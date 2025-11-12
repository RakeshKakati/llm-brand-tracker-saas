/**
 * Integration Service
 * Handles triggering webhooks and other integrations when brand mentions are found
 */

import { supabaseAdmin } from '@/app/lib/supabaseServer';

export interface WebhookPayload {
  event: 'brand_mentioned' | 'mention_updated' | 'position_changed';
  timestamp: string;
  data: {
    brand: string;
    query: string;
    mentioned: boolean;
    position?: number | null;
    evidence?: string;
    sources?: Array<{ url: string; title?: string }>;
    source_urls?: string[];
    raw_output?: string;
  };
}

export interface Integration {
  id: string;
  user_email: string;
  team_id?: string;
  type: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  webhook_url?: string;
  webhook_secret?: string;
  webhook_method?: string;
  webhook_auth_header?: string; // e.g., "Bearer token123" or "Basic base64string"
  payload_template?: any;
  event_filters?: {
    events?: string[];
    min_position?: number;
    mentioned_only?: boolean;
  };
}

/**
 * Get active integrations for a user/team
 */
export async function getActiveIntegrations(
  userEmail: string,
  teamId?: string
): Promise<Integration[]> {
  try {
    let query = supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('status', 'active')
      .eq('type', 'webhook');

    if (teamId) {
      query = query.or(`user_email.eq.${userEmail},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_email', userEmail).is('team_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }

    return (data || []) as Integration[];
  } catch (error) {
    console.error('Error in getActiveIntegrations:', error);
    return [];
  }
}

/**
 * Check if integration should trigger based on event filters
 */
function shouldTriggerIntegration(
  integration: Integration,
  event: string,
  mentionData: WebhookPayload['data']
): boolean {
  // If paused or error, don't trigger
  if (integration.status !== 'active') {
    return false;
  }

  const filters = integration.event_filters;

  // Check event type filter
  if (filters?.events && !filters.events.includes(event)) {
    return false;
  }

  // Check mentioned_only filter
  if (filters?.mentioned_only && !mentionData.mentioned) {
    return false;
  }

  // Check min_position filter
  if (filters?.min_position && mentionData.position) {
    if (mentionData.position > filters.min_position) {
      return false;
    }
  }

  return true;
}

/**
 * Build webhook payload (supports custom templates)
 */
function buildWebhookPayload(
  integration: Integration,
  event: string,
  mentionData: WebhookPayload['data']
): any {
  // If custom template provided, use it
  if (integration.payload_template) {
    // Simple template replacement (can be enhanced)
    let payload = JSON.stringify(integration.payload_template);
    payload = payload.replace(/\{\{brand\}\}/g, mentionData.brand || '');
    payload = payload.replace(/\{\{query\}\}/g, mentionData.query || '');
    payload = payload.replace(/\{\{mentioned\}\}/g, String(mentionData.mentioned || false));
    payload = payload.replace(/\{\{position\}\}/g, String(mentionData.position || ''));
    payload = payload.replace(/\{\{evidence\}\}/g, mentionData.evidence || '');
    payload = payload.replace(/\{\{timestamp\}\}/g, new Date().toISOString());
    
    try {
      return JSON.parse(payload);
    } catch (e) {
      console.error('Error parsing custom payload template:', e);
    }
  }

  // Default payload structure
  return {
    event,
    timestamp: new Date().toISOString(),
    data: mentionData,
  };
}

/**
 * Trigger webhook for a single integration
 */
async function triggerWebhook(
  integration: Integration,
  payload: any
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  if (!integration.webhook_url) {
    return { success: false, error: 'Webhook URL not configured' };
  }

  const startTime = Date.now();
  let statusCode: number | undefined;
  let responseBody: string | undefined;
  let errorMessage: string | undefined;

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'kommi-webhook/1.0',
    };

    // Add Authorization header if configured
    if (integration.webhook_auth_header) {
      // Parse the auth header (format: "Bearer token" or "Basic base64" or just "token")
      const authParts = integration.webhook_auth_header.trim().split(' ');
      if (authParts.length === 2) {
        // Format: "Bearer token" or "Basic base64"
        headers['Authorization'] = integration.webhook_auth_header;
      } else {
        // Just a token, default to Bearer
        headers['Authorization'] = `Bearer ${integration.webhook_auth_header}`;
      }
    }

    // Add webhook signature if secret is configured
    if (integration.webhook_secret) {
      const crypto = await import('crypto');
      const signature = crypto
        .createHmac('sha256', integration.webhook_secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      headers['X-Kommi-Signature'] = `sha256=${signature}`;
    }

    // Make webhook request
    const response = await fetch(integration.webhook_url, {
      method: integration.webhook_method || 'POST',
      headers,
      body: JSON.stringify(payload),
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    statusCode = response.status;
    responseBody = await response.text().catch(() => 'Unable to read response');

    const success = response.ok;

    // Log the webhook attempt
    await logWebhookAttempt(
      integration.id,
      payload.event,
      success ? 'success' : 'error',
      statusCode,
      payload,
      responseBody,
      success ? undefined : `HTTP ${statusCode}: ${responseBody.substring(0, 500)}`,
      Date.now() - startTime
    );

    // Update integration stats
    await updateIntegrationStats(integration.id, success);

    return {
      success,
      statusCode,
      error: success ? undefined : `HTTP ${statusCode}: ${responseBody.substring(0, 200)}`,
    };
  } catch (error: any) {
    errorMessage = error.message || 'Unknown error';
    const duration = Date.now() - startTime;

    // Log the error
    await logWebhookAttempt(
      integration.id,
      payload.event,
      'error',
      statusCode,
      payload,
      responseBody,
      errorMessage,
      duration
    );

    // Update integration stats
    await updateIntegrationStats(integration.id, false);

    return {
      success: false,
      error: errorMessage,
      statusCode,
    };
  }
}

/**
 * Trigger all active integrations for a brand mention
 */
export async function triggerIntegrations(
  userEmail: string,
  event: 'brand_mentioned' | 'mention_updated' | 'position_changed',
  mentionData: WebhookPayload['data'],
  teamId?: string
): Promise<void> {
  try {
    // Get all active integrations
    const integrations = await getActiveIntegrations(userEmail, teamId);

    if (integrations.length === 0) {
      return; // No integrations to trigger
    }

    // Trigger each integration in parallel (but don't wait for all)
    const promises = integrations.map(async (integration) => {
      // Check if should trigger based on filters
      if (!shouldTriggerIntegration(integration, event, mentionData)) {
        return;
      }

      // Build payload
      const payload = buildWebhookPayload(integration, event, mentionData);

      // Trigger webhook
      await triggerWebhook(integration, payload);
    });

    // Fire and forget - don't block the main flow
    Promise.all(promises).catch((error) => {
      console.error('Error triggering integrations:', error);
      // Don't throw - we don't want to break the main flow
    });
  } catch (error) {
    console.error('Error in triggerIntegrations:', error);
    // Silently fail - don't break the main mention tracking flow
  }
}

/**
 * Log webhook attempt
 */
async function logWebhookAttempt(
  integrationId: string,
  eventType: string,
  status: 'success' | 'error' | 'pending',
  statusCode?: number,
  requestPayload?: any,
  responseBody?: string,
  errorMessage?: string,
  durationMs?: number
): Promise<void> {
  try {
    await supabaseAdmin.from('integration_logs').insert([
      {
        integration_id: integrationId,
        event_type: eventType,
        status,
        status_code: statusCode,
        request_payload: requestPayload,
        response_body: responseBody,
        error_message: errorMessage,
        duration_ms: durationMs,
      },
    ]);
  } catch (error) {
    console.error('Error logging webhook attempt:', error);
    // Don't throw - logging failures shouldn't break the flow
  }
}

/**
 * Update integration statistics
 */
async function updateIntegrationStats(
  integrationId: string,
  success: boolean
): Promise<void> {
  try {
    // Get current stats
    const { data: current } = await supabaseAdmin
      .from('integrations')
      .select('success_count, error_count')
      .eq('id', integrationId)
      .single();

    const update: any = {
      last_triggered_at: new Date().toISOString(),
    };

    if (success) {
      update.success_count = (current?.success_count || 0) + 1;
      update.error_count = 0; // Reset error count on success
      update.last_error = null;
      update.status = 'active'; // Reactivate if it was in error state
    } else {
      const newErrorCount = (current?.error_count || 0) + 1;
      update.error_count = newErrorCount;
      // If too many errors, mark as error status
      if (newErrorCount >= 5) {
        update.status = 'error';
      }
    }

    await supabaseAdmin
      .from('integrations')
      .update(update)
      .eq('id', integrationId);
  } catch (error) {
    console.error('Error updating integration stats:', error);
    // Don't throw
  }
}

/**
 * Test webhook (manual trigger)
 */
export async function testWebhook(integrationId: string): Promise<{
  success: boolean;
  statusCode?: number;
  error?: string;
  duration?: number;
}> {
  try {
    const { data: integration, error } = await supabaseAdmin
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .single();

    if (error || !integration) {
      return { success: false, error: 'Integration not found' };
    }

    // Create test payload
    const testPayload = buildWebhookPayload(
      integration as Integration,
      'brand_mentioned',
      {
        brand: 'Test Brand',
        query: 'test query',
        mentioned: true,
        position: 1,
        evidence: 'This is a test webhook from kommi',
        sources: [{ url: 'https://example.com', title: 'Example Source' }],
      }
    );

    const startTime = Date.now();
    const result = await triggerWebhook(integration as Integration, testPayload);
    const duration = Date.now() - startTime;

    return {
      ...result,
      duration,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}


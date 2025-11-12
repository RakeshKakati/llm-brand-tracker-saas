import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseServer';
import { testWebhook } from '@/lib/integration-service';

/**
 * PUT /api/integrations/[id]
 * Update an integration
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, status, webhook_url, webhook_secret, webhook_auth_header, event_filters, payload_template } = body;

    // Validate webhook URL if provided
    if (webhook_url) {
      try {
        new URL(webhook_url);
        if (!webhook_url.startsWith('https://') && !webhook_url.startsWith('http://localhost')) {
          return NextResponse.json(
            { error: 'Webhook URL must use HTTPS (or localhost for development)' },
            { status: 400 }
          );
        }
      } catch (e) {
        return NextResponse.json({ error: 'Invalid webhook URL format' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (webhook_url !== undefined) updateData.webhook_url = webhook_url;
    if (webhook_secret !== undefined) updateData.webhook_secret = webhook_secret;
    if (webhook_auth_header !== undefined) updateData.webhook_auth_header = webhook_auth_header;
    if (event_filters !== undefined) updateData.event_filters = event_filters;
    if (payload_template !== undefined) updateData.payload_template = payload_template;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('integrations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating integration:', error);
      return NextResponse.json({ error: 'Failed to update integration' }, { status: 500 });
    }

    return NextResponse.json({ integration: data });
  } catch (error: any) {
    console.error('Error in PUT /api/integrations/[id]:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

/**
 * DELETE /api/integrations/[id]
 * Delete an integration
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('integrations')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting integration:', error);
      return NextResponse.json({ error: 'Failed to delete integration' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/integrations/[id]:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}


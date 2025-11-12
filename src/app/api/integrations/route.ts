import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseServer';

/**
 * GET /api/integrations
 * List all integrations for the current user
 */
export async function GET(req: NextRequest) {
  try {
    // Get user_email from query param (frontend sends it from session)
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get('user_email');
    const teamId = searchParams.get('team_id');

    if (!userEmail) {
      return NextResponse.json({ error: 'user_email required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('integrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamId) {
      query = query.or(`user_email.eq.${userEmail},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_email', userEmail).is('team_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching integrations:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('Integrations table does not exist. Please run the migration.');
        return NextResponse.json({ integrations: [] });
      }
      return NextResponse.json({ error: 'Failed to fetch integrations', details: error.message }, { status: 500 });
    }

    console.log(`Found ${data?.length || 0} integrations for ${userEmail}`);
    return NextResponse.json({ integrations: data || [] });
  } catch (error: any) {
    console.error('Error in GET /api/integrations:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

/**
 * POST /api/integrations
 * Create a new integration
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_email, team_id, type, name, webhook_url, webhook_secret, webhook_auth_header, event_filters, payload_template } = body;

    if (!user_email || !type || !name) {
      return NextResponse.json(
        { error: 'user_email, type, and name are required' },
        { status: 400 }
      );
    }

    if (type === 'webhook' && !webhook_url) {
      return NextResponse.json(
        { error: 'webhook_url is required for webhook integrations' },
        { status: 400 }
      );
    }

    // Validate webhook URL
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

    // Get user_id from email (optional - don't fail if user doesn't exist in users table)
    let userId = null;
    try {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', user_email)
        .single();
      userId = userData?.id || null;
    } catch (userError: any) {
      // User might not exist in users table - that's okay, we'll use null
      console.log('User not found in users table, using null for user_id:', userError.message);
    }

    const { data: integration, error } = await supabaseAdmin
      .from('integrations')
      .insert([
        {
          user_email,
          user_id: userId,
          team_id: team_id || null,
          type: type || 'webhook',
          name,
          webhook_url: webhook_url || null,
          webhook_secret: webhook_secret || null,
          webhook_auth_header: webhook_auth_header || null,
          event_filters: event_filters || null,
          payload_template: payload_template || null,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating integration:', error);
      // Check if column doesn't exist (migration issue)
      if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database schema mismatch. Please run the migration to add webhook_auth_header column.',
          details: error.message,
          hint: 'Run: ALTER TABLE integrations ADD COLUMN IF NOT EXISTS webhook_auth_header TEXT;'
        }, { status: 500 });
      }
      return NextResponse.json({ 
        error: 'Failed to create integration', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ integration });
  } catch (error: any) {
    console.error('Error in POST /api/integrations:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseServer';

/**
 * GET /api/integrations/[id]/logs
 * Get logs for a specific integration
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabaseAdmin
      .from('integration_logs')
      .select('*')
      .eq('integration_id', params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching integration logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('integration_logs')
      .select('*', { count: 'exact', head: true })
      .eq('integration_id', params.id);

    return NextResponse.json({ 
      logs: data || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('Error in GET /api/integrations/[id]/logs:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}



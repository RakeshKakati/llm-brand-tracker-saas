import { NextRequest, NextResponse } from 'next/server';
import { testWebhook } from '@/lib/integration-service';

/**
 * POST /api/integrations/[id]/test
 * Test a webhook integration
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await testWebhook(params.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}



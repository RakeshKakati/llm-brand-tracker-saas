/**
 * Real-time Brand Tracking Endpoint (RAG-enabled)
 * 
 * This is a SEPARATE endpoint from /api/trackBrand and /api/checkMention
 * It provides optional real-time tracking using RAG.
 * 
 * Features:
 * - Completely separate from existing endpoints (won't break anything)
 * - Optional feature flag controlled
 * - Graceful fallback to standard tracking
 * - Returns enhanced results with real-time data
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";
import { getRAGTracking, checkBrandMentionWithRAG } from "@/lib/rag-service";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brand, query, user_email, user_id, team_id } = body;

    // Validation
    if (!brand || !query) {
      return NextResponse.json(
        { error: "Missing brand or query" },
        { status: 400 }
      );
    }

    if (!user_email || !user_id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    console.log(`🔍 Real-time tracking: brand="${brand}", query="${query}" for user=${user_email}`);

    // Check if RAG is enabled
    if (process.env.ENABLE_RAG_TRACKING !== 'true') {
      // Fallback to standard checkMention
      console.log('⚠️ RAG not enabled, using standard checkMention logic');
      // Import and use checkMention logic directly
      const { NextResponse: StandardResponse } = await import("next/server");
      const { supabaseAdmin: supabase } = await import("@/app/lib/supabaseServer");
      
      // Call standard checkMention endpoint via internal fetch
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const standardResponse = await fetch(`${baseUrl}/api/checkMention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brand, query, user_email, user_id, team_id }),
      });
      
      if (standardResponse.ok) {
        const result = await standardResponse.json();
        return StandardResponse.json(result);
      }
      
      // If standard endpoint also fails, return error
      return StandardResponse.json(
        { error: "RAG disabled and standard endpoint unavailable", mentioned: false },
        { status: 503 }
      );
    }

    // Use RAG for real-time tracking
    const ragResult = await checkBrandMentionWithRAG(brand, query);

    if (!ragResult) {
      // RAG failed, fallback to standard
      console.log('⚠️ RAG failed, using standard checkMention');
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const standardResponse = await fetch(`${baseUrl}/api/checkMention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ brand, query, user_email, user_id, team_id }),
      });
      
      if (standardResponse.ok) {
        const result = await standardResponse.json();
        return NextResponse.json(result);
      }
      
      // If both fail, return error
      return NextResponse.json(
        { error: "RAG failed and standard endpoint unavailable", mentioned: false },
        { status: 503 }
      );
    }

    // Extract sources
    const source_urls = ragResult.sources?.map(s => s.url) || [];

    // Store in database (same structure as checkMention)
    const { error: dbError } = await supabaseAdmin.from("brand_mentions").insert([
      {
        brand,
        query,
        mentioned: ragResult.mentioned,
        evidence: ragResult.evidence,
        raw_output: JSON.stringify({
          method: 'rag_realtime',
          timestamp: new Date().toISOString(),
          sources: ragResult.sources,
        }),
        source_urls: source_urls,
        user_email,
        team_id: team_id || null,
      },
    ]);

    if (dbError) {
      console.error("❌ Database insert error:", dbError);
      // Still return result even if DB insert fails
    }

    // Trigger integrations (webhooks)
    try {
      const { triggerIntegrations } = await import('@/lib/integration-service');
      await triggerIntegrations(
        user_email,
        'brand_mentioned',
        {
          brand,
          query,
          mentioned: ragResult.mentioned,
          evidence: ragResult.evidence,
          source_urls: source_urls,
          sources: ragResult.sources || [],
        },
        team_id || undefined
      );
    } catch (integrationError) {
      console.error('⚠️ Integration trigger failed (non-critical):', integrationError);
    }

    // Return enhanced response
    return NextResponse.json({
      brand,
      query,
      mentioned: ragResult.mentioned,
      evidence: ragResult.evidence,
      sources: ragResult.sources,
      method: 'rag_realtime',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error in realtime tracking:", error);
    
    // Fallback to standard endpoint
    try {
      const body = await req.json().catch(() => ({}));
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const standardResponse = await fetch(`${baseUrl}/api/checkMention`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (standardResponse.ok) {
        const result = await standardResponse.json();
        return NextResponse.json(result);
      }
      
      return NextResponse.json(
        { error: error.message || "Unknown error", mentioned: false },
        { status: 500 }
      );
    } catch (fallbackError) {
      return NextResponse.json(
        { error: error.message || "Unknown error", mentioned: false },
        { status: 500 }
      );
    }
  }
}


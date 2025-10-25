import { supabase } from "@/app/lib/supabaseClient";

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log("🔄 Starting server-side cron job...");
    
    // Get all active trackers
    const { data: trackers, error: fetchError } = await supabase
      .from("tracked_brands")
      .select("*")
      .eq("active", true);
    
    if (fetchError) {
      console.error("❌ Error fetching trackers:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch trackers" }), { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }
    
    if (!trackers || trackers.length === 0) {
      console.log("ℹ️ No active trackers found");
      return new Response(JSON.stringify({ message: "No active trackers" }), { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      });
    }
    
    console.log(`📊 Found ${trackers.length} active trackers`);
    
    // Process each tracker
    const results = [];
    for (const tracker of trackers) {
      try {
        console.log(`🔍 Checking tracker: ${tracker.brand} - ${tracker.query}`);
        
        // Call the checkMention API internally
        const response = await fetch(`https://llm-brand-tracker-saas.vercel.app/api/checkMention`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            brand: tracker.brand, 
            query: tracker.query 
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          results.push({
            tracker_id: tracker.id,
            brand: tracker.brand,
            query: tracker.query,
            mentioned: result.mentioned,
            success: true
          });
          console.log(`✅ Check completed for ${tracker.brand}: ${result.mentioned ? 'MENTIONED' : 'NOT FOUND'}`);
        } else {
          console.error(`❌ Check failed for ${tracker.brand}:`, response.status);
          results.push({
            tracker_id: tracker.id,
            brand: tracker.brand,
            query: tracker.query,
            success: false,
            error: `HTTP ${response.status}`
          });
        }
        
        // Add a small delay between checks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error checking ${tracker.brand}:`, error);
        results.push({
          tracker_id: tracker.id,
          brand: tracker.brand,
          query: tracker.query,
          success: false,
          error: error.message
        });
      }
    }
    
    console.log(`🎯 Completed ${results.length} checks`);
    
    return new Response(JSON.stringify({ 
      message: `Processed ${results.length} trackers`,
      results,
      timestamp: new Date().toISOString()
    }), { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error("💥 Fatal error in server cron job:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error.message 
    }), { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

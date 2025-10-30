import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseServer";
import { extractContactsFromURL, ExtractedContact } from "@/lib/contactExtractor";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_email, urls, brand, limit = 20 } = body;

    if (!user_email) {
      return NextResponse.json(
        { error: "Unauthorized - user_email required" },
        { status: 401 }
      );
    }

    console.log(`📧 Contact extraction requested by: ${user_email}`);

    // If URLs provided, use them; otherwise fetch from brand_mentions
    let urlsToProcess: Array<{ url: string; mention_id?: string; brand?: string; query?: string }> = [];

    if (urls && Array.isArray(urls) && urls.length > 0) {
      // Use provided URLs
      urlsToProcess = urls.map((url: string) => ({ url }));
      console.log(`📋 Processing ${urlsToProcess.length} provided URLs`);
    } else {
      // Fetch URLs from brand_mentions where mentioned = false
      let query = supabaseAdmin
        .from("brand_mentions")
        .select("id, brand, query, source_urls, created_at")
        .eq("user_email", user_email)
        .not("source_urls", "is", null);

      if (brand) {
        query = query.eq("brand", brand);
      }

      const { data: mentions, error: mentionsError } = await query
        .order("created_at", { ascending: false })
        .limit(100);

      if (mentionsError) {
        console.error("❌ Error fetching mentions:", mentionsError);
        return NextResponse.json(
          { error: "Failed to fetch brand mentions" },
          { status: 500 }
        );
      }

      if (!mentions || mentions.length === 0) {
        return NextResponse.json({
          processed: 0,
          contacts_found: 0,
          contacts: [],
          message: "No source URLs found in brand mentions",
        });
      }

      // Extract unique URLs from source_urls arrays
      const urlSet = new Set<string>();
      const urlMetadata = new Map<string, { mention_id: string; brand?: string; query?: string }>();

      for (const mention of mentions) {
        if (mention.source_urls && Array.isArray(mention.source_urls)) {
          for (const url of mention.source_urls) {
            if (typeof url === 'string' && url.trim()) {
              if (!urlSet.has(url)) {
                urlSet.add(url);
                urlMetadata.set(url, {
                  mention_id: mention.id,
                  brand: mention.brand,
                  query: mention.query,
                });
              }
            }
          }
        }
      }

      urlsToProcess = Array.from(urlSet)
        .slice(0, limit)
        .map(url => ({
          url,
          ...urlMetadata.get(url),
        }));

      console.log(`📋 Found ${urlsToProcess.length} unique URLs to process`);
    }

    if (urlsToProcess.length === 0) {
      return NextResponse.json({
        processed: 0,
        contacts_found: 0,
        contacts: [],
        message: "No URLs to process",
      });
    }

    // Extract domain from URL helper
    const getDomain = (url: string): string => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return url;
      }
    };

    // Process URLs and extract contacts
    const allExtractedContacts: Array<ExtractedContact & { url: string; mention_id?: string; domain: string }> = [];
    let processed = 0;

    for (let i = 0; i < urlsToProcess.length; i++) {
      const { url, mention_id, brand: urlBrand, query: urlQuery } = urlsToProcess[i];
      
      try {
        console.log(`🔍 Processing URL ${i + 1}/${urlsToProcess.length}: ${url}`);
        
        const contacts = await extractContactsFromURL(url);
        
        if (contacts.length > 0) {
          const domain = getDomain(url);
          
          // Store contacts with metadata
          for (const contact of contacts) {
            allExtractedContacts.push({
              ...contact,
              url,
              mention_id,
              domain,
              brand: urlBrand || brand,
              query: urlQuery,
            });
          }
          
          console.log(`✅ Found ${contacts.length} contacts from ${url}`);
        } else {
          console.log(`⚠️ No contacts found in ${url}`);
        }

        // Add delay to avoid rate limiting
        if (i < urlsToProcess.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      } catch (error) {
        console.error(`❌ Error processing ${url}:`, error);
        // Continue with next URL
      }
      
      processed++;
    }

    // Store contacts in database
    const contactsToInsert = allExtractedContacts.map(contact => ({
      user_email,
      source_url: contact.url,
      domain: contact.domain,
      mention_id: contact.mention_id || null,
      brand: contact.brand || brand || null,
      query: contact.query || null,
      email: contact.email || null,
      phone: contact.phone || null,
      linkedin_url: contact.linkedin || null,
      twitter_url: contact.twitter || null,
      facebook_url: contact.facebook || null,
      instagram_url: contact.instagram || null,
      author_name: contact.authorName || null,
      company_name: contact.companyName || null,
      contact_page_url: contact.contactPageUrl || null,
      extraction_method: contact.extractionMethod,
      confidence_score: contact.confidence,
    }));

    if (contactsToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("extracted_contacts")
        .upsert(contactsToInsert, {
          onConflict: "user_email,source_url,email,phone",
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error("❌ Error inserting contacts:", insertError);
        // Don't fail the request, just log the error
      } else {
        console.log(`✅ Stored ${contactsToInsert.length} contacts in database`);
      }
    }

    // Return results
    return NextResponse.json({
      processed,
      contacts_found: allExtractedContacts.length,
      contacts: allExtractedContacts.map(contact => ({
        email: contact.email,
        phone: contact.phone,
        linkedin: contact.linkedin,
        twitter: contact.twitter,
        facebook: contact.facebook,
        instagram: contact.instagram,
        authorName: contact.authorName,
        companyName: contact.companyName,
        sourceUrl: contact.url,
        domain: contact.domain,
        confidence: contact.confidence,
      })),
    });
  } catch (error) {
    console.error("❌ Contact extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract contacts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


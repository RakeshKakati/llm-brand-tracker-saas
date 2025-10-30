/**
 * Contact Extractor Utility
 * Extracts contact information (emails, phones, social links) from web pages
 */

export interface ExtractedContact {
  email?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  authorName?: string;
  companyName?: string;
  contactPageUrl?: string;
  extractionMethod: 'direct' | 'contact_page' | 'author_page';
  confidence: number; // 0-100
}

/**
 * Extract contacts from a URL by fetching and parsing HTML
 */
export async function extractContactsFromURL(url: string): Promise<ExtractedContact[]> {
  try {
    const contacts: ExtractedContact[] = [];
    
    // Fetch main page
    const mainPageHtml = await fetchHTML(url);
    if (!mainPageHtml) return contacts;
    
    // Extract from main page
    const directContacts = extractDirectContacts(mainPageHtml, url);
    contacts.push(...directContacts);
    
    // Try contact page (non-blocking, don't fail if not found)
    try {
      const contactPageUrl = findContactPageURL(mainPageHtml, url);
      if (contactPageUrl && contactPageUrl !== url) {
        const contactPageHtml = await fetchHTML(contactPageUrl);
        if (contactPageHtml) {
          const contactPageContacts = extractDirectContacts(contactPageHtml, contactPageUrl);
          contactPageContacts.forEach(contact => {
            contact.extractionMethod = 'contact_page';
            contact.contactPageUrl = contactPageUrl;
          });
          contacts.push(...contactPageContacts);
        }
      }
    } catch (e) {
      // Silently fail for contact page - not critical
      console.log(`Could not fetch contact page for ${url}`);
    }
    
    // Try author page (for blog posts/articles)
    try {
      const authorPageUrl = findAuthorPageURL(mainPageHtml, url);
      if (authorPageUrl && authorPageUrl !== url) {
        const authorPageHtml = await fetchHTML(authorPageUrl);
        if (authorPageHtml) {
          const authorContacts = extractDirectContacts(authorPageHtml, authorPageUrl);
          authorContacts.forEach(contact => {
            contact.extractionMethod = 'author_page';
            contact.contactPageUrl = authorPageUrl;
          });
          contacts.push(...authorContacts);
        }
      }
    } catch (e) {
      // Silently fail for author page - not critical
      console.log(`Could not fetch author page for ${url}`);
    }
    
    return deduplicateContacts(contacts);
  } catch (error) {
    console.error(`Error extracting contacts from ${url}:`, error);
    return [];
  }
}

/**
 * Fetch HTML from a URL
 */
async function fetchHTML(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContactExtractor/1.0; +https://kommi.in)',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const html = await response.text();
    return html;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log(`Timeout fetching ${url}`);
    }
    return null;
  }
}

/**
 * Extract contact information directly from HTML
 */
function extractDirectContacts(html: string, baseUrl: string): ExtractedContact[] {
  const contacts: ExtractedContact[] = [];
  
  // 1. Extract emails - multiple patterns
  const emailPatterns = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
  ];
  
  const allEmails = new Set<string>();
  emailPatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const email = match.replace(/^mailto:/i, '').toLowerCase().trim();
        if (isValidEmail(email)) {
          allEmails.add(email);
        }
      });
    }
  });
  
  // 2. Extract phone numbers
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /tel:([+\d\s\-()]+)/gi,
    /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  ];
  
  const allPhones = new Set<string>();
  phonePatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const phone = match.replace(/^tel:/i, '').trim();
        if (isValidPhone(phone)) {
          allPhones.add(phone);
        }
      });
    }
  });
  
  // 3. Extract social media links
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company|pub)\/([a-zA-Z0-9-]+)/gi;
  const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/gi;
  const facebookRegex = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9.]+)/gi;
  const instagramRegex = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/gi;
  
  const linkedinMatch = html.match(linkedinRegex);
  const twitterMatch = html.match(twitterRegex);
  const facebookMatch = html.match(facebookRegex);
  const instagramMatch = html.match(instagramRegex);
  
  const linkedin = linkedinMatch ? linkedinMatch[0] : undefined;
  const twitter = twitterMatch ? twitterMatch[0] : undefined;
  const facebook = facebookMatch ? facebookMatch[0] : undefined;
  const instagram = instagramMatch ? instagramMatch[0] : undefined;
  
  // 4. Extract author name
  const authorName = extractAuthorName(html);
  
  // 5. Extract company name
  const companyName = extractCompanyName(html);
  
  // Build contact objects
  if (allEmails.size > 0) {
    // Create one contact per email
    allEmails.forEach(email => {
      contacts.push({
        email,
        phone: allPhones.size > 0 ? Array.from(allPhones)[0] : undefined,
        linkedin,
        twitter,
        facebook,
        instagram,
        authorName,
        companyName,
        extractionMethod: 'direct',
        confidence: calculateConfidence(email, authorName, companyName),
      });
    });
  } else if (allPhones.size > 0) {
    // If no email but has phone, create contact with phone
    contacts.push({
      phone: Array.from(allPhones)[0],
      linkedin,
      twitter,
      facebook,
      instagram,
      authorName,
      companyName,
      extractionMethod: 'direct',
      confidence: 40, // Lower confidence without email
    });
  } else if (authorName || linkedin || twitter) {
    // At least some contact info
    contacts.push({
      linkedin,
      twitter,
      facebook,
      instagram,
      authorName,
      companyName,
      extractionMethod: 'direct',
      confidence: 30, // Lower confidence without email/phone
    });
  }
  
  return contacts;
}

/**
 * Find contact page URL from HTML
 */
function findContactPageURL(html: string, baseUrl: string): string | null {
  const contactPatterns = [
    /<a[^>]+href=["']([^"']*(?:contact|about|team|reach|connect)[^"']*)["'][^>]*>/gi,
    /<a[^>]+href=["']([^"']*\/contact[^"']*)["'][^>]*>/gi,
    /<a[^>]+href=["']([^"']*\/about[^"']*)["'][^>]*>/gi,
  ];
  
  for (const pattern of contactPatterns) {
    const matches = Array.from(html.matchAll(pattern));
    for (const match of matches) {
      if (match[1]) {
        try {
          const href = match[1];
          const fullUrl = new URL(href, baseUrl).href;
          // Avoid redirect loops
          if (fullUrl !== baseUrl && !fullUrl.includes('#') && !fullUrl.includes('mailto:')) {
            return fullUrl;
          }
        } catch (e) {
          continue;
        }
      }
    }
  }
  
  return null;
}

/**
 * Find author page URL from HTML
 */
function findAuthorPageURL(html: string, baseUrl: string): string | null {
  const authorPatterns = [
    /<a[^>]+href=["']([^"']*author[^"']*)["'][^>]*>/gi,
    /<a[^>]+href=["']([^"']*writer[^"']*)["'][^>]*>/gi,
    /<a[^>]+rel=["']author["'][^>]+href=["']([ّ^"']+)["']/gi,
  ];
  
  for (const pattern of authorPatterns)量为 {
    const matches = Array.from(html.matchAll(pattern));
    for (const match of matches) {
      if (match[1]) {
        try {
          const href = match[1];
          const fullUrl = new URL(href, baseUrl).href;
          if (fullUrl !== baseUrl && !fullUrl.includes('#') && !fullUrl.includes('mailto:')) {
            return fullUrl;
          }
        } catch (e) {
          continue;
        }
      }
    }
  }
  
  return null;
}

/**
 * Extract author name from HTML
 */
function extractAuthorName(html: string): string | undefined {
  // Try JSON-LD schema
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  const jsonLdMatches = Array.from(html.matchAll(jsonLdRegex));
  
  for (const match of jsonLdMatches) {
    try {
      const jsonStr = match[1].replace(/<[^>]+>/g, '');
      const json = JSON.parse(jsonStr);
      
      if (json.author?.name) return json.author.name;
      if (json['@type'] === 'Person' && json.name) return json.name;
      if (Array.isArray(json['@graph'])) {
        for (const item of json['@graph']) {
          if (item['@type'] === 'Person' && item.name) return item.name;
          if (item.author?.name) return item.author.name;
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  // Try meta tags
  const metaAuthorRegex = /<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i;
  const metaMatch = html.match(metaAuthorRegex);
  if (metaMatch) return metaMatch[1].trim();
  
  // Try article:author
  const articleAuthorRegex = /<meta[^>]+property=["']article:author["'][^>]+content=["']([^"']+)["']/i;
  const articleMatch = html.match(articleAuthorRegex);
  if (articleMatch) return articleMatch[1].trim();
  
  // Try itemprop author
  const itempropRegex = /<[^>]+itemprop=["']author["'][^>]*>([^<]+)</i;
  const itempropMatch = html.match(itempropRegex);
  if (itempropMatch) return itempropMatch[1].trim();
  
  return undefined;
}

/**
 * Extract company name from HTML
 */
function extractCompanyName(html: string): string | undefined {
  // Try JSON-LD schema
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  const jsonLdMatches = Array.from(html.matchAll(jsonLdRegex));
  
  for (const match of jsonLdMatches) {
    try {
      const jsonStr = match[1].replace(/<[^>]+>/g, '');
      const json = JSON.parse(jsonStr);
      
      if (json['@type'] === 'Organization' && json.name) return json.name;
       if (json.publisher?.name) return json.publisher.name;
      if (Array.isArray(json['@graph'])) {
        for (const item of json['@graph']) {
          if (item['@type'] === 'Organization' && item.name) return item.name;
        }
      }
    } catch (e) {
      continue;
    }
  }
  
  // Try meta tags
  const metaOrgRegex = /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i;
  const metaOrgMatch = html.match(metaOrgRegex);
  if (metaOrgMatch) return metaOrgMatch[1].trim();
  
  return undefined;
}

/**
 * Calculate confidence score for a contact
 */
function calculateConfidence(
  email: string,
  authorName?: string,
  companyName?: string
): number {
  let confidence = 50; // Base confidence
  
  // Higher confidence if we have author name
  if (authorName && authorName.length > 2) confidence += 20;
  
  // Higher confidence if we have company name
  if (companyName && companyName.length > 2) confidence += 10;
  
  // Lower confidence for generic emails
  const genericEmails = /^(noreply|no-reply|donotreply|support|admin|webmaster|info|contact|hello|hi|sales|marketing|newsletter|do-not-reply)@/i;
  if (genericEmails.test(email)) {
    confidence -= 20;
  } else {
    // Personal-looking emails get higher confidence
    confidence += 15;
  }
  
  // Lower confidence for free email providers (but don't exclude them)
  if (email.match(/@(gmail|yahoo|hotmail|outlook|icloud)\.com$/i)) {
    confidence -= 5;
  }
  
  return Math.min(100, Math.max(0, confidence));
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  // Filter out common non-contact emails
  const excludePatterns = [
    /^(noreply|no-reply|donotreply|support|admin|webmaster|info|contact|hello|hi|sales|marketing|newsletter|do-not-reply)@/i,
    /example\.com$/i,
    /test\./i,
    /placeholder/i,
  ];
  
  if (excludePatterns.some(pattern => pattern.test(email))) {
    return false;
  }
  
  // Basic email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone: string): boolean {
  // Remove common non-phone patterns
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  
  // Should have at least 7 digits
  if (cleaned.length < 7) return false;
  
  // Should have at most 15 digits (international standard)
  if (cleaned.length > 15) return false;
  
  // Should be mostly digits
  if (!/^\d+$/.test(cleaned)) return false;
  
  return true;
}

/**
 * Deduplicate contacts by email or phone
 */
function deduplicateContacts(contacts: ExtractedContact[]): ExtractedContact[] {
  const seen = new Map<string, ExtractedContact>();
  
  for (const contact of contacts) {
    const key = contact.email || contact.phone || contact.linkedin || contact.authorName || '';
    if (key && !seen.has(key)) {
      seen.set(key, contact);
    } else if (key && seen.has(key)) {
      // Merge if we have more info
      const existing = seen.get(key)!;
      const merged = {
        ...existing,
        ...contact,
        // Keep the higher confidence
        confidence: Math.max(existing.confidence, contact.confidence),
      };
      seen.set(key, merged);
    }
  }
  
  return Array.from(seen.values());
}


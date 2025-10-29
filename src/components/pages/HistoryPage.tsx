"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  History, 
  Search, 
  Filter,
  CheckCircle, 
  XCircle,
  Calendar,
  Clock,
  RefreshCw,
  FileText,
  Loader2,
  ExternalLink,
  MoreVertical
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/app/lib/supabaseClient";

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMentioned, setFilterMentioned] = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [evidenceSheetOpen, setEvidenceSheetOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<{ brand: string; query: string; evidence: string } | null>(null);

  useEffect(() => {
    fetchMentions();
    
    // Auto-refresh every 30 seconds to catch external cron job updates
    const refreshInterval = setInterval(() => {
      console.log("🔄 Auto-refreshing history data...");
      fetchMentions(true); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchMentions = async (isSilentRefresh = false) => {
    try {
      if (!isSilentRefresh) {
        setLoading(true);
      }
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      console.log("📜 History - User session:", session?.user?.email);
      
      if (!session?.user?.email) {
        console.error("❌ No user session found in History");
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      console.log("🔍 Fetching mention history for:", userEmail);
      
      // Fetch mentions filtered by user
      const { data, error } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        console.log("✅ History fetched:", data.length, "mentions");
        setRecords(data);
        if (!isSilentRefresh) {
          setLastRefresh(new Date());
        }
      } else if (error) {
        console.error("❌ Error fetching mentions:", error);
      }
    } catch (error) {
      console.error("Error fetching mentions:", error);
    } finally {
      if (!isSilentRefresh) {
        setLoading(false);
      }
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterMentioned === null || record.mentioned === filterMentioned;
    return matchesSearch && matchesFilter;
  });

  // Helper function to extract and format evidence from a record
  const extractEvidence = (record: any): string => {
    let fullText = '';
    
    if (record.raw_output) {
      try {
        const parsed = typeof record.raw_output === 'string' 
          ? JSON.parse(record.raw_output) 
          : record.raw_output;
        
        // Extract text from /v1/responses format - find message item
        if (parsed?.output && Array.isArray(parsed.output)) {
          const messageItem = parsed.output.find((item: any) => item.type === "message" && item.content);
          if (messageItem?.content?.[0]?.text) {
            fullText = messageItem.content[0].text;
          }
        }
      } catch (e) {
        fullText = '';
      }
    }
    
    // Function to summarize text intelligently
    const summarizeText = (text: string): string => {
      if (!text || text.trim().length === 0) return '';
      
      // Remove disclaimer patterns
      const disclaimerPatterns = [
        /I can't browse the web in real-time, but I can provide insights based on my last training data[^.]*\./gi,
        /I'm unable to browse the web directly or fetch real-time search results[^.]*\./gi,
        /I'm unable to search the web or provide real-time data[^.]*\./gi,
        /I'm unable to search the web in real-time[^.]*\./gi,
        /I don't have real-time access to the internet[^.]*\./gi,
        /I cannot browse the web[^.]*\./gi,
        /I'm unable to browse the web[^.]*\./gi,
        /based on my last training data[^.]*\./gi,
        /based on my training data[^.]*\./gi,
        /based on information available up to[^.]*\./gi,
        /my knowledge cutoff[^.]*\./gi,
        /my capabilities are limited to information[^.]*\./gi,
        /based on what I know up to[^.]*\./gi,
        /as my capabilities are limited[^.]*\./gi,
        /However, I can provide[^.]*information based on[^.]*\./gi,
        /For the most accurate and up-to-date information[^.]*\./gi,
        /If you're looking for the most current information[^.]*\./gi,
        /I recommend checking[^.]*for the latest[^.]*\./gi,
      ];
      
      let cleaned = text;
      disclaimerPatterns.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '').trim();
      });
      
      // Remove sentences that start with disclaimers
      cleaned = cleaned.replace(/^I'?m?\s+(unable|cannot|can't)\s+[^.]*\./gmi, '').trim();
      cleaned = cleaned.replace(/^However,\s+[^.]*based on[^.]*\./gmi, '').trim();
      cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
      
      // Remove URL fragments and markdown link artifacts
      cleaned = cleaned.replace(/\(\[([^\]]+)\]\([^\)]+\)\)/g, '$1').trim();
      cleaned = cleaned.replace(/utm_source=openai[\)]*/gi, '').trim();
      cleaned = cleaned.replace(/\)+\s*\*\*/g, '**').trim();
      cleaned = cleaned.replace(/\(+/g, '(').replace(/\)+/g, ')').trim();
      cleaned = cleaned.replace(/\s*\)+\s*\*\*/g, '**').trim();
      cleaned = cleaned.replace(/\s*\)+\s*([A-Z])/g, ' $1').trim();
      cleaned = cleaned.replace(/\s+\)\s+/g, ' ').trim();
      
      if (cleaned.length === 0) return '';
      
      return cleaned;
    };
    
    if (fullText && fullText.trim().length > 0) {
      const summary = summarizeText(fullText);
      if (summary && summary.trim().length > 0) {
        return summary;
      }
    }
    
    if (record.evidence && record.evidence !== "No mention found") {
      return record.evidence;
    }
    
    return 'No response data available';
  };

  const handleShowEvidence = (record: any) => {
    const evidence = extractEvidence(record);
    setSelectedEvidence({
      brand: record.brand || 'Unknown',
      query: record.query || 'Unknown',
      evidence: evidence
    });
    setEvidenceSheetOpen(true);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mention History</h1>
          <p className="text-sm text-muted-foreground">
            View all brand mention checks and results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right text-sm text-muted-foreground">
            <p>Last updated</p>
            <p className="font-medium">{lastRefresh.toLocaleTimeString()}</p>
          </div>
          <Button
            onClick={async () => {
              console.log("🔄 Manual refresh triggered");
              await fetchMentions();
              setLastRefresh(new Date());
            }}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands or queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterMentioned === null ? "default" : "outline"}
                onClick={() => setFilterMentioned(null)}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterMentioned === true ? "default" : "outline"}
                onClick={() => setFilterMentioned(true)}
                size="sm"
              >
                <CheckCircle className="w-3 h-3 mr-1.5" />
                Mentioned
              </Button>
              <Button
                variant={filterMentioned === false ? "default" : "outline"}
                onClick={() => setFilterMentioned(false)}
                size="sm"
              >
                <XCircle className="w-3 h-3 mr-1.5" />
                Not Found
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              <CardTitle>All Checks</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Loading mentions...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No mentions found</p>
              <p className="text-sm mt-1">
                {searchTerm || filterMentioned !== null 
                  ? "Try adjusting your filters" 
                  : "Run some brand checks to see results here"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle px-4 md:px-0">
                <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px] md:w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px] md:w-[150px]">Brand</TableHead>
                    <TableHead className="min-w-[200px] md:min-w-[250px]">Query</TableHead>
                    <TableHead className="hidden md:table-cell w-[200px] md:w-[250px] lg:w-[300px]">Citation Links</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="group">
                      <TableCell>
                        <Badge 
                          variant={record.mentioned ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {record.mentioned ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Mentioned
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Not Found
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {record.brand}
                      </TableCell>
                      <TableCell className="min-w-[200px] md:min-w-[250px] max-w-[300px] md:max-w-none">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span className="text-sm break-words">{record.query}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell w-[200px] md:w-[250px] lg:w-[300px]">
                        {(() => {
                          // Extract citation links from record - comprehensive extraction
                          let citationLinks: Array<{ url: string; title?: string }> = [];
                          
                          // Try source_urls first
                          if (record.source_urls && Array.isArray(record.source_urls) && record.source_urls.length > 0) {
                            citationLinks = record.source_urls.map((url: string) => ({ url }));
                          }
                          
                          // Also extract from raw_output (even if source_urls exists, to get titles)
                          if (record.raw_output) {
                            try {
                              const parsed = typeof record.raw_output === 'string' 
                                ? JSON.parse(record.raw_output) 
                                : record.raw_output;
                              
                              if (parsed?.output && Array.isArray(parsed.output)) {
                                // Find message item for annotations
                                const messageItem = parsed.output.find((item: any) => item.type === "message" && item.content);
                                
                                // Extract from annotations (url_citation)
                                if (messageItem?.content?.[0]?.annotations) {
                                  const annotations = messageItem.content[0].annotations;
                                  annotations.forEach((ann: any) => {
                                    if (ann.type === 'url_citation' && ann.url) {
                                      citationLinks.push({
                                        url: ann.url,
                                        title: ann.title
                                      });
                                    }
                                  });
                                }
                                
                                // Extract from web_search_call.action.sources in output items
                                for (const item of parsed.output) {
                                  if (item?.type === 'web_search_call' && item?.action?.sources) {
                                    const sources = item.action.sources;
                                    sources.forEach((source: any) => {
                                      if (source?.url) {
                                        citationLinks.push({
                                          url: source.url,
                                          title: source.title || source.name
                                        });
                                      }
                                    });
                                  }
                                }
                                
                                // Fallback: regex from text if no structured citations found
                                if (citationLinks.length === 0 && messageItem?.content?.[0]?.text) {
                                  const text = messageItem.content[0].text;
                                  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                                  const urlMatches = text.match(urlRegex) || [];
                                  citationLinks = urlMatches.map((url: string) => ({ url }));
                                }
                              }
                            } catch (e) {
                              // If parsing fails, try regex on raw string
                              if (citationLinks.length === 0) {
                                const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
                                const urlMatches = (typeof record.raw_output === 'string' ? record.raw_output : '').match(urlRegex) || [];
                                citationLinks = urlMatches.map((url: string) => ({ url }));
                              }
                            }
                          }
                          
                          // Remove duplicate URLs (keep first occurrence with title if available)
                          const urlMap = new Map<string, { url: string; title?: string }>();
                          citationLinks.forEach(link => {
                            if (!urlMap.has(link.url) || !urlMap.get(link.url)?.title) {
                              urlMap.set(link.url, link);
                            }
                          });
                          const uniqueLinks = Array.from(urlMap.values());
                          
                          if (uniqueLinks.length > 0) {
                            return (
                              <div className="flex flex-col gap-1.5 max-h-[150px] md:max-h-[200px] overflow-y-auto pr-1">
                                {uniqueLinks.map((link, idx) => {
                                  try {
                                    const urlObj = new URL(link.url);
                                    const domain = urlObj.hostname.replace(/^www\./, '');
                                    return (
                                      <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline truncate max-w-full"
                                        title={link.title || link.url}
                                      >
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{link.title || domain}</span>
                                      </a>
                                    );
                                  } catch (e) {
                                    return (
                                      <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline truncate max-w-full"
                                        title={link.url}
                                      >
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{link.url}</span>
                                      </a>
                                    );
                                  }
                                })}
                              </div>
                            );
                          } else {
                            return (
                              <span className="text-xs text-muted-foreground">
                                No citation links
                              </span>
                            );
                          }
                        })()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleShowEvidence(record)}
                          title="View evidence"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evidence Sheet */}
      <Sheet open={evidenceSheetOpen} onOpenChange={setEvidenceSheetOpen}>
        <SheetContent className="sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Evidence Details</SheetTitle>
            <SheetDescription>
              {selectedEvidence && (
                <div className="space-y-1 mt-2">
                  <p className="font-medium">Brand: {selectedEvidence.brand}</p>
                  <p className="text-sm text-muted-foreground">Query: {selectedEvidence.query}</p>
                </div>
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {selectedEvidence && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Response Summary:</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words bg-muted/50 p-4 rounded-lg max-h-[60vh] overflow-y-auto">
                    {selectedEvidence.evidence || 'No evidence available'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

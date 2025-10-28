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
  Loader2
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMentioned, setFilterMentioned] = useState<boolean | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mention History</h1>
          <p className="text-sm text-muted-foreground">
            View all brand mention checks and results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm text-muted-foreground">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[150px]">Brand</TableHead>
                    <TableHead>Query</TableHead>
                    <TableHead className="hidden lg:table-cell">Evidence</TableHead>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[80px] text-right">Time</TableHead>
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
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                          <span className="text-sm">{record.query}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[400px]">
                        {record.evidence && record.evidence !== "No mention found" ? (
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {record.evidence}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No evidence
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(record.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(record.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

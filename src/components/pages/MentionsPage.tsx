"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle,
  Search,
  Calendar,
  FileText,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function MentionsPage() {
  const [mentions, setMentions] = useState<any[]>([]);
  const [filteredMentions, setFilteredMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "mentioned" | "not-mentioned">("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [queryFilter, setQueryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const mentionsPerPage = 25;

  useEffect(() => {
    fetchMentions();
  }, []);

  useEffect(() => {
    // Filter mentions based on search and filters
    let filtered = mentions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.brand?.toLowerCase().includes(query) ||
        m.query?.toLowerCase().includes(query) ||
        m.raw_output?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === "mentioned") {
      filtered = filtered.filter(m => m.mentioned);
    } else if (statusFilter === "not-mentioned") {
      filtered = filtered.filter(m => !m.mentioned);
    }

    // Brand filter
    if (brandFilter && brandFilter !== "all") {
      filtered = filtered.filter(m => m.brand?.toLowerCase().includes(brandFilter.toLowerCase()));
    }

    // Query filter
    if (queryFilter && queryFilter !== "all") {
      filtered = filtered.filter(m => m.query?.toLowerCase().includes(queryFilter.toLowerCase()));
    }

    setFilteredMentions(filtered);
    setTotalPages(Math.ceil(filtered.length / mentionsPerPage));
    setCurrentPage(1);
  }, [mentions, searchQuery, statusFilter, brandFilter, queryFilter]);

  const fetchMentions = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user?.email) {
        console.error("No user session found");
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      console.log("Fetching mentions for:", userEmail);

      const { data, error } = await supabase
        .from("brand_mentions")
        .select("*")
        .eq("user_email", userEmail)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching mentions:", error);
      } else {
        console.log("✅ Fetched mentions:", data?.length);
        setMentions(data || []);
        setFilteredMentions(data || []);
      }
    } catch (error) {
      console.error("Error in fetchMentions:", error);
    } finally {
      setLoading(false);
    }
  };

  const paginatedMentions = filteredMentions.slice(
    (currentPage - 1) * mentionsPerPage,
    currentPage * mentionsPerPage
  );

  const uniqueBrands = Array.from(new Set(mentions.map(m => m.brand).filter(Boolean)));
  const uniqueQueries = Array.from(new Set(mentions.map(m => m.query).filter(Boolean)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading mentions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Brand Mentions</h1>
          <p className="text-sm text-muted-foreground">
            Search and filter all your brand mentions data
          </p>
        </div>
        <Button onClick={fetchMentions} className="gap-2" size="sm">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Mentions</div>
            <div className="text-2xl font-bold">{mentions.length}</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Brand Found</div>
            <div className="text-2xl font-bold text-green-600">
              {mentions.filter(m => m.mentioned).length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Not Found</div>
            <div className="text-2xl font-bold text-red-600">
              {mentions.filter(m => !m.mentioned).length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Filtered Results</div>
            <div className="text-2xl font-bold">{filteredMentions.length}</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>Search and filter your brand mentions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="mentioned">Brand Found</SelectItem>
                <SelectItem value="not-mentioned">Not Found</SelectItem>
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select value={brandFilter || "all"} onValueChange={(v) => setBrandFilter(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Query Filter */}
            <Select value={queryFilter || "all"} onValueChange={(v) => setQueryFilter(v === "all" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by query" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Queries</SelectItem>
                {uniqueQueries.slice(0, 50).map(query => (
                  <SelectItem key={query} value={query}>{query.length > 40 ? query.substring(0, 40) + '...' : query}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== "all" || (brandFilter && brandFilter !== "all") || (queryFilter && queryFilter !== "all")) && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setBrandFilter("all");
                  setQueryFilter("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mention History</CardTitle>
          <CardDescription>
            Showing {paginatedMentions.length} of {filteredMentions.length} results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedMentions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[150px]">Brand</TableHead>
                      <TableHead>Query</TableHead>
                      <TableHead className="w-[200px]">Date & Time</TableHead>
                      <TableHead className="w-[80px] text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMentions.map((mention) => (
                      <TableRow key={mention.id}>
                        <TableCell>
                          <Badge variant={mention.mentioned ? "default" : "secondary"} className="gap-1.5">
                            {mention.mentioned ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Found
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                None
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{mention.brand || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate max-w-[400px]">{mention.query}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(mention.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            <span className="text-xs">
                              {new Date(mention.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => alert(JSON.stringify(mention.raw_output, null, 2))}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-10"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No mentions found</p>
              <p className="text-sm mt-1">
                {mentions.length === 0 ? "No mentions data available yet" : "Try adjusting your filters"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


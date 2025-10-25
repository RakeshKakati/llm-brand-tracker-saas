"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Search, 
  Filter,
  CheckCircle, 
  XCircle,
  Calendar,
  Clock
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMentioned, setFilterMentioned] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMentions();
  }, []);

  const fetchMentions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("brand_mentions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching mentions:", error);
    } finally {
      setLoading(false);
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mention History</h1>
        <p className="text-gray-600">View all brand mention checks and results</p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search brands or queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
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
              <CheckCircle className="w-3 h-3 mr-1" />
              Mentioned
            </Button>
            <Button
              variant={filterMentioned === false ? "default" : "outline"}
              onClick={() => setFilterMentioned(false)}
              size="sm"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Not Found
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">All Checks</h2>
            <Badge variant="secondary">{filteredRecords.length}</Badge>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading mentions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{record.brand}</h3>
                      <Badge variant={record.mentioned ? "default" : "secondary"}>
                        {record.mentioned ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mentioned
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Found
                          </>
                        )}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{record.query}</p>
                    
                    {record.evidence && record.evidence !== "No mention found" && (
                      <div className="bg-gray-50 p-3 rounded-md mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Evidence:</strong> {record.evidence}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(record.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(record.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredRecords.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No mentions found</p>
                <p className="text-sm">
                  {searchTerm || filterMentioned !== null 
                    ? "Try adjusting your filters" 
                    : "Run some brand checks to see results here"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

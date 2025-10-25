"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TrackerTable() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchMentions();
  }, []);

  async function fetchMentions() {
    const { data, error } = await supabase.from("brand_mentions").select("*").order("created_at", { ascending: false });
    if (!error && data) setRecords(data);
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium mb-4">Recent Mentions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand</TableHead>
            <TableHead>Query</TableHead>
            <TableHead>Mentions</TableHead>
            <TableHead>Evidence</TableHead>
            <TableHead>Checked At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.brand}</TableCell>
              <TableCell>{r.query}</TableCell>
              <TableCell>{r.mentioned ? "✅" : "❌"}</TableCell>
              <TableCell className="max-w-xs truncate">{r.evidence}</TableCell>
              <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

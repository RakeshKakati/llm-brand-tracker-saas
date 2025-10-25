"use client";

import { useState } from "react";
import TrackerForm from "@/components/TrackerForm";
import TrackerTable from "@/components/TrackerTable";
import DashboardShell from "@/components/DashboardShell";

export default function HomePage() {
  const [refresh, setRefresh] = useState(false);

  async function runCheck(brand: string, query: string, interval: number) {
    const res = await fetch("/api/checkMention", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, query, interval }),
    });
    if (res.ok) setRefresh(!refresh);
  }

  return (
    <DashboardShell>
      <TrackerForm onRunCheck={runCheck} />
      <TrackerTable key={String(refresh)} />
    </DashboardShell>
  );
}

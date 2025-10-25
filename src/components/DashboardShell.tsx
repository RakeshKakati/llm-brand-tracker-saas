"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">LLM Brand Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor real-time brand mentions via OpenAI</p>
      </header>
      <Card className="w-full max-w-4xl p-6 shadow-sm rounded-2xl bg-card border">
        {children}
      </Card>
      <footer className="mt-10 text-sm text-muted-foreground">
        Built with ⚡ OpenAI + Supabase + Next.js
      </footer>
    </div>
  );
}

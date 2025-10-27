"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/components/pages/DashboardPage";
import TrackingPage from "@/components/pages/TrackingPage";
import HistoryPage from "@/components/pages/HistoryPage";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import SettingsPage from "@/components/pages/SettingsPage";

export default function NotionLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      console.log("❌ No user found, redirecting to auth");
      router.push("/auth");
    } else if (user) {
      console.log("✅ User authenticated:", user.email);
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if no user
  if (!user) {
    return null;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "tracking":
      case "active":
        return <TrackingPage />;
      case "history":
        return <HistoryPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar onPageChange={setCurrentPage} currentPage={currentPage} />
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

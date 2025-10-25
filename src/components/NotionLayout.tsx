"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardPage from "@/components/pages/DashboardPage";
import TrackingPage from "@/components/pages/TrackingPage";
import HistoryPage from "@/components/pages/HistoryPage";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import SettingsPage from "@/components/pages/SettingsPage";

export default function NotionLayout() {
  const [currentPage, setCurrentPage] = useState("dashboard");

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

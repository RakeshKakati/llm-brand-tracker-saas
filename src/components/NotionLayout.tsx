"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import DashboardPage from "@/components/pages/DashboardPage";
import TrackingPage from "@/components/pages/TrackingPage";
import HistoryPage from "@/components/pages/HistoryPage";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import SettingsPage from "@/components/pages/SettingsPage";
import CompetitorsPage from "@/components/pages/CompetitorsPage";
import TeamsPage from "@/components/pages/TeamsPage";

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
      case "competitors":
        return <CompetitorsPage />;
      case "teams":
        return <TeamsPage />;
      default:
        return <DashboardPage />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard": return "Overview";
      case "tracking": return "Active Trackers";
      case "active": return "Active Trackers";
      case "history": return "Web Visibility";
      case "analytics": return "Analytics";
      case "settings": return "Settings";
      case "competitors": return "Competitors";
      case "teams": return "Teams";
      default: return "Overview";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar onPageChange={setCurrentPage} currentPage={currentPage} userEmail={user?.email || ""} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {renderPage()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

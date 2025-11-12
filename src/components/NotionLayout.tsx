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
import ContactsPage from "@/components/pages/ContactsPage";
import IntegrationsPage from "@/components/pages/IntegrationsPage";
import OnboardingPage from "@/components/pages/OnboardingPage";
import { supabase } from "@/app/lib/supabaseClient";

export default function NotionLayout() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      console.log("❌ No user found, redirecting to auth");
      router.push("/auth");
    } else if (user) {
      console.log("✅ User authenticated:", user.email);
      checkFirstTimeUser();
    }
  }, [user, loading, router]);

  // Check if user is first-time (no trackers)
  const checkFirstTimeUser = async () => {
    if (!user?.email) return;
    
    try {
      setCheckingOnboarding(true);
      const { data, error } = await supabase
        .from("tracked_brands")
        .select("id")
        .eq("user_email", user.email)
        .limit(1);
      
      if (error) {
        console.error("Error checking trackers:", error);
        setCheckingOnboarding(false);
        return;
      }

      // Show onboarding if user has no trackers
      setShowOnboarding(!data || data.length === 0);
    } catch (err) {
      console.error("Error in checkFirstTimeUser:", err);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  // Show loading spinner while checking auth or onboarding status
  if (loading || checkingOnboarding) {
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

  // Show onboarding for first-time users
  if (showOnboarding) {
    return (
      <SidebarProvider>
        <AppSidebar onPageChange={setCurrentPage} currentPage={currentPage} userEmail={user?.email || ""} />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            <OnboardingPage />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
      case "contacts":
        return <ContactsPage />;
      case "integrations":
        return <IntegrationsPage />;
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
      case "contacts": return "Contacts";
      case "integrations": return "Integrations";
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

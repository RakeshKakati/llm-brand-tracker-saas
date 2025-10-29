"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronRight, FileText, LogOut, Settings, Target, Users, ChevronDown, Crown, Zap, Building2 } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/app/lib/supabaseClient";

interface AppSidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
  userEmail: string;
}

export function AppSidebar({ onPageChange, currentPage, userEmail, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ trackers: { used: 0, limit: 3 }, mentions: { used: 0, limit: 50 }, plan: "free" });

  const fetchUsage = async () => {
    if (!userEmail) return;
    
    try {
      const res = await fetch(`/api/usage?user_email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setUsage(data);
      }
    } catch (error) {
      console.error("❌ Error fetching usage:", error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchUsage();
      // Refresh usage every 30 seconds
      const interval = setInterval(fetchUsage, 30000);
      return () => clearInterval(interval);
    }
  }, [userEmail]);

  const handleSignOut = async () => {
    if (!confirm("Are you sure you want to sign out?")) {
      return;
    }

    try {
      setLoading(true);
      console.log("🚪 Signing out user:", userEmail);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        alert("Failed to sign out. Please try again.");
        return;
      }

      localStorage.removeItem("session");
      localStorage.removeItem("user");

      console.log("✅ Sign out successful, redirecting to home...");
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navMain = [
    {
      title: "Overview",
      icon: BarChart3,
      page: "dashboard",
    },
    {
      title: "Competitors",
      icon: Users,
      page: "competitors",
    },
    {
      title: "Web Visibility",
      icon: FileText,
      page: "history",
    },
    {
      title: "Active Trackers",
      icon: Target,
      page: "active",
    },
    {
      title: "Teams",
      icon: Building2,
      page: "teams",
    },
    {
      title: "Settings",
      icon: Settings,
      page: "settings",
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
                <Image 
                  src="/logo.svg" 
                  alt="kommi logo" 
                  width={32} 
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">kommi</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={currentPage === item.page}
                tooltip={item.title}
                onClick={() => onPageChange(item.page)}
              >
                <span className="cursor-pointer">
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {/* Usage Tracking Section */}
        <div className="px-4 py-2 mb-2 border-t border-sidebar-border">
          <div className="space-y-3">
            {/* Trackers Usage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3 h-3" />
                  <span className="font-medium">Trackers</span>
                </div>
                <span className="text-sidebar-muted-foreground">
                  {usage.trackers.used} / {usage.trackers.limit}
                </span>
              </div>
              <Progress 
                value={(usage.trackers.used / usage.trackers.limit) * 100} 
                className="h-1.5"
              />
            </div>

            {/* Mentions Usage */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  <span className="font-medium">Mentions</span>
                </div>
                <span className="text-sidebar-muted-foreground">
                  {usage.mentions.used} / {usage.mentions.limit}
                </span>
              </div>
              <Progress 
                value={(usage.mentions.used / usage.mentions.limit) * 100} 
                className="h-1.5"
              />
            </div>

            {/* Plan Badge */}
            <div className="flex items-center justify-center">
              {usage.plan === 'pro' ? (
                <Badge className="gap-1.5 text-[10px] px-2 py-0.5">
                  <Crown className="w-3 h-3" />
                  Pro Plan
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                  Free Plan
                </Badge>
              )}
            </div>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {userEmail ? userEmail.slice(0, 2).toUpperCase() : "US"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Account</span>
                    <span className="truncate text-xs">{userEmail}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleSignOut} disabled={loading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {loading ? "Signing out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

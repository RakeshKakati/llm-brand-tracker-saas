"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, BarChart3, ChevronRight, Clock, FileText, LogOut, Search, Settings, Target } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, User2 } from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

interface AppSidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
  userEmail: string;
}

export function AppSidebar({ onPageChange, currentPage, userEmail, ...props }: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      title: "Dashboard",
      icon: BarChart3,
      page: "dashboard",
    },
    {
      title: "Brand Tracking",
      icon: Search,
      page: "tracking",
      items: [
        { title: "Active Trackers", page: "active" },
        { title: "Mention History", page: "history" },
        { title: "Analytics", page: "analytics" },
      ],
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Target className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Brand Tracker</span>
                <span className="truncate text-xs">SaaS Platform</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) =>
            item.items ? (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.page === "tracking"}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={currentPage === subItem.page}
                            onClick={() => onPageChange(subItem.page)}
                          >
                            <span className="cursor-pointer">{subItem.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
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
            )
          )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
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

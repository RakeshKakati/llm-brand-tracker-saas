"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  ClipboardListIcon,
  FileIcon,
  LayoutDashboardIcon,
  Activity,
  Target,
  History,
} from "lucide-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onPageChange: (page: string) => void;
  currentPage: string;
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
      page: "dashboard"
    },
    {
      title: "Active Trackers",
      url: "#",
      icon: Activity,
      page: "active"
    },
    {
      title: "Mention History",
      url: "#",
      icon: History,
      page: "history"
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChartIcon,
      page: "analytics"
    },
  ],
  navSecondary: [],
  documents: [
    {
      name: "Brand Mentions",
      url: "#",
      icon: Target,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Data Export",
      url: "#",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ onPageChange, currentPage, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Brand Tracker</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} onPageChange={onPageChange} currentPage={currentPage} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" onPageChange={onPageChange} currentPage={currentPage} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser onPageChange={onPageChange} />
      </SidebarFooter>
    </Sidebar>
  )
}

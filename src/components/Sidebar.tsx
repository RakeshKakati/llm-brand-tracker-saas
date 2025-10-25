"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  BarChart3, 
  Settings, 
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  Activity
} from "lucide-react";

interface SidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ onPageChange, currentPage }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["tracking"]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      page: "dashboard"
    },
    {
      id: "tracking",
      label: "Brand Tracking",
      icon: Search,
      page: "tracking",
      children: [
        { id: "active", label: "Active Trackers", page: "active" },
        { id: "history", label: "Mention History", page: "history" },
        { id: "analytics", label: "Analytics", page: "analytics" }
      ]
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      page: "settings"
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Brand Tracker</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            <Button
              variant="ghost"
              className={`w-full justify-start h-8 px-2 text-sm font-normal ${
                currentPage === item.page ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => {
                if (item.children) {
                  toggleSection(item.id);
                } else {
                  onPageChange(item.page);
                }
              }}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
              {item.children && (
                expandedSections.includes(item.id) ? 
                  <ChevronDown className="w-3 h-3 ml-auto" /> : 
                  <ChevronRight className="w-3 h-3 ml-auto" />
              )}
            </Button>
            
            {item.children && expandedSections.includes(item.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Button
                    key={child.id}
                    variant="ghost"
                    className={`w-full justify-start h-7 px-2 text-xs font-normal ${
                      currentPage === child.page ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => onPageChange(child.page)}
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    {child.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button className="w-full justify-start h-8 px-2 text-sm font-normal text-gray-600 hover:text-gray-900">
          <Plus className="w-4 h-4 mr-2" />
          New Tracker
        </Button>
      </div>
    </div>
  );
}
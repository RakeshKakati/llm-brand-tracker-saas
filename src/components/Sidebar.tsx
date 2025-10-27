"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/app/lib/supabaseClient";
import { 
  Search, 
  BarChart3, 
  Settings, 
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  Activity,
  LogOut,
  User
} from "lucide-react";

interface SidebarProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ onPageChange, currentPage }: SidebarProps) {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(["tracking"]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        console.log("👤 Sidebar - User logged in:", session.user.email);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

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
      
      // Clear localStorage
      localStorage.removeItem('session');
      localStorage.removeItem('user');
      
      console.log("✅ Sign out successful, redirecting to home...");
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error("Sign out error:", error);
      alert("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      {/* User Info & Sign Out at Bottom */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* User Info */}
        <div className="px-3 py-2 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-3 h-3 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">Logged in as</span>
          </div>
          <p className="text-xs text-gray-600 truncate" title={userEmail}>
            {userEmail || "Loading..."}
          </p>
        </div>

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          disabled={loading}
          variant="ghost"
          className="w-full justify-start h-8 px-2 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>
    </div>
  );
}
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Key,
  Globe,
  Clock
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <div className="space-y-8">
        {/* Account Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input 
                placeholder="your@email.com" 
                className="mt-1"
                disabled
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Display Name</Label>
              <Input 
                placeholder="Your Name" 
                className="mt-1"
                disabled
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button variant="outline" disabled>
              Update Account
            </Button>
          </div>
        </Card>

        {/* API Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Key className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">OpenAI API Key</h3>
                <Badge variant="secondary">Configured</Badge>
              </div>
              <p className="text-sm text-gray-600">Used for brand mention detection and web search</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Supabase Configuration</h3>
                <Badge variant="secondary">Connected</Badge>
              </div>
              <p className="text-sm text-gray-600">Database and authentication services</p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Get notified when mentions are found</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Real-time Alerts</h3>
                <p className="text-sm text-gray-600">Instant notifications for important mentions</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Configure
              </Button>
            </div>
          </div>
        </Card>

        {/* Application Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Application</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Default Check Interval</Label>
                <Input 
                  type="number" 
                  placeholder="5" 
                  className="mt-1"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Minutes between automatic checks</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Max Trackers</Label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  className="mt-1"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Maximum active trackers</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Dark Mode</h3>
                <p className="text-sm text-gray-600">Switch between light and dark themes</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-medium text-green-900">OpenAI API</h3>
              </div>
              <p className="text-sm text-green-700">Operational</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-medium text-green-900">Database</h3>
              </div>
              <p className="text-sm text-green-700">Connected</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-medium text-green-900">Web Search</h3>
              </div>
              <p className="text-sm text-green-700">Active</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

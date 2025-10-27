"use client";

import { useState, useEffect } from "react";
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
  Clock,
  Crown,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Target,
  AlertCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";
import { getStripe, STRIPE_PLANS } from "@/lib/stripe";

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);

  useEffect(() => {
    fetchUserData();
    
    // Check if user just upgraded or cancelled
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('upgraded') === 'true') {
      console.log("🎉 Payment successful! Refreshing subscription data...");
      alert("🎉 Payment successful! Your subscription is being upgraded to Pro...");
      
      // Refresh multiple times to catch webhook update
      setTimeout(() => fetchUserData(), 1000);
      setTimeout(() => fetchUserData(), 3000);
      setTimeout(() => fetchUserData(), 5000);
      
      // Remove query params from URL
      window.history.replaceState({}, '', '/dashboard?page=settings');
    } else if (urlParams.get('cancelled') === 'true') {
      console.log("⚠️ Payment cancelled");
      alert("Payment was cancelled. You can upgrade anytime!");
      window.history.replaceState({}, '', '/dashboard?page=settings');
    }
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      console.log("📧 SettingsPage - Session:", session?.user?.email);
      
      setUser(session?.user);

      if (session?.user?.email) {
        // Fetch subscription
        console.log("🔍 Fetching subscription for:", session.user.email);
        const { data: subData, error: subError } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_email", session.user.email)
          .maybeSingle();

        if (subError) {
          console.error("❌ Subscription fetch error:", subError);
        } else if (subData) {
          console.log("✅ Subscription found:", subData);
          setSubscription(subData);
        } else {
          console.log("⚠️ No subscription found - should be created on signup");
          // Default to free plan if not found
          setSubscription({
            plan_type: "free",
            status: "active",
          });
        }
      } else {
        console.log("❌ No user email in session");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "pro": return "bg-purple-600";
      case "enterprise": return "bg-blue-600";
      default: return "bg-green-600";
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "pro": return "Pro";
      case "enterprise": return "Enterprise";
      default: return "Free";
    }
  };

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);

      if (!user?.email) {
        alert("Please sign in to upgrade");
        return;
      }

      console.log("💳 Starting upgrade process for:", user.email);

      // Create Stripe checkout session (API will use price ID from server env)
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Checkout creation failed:", data);
        throw new Error(data.error || "Failed to create checkout session");
      }

      console.log("✅ Checkout session created:", data);

      // Redirect to Stripe Checkout
      if (data.url) {
        console.log("🔗 Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL returned");
      }
    } catch (error: any) {
      console.error("❌ Upgrade error:", error);
      alert(error.message || "Failed to start upgrade process");
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true);

      if (!user?.email) {
        alert("Please sign in to manage subscription");
        return;
      }

      console.log("🏛️  Opening customer portal for:", user.email);

      // Create portal session
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session");
      }

      console.log("✅ Portal session created, redirecting...");

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error: any) {
      console.error("❌ Portal error:", error);
      alert(error.message || "Failed to open customer portal");
    } finally {
      setManagingSubscription(false);
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      {/* Subscription Status */}
      {loading ? (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${getPlanColor(subscription?.plan_type || 'free')}`}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
                <Badge variant="outline" className="mt-1">
                  {getPlanLabel(subscription?.plan_type || 'free')}
                </Badge>
              </div>
            </div>
            {subscription?.plan_type === 'free' || !subscription?.plan_type ? (
              <Button 
                onClick={handleUpgrade} 
                disabled={upgrading}
                className="gap-2"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Upgrade to Pro - $29/month
                  </>
                )}
              </Button>
            ) : subscription.stripe_subscription_id ? (
              <Button 
                onClick={handleManageSubscription}
                disabled={managingSubscription}
                variant="outline" 
                className="gap-2"
              >
                {managingSubscription ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Manage Subscription
                  </>
                )}
              </Button>
            ) : null}
          </div>
          
          <div className="p-4 bg-background rounded-lg border mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {subscription?.plan_type === 'pro' ? '💎 Pro Plan Features' : '🆓 Free Plan'}
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription?.plan_type === 'pro' 
                    ? 'Unlimited trackers, hourly checks, advanced analytics' 
                    : '5 trackers, daily checks, basic analytics'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {subscription?.plan_type === 'pro' ? '$29' : '$0'}
                </p>
                <p className="text-sm text-gray-600">per month</p>
              </div>
            </div>
          </div>

          {subscription?.current_period_end && (
            <div className="p-4 bg-background rounded-lg border mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Billing Period</h3>
              </div>
              <p className="text-sm text-gray-600">
                Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          )}
        </Card>
      )}

      <div className="space-y-8">
        {/* Account Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <Input 
                    value={user?.email || ""}
                    placeholder="your@email.com" 
                    className="mt-1"
                    disabled
                  />
                  {user?.email && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">User ID</Label>
                  <Input 
                    value={user?.id || ""}
                    placeholder="User ID" 
                    className="mt-1"
                    disabled
                  />
                </div>
              </div>
              
              {user && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Account Information</h3>
                  </div>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><strong>Email:</strong> {user.email}</p>
                    {user.user_metadata?.full_name && (
                      <p><strong>Name:</strong> {user.user_metadata.full_name}</p>
                    )}
                    <p><strong>Created:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Button variant="outline" disabled>
                  Update Account
                </Button>
              </div>
            </>
          )}
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

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  CreditCard,
  Crown,
  TrendingUp,
  Loader2,
  CheckCircle,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/app/lib/supabaseClient";

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
  });
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
      
      if (session?.user) {
        setUser(session.user);
        
        // Load user metadata if available
        if (session.user.user_metadata?.full_name) {
          setProfile({
            full_name: session.user.user_metadata.full_name,
          });
        }
      }

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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      if (!user?.email) {
        alert("Please sign in to update your profile");
        return;
      }

      console.log("💾 Updating profile for:", user.email);

      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
        }
      });

      if (error) throw error;

      console.log("✅ Profile updated successfully");
      alert("✅ Profile updated successfully!");
      
      // Refresh user data
      fetchUserData();
    } catch (error: any) {
      console.error("❌ Error updating profile:", error);
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
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

  const getPlanFeatures = (plan: string) => {
    switch (plan) {
      case "pro":
        return [
          "Unlimited brand trackers",
          "Hourly monitoring checks",
          "Advanced analytics dashboard",
          "Competitor tracking",
          "Email notifications",
          "API access",
          "Priority support",
        ];
      case "enterprise":
        return [
          "Everything in Pro",
          "Custom integrations",
          "Dedicated account manager",
          "SLA guarantees",
          "Custom features",
        ];
      default:
        return [
          "5 active brand trackers",
          "Daily monitoring checks",
          "Basic analytics",
          "Email notifications",
        ];
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account, profile, and subscription</p>
      </div>

      <div className="grid gap-6">
        {/* User Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={profile.full_name || ""}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    {user?.email && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user_id" className="text-sm font-medium">
                    User ID
                  </Label>
                  <Input
                    id="user_id"
                    value={user?.id || ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Your unique identifier (cannot be changed)
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-sm text-gray-600">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="min-w-[120px]"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Section */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <CardTitle>Billing & Subscription</CardTitle>
              </div>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${getPlanColor(subscription?.plan_type || 'free')}`}>
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">Current Plan</h3>
                          <Badge variant="outline" className="text-sm">
                            {getPlanLabel(subscription?.plan_type || 'free')}
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold text-gray-700">
                          ${subscription?.plan_type === 'pro' ? '19' : '0'} <span className="text-sm font-normal text-gray-600">/month</span>
                        </p>
                      </div>
                    </div>
                    {subscription?.plan_type === 'free' || !subscription?.plan_type ? (
                      <Button 
                        onClick={handleUpgrade} 
                        disabled={upgrading}
                        size="lg"
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
                            Upgrade to Pro
                          </>
                        )}
                      </Button>
                    ) : subscription.stripe_subscription_id ? (
                      <Button 
                        onClick={handleManageSubscription}
                        disabled={managingSubscription}
                        variant="outline"
                        size="lg"
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
                            Manage Billing
                          </>
                        )}
                      </Button>
                    ) : null}
                  </div>
                  
                  {/* Plan Features */}
                  <div className="space-y-2 mb-6">
                    {getPlanFeatures(subscription?.plan_type || 'free').map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <p className="text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>

                  {/* Billing Period */}
                  {subscription?.current_period_end && (
                    <div className="flex items-center gap-2 p-4 bg-white rounded-lg border">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Current Billing Period</p>
                        <p className="text-sm text-gray-600">
                          {subscription.current_period_start && (
                            <span>{new Date(subscription.current_period_start).toLocaleDateString()}</span>
                          )}
                          {subscription.current_period_end && (
                            <span> - {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                          )}
                        </p>
                        {subscription.status === 'active' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {subscription?.status === 'cancelled' && (
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Subscription Cancelled</p>
                        <p className="text-sm text-yellow-700">
                          Your subscription will remain active until {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'the end of your billing period'}.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

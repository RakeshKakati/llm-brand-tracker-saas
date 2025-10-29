"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Mail,
  Crown,
  User,
  Eye,
  Trash2,
  MoreVertical,
  Settings,
  Check,
  X,
  Loader2,
  Building2,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/app/lib/supabaseClient";
import { toast } from "sonner";
import TeamWorkspacePage from "./TeamWorkspacePage";

interface Team {
  id: string;
  name: string;
  description?: string;
  owner_email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "pending" | "invited";
  created_at: string;
}

interface TeamMember {
  id: string;
  user_email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "pending" | "invited";
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
}

interface Invitation {
  id: string;
  team_id: string;
  user_email: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "invited";
  invited_by?: string;
  invited_at?: string;
  team: {
    id: string;
    name: string;
    description?: string;
    owner_email: string;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [subscription, setSubscription] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin" | "viewer">("member");
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [viewingWorkspace, setViewingWorkspace] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndTeams();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchPendingInvitations();
    }
  }, [userEmail]);

  const fetchUserAndTeams = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
      console.error("❌ No user session");
        return;
      }

      setUserEmail(session.user.email);
      
      // Fetch subscription to check plan type
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_email", session.user.email)
        .maybeSingle();
      
      setSubscription(subData || { plan_type: "free", status: "active" });
      
      await fetchTeams(session.user.email);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchPendingInvitations = async () => {
    if (!userEmail) return;
    
    try {
      setLoadingInvitations(true);
      const res = await fetch(`/api/teams/invitations?user_email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      
      if (res.ok) {
        setPendingInvitations(data.invitations || []);
      } else {
        console.error("Error fetching invitations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleInvitationAction = async (invitationId: string, action: "accept" | "decline") => {
    if (!userEmail) return;

    try {
      const res = await fetch("/api/teams/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId,
          action,
          user_email: userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === "accept") {
          toast.success(data.message || "Invitation accepted!");
          // Refresh teams and invitations
          await fetchTeams(userEmail);
        } else {
          toast.success("Invitation declined");
        }
        // Refresh invitations list
        await fetchPendingInvitations();
      } else {
        toast.error(data.error || `Failed to ${action} invitation`);
      }
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
      toast.error(`Failed to ${action} invitation`);
    }
  };

  const fetchTeams = async (email: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/teams/list?user_email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      if (res.ok) {
        setTeams(data.teams || []);
      } else {
        toast.error(data.error || "Failed to fetch teams");
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (teamId: string) => {
    if (!userEmail) return;
    try {
      setLoadingMembers(true);
      const res = await fetch(
        `/api/teams/${teamId}/members?user_email=${encodeURIComponent(userEmail)}`
      );
      const data = await res.json();
      
      if (res.ok) {
        setMembers(data.members || []);
      } else {
        toast.error(data.error || "Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
          owner_email: userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Team created successfully!");
        setShowCreateDialog(false);
        setTeamName("");
        setTeamDescription("");
        await fetchTeams(userEmail);
      } else {
        toast.error(data.error || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedTeam) {
      toast.error("Email and team selection required");
      return;
    }

    try {
      setInviting(true);
      const res = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: inviteEmail,
          role: inviteRole,
          inviter_email: userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Invitation sent to ${inviteEmail}. They'll see it in their Teams page.`);
        setShowInviteDialog(false);
        setInviteEmail("");
        setInviteRole("member");
        await fetchMembers(selectedTeam.id);
        // Refresh invitations in case user invited themselves (testing) or refresh for invited user
        await fetchPendingInvitations();
      } else {
        toast.error(data.error || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    if (!selectedTeam || !confirm(`Remove ${memberEmail} from team?`)) {
      return;
    }

    try {
      const res = await fetch(
        `/api/teams/${selectedTeam.id}/members/${memberId}?user_email=${encodeURIComponent(userEmail)}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        toast.success("Member removed successfully");
        await fetchMembers(selectedTeam.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleUpdateMemberRole = async (
    memberId: string,
    newRole: "admin" | "member" | "viewer"
  ) => {
    if (!selectedTeam) return;

    try {
      const res = await fetch(
        `/api/teams/${selectedTeam.id}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: newRole,
            user_email: userEmail,
          }),
        }
      );

      if (res.ok) {
        toast.success("Member role updated");
        await fetchMembers(selectedTeam.id);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleAcceptInvitation = async (teamId: string) => {
    try {
      // Find the pending invitation
      const member = members.find(
        (m) => m.user_email === userEmail && m.status === "pending"
      );
      if (!member) return;

      const res = await fetch(
        `/api/teams/${teamId}/members/${member.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "active",
            user_email: userEmail,
          }),
        }
      );

      if (res.ok) {
        toast.success("Invitation accepted!");
        await fetchTeams(userEmail);
        if (selectedTeam?.id === teamId) {
          await fetchMembers(teamId);
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to accept invitation");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-yellow-500"><Crown className="w-3 h-3 mr-1" />Owner</Badge>;
      case "admin":
        return <Badge className="bg-purple-500"><Settings className="w-3 h-3 mr-1" />Admin</Badge>;
      case "member":
        return <Badge variant="outline"><User className="w-3 h-3 mr-1" />Member</Badge>;
      case "viewer":
        return <Badge variant="outline"><Eye className="w-3 h-3 mr-1" />Viewer</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const canManage = (team: Team) => {
    return team.role === "owner" || team.role === "admin";
  };

  const isPro = subscription?.plan_type === "pro" && subscription?.status === "active";

  const handleUpgrade = async () => {
    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("❌ Upgrade error:", error);
      toast.error(error.message || "Failed to start upgrade process");
    }
  };

  const handleViewWorkspace = (teamId: string) => {
    // Allow all users to view team workspaces (free users can view but not create)
    setViewingWorkspace(teamId);
  };

  // If viewing a team workspace, show that instead
  if (viewingWorkspace) {
    return (
      <TeamWorkspacePage
        teamId={viewingWorkspace}
        onBack={() => setViewingWorkspace(null)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Upgrade Banner for Free Users */}
      {!isPro && (
        <Card className="border-primary bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upgrade to Pro for Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Create teams, invite members, and collaborate on brand tracking. Only Pro plan users can create and access team workspaces.
                  </p>
                </div>
              </div>
              <Button onClick={handleUpgrade} className="whitespace-nowrap">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-sm text-muted-foreground">
            Collaborate with your team on brand tracking and monitoring
          </p>
        </div>
        {isPro ? (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a team workspace to collaborate with your colleagues
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Marketing Team"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Team for tracking brand mentions"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        ) : (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button disabled variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Team (Pro Required)
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upgrade to Pro</DialogTitle>
                <DialogDescription>
                  Team collaboration is a Pro feature. Upgrade to create teams and invite members.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Pro Plan Features:</h3>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            Create unlimited teams
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            Invite team members
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            Shared team workspaces
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            10 brand trackers
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-primary" />
                            Hourly checks & advanced analytics
                          </li>
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-lg font-bold mb-1">$19/month</p>
                        <p className="text-sm text-muted-foreground">Cancel anytime</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpgrade}>
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              You have {pendingInvitations.length} pending team invitation{pendingInvitations.length > 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-background"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{invitation.team.name}</h4>
                    {invitation.team.description && (
                      <p className="text-sm text-muted-foreground mt-1">{invitation.team.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {getRoleBadge(invitation.role)}
                      <span className="text-xs text-muted-foreground">
                        Invited {invitation.invited_at ? new Date(invitation.invited_at).toLocaleDateString() : "recently"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleInvitationAction(invitation.id, "accept")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInvitationAction(invitation.id, "decline")}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Teams
          </CardTitle>
          <CardDescription>
            Teams you own or are a member of
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">No teams yet</p>
              <p className="text-sm mt-1">Create a team to start collaborating</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <Card
                  key={team.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTeam?.id === team.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => {
                    setSelectedTeam(team);
                    fetchMembers(team.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{team.name}</h3>
                          {getRoleBadge(team.role)}
                        </div>
                        {team.description && (
                          <p className="text-sm text-muted-foreground">{team.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Owner: {team.owner_email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewWorkspace(team.id);
                          }}
                        >
                          View Workspace
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeam(team);
                            fetchMembers(team.id);
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      {selectedTeam && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
                <CardDescription>
                  {selectedTeam.name} - Manage team members
                </CardDescription>
              </div>
              {canManage(selectedTeam) && (
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join this team
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="invite-email">Email Address *</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="invite-role">Role</Label>
                        <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer - Read only access</SelectItem>
                            <SelectItem value="member">Member - Can view and create trackers</SelectItem>
                            <SelectItem value="admin">Admin - Can manage members</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteMember} disabled={inviting}>
                        {inviting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    {canManage(selectedTeam) && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-primary" />
                          </div>
                          {member.user_email}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>
                        {member.status === "pending" && member.user_email === userEmail ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcceptInvitation(selectedTeam.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                        ) : (
                          <Badge variant={member.status === "active" ? "default" : "secondary"}>
                            {member.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.joined_at
                          ? new Date(member.joined_at).toLocaleDateString()
                          : member.invited_at
                          ? `Invited ${new Date(member.invited_at).toLocaleDateString()}`
                          : "-"}
                      </TableCell>
                      {canManage(selectedTeam) && member.user_email !== selectedTeam.owner_email && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {member.role !== "admin" && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateMemberRole(member.id, "admin")}
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Make Admin
                                </DropdownMenuItem>
                              )}
                              {member.role !== "member" && member.role !== "owner" && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateMemberRole(member.id, "member")}
                                >
                                  <User className="w-4 h-4 mr-2" />
                                  Make Member
                                </DropdownMenuItem>
                              )}
                              {member.role !== "viewer" && (
                                <DropdownMenuItem
                                  onClick={() => handleUpdateMemberRole(member.id, "viewer")}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Make Viewer
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.id, member.user_email)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


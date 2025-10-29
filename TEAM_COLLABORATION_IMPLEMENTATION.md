# Team Collaboration Feature Implementation Guide

## ✅ What's Been Implemented

### 1. Database Schema (`add-teams-feature.sql`)
- ✅ `teams` table - Stores team information
- ✅ `team_members` table - Stores team membership with roles (owner, admin, member, viewer)
- ✅ `team_id` columns added to `tracked_brands` and `brand_mentions` tables
- ✅ Comprehensive RLS policies for team-based access control
- ✅ Helper function `get_user_teams()` for efficient team queries

### 2. API Routes
- ✅ `POST /api/teams/create` - Create new team
- ✅ `GET /api/teams/list` - List user's teams
- ✅ `GET /api/teams/[teamId]/members` - Get team members
- ✅ `POST /api/teams/[teamId]/members` - Invite team member
- ✅ `PATCH /api/teams/[teamId]/members/[memberId]` - Update member role/status
- ✅ `DELETE /api/teams/[teamId]/members/[memberId]` - Remove team member

### 3. UI Components
- ✅ `TeamsPage.tsx` - Full team management interface
  - Create teams
  - View team list
  - Invite members
  - Manage member roles
  - Accept invitations
  - Remove members

### 4. Navigation
- ✅ Added "Teams" menu item to Sidebar
- ✅ Integrated TeamsPage into NotionLayout routing

## 📋 Setup Instructions

### Step 1: Run Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `add-teams-feature.sql`
3. Run the migration
4. Verify all tables and policies were created successfully

### Step 2: Verify RLS Policies
The migration includes comprehensive RLS policies:
- Teams: Users can view teams they own or are members of
- Team Members: Role-based access control
- Tracked Brands: Include team-based access
- Brand Mentions: Include team-based access

### Step 3: Test the Feature
1. Log in to your application
2. Navigate to "Teams" in the sidebar
3. Create a new team
4. Invite team members
5. Verify team members can see shared data

## 🔄 Next Steps (To Complete Implementation)

### 1. Update Dashboard/Pages to Support Team Context
**Priority: High**

Currently, dashboard and other pages only show user's own data. Need to:
- Add team selector dropdown
- Filter queries to include team data when team is selected
-assessment in DashboardPage.tsx, HistoryPage.tsx, AnalyticsPage.tsx

**Example update for DashboardPage.tsx:**
```typescript
// Add team context state
const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

// Update queries to include team filter
const { data: mentions } = await supabase
  .from("brand_mentions")
  .select("*")
  .eq("user_email", userEmail)
  .or(selectedTeamId ? `team_id.eq.${selectedTeamId},user_email.eq.${userEmail}` : undefined);
```

### 2. Update Tracker Creation to Support Teams
**Priority: High**

When creating a tracker, allow users to assign it to a team:

**File: `src/app/api/trackBrand/route.ts`**
```typescript
// Add team_id to request body
const { brand, query, interval, user_email, user_id, team_id } = await req.json();

// Include team_id in insert
.insert([
  {
    brand,
    query,
    interval,
    user_email,
    user_id,
    team_id: team_id || null, // Optional - can be personal or team tracker
  },
])
```

**File: `src/components/pages/TrackingPage.tsx`**
- Add team selector when creating new tracker
- Show team badge on trackers that belong to teams

### 3. Email Invitations
**Priority: Medium**

Currently invitations are stored but no emails are sent. To implement:

1. Set up email service (Resend recommended):
```bash
npm install resend
```

2. Create email template:
```typescript
// src/lib/emails/team-invitation.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTeamInvitationEmail(
  inviteeEmail: string,
  teamName: string,
  inviterEmail: string,
  inviteLink: string
) {
  await resend.emails.send({
    from: 'kommi <invitations@kommi.ai>',
    to: inviteeEmail,
    subject: `You've been invited to join ${teamName}`,
    html: `
      <h2>Team Invitation</h2>
      <p>${inviterEmail} has invited you to join the team "${teamName}" on kommi.</p>
      <a href="${inviteLink}">Accept Invitation</a>
    `,
  });
}
```

3. Update invitation endpoint:
```typescript
// In /api/teams/[teamId]/members route.ts
import { sendTeamInvitationEmail } from '@/lib/emails/team-invitation';

// After creating invitation record
await sendTeamInvitationEmail(
  inviteeEmail,
  team.name,
  inviter_email,
  `${process.env.NEXT_PUBLIC_APP_URL}/teams?invite=${member.id}`
);
```

### 4. Team Activity Feed
**Priority: Low**

Show team activity in a dedicated section or sidebar widget:
- New trackers created by team members
- New mentions found
- Member invitations and joins
- Role changes

### 5. Team Settings
**Priority: Low**

Add team settings page:
- Update team name and description
- Transfer ownership
- Delete team
- Export team data

## 🎯 Role Permissions

### Owner
- ✅ Create/edit/delete team
- ✅ Invite/remove members
- ✅ Change member roles
- ✅ Transfer ownership
- ✅ View all team data

### Admin
- ✅ Invite/remove members (except owner)
- ✅ Change member roles (except owner)
- ✅ View all team data
- ❌ Cannot delete team
- ❌ Cannot transfer ownership

### Member
- ✅ Create trackers for team
- ✅ View all team data
- ✅ Accept invitations
- ❌ Cannot invite members
- ❌ Cannot change roles

### Viewer
- ✅ View all team data
- ❌ Cannot create trackers
- ❌ Cannot invite members
- ❌ Cannot change roles

## 🔐 Security Considerations

1. **RLS Policies**: All data access is controlled by Row Level Security policies
2. **Role Verification**: All API routes verify user permissions before allowing actions
3. **Email Validation**: Team invitations validate email addresses
4. **Owner Protection**: Cannot remove team owner or change owner role

## 📊 Data Flow

```
User creates team
  ↓
Team record created in `teams` table
  ↓
Owner automatically added to `team_members` with role="admin"
  ↓
Owner invites members
  ↓
Members receive invitation (status="invited")
  ↓
Member accepts invitation (status="active")
  ↓
Member can now view team trackers and mentions
```

## 🚀 Testing Checklist

- [ ] Create a new team
- [ ] Invite team member (existing user)
- [ ] Accept invitation
- [ ] Create tracker assigned to team
- [ ] Verify team members can see team tracker
- [ ] Update member role
- [ ] Remove team member
- [ ] Verify RLS prevents unauthorized access
- [ ] Test with multiple teams (user owns one, member of another)

## 📝 Known Limitations

1. **Email Invitations**: Currently stored but not sent (see Next Steps #3)
2. **Team Selector**: Dashboard/pages don't yet have team context selector
3. **Invitation Links**: No auto-generated invitation acceptance links
4. **Team Limits**: No limits on team size (could add per plan)
5. **Team Export**: No bulk export of team data

## 🔗 Related Files

- Database: `add-teams-feature.sql`
- API Routes: `src/app/api/teams/**/*.ts`
- UI: `src/components/pages/TeamsPage.tsx`
- Navigation: `src/components/Sidebar.tsx`, `src/components/NotionLayout.tsx`

## 💡 Future Enhancements

1. **Team Analytics**: Aggregate analytics across team members
2. **Team Templates**: Pre-configured tracker sets for teams
3. **Team Slack Integration**: Notify team channel of new mentions
4. **Team Export**: Export team data as PDF/CSV
5. **Team Activity Dashboard**: Visual activity feed for teams
6. **Team Permissions Granular**: Per-tracker permissions (view/edit/delete)

---

**Status**: Core functionality complete ✅ | UI complete ✅ | Team context in pages pending ⏳


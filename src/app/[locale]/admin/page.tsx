import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/[locale]/components/ui/card";
import { Briefcase, Users, Eye, MousePointerClick, UserPlus, Bell, Mail, FlaskConical, Share2, Clock, Gift, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import { Badge } from "@/app/[locale]/components/ui/badge";

async function getStats() {
  const [jobsResult, interactionsResult] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = TRUE) as active_jobs,
        COUNT(*) as total_jobs
      FROM job_offers
    `),
    db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE action = 'viewed') as views,
        COUNT(*) FILTER (WHERE action = 'applied') as applications,
        COUNT(*) FILTER (WHERE action = 'seen_contact') as contact_views,
        COUNT(DISTINCT user_id) as unique_users
      FROM job_offer_interactions
    `),
  ]);

  const jobs = jobsResult.rows[0] as Record<string, unknown>;
  const interactions = interactionsResult.rows[0] as Record<string, unknown>;

  return {
    activeJobs: Number(jobs?.active_jobs ?? 0),
    totalJobs: Number(jobs?.total_jobs ?? 0),
    views: Number(interactions?.views ?? 0),
    applications: Number(interactions?.applications ?? 0),
    contactViews: Number(interactions?.contact_views ?? 0),
    uniqueUsers: Number(interactions?.unique_users ?? 0),
  };
}

async function getSharingStats() {
  const [sharesResult, invitesResult] = await Promise.all([
    db.execute(sql`SELECT COUNT(*) as count FROM flavour_shares`),
    db.execute(sql`SELECT COUNT(*) as count FROM flavour_invites WHERE status = 'pending'`),
  ]);

  return {
    totalShares: Number((sharesResult.rows[0] as Record<string, unknown>)?.count ?? 0),
    pendingInvites: Number((invitesResult.rows[0] as Record<string, unknown>)?.count ?? 0),
  };
}

type PendingInvite = {
  invite_id: number;
  invited_email: string;
  created_at: string;
  flavour_name: string;
  inviter_username: string | null;
  inviter_email: string;
};

async function getPendingInvites(): Promise<PendingInvite[]> {
  const result = await db.execute(sql`
    SELECT
      fi.invite_id,
      fi.invited_email,
      fi.created_at,
      f.name as flavour_name,
      u.username as inviter_username,
      u.email as inviter_email
    FROM flavour_invites fi
    JOIN flavour f ON fi.flavour_id = f.flavour_id
    JOIN users u ON fi.invited_by_user_id = u.user_id
    WHERE fi.status = 'pending'
    ORDER BY fi.created_at DESC
    LIMIT 50
  `);

  return result.rows as PendingInvite[];
}

async function getUserStats() {
  const [
    totalUsersResult,
    newUsersResult,
    activeUsersResult,
    alertUsersResult,
    newsletterResult,
  ] = await Promise.all([
    db.execute(sql`SELECT COUNT(*) as count FROM users`),
    db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '7 days'`),
    db.execute(sql`SELECT COUNT(DISTINCT user_id) as count FROM job_offer_interactions`),
    db.execute(sql`SELECT COUNT(*) as count FROM job_alert_preferences WHERE is_active = TRUE`),
    db.execute(sql`SELECT COUNT(*) as count FROM newsletter_subscribers WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL`),
  ]);

  return {
    totalUsers: Number((totalUsersResult.rows[0] as Record<string, unknown>)?.count ?? 0),
    newUsers: Number((newUsersResult.rows[0] as Record<string, unknown>)?.count ?? 0),
    activeUsers: Number((activeUsersResult.rows[0] as Record<string, unknown>)?.count ?? 0),
    alertUsers: Number((alertUsersResult.rows[0] as Record<string, unknown>)?.count ?? 0),
    newsletterSubscribers: Number((newsletterResult.rows[0] as Record<string, unknown>)?.count ?? 0),
  };
}

type UserWithStats = {
  user_id: string;
  email: string | null;
  username: string;
  created_at: string;
  views: number;
  applications: number;
  contact_views: number;
  flavors_count: number;
  has_alerts: boolean;
};

async function getUsersWithStats(): Promise<UserWithStats[]> {
  const result = await db.execute(sql`
    SELECT
      u.user_id,
      u.email,
      u.username,
      u.created_at,
      COALESCE(i.views, 0) as views,
      COALESCE(i.applications, 0) as applications,
      COALESCE(i.contact_views, 0) as contact_views,
      COALESCE(f.flavors_count, 0) as flavors_count,
      CASE WHEN jap.user_id IS NOT NULL AND jap.is_active = TRUE THEN TRUE ELSE FALSE END as has_alerts
    FROM users u
    LEFT JOIN (
      SELECT
        user_id,
        COUNT(*) FILTER (WHERE action = 'viewed') as views,
        COUNT(*) FILTER (WHERE action = 'applied') as applications,
        COUNT(*) FILTER (WHERE action = 'seen_contact') as contact_views
      FROM job_offer_interactions
      GROUP BY user_id
    ) i ON u.user_id = i.user_id
    LEFT JOIN (
      SELECT user_id, COUNT(*) as flavors_count
      FROM flavour
      GROUP BY user_id
    ) f ON u.user_id = f.user_id
    LEFT JOIN job_alert_preferences jap ON u.user_id = jap.user_id
    ORDER BY u.created_at DESC
    LIMIT 100
  `);

  return result.rows as UserWithStats[];
}

async function getReferralStats() {
  const result = await db.execute(sql`
    SELECT
      COUNT(*) as total_referrals,
      COUNT(referred_user_id) as total_conversions,
      COUNT(*) FILTER (WHERE converted_at > NOW() - INTERVAL '7 days') as recent_conversions
    FROM referral
  `);

  const stats = result.rows[0] as Record<string, unknown>;
  const totalReferrals = Number(stats?.total_referrals ?? 0);
  const totalConversions = Number(stats?.total_conversions ?? 0);

  return {
    totalReferrals,
    totalConversions,
    recentConversions: Number(stats?.recent_conversions ?? 0),
    conversionRate: totalReferrals > 0 ? Math.round((totalConversions / totalReferrals) * 100) : 0,
  };
}

type ReferralConversion = {
  id: number;
  platform: string;
  converted_at: string;
  referrer_name: string | null;
  referrer_email: string;
  referred_name: string | null;
  referred_email: string;
};

async function getRecentConversions(): Promise<ReferralConversion[]> {
  const result = await db.execute(sql`
    SELECT
      r.id,
      r.platform,
      r.converted_at,
      referrer.username as referrer_name,
      referrer.email as referrer_email,
      referred.username as referred_name,
      referred.email as referred_email
    FROM referral r
    JOIN users referrer ON r.referrer_id = referrer.user_id
    JOIN users referred ON r.referred_user_id = referred.user_id
    WHERE r.converted_at IS NOT NULL
    ORDER BY r.converted_at DESC
    LIMIT 20
  `);

  return result.rows as ReferralConversion[];
}

export default async function AdminDashboard() {
  const t = await getTranslations("Admin");
  const [stats, userStats, users, sharingStats, pendingInvites, referralStats, recentConversions] = await Promise.all([
    getStats(),
    getUserStats(),
    getUsersWithStats(),
    getSharingStats(),
    getPendingInvites(),
    getReferralStats(),
    getRecentConversions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{t("dashboardDescription")}</p>
      </div>

      {/* Job Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeJobs")}</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              {t("outOfTotal", { total: stats.totalJobs })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalViews")}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.views}</div>
            <p className="text-xs text-muted-foreground">
              {t("uniqueUsers", { count: stats.uniqueUsers })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("applications")}</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications}</div>
            <p className="text-xs text-muted-foreground">{t("totalApplications")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("contactViews")}</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactViews}</div>
            <p className="text-xs text-muted-foreground">{t("totalContactViews")}</p>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("users")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalUsers")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">{t("registeredUsers")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("newUsers")}</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.newUsers}</div>
              <p className="text-xs text-muted-foreground">{t("last7Days")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("activeUsers")}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">{t("usersWithActivity")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("jobAlertUsers")}</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.alertUsers}</div>
              <p className="text-xs text-muted-foreground">{t("usersWithAlerts")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("newsletterSubscribers")}</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.newsletterSubscribers}</div>
              <p className="text-xs text-muted-foreground">{t("confirmedSubscribers")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sharing Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Flavor Sharing</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shares</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharingStats.totalShares}</div>
              <p className="text-xs text-muted-foreground">Flavors shared with users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sharingStats.pendingInvites}</div>
              <p className="text-xs text-muted-foreground">Potential new users</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Referral Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Referral Program</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">Links shared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{referralStats.totalConversions}</div>
              <p className="text-xs text-muted-foreground">Users who signed up</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent (7d)</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralStats.recentConversions}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Of referral links</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Referral Conversions */}
      {recentConversions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-500" />
              Recent Referral Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentConversions.map((conversion) => (
                  <TableRow key={conversion.id}>
                    <TableCell className="font-medium">
                      {conversion.referrer_name || conversion.referrer_email}
                    </TableCell>
                    <TableCell>
                      {conversion.referred_name || conversion.referred_email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{conversion.platform}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(conversion.converted_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites List */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Invites (Potential Users)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invited Email</TableHead>
                  <TableHead>Flavor</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.invite_id}>
                    <TableCell className="font-medium">{invite.invited_email}</TableCell>
                    <TableCell>{invite.flavour_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {invite.inviter_username || invite.inviter_email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invite.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userList")}</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t("noUsersFound")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("username")}</TableHead>
                  <TableHead>{t("email")}</TableHead>
                  <TableHead>{t("joined")}</TableHead>
                  <TableHead className="text-center">{t("views")}</TableHead>
                  <TableHead className="text-center">{t("applied")}</TableHead>
                  <TableHead className="text-center">{t("contacts")}</TableHead>
                  <TableHead className="text-center">{t("flavors")}</TableHead>
                  <TableHead className="text-center">{t("alerts")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">{user.views}</TableCell>
                    <TableCell className="text-center">{user.applications}</TableCell>
                    <TableCell className="text-center">{user.contact_views}</TableCell>
                    <TableCell className="text-center">
                      {user.flavors_count > 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <FlaskConical className="h-3 w-3" />
                          {user.flavors_count}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.has_alerts ? (
                        <Badge variant="default" className="gap-1">
                          <Bell className="h-3 w-3" />
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { sql } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/[locale]/components/ui/card";
import { Briefcase, Users, Eye, MousePointerClick } from "lucide-react";

async function getStats() {
  const [jobsResult, interactionsResult] = await Promise.all([
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status = TRUE) as active_jobs,
        COUNT(*) as total_jobs
      FROM job_offers
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE action = 'viewed') as views,
        COUNT(*) FILTER (WHERE action = 'applied') as applications,
        COUNT(*) FILTER (WHERE action = 'seen_contact') as contact_views,
        COUNT(DISTINCT user_id) as unique_users
      FROM job_offer_interactions
    `,
  ]);

  return {
    activeJobs: Number(jobsResult[0]?.active_jobs ?? 0),
    totalJobs: Number(jobsResult[0]?.total_jobs ?? 0),
    views: Number(interactionsResult[0]?.views ?? 0),
    applications: Number(interactionsResult[0]?.applications ?? 0),
    contactViews: Number(interactionsResult[0]?.contact_views ?? 0),
    uniqueUsers: Number(interactionsResult[0]?.unique_users ?? 0),
  };
}

export default async function AdminDashboard() {
  const t = await getTranslations("Admin");
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground">{t("dashboardDescription")}</p>
      </div>

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
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactViews}</div>
            <p className="text-xs text-muted-foreground">{t("totalContactViews")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { job_search_monitors, monitored_listings } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getJobSearchMonitors() {
  await requireAdmin();
  return await db
    .select()
    .from(job_search_monitors)
    .orderBy(desc(job_search_monitors.created_at));
}

export async function createJobSearchMonitor(data: {
  label: string;
  search_url: string;
  site_key: string;
}) {
  await requireAdmin();
  const result = await db
    .insert(job_search_monitors)
    .values(data)
    .returning();
  return result[0];
}

export async function updateJobSearchMonitor(
  id: number,
  data: {
    label?: string;
    search_url?: string;
    site_key?: string;
    is_active?: boolean;
  }
) {
  await requireAdmin();
  const result = await db
    .update(job_search_monitors)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(eq(job_search_monitors.id, id))
    .returning();
  return result[0];
}

export async function deleteJobSearchMonitor(id: number) {
  await requireAdmin();
  await db
    .delete(job_search_monitors)
    .where(eq(job_search_monitors.id, id));
  return { success: true };
}

export async function getMonitoredListings(monitorId: number) {
  await requireAdmin();
  return await db
    .select()
    .from(monitored_listings)
    .where(eq(monitored_listings.monitor_id, monitorId))
    .orderBy(desc(monitored_listings.first_seen_at));
}

export async function getRecentNewListings(limit = 50) {
  await requireAdmin();
  const result = await db.execute(sql`
    SELECT ml.*, jsm.label as monitor_label,
      CASE WHEN ml.imported_job_id IS NOT NULL THEN true ELSE false END as on_platform
    FROM monitored_listings ml
    JOIN job_search_monitors jsm ON ml.monitor_id = jsm.id
    ORDER BY ml.first_seen_at DESC
    LIMIT ${limit}
  `);
  return result.rows;
}

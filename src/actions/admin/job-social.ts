"use server";

import { db } from "@/lib/db";
import { job_social_post, job_offers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export type JobSocialPost = {
  id: number;
  job_offer_id: string;
  platform: string;
  posted_at: string | null;
};

export async function getActiveJobOffers() {
  await requireAdmin();

  return await db
    .select()
    .from(job_offers)
    .where(eq(job_offers.status, true))
    .orderBy(desc(job_offers.posted_at));
}

export async function getJobSocialPosts(): Promise<JobSocialPost[]> {
  await requireAdmin();

  const rows = await db.select().from(job_social_post);

  return rows.map((r) => ({
    id: r.id,
    job_offer_id: r.job_offer_id,
    platform: r.platform,
    posted_at: r.posted_at,
  }));
}

export async function markJobAsPosted(
  jobOfferId: string,
  platform: "linkedin" | "instagram"
): Promise<void> {
  await requireAdmin();

  await db
    .insert(job_social_post)
    .values({ job_offer_id: jobOfferId, platform })
    .onConflictDoNothing();
}

export async function unmarkJobAsPosted(
  jobOfferId: string,
  platform: "linkedin" | "instagram"
): Promise<void> {
  await requireAdmin();

  await db
    .delete(job_social_post)
    .where(
      and(
        eq(job_social_post.job_offer_id, jobOfferId),
        eq(job_social_post.platform, platform)
      )
    );
}

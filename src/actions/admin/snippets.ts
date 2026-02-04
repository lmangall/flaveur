"use server";

import { db } from "@/lib/db";
import { snippet_post } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export type SnippetPost = {
  id: number;
  fact_id: string;
  platform: string;
  posted_at: string | null;
};

export async function getSnippetPosts(): Promise<SnippetPost[]> {
  await requireAdmin();

  const rows = await db.select().from(snippet_post);

  return rows.map((r) => ({
    id: r.id,
    fact_id: r.fact_id,
    platform: r.platform,
    posted_at: r.posted_at,
  }));
}

export async function markAsPosted(
  factId: string,
  platform: "linkedin" | "instagram"
): Promise<void> {
  await requireAdmin();

  await db
    .insert(snippet_post)
    .values({ fact_id: factId, platform })
    .onConflictDoNothing();
}

export async function unmarkAsPosted(
  factId: string,
  platform: "linkedin" | "instagram"
): Promise<void> {
  await requireAdmin();

  await db
    .delete(snippet_post)
    .where(
      and(eq(snippet_post.fact_id, factId), eq(snippet_post.platform, platform))
    );
}

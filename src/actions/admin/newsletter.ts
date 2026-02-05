"use server";

import { db } from "@/lib/db";
import { newsletter_subscribers } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

export async function getAllNewsletterSubscribers() {
  await requireAdmin();

  const subscribers = await db
    .select()
    .from(newsletter_subscribers)
    .orderBy(desc(newsletter_subscribers.subscribed_at));

  return subscribers;
}

export async function getNewsletterStats() {
  await requireAdmin();

  const allSubscribers = await db
    .select()
    .from(newsletter_subscribers);

  const confirmed = allSubscribers.filter(
    (s) => s.confirmed_at && !s.unsubscribed_at
  );
  const unsubscribed = allSubscribers.filter((s) => s.unsubscribed_at);
  const pending = allSubscribers.filter((s) => !s.confirmed_at && !s.unsubscribed_at);

  const sourceBreakdown = allSubscribers.reduce((acc, sub) => {
    const source = sub.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const localeBreakdown = allSubscribers.reduce((acc, sub) => {
    const locale = sub.locale || "unknown";
    acc[locale] = (acc[locale] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: allSubscribers.length,
    confirmed: confirmed.length,
    unsubscribed: unsubscribed.length,
    pending: pending.length,
    sourceBreakdown,
    localeBreakdown,
  };
}

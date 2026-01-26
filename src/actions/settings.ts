"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { newsletter_subscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { subscribeToNewsletter, unsubscribe } from "./newsletter";

export type NewsletterStatus = "subscribed" | "pending" | "unsubscribed" | "not_found";

export interface NewsletterStatusResult {
  status: NewsletterStatus;
  email: string | null;
  confirmationToken?: string;
}

export async function getNewsletterStatus(email: string): Promise<NewsletterStatusResult> {
  if (!email) {
    return { status: "not_found", email: null };
  }

  const result = await db
    .select({
      email: newsletter_subscribers.email,
      confirmed_at: newsletter_subscribers.confirmed_at,
      unsubscribed_at: newsletter_subscribers.unsubscribed_at,
      confirmation_token: newsletter_subscribers.confirmation_token,
    })
    .from(newsletter_subscribers)
    .where(eq(newsletter_subscribers.email, email.toLowerCase().trim()));

  if (result.length === 0) {
    return { status: "not_found", email };
  }

  const subscriber = result[0];

  if (subscriber.unsubscribed_at) {
    return { status: "unsubscribed", email };
  }

  if (subscriber.confirmed_at) {
    return {
      status: "subscribed",
      email,
      confirmationToken: subscriber.confirmation_token ?? undefined,
    };
  }

  return {
    status: "pending",
    email,
    confirmationToken: subscriber.confirmation_token ?? undefined,
  };
}

export async function subscribeUserToNewsletter(email: string, locale: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "unauthorized" };
  }

  return subscribeToNewsletter(email, "settings", locale);
}

export async function unsubscribeUserFromNewsletter(confirmationToken: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "unauthorized" };
  }

  return unsubscribe(confirmationToken);
}

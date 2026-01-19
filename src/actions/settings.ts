"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
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

  const result = await sql`
    SELECT email, confirmed_at, unsubscribed_at, confirmation_token
    FROM newsletter_subscribers
    WHERE email = ${email.toLowerCase().trim()}
  `;

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
      confirmationToken: subscriber.confirmation_token as string
    };
  }

  return {
    status: "pending",
    email,
    confirmationToken: subscriber.confirmation_token as string
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

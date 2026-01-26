"use server";

import { db } from "@/lib/db";
import { newsletter_subscribers } from "@/db/schema";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { sendWelcomeEmail, sendUnsubscribeConfirmationEmail, sendNewSubscriberNotification } from "@/lib/email/resend";
import { newsletterSubscribeSchema, confirmationTokenSchema } from "@/lib/validations/newsletter";

export async function subscribeToNewsletter(email: string, source: string, locale: string) {
  const validation = newsletterSubscribeSchema.safeParse({ email, source, locale });
  if (!validation.success) {
    return { success: false, error: "invalid_email" };
  }

  const normalizedEmail = validation.data.email;

  const existingSubscriber = await db
    .select()
    .from(newsletter_subscribers)
    .where(eq(newsletter_subscribers.email, normalizedEmail));

  if (existingSubscriber.length > 0) {
    const subscriber = existingSubscriber[0];

    if (subscriber.confirmed_at && !subscriber.unsubscribed_at) {
      return { success: false, error: "already_subscribed" };
    }

    if (subscriber.unsubscribed_at) {
      await db
        .update(newsletter_subscribers)
        .set({
          unsubscribed_at: null,
          confirmed_at: new Date().toISOString(),
          subscribed_at: new Date().toISOString(),
          source,
          locale,
        })
        .where(eq(newsletter_subscribers.email, normalizedEmail));

      await Promise.all([
        sendWelcomeEmail(normalizedEmail, locale),
        sendNewSubscriberNotification(normalizedEmail, source, locale),
      ]);
      return { success: true, message: "subscribed" };
    }
  }

  await db.insert(newsletter_subscribers).values({
    email: normalizedEmail,
    source,
    locale,
    confirmed_at: new Date().toISOString(),
  });

  await Promise.all([
    sendWelcomeEmail(normalizedEmail, locale),
    sendNewSubscriberNotification(normalizedEmail, source, locale),
  ]);

  return { success: true, message: "subscribed" };
}

export async function confirmSubscription(token: string) {
  const validation = confirmationTokenSchema.safeParse({ token });
  if (!validation.success) {
    return { success: false, error: "invalid_token" };
  }

  const result = await db
    .select()
    .from(newsletter_subscribers)
    .where(eq(newsletter_subscribers.confirmation_token, token));

  if (result.length === 0) {
    return { success: false, error: "token_not_found" };
  }

  const subscriber = result[0];

  if (subscriber.confirmed_at && !subscriber.unsubscribed_at) {
    return { success: false, error: "already_confirmed" };
  }

  await db
    .update(newsletter_subscribers)
    .set({
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
    })
    .where(eq(newsletter_subscribers.confirmation_token, token));

  await sendWelcomeEmail(subscriber.email, subscriber.locale || "fr");

  return { success: true, message: "subscription_confirmed" };
}

export async function unsubscribe(token: string) {
  const validation = confirmationTokenSchema.safeParse({ token });
  if (!validation.success) {
    return { success: false, error: "invalid_token" };
  }

  const result = await db
    .select()
    .from(newsletter_subscribers)
    .where(eq(newsletter_subscribers.confirmation_token, token));

  if (result.length === 0) {
    return { success: false, error: "token_not_found" };
  }

  const subscriber = result[0];

  if (subscriber.unsubscribed_at) {
    return { success: false, error: "already_unsubscribed" };
  }

  await db
    .update(newsletter_subscribers)
    .set({ unsubscribed_at: new Date().toISOString() })
    .where(eq(newsletter_subscribers.confirmation_token, token));

  await sendUnsubscribeConfirmationEmail(subscriber.email, subscriber.locale || "fr");

  return { success: true, message: "unsubscribed" };
}

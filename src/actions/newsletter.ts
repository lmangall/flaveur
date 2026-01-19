"use server";

import { sql } from "@/lib/db";
import { sendConfirmationEmail, sendWelcomeEmail, sendUnsubscribeConfirmationEmail } from "@/lib/email/resend";
import { newsletterSubscribeSchema, confirmationTokenSchema } from "@/lib/validations/newsletter";

export async function subscribeToNewsletter(email: string, source: string, locale: string) {
  // Validate with Zod
  const validation = newsletterSubscribeSchema.safeParse({ email, source, locale });
  if (!validation.success) {
    return { success: false, error: "invalid_email" };
  }

  const normalizedEmail = validation.data.email;

  // Check if email already exists
  const existingSubscriber = await sql`
    SELECT id, confirmed_at, unsubscribed_at, confirmation_token
    FROM newsletter_subscribers
    WHERE email = ${normalizedEmail}
  `;

  if (existingSubscriber.length > 0) {
    const subscriber = existingSubscriber[0];

    // If already confirmed and not unsubscribed, return already subscribed
    if (subscriber.confirmed_at && !subscriber.unsubscribed_at) {
      return { success: false, error: "already_subscribed" };
    }

    // If unsubscribed, allow resubscription
    if (subscriber.unsubscribed_at) {
      const newToken = crypto.randomUUID();
      await sql`
        UPDATE newsletter_subscribers
        SET unsubscribed_at = NULL,
            confirmed_at = NULL,
            confirmation_token = ${newToken}::uuid,
            subscribed_at = NOW(),
            source = ${source},
            locale = ${locale}
        WHERE email = ${normalizedEmail}
        RETURNING confirmation_token
      `;

      await sendConfirmationEmail(normalizedEmail, newToken, locale);
      return { success: true, message: "confirmation_sent" };
    }

    // If not confirmed yet, resend confirmation email
    if (!subscriber.confirmed_at) {
      await sendConfirmationEmail(normalizedEmail, subscriber.confirmation_token as string, locale);
      return { success: true, message: "confirmation_resent" };
    }
  }

  // Create new subscription
  const result = await sql`
    INSERT INTO newsletter_subscribers (email, source, locale)
    VALUES (${normalizedEmail}, ${source}, ${locale})
    RETURNING confirmation_token
  `;

  const token = result[0].confirmation_token as string;

  // Send confirmation email
  await sendConfirmationEmail(normalizedEmail, token, locale);

  return { success: true, message: "confirmation_sent" };
}

export async function confirmSubscription(token: string) {
  // Validate token with Zod
  const validation = confirmationTokenSchema.safeParse({ token });
  if (!validation.success) {
    return { success: false, error: "invalid_token" };
  }

  // Find subscriber by token
  const result = await sql`
    SELECT id, email, confirmed_at, unsubscribed_at, locale
    FROM newsletter_subscribers
    WHERE confirmation_token = ${token}::uuid
  `;

  if (result.length === 0) {
    return { success: false, error: "token_not_found" };
  }

  const subscriber = result[0];

  // Check if already confirmed
  if (subscriber.confirmed_at && !subscriber.unsubscribed_at) {
    return { success: false, error: "already_confirmed" };
  }

  // Confirm subscription
  await sql`
    UPDATE newsletter_subscribers
    SET confirmed_at = NOW(),
        unsubscribed_at = NULL
    WHERE confirmation_token = ${token}::uuid
  `;

  // Send welcome email
  await sendWelcomeEmail(subscriber.email as string, (subscriber.locale as string) || 'fr');

  return { success: true, message: "subscription_confirmed" };
}

export async function unsubscribe(token: string) {
  // Validate token with Zod
  const validation = confirmationTokenSchema.safeParse({ token });
  if (!validation.success) {
    return { success: false, error: "invalid_token" };
  }

  // Find subscriber by token
  const result = await sql`
    SELECT id, email, confirmed_at, unsubscribed_at, locale
    FROM newsletter_subscribers
    WHERE confirmation_token = ${token}::uuid
  `;

  if (result.length === 0) {
    return { success: false, error: "token_not_found" };
  }

  const subscriber = result[0];

  // Check if already unsubscribed
  if (subscriber.unsubscribed_at) {
    return { success: false, error: "already_unsubscribed" };
  }

  // Mark as unsubscribed
  await sql`
    UPDATE newsletter_subscribers
    SET unsubscribed_at = NOW()
    WHERE confirmation_token = ${token}::uuid
  `;

  // Send unsubscribe confirmation email
  await sendUnsubscribeConfirmationEmail(subscriber.email as string, (subscriber.locale as string) || 'fr');

  return { success: true, message: "unsubscribed" };
}

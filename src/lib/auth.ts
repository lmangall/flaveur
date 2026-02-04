import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@/db/schema";
import { getPostHogClient } from "./posthog-server";
import { sendNewUserNotification } from "./email/resend";

// Determine the base URL for auth - critical for cookie domain and OAuth redirects
function getBaseURL() {
  // Explicit env var takes priority
  if (process.env.BETTER_AUTH_URL && process.env.BETTER_AUTH_URL !== "http://localhost:3000") {
    return process.env.BETTER_AUTH_URL;
  }
  // Vercel production/preview
  if (process.env.VERCEL_ENV === "production") {
    return "https://www.oumamie.xyz";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Local development
  return "http://localhost:3000";
}

export const auth = betterAuth({
  // Base URL for the auth server - REQUIRED for production
  baseURL: getBaseURL(),

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      // Map Better Auth's expected tables to our schema
      user: schema.users,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // Trust the host header for OAuth redirects in production
  trustedOrigins: [
    getBaseURL(),
    "https://www.oumamie.xyz",
    "https://oumamie.xyz",
    "http://localhost:3000",
  ],

  // Advanced cookie settings for cross-page persistence
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: ".oumamie.xyz",
    },
  },

  // Enable email + password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },

  // Account linking - allows OAuth to link to existing users by email
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // 60 minutes (was 5 minutes)
    },
  },

  // Plugins
  plugins: [nextCookies()],

  // Database hooks for tracking
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          // Track Google OAuth signups server-side (client-side capture gets interrupted by redirect)
          if (account.providerId === "google") {
            const posthog = getPostHogClient();
            posthog.capture({
              distinctId: account.userId,
              event: "user_signed_up",
              properties: {
                method: "google",
              },
            });
            // Flush immediately - serverless functions can terminate before async sends complete
            await posthog.flush();

            // Send admin notification for Google OAuth signups
            try {
              const user = await db
                .select({ email: schema.users.email, name: schema.users.name })
                .from(schema.users)
                .where(eq(schema.users.id, account.userId))
                .limit(1);

              if (user[0]) {
                await sendNewUserNotification({
                  userId: account.userId,
                  email: user[0].email || "",
                  name: user[0].name || "Unknown",
                  signupMethod: "google",
                  referrerName: null,
                  referrerEmail: null,
                  referralCode: null,
                });
              }
            } catch (error) {
              console.error("[auth] Failed to send new user notification:", error);
            }
          }
        },
      },
    },
  },
});

// Export types for use in components
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

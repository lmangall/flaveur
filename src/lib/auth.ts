import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  // Base URL for the auth server - REQUIRED for production
  baseURL: process.env.BETTER_AUTH_URL,

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
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "https://www.oumamie.xyz",
    "https://oumamie.xyz",
  ],

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
});

// Export types for use in components
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

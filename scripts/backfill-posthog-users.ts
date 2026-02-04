/**
 * Backfill PostHog user properties for existing users
 *
 * Sends identify calls to PostHog with all available user data:
 *   - Basic info: email, name, image
 *   - Profile data: bio, location, job_title, organization, etc.
 *   - Account metadata: created_at, email_verified
 *
 * Usage:
 *   npx tsx scripts/backfill-posthog-users.ts
 *   npx tsx scripts/backfill-posthog-users.ts --dry-run
 *   npx tsx scripts/backfill-posthog-users.ts --user-id=user_xxx
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable must be set
 *   - NEXT_PUBLIC_POSTHOG_KEY environment variable must be set
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { PostHog } from "posthog-node";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

if (!POSTHOG_KEY) {
  console.error("NEXT_PUBLIC_POSTHOG_KEY environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const userIdArg = args.find((a) => a.startsWith("--user-id="));
const specificUserId = userIdArg ? userIdArg.split("=")[1] : null;

interface UserRow {
  user_id: string;
  email: string | null;
  username: string;
  image: string | null;
  email_verified: boolean | null;
  created_at: string | null;
  // Profile fields
  bio: string | null;
  profile_type: string | null;
  organization: string | null;
  job_title: string | null;
  location: string | null;
  years_of_experience: string | null;
  specializations: string[] | null;
  certifications: string[] | null;
  field_of_study: string | null;
  professional_memberships: string[] | null;
  is_profile_public: boolean | null;
  open_to_opportunities: boolean | null;
  onboarding_status: string | null;
}

async function fetchUsers(): Promise<UserRow[]> {
  const whereClause = specificUserId ? `WHERE u.user_id = '${specificUserId}'` : "";

  const result = await sql`
    SELECT
      u.user_id,
      u.email,
      u.username,
      u.image,
      u.email_verified,
      u.created_at,
      p.bio,
      p.profile_type,
      p.organization,
      p.job_title,
      p.location,
      p.years_of_experience,
      p.specializations,
      p.certifications,
      p.field_of_study,
      p.professional_memberships,
      p.is_profile_public,
      p.open_to_opportunities,
      p.onboarding_status
    FROM users u
    LEFT JOIN user_profile p ON u.user_id = p.user_id
    ${specificUserId ? sql`WHERE u.user_id = ${specificUserId}` : sql``}
    ORDER BY u.created_at ASC
  `;

  return result as UserRow[];
}

function buildPostHogProperties(user: UserRow): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  // Basic user info
  if (user.email) properties.email = user.email;
  if (user.username) properties.name = user.username;
  if (user.image) properties.avatar = user.image;
  if (user.email_verified !== null) properties.email_verified = user.email_verified;
  if (user.created_at) properties.signed_up_at = user.created_at;

  // Profile info
  if (user.bio) properties.bio = user.bio;
  if (user.profile_type) properties.profile_type = user.profile_type;
  if (user.organization) properties.organization = user.organization;
  if (user.job_title) properties.job_title = user.job_title;
  if (user.location) properties.location = user.location;
  if (user.years_of_experience) properties.years_of_experience = user.years_of_experience;
  if (user.specializations?.length) properties.specializations = user.specializations;
  if (user.certifications?.length) properties.certifications = user.certifications;
  if (user.field_of_study) properties.field_of_study = user.field_of_study;
  if (user.professional_memberships?.length) properties.professional_memberships = user.professional_memberships;
  if (user.is_profile_public !== null) properties.is_profile_public = user.is_profile_public;
  if (user.open_to_opportunities !== null) properties.open_to_opportunities = user.open_to_opportunities;
  if (user.onboarding_status) properties.onboarding_status = user.onboarding_status;

  return properties;
}

async function main() {
  console.log("=".repeat(60));
  console.log("PostHog User Backfill Script");
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("\n🔍 DRY RUN MODE - No data will be sent to PostHog\n");
  }

  if (specificUserId) {
    console.log(`\nFiltering to user: ${specificUserId}\n`);
  }

  // Fetch users from database
  console.log("Fetching users from database...");
  const users = await fetchUsers();
  console.log(`Found ${users.length} user(s)\n`);

  if (users.length === 0) {
    console.log("No users to process.");
    return;
  }

  // Initialize PostHog client
  let posthog: PostHog | null = null;
  if (!dryRun) {
    posthog = new PostHog(POSTHOG_KEY!, {
      host: POSTHOG_HOST,
      flushAt: 20,
      flushInterval: 5000,
    });
  }

  let successCount = 0;
  let skipCount = 0;

  for (const user of users) {
    const properties = buildPostHogProperties(user);
    const propertyCount = Object.keys(properties).length;

    // Skip users with no useful properties
    if (propertyCount === 0) {
      console.log(`⏭️  ${user.user_id} - No properties to backfill`);
      skipCount++;
      continue;
    }

    if (dryRun) {
      console.log(`\n📋 ${user.user_id}`);
      console.log(`   Email: ${properties.email || "(none)"}`);
      console.log(`   Name: ${properties.name || "(none)"}`);
      console.log(`   Properties: ${propertyCount}`);
      console.log("   Data:", JSON.stringify(properties, null, 2).split("\n").map((l) => "   " + l).join("\n"));
    } else {
      posthog!.identify({
        distinctId: user.user_id,
        properties,
      });
      console.log(`✅ ${user.user_id} - ${properties.email || "(no email)"} - ${propertyCount} properties`);
    }

    successCount++;
  }

  // Flush and shutdown PostHog
  if (posthog) {
    console.log("\nFlushing events to PostHog...");
    await posthog.shutdown();
  }

  console.log("\n" + "=".repeat(60));
  console.log("Summary:");
  console.log(`  Total users: ${users.length}`);
  console.log(`  Processed: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log("=".repeat(60));

  if (dryRun) {
    console.log("\n💡 Run without --dry-run to send data to PostHog");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

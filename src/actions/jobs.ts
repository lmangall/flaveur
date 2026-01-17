"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function getJobs() {
  const { userId } = await auth();

  let result;
  if (userId) {
    // Authenticated: Return all public + user-specific job offers
    result = await sql`
      SELECT * FROM public.job_offers
      WHERE status = TRUE OR EXISTS (
        SELECT 1 FROM public.job_offer_interactions
        WHERE job_offer_id = public.job_offers.id AND user_id = ${userId}
      )
    `;
  } else {
    // Unauthenticated: Return only public job offers
    result = await sql`SELECT * FROM public.job_offers WHERE status = TRUE`;
  }

  return result;
}

export async function getJobById(jobId: number) {
  const result = await sql`
    SELECT * FROM public.job_offers WHERE id = ${jobId}
  `;

  if (result.length === 0) {
    throw new Error("Job offer not found");
  }

  return result[0];
}

export async function createJob(data: {
  title: string;
  description?: string;
  company_name?: string;
  original_company_name?: string;
  through_recruiter?: boolean;
  source_website?: string;
  source_url?: string;
  location?: string;
  employment_type?: string;
  salary?: string;
  requirements?: string;
  tags?: string[];
  industry?: string;
  experience_level?: string;
  contact_person?: string;
  posted_at?: string;
  expires_at?: string;
}) {
  const result = await sql`
    INSERT INTO public.job_offers (
      title, description, company_name, original_company_name,
      through_recruiter, source_website, source_url, location,
      employment_type, salary, requirements, tags, posted_at,
      expires_at, industry, experience_level, contact_person
    )
    VALUES (
      ${data.title}, ${data.description ?? null}, ${data.company_name ?? null},
      ${data.original_company_name ?? null}, ${data.through_recruiter ?? null},
      ${data.source_website ?? null}, ${data.source_url ?? null},
      ${data.location ?? null}, ${data.employment_type ?? null},
      ${data.salary ?? null}, ${data.requirements ?? null},
      ${data.tags ?? null}, ${data.posted_at ?? null},
      ${data.expires_at ?? null}, ${data.industry ?? null},
      ${data.experience_level ?? null}, ${data.contact_person ?? null}
    )
    RETURNING *
  `;

  return result[0];
}

export async function addJobInteraction(
  jobId: number,
  action: "viewed" | "applied" | "seen_contact",
  referrer?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validActions = ["viewed", "applied", "seen_contact"];
  if (!validActions.includes(action)) {
    throw new Error("Invalid action");
  }

  const result = await sql`
    INSERT INTO public.job_offer_interactions (user_id, job_offer_id, action, referrer)
    VALUES (${userId}, ${jobId}, ${action}, ${referrer ?? null})
    RETURNING *
  `;

  return result[0];
}

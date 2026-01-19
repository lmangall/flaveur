"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import {
  type JobInteractionValue,
  type EmploymentTypeValue,
  type ExperienceLevelValue,
  type ContactPerson,
  isValidJobInteraction,
} from "@/constants";

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
  employment_type?: EmploymentTypeValue;
  salary?: string;
  requirements?: string[];
  tags?: string[];
  industry?: string;
  experience_level?: ExperienceLevelValue;
  contact_person?: ContactPerson;
  posted_at?: string;
  expires_at?: string;
  status?: boolean;
}) {
  const contactPersonJson = data.contact_person
    ? JSON.stringify(data.contact_person)
    : null;

  const result = await sql`
    INSERT INTO public.job_offers (
      title, description, company_name, original_company_name,
      through_recruiter, source_website, source_url, location,
      employment_type, salary, requirements, tags, posted_at,
      expires_at, industry, experience_level, contact_person, status
    )
    VALUES (
      ${data.title}, ${data.description ?? null}, ${data.company_name ?? null},
      ${data.original_company_name ?? null}, ${data.through_recruiter ?? null},
      ${data.source_website ?? null}, ${data.source_url ?? null},
      ${data.location ?? null}, ${data.employment_type ?? null},
      ${data.salary ?? null}, ${data.requirements ?? null},
      ${data.tags ?? null}, ${data.posted_at ?? null},
      ${data.expires_at ?? null}, ${data.industry ?? null},
      ${data.experience_level ?? null}, ${contactPersonJson},
      ${data.status ?? true}
    )
    RETURNING *
  `;

  return result[0];
}

export async function addJobInteraction(
  jobId: number,
  action: JobInteractionValue,
  referrer?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!isValidJobInteraction(action)) {
    throw new Error("Invalid action");
  }

  const result = await sql`
    INSERT INTO public.job_offer_interactions (user_id, job_offer_id, action, referrer)
    VALUES (${userId}, ${jobId}, ${action}, ${referrer ?? null})
    RETURNING *
  `;

  return result[0];
}

// Admin functions

export async function getAllJobs() {
  const result = await sql`
    SELECT * FROM public.job_offers
    ORDER BY created_at DESC
  `;
  return result;
}

export async function updateJob(
  jobId: number,
  data: {
    title?: string;
    description?: string;
    company_name?: string;
    original_company_name?: string;
    through_recruiter?: boolean;
    source_website?: string;
    source_url?: string;
    location?: string;
    employment_type?: EmploymentTypeValue;
    salary?: string;
    requirements?: string[];
    tags?: string[];
    industry?: string;
    experience_level?: ExperienceLevelValue;
    contact_person?: ContactPerson;
    expires_at?: string;
    status?: boolean;
  }
) {
  const contactPersonJson = data.contact_person
    ? JSON.stringify(data.contact_person)
    : null;

  const result = await sql`
    UPDATE public.job_offers SET
      title = COALESCE(${data.title ?? null}, title),
      description = COALESCE(${data.description ?? null}, description),
      company_name = COALESCE(${data.company_name ?? null}, company_name),
      original_company_name = COALESCE(${data.original_company_name ?? null}, original_company_name),
      through_recruiter = COALESCE(${data.through_recruiter ?? null}, through_recruiter),
      source_website = COALESCE(${data.source_website ?? null}, source_website),
      source_url = COALESCE(${data.source_url ?? null}, source_url),
      location = COALESCE(${data.location ?? null}, location),
      employment_type = COALESCE(${data.employment_type ?? null}, employment_type),
      salary = COALESCE(${data.salary ?? null}, salary),
      requirements = COALESCE(${data.requirements ?? null}, requirements),
      tags = COALESCE(${data.tags ?? null}, tags),
      industry = COALESCE(${data.industry ?? null}, industry),
      experience_level = COALESCE(${data.experience_level ?? null}, experience_level),
      contact_person = COALESCE(${contactPersonJson}::jsonb, contact_person),
      expires_at = COALESCE(${data.expires_at ?? null}, expires_at),
      status = COALESCE(${data.status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${jobId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Job not found");
  }

  return result[0];
}

export async function deleteJob(jobId: number) {
  // First delete interactions
  await sql`
    DELETE FROM public.job_offer_interactions
    WHERE job_offer_id = ${jobId}
  `;

  // Then delete the job
  const result = await sql`
    DELETE FROM public.job_offers
    WHERE id = ${jobId}
    RETURNING id
  `;

  if (result.length === 0) {
    throw new Error("Job not found");
  }

  return { success: true };
}

export async function toggleJobStatus(jobId: number, status: boolean) {
  const result = await sql`
    UPDATE public.job_offers
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${jobId}
    RETURNING *
  `;

  if (result.length === 0) {
    throw new Error("Job not found");
  }

  return result[0];
}

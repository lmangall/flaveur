"use server";

import { getUserId, getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { flavour, substance, category, substance_flavour, users } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { DEMO_USER } from "@/constants/samples";

export interface DashboardStats {
  totalFlavors: number;
  publicFlavors: number;
  draftFlavors: number;
  publishedFlavors: number;
  archivedFlavors: number;
  totalSubstances: number;
  totalCategories: number;
  recentActivityCount: number;
}

export interface RecentFlavor {
  flavour_id: number;
  name: string;
  status: string;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  substance_count: number;
}

export interface PublicFlavor {
  flavour_id: number;
  name: string;
  description: string | null;
  status: string;
  updated_at: string;
  user_id: string;
  username: string;
  substance_count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getUserId();

  const flavorStats = await db.execute(sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_public = true) as public_count,
      COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
      COUNT(*) FILTER (WHERE status = 'published') as published_count,
      COUNT(*) FILTER (WHERE status = 'archived') as archived_count,
      COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '30 days') as recent_count
    FROM flavour
    WHERE user_id = ${userId}
  `);

  const substanceStats = await db.select({ total: count() }).from(substance);
  const categoryStats = await db.select({ total: count() }).from(category);

  const stats = flavorStats.rows[0] as Record<string, unknown>;

  return {
    totalFlavors: Number(stats.total) || 0,
    publicFlavors: Number(stats.public_count) || 0,
    draftFlavors: Number(stats.draft_count) || 0,
    publishedFlavors: Number(stats.published_count) || 0,
    archivedFlavors: Number(stats.archived_count) || 0,
    totalSubstances: substanceStats[0].total || 0,
    totalCategories: categoryStats[0].total || 0,
    recentActivityCount: Number(stats.recent_count) || 0,
  };
}

export async function getRecentFlavors(limit: number = 6): Promise<RecentFlavor[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      f.flavour_id,
      f.name,
      f.status,
      f.is_public,
      f.updated_at,
      f.created_at,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM flavour f
    LEFT JOIN (
      SELECT flavour_id, COUNT(*) as substance_count
      FROM substance_flavour
      GROUP BY flavour_id
    ) sf ON f.flavour_id = sf.flavour_id
    WHERE f.user_id = ${userId}
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    status: String(f.status),
    is_public: Boolean(f.is_public),
    updated_at: String(f.updated_at),
    created_at: String(f.created_at),
    substance_count: Number(f.substance_count) || 0,
  }));
}

export async function getFavoriteFlavors(limit: number = 6): Promise<RecentFlavor[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      f.flavour_id,
      f.name,
      f.status,
      f.is_public,
      f.updated_at,
      f.created_at,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM flavour f
    LEFT JOIN (
      SELECT flavour_id, COUNT(*) as substance_count
      FROM substance_flavour
      GROUP BY flavour_id
    ) sf ON f.flavour_id = sf.flavour_id
    WHERE f.user_id = ${userId} AND f.status = 'published'
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    status: String(f.status),
    is_public: Boolean(f.is_public),
    updated_at: String(f.updated_at),
    created_at: String(f.created_at),
    substance_count: Number(f.substance_count) || 0,
  }));
}

export async function getPublicFlavors(limit: number = 6): Promise<RecentFlavor[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      f.flavour_id,
      f.name,
      f.status,
      f.is_public,
      f.updated_at,
      f.created_at,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM flavour f
    LEFT JOIN (
      SELECT flavour_id, COUNT(*) as substance_count
      FROM substance_flavour
      GROUP BY flavour_id
    ) sf ON f.flavour_id = sf.flavour_id
    WHERE f.user_id = ${userId} AND f.is_public = true
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    status: String(f.status),
    is_public: Boolean(f.is_public),
    updated_at: String(f.updated_at),
    created_at: String(f.created_at),
    substance_count: Number(f.substance_count) || 0,
  }));
}

export async function getCommunityFlavors(limit: number = 12): Promise<PublicFlavor[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      f.flavour_id,
      f.name,
      f.description,
      f.status,
      f.updated_at,
      f.user_id,
      u.username,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM flavour f
    LEFT JOIN users u ON f.user_id = u.user_id
    LEFT JOIN (
      SELECT flavour_id, COUNT(*) as substance_count
      FROM substance_flavour
      GROUP BY flavour_id
    ) sf ON f.flavour_id = sf.flavour_id
    WHERE f.is_public = true AND f.user_id != ${userId}
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    description: f.description ? String(f.description) : null,
    status: String(f.status),
    updated_at: String(f.updated_at),
    user_id: String(f.user_id),
    username: String(f.username || "Anonymous"),
    substance_count: Number(f.substance_count) || 0,
  }));
}

export interface SampleFlavor {
  flavour_id: number;
  name: string;
  description: string | null;
  status: string;
  updated_at: string;
  substance_count: number;
  variation_group_id: number | null;
  variation_label: string | null;
  is_main_variation: boolean;
  variation_count: number;
}

/**
 * Get sample flavors owned by the demo user (Arthur Dent).
 * These are public examples that demonstrate features like variations.
 * Does not require authentication - samples are visible to everyone.
 */
export async function getSampleFlavors(): Promise<SampleFlavor[]> {
  const result = await db.execute(sql`
    SELECT
      f.flavour_id,
      f.name,
      f.description,
      f.status,
      f.updated_at,
      f.variation_group_id,
      f.variation_label,
      f.is_main_variation,
      COALESCE(sf.substance_count, 0) as substance_count,
      COALESCE(vc.variation_count, 1) as variation_count
    FROM flavour f
    LEFT JOIN (
      SELECT flavour_id, COUNT(*) as substance_count
      FROM substance_flavour
      GROUP BY flavour_id
    ) sf ON f.flavour_id = sf.flavour_id
    LEFT JOIN (
      SELECT variation_group_id, COUNT(*) as variation_count
      FROM flavour
      WHERE variation_group_id IS NOT NULL
      GROUP BY variation_group_id
    ) vc ON f.variation_group_id = vc.variation_group_id
    WHERE f.user_id = ${DEMO_USER.user_id}
      AND (f.is_main_variation = true OR f.variation_group_id IS NULL)
    ORDER BY f.variation_group_id NULLS LAST, f.updated_at DESC
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    description: f.description ? String(f.description) : null,
    status: String(f.status),
    updated_at: String(f.updated_at),
    substance_count: Number(f.substance_count) || 0,
    variation_group_id: f.variation_group_id ? Number(f.variation_group_id) : null,
    variation_label: f.variation_label ? String(f.variation_label) : null,
    is_main_variation: Boolean(f.is_main_variation),
    variation_count: Number(f.variation_count) || 1,
  }));
}

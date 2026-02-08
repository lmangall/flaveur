"use server";

import { getUserId, getSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { formula, substance, category, substance_formula, users } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import { DEMO_USER, DEMO_USERS } from "@/constants/samples";

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
  formula_id: number;
  name: string;
  status: string;
  is_public: boolean;
  updated_at: string;
  created_at: string;
  substance_count: number;
}

export interface PublicFlavor {
  formula_id: number;
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
    FROM formula
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
      f.formula_id,
      f.name,
      f.status,
      f.is_public,
      f.updated_at,
      f.created_at,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM formula f
    LEFT JOIN (
      SELECT formula_id, COUNT(*) as substance_count
      FROM substance_formula
      GROUP BY formula_id
    ) sf ON f.formula_id = sf.formula_id
    WHERE f.user_id = ${userId}
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    formula_id: Number(f.formula_id),
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
      f.formula_id,
      f.name,
      f.status,
      f.is_public,
      f.updated_at,
      f.created_at,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM formula f
    LEFT JOIN (
      SELECT formula_id, COUNT(*) as substance_count
      FROM substance_formula
      GROUP BY formula_id
    ) sf ON f.formula_id = sf.formula_id
    WHERE f.user_id = ${userId} AND f.status = 'published'
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    formula_id: Number(f.formula_id),
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
      f.formula_id,
      f.name,
      f.status,
      f.is_public,
      f.updated_at,
      f.created_at,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM formula f
    LEFT JOIN (
      SELECT formula_id, COUNT(*) as substance_count
      FROM substance_formula
      GROUP BY formula_id
    ) sf ON f.formula_id = sf.formula_id
    WHERE f.user_id = ${userId} AND f.is_public = true
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    formula_id: Number(f.formula_id),
    name: String(f.name),
    status: String(f.status),
    is_public: Boolean(f.is_public),
    updated_at: String(f.updated_at),
    created_at: String(f.created_at),
    substance_count: Number(f.substance_count) || 0,
  }));
}

export interface CommunityFilters {
  categoryId?: number;
  projectType?: string;
  search?: string;
}

export interface CommunityFlavor extends PublicFlavor {
  category_name: string | null;
  project_type: string;
}

export async function getCommunityFlavors(
  limit: number = 12,
  filters?: CommunityFilters
): Promise<CommunityFlavor[]> {
  const userId = await getUserId();

  // Get demo user IDs
  const demoUserIds = DEMO_USERS.map((u) => u.user_id);

  // Build WHERE conditions - only show formulas from demo users
  const conditions = [
    sql`f.is_public = true`,
    sql`f.user_id != ${userId}`,
    sql`f.status = 'published'`,
    sql`f.user_id = ANY(${demoUserIds})`,
  ];

  if (filters?.categoryId) {
    conditions.push(sql`f.category_id = ${filters.categoryId}`);
  }

  if (filters?.projectType) {
    conditions.push(sql`f.project_type = ${filters.projectType}`);
  }

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(
      sql`(f.name ILIKE ${searchTerm} OR f.description ILIKE ${searchTerm})`
    );
  }

  const whereClause = sql.join(conditions, sql` AND `);

  const result = await db.execute(sql`
    SELECT
      f.formula_id,
      f.name,
      f.description,
      f.status,
      f.updated_at,
      f.user_id,
      f.project_type,
      u.username,
      c.name as category_name,
      COALESCE(sf.substance_count, 0) as substance_count
    FROM formula f
    LEFT JOIN users u ON f.user_id = u.user_id
    LEFT JOIN category c ON f.category_id = c.category_id
    LEFT JOIN (
      SELECT formula_id, COUNT(*) as substance_count
      FROM substance_formula
      GROUP BY formula_id
    ) sf ON f.formula_id = sf.formula_id
    WHERE ${whereClause}
    ORDER BY f.updated_at DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    formula_id: Number(f.formula_id),
    name: String(f.name),
    description: f.description ? String(f.description) : null,
    status: String(f.status),
    updated_at: String(f.updated_at),
    user_id: String(f.user_id),
    username: String(f.username || "Anonymous"),
    substance_count: Number(f.substance_count) || 0,
    category_name: f.category_name ? String(f.category_name) : null,
    project_type: String(f.project_type || "flavor"),
  }));
}

export interface SampleFlavor {
  formula_id: number;
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
      f.formula_id,
      f.name,
      f.description,
      f.status,
      f.updated_at,
      f.variation_group_id,
      f.variation_label,
      f.is_main_variation,
      COALESCE(sf.substance_count, 0) as substance_count,
      COALESCE(vc.variation_count, 1) as variation_count
    FROM formula f
    LEFT JOIN (
      SELECT formula_id, COUNT(*) as substance_count
      FROM substance_formula
      GROUP BY formula_id
    ) sf ON f.formula_id = sf.formula_id
    LEFT JOIN (
      SELECT variation_group_id, COUNT(*) as variation_count
      FROM formula
      WHERE variation_group_id IS NOT NULL
      GROUP BY variation_group_id
    ) vc ON f.variation_group_id = vc.variation_group_id
    WHERE f.user_id = ${DEMO_USER.user_id}
      AND (f.is_main_variation = true OR f.variation_group_id IS NULL)
    ORDER BY f.variation_group_id NULLS LAST, f.updated_at DESC
  `);

  return (result.rows as Record<string, unknown>[]).map((f) => ({
    formula_id: Number(f.formula_id),
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

// ─────────────────────────────────────────────────────────────
// TOP SUBSTANCES
// ─────────────────────────────────────────────────────────────

export interface TopSubstance {
  substance_id: number;
  common_name: string;
  usage_count: number;
}

/**
 * Get the user's most-used substances across all their formulas.
 */
export async function getTopSubstances(limit: number = 5): Promise<TopSubstance[]> {
  const userId = await getUserId();

  const result = await db.execute(sql`
    SELECT
      s.substance_id,
      s.common_name,
      COUNT(sf.formula_id)::int as usage_count
    FROM substance_formula sf
    JOIN substance s ON sf.substance_id = s.substance_id
    JOIN formula f ON sf.formula_id = f.formula_id
    WHERE f.user_id = ${userId}
    GROUP BY s.substance_id, s.common_name
    ORDER BY usage_count DESC
    LIMIT ${limit}
  `);

  return (result.rows as Record<string, unknown>[]).map((row) => ({
    substance_id: Number(row.substance_id),
    common_name: String(row.common_name),
    usage_count: Number(row.usage_count),
  }));
}

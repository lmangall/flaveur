"use server";

import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get flavor counts by status for current user
  const flavorStats = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_public = true) as public_count,
      COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
      COUNT(*) FILTER (WHERE status = 'published') as published_count,
      COUNT(*) FILTER (WHERE status = 'archived') as archived_count,
      COUNT(*) FILTER (WHERE updated_at > NOW() - INTERVAL '30 days') as recent_count
    FROM flavour
    WHERE user_id = ${userId}
  `;

  // Get total substances count
  const substanceStats = await sql`
    SELECT COUNT(*) as total FROM substance
  `;

  // Get total categories count
  const categoryStats = await sql`
    SELECT COUNT(*) as total FROM category
  `;

  const stats = flavorStats[0];

  return {
    totalFlavors: Number(stats.total) || 0,
    publicFlavors: Number(stats.public_count) || 0,
    draftFlavors: Number(stats.draft_count) || 0,
    publishedFlavors: Number(stats.published_count) || 0,
    archivedFlavors: Number(stats.archived_count) || 0,
    totalSubstances: Number(substanceStats[0].total) || 0,
    totalCategories: Number(categoryStats[0].total) || 0,
    recentActivityCount: Number(stats.recent_count) || 0,
  };
}

export async function getRecentFlavors(limit: number = 6): Promise<RecentFlavor[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const flavors = await sql`
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
  `;

  return flavors.map(f => ({
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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // For now, return published flavors as "favorites" since we don't have a favorites table yet
  // This can be updated later when we add proper favorites functionality
  const flavors = await sql`
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
  `;

  return flavors.map(f => ({
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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get user's own public flavors
  const flavors = await sql`
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
  `;

  return flavors.map(f => ({
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
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get public flavors from other users
  const flavors = await sql`
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
  `;

  return flavors.map(f => ({
    flavour_id: Number(f.flavour_id),
    name: String(f.name),
    description: f.description ? String(f.description) : null,
    status: String(f.status),
    updated_at: String(f.updated_at),
    user_id: String(f.user_id),
    username: String(f.username || 'Anonymous'),
    substance_count: Number(f.substance_count) || 0,
  }));
}

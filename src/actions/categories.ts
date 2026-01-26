"use server";

import { db } from "@/lib/db";
import { category, flavour } from "@/db/schema";
import { eq, isNull, sql, count } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { createCategorySchema, updateCategorySchema } from "@/lib/validations/category";

export interface CategoryWithDetails {
  category_id: number;
  name: string;
  description: string | null;
  parent_category_id: number | null;
  parent_name: string | null;
  children_count: number;
  updated_at: string | null;
}

export async function getCategories(): Promise<CategoryWithDetails[]> {
  const result = await db.execute(sql`
    SELECT
      c.category_id,
      c.name,
      c.description,
      c.parent_category_id,
      c.updated_at,
      p.name as parent_name,
      COALESCE(ch.children_count, 0) as children_count
    FROM category c
    LEFT JOIN category p ON c.parent_category_id = p.category_id
    LEFT JOIN (
      SELECT parent_category_id, COUNT(*) as children_count
      FROM category
      WHERE parent_category_id IS NOT NULL
      GROUP BY parent_category_id
    ) ch ON c.category_id = ch.parent_category_id
    ORDER BY
      CASE WHEN c.parent_category_id IS NULL THEN 0 ELSE 1 END,
      c.name
  `);

  return (result.rows as Record<string, unknown>[]).map((row) => ({
    category_id: Number(row.category_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    parent_category_id: row.parent_category_id ? Number(row.parent_category_id) : null,
    parent_name: row.parent_name ? String(row.parent_name) : null,
    children_count: Number(row.children_count) || 0,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  }));
}

export async function getCategoryById(categoryId: number): Promise<CategoryWithDetails | null> {
  const result = await db.execute(sql`
    SELECT
      c.category_id,
      c.name,
      c.description,
      c.parent_category_id,
      c.updated_at,
      p.name as parent_name,
      COALESCE(ch.children_count, 0) as children_count
    FROM category c
    LEFT JOIN category p ON c.parent_category_id = p.category_id
    LEFT JOIN (
      SELECT parent_category_id, COUNT(*) as children_count
      FROM category
      WHERE parent_category_id IS NOT NULL
      GROUP BY parent_category_id
    ) ch ON c.category_id = ch.parent_category_id
    WHERE c.category_id = ${categoryId}
  `);

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as Record<string, unknown>;
  return {
    category_id: Number(row.category_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    parent_category_id: row.parent_category_id ? Number(row.parent_category_id) : null,
    parent_name: row.parent_name ? String(row.parent_name) : null,
    children_count: Number(row.children_count) || 0,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function createCategory(data: {
  name: string;
  description?: string;
  parent_category_id?: number | null;
}): Promise<CategoryWithDetails> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validation = createCategorySchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid category data");
  }

  const { name, description, parent_category_id } = validation.data;

  if (parent_category_id) {
    const parentExists = await db
      .select({ category_id: category.category_id })
      .from(category)
      .where(eq(category.category_id, parent_category_id));
    if (parentExists.length === 0) {
      throw new Error("Parent category not found");
    }
  }

  const result = await db
    .insert(category)
    .values({
      name: name.trim(),
      description: description?.trim() || null,
      parent_category_id: parent_category_id || null,
    })
    .returning();

  const row = result[0];
  return {
    category_id: row.category_id,
    name: row.name,
    description: row.description,
    parent_category_id: row.parent_category_id,
    parent_name: null,
    children_count: 0,
    updated_at: row.updated_at,
  };
}

export async function updateCategory(
  categoryId: number,
  data: {
    name?: string;
    description?: string;
    parent_category_id?: number | null;
  }
): Promise<CategoryWithDetails> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validation = updateCategorySchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid category data");
  }

  const { name, description, parent_category_id } = validation.data;

  const existingCategory = await db
    .select({ category_id: category.category_id })
    .from(category)
    .where(eq(category.category_id, categoryId));
  if (existingCategory.length === 0) {
    throw new Error("Category not found");
  }

  if (parent_category_id === categoryId) {
    throw new Error("A category cannot be its own parent");
  }

  if (parent_category_id) {
    const parentExists = await db
      .select({ category_id: category.category_id })
      .from(category)
      .where(eq(category.category_id, parent_category_id));
    if (parentExists.length === 0) {
      throw new Error("Parent category not found");
    }

    // Check circular references with recursive CTE
    const isCircular = await db.execute(sql`
      WITH RECURSIVE children AS (
        SELECT category_id FROM category WHERE parent_category_id = ${categoryId}
        UNION ALL
        SELECT c.category_id FROM category c
        INNER JOIN children ch ON c.parent_category_id = ch.category_id
      )
      SELECT 1 FROM children WHERE category_id = ${parent_category_id}
    `);
    if (isCircular.rows.length > 0) {
      throw new Error("Cannot set a child category as the parent (circular reference)");
    }
  }

  const result = await db
    .update(category)
    .set({
      name: name?.trim() || undefined,
      description: description?.trim() ?? null,
      parent_category_id: parent_category_id ?? null,
      updated_at: new Date().toISOString(),
    })
    .where(eq(category.category_id, categoryId))
    .returning();

  const row = result[0];

  let parentName: string | null = null;
  if (row.parent_category_id) {
    const parentResult = await db
      .select({ name: category.name })
      .from(category)
      .where(eq(category.category_id, row.parent_category_id));
    if (parentResult.length > 0) {
      parentName = parentResult[0].name;
    }
  }

  return {
    category_id: row.category_id,
    name: row.name,
    description: row.description,
    parent_category_id: row.parent_category_id,
    parent_name: parentName,
    children_count: 0,
    updated_at: row.updated_at,
  };
}

export async function deleteCategory(categoryId: number): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const existingCategory = await db
    .select({ category_id: category.category_id, name: category.name })
    .from(category)
    .where(eq(category.category_id, categoryId));
  if (existingCategory.length === 0) {
    throw new Error("Category not found");
  }

  const children = await db
    .select({ count: count() })
    .from(category)
    .where(eq(category.parent_category_id, categoryId));
  if (Number(children[0].count) > 0) {
    throw new Error("Cannot delete category with subcategories. Delete or reassign subcategories first.");
  }

  const flavorsUsingCategory = await db
    .select({ count: count() })
    .from(flavour)
    .where(eq(flavour.category_id, categoryId));
  if (Number(flavorsUsingCategory[0].count) > 0) {
    throw new Error("Cannot delete category that is assigned to flavors. Reassign flavors first.");
  }

  await db.delete(category).where(eq(category.category_id, categoryId));

  return { success: true, message: "Category deleted successfully" };
}

export async function getTopLevelCategories(): Promise<CategoryWithDetails[]> {
  const result = await db.execute(sql`
    SELECT
      c.category_id,
      c.name,
      c.description,
      c.parent_category_id,
      c.updated_at,
      COALESCE(ch.children_count, 0) as children_count
    FROM category c
    LEFT JOIN (
      SELECT parent_category_id, COUNT(*) as children_count
      FROM category
      WHERE parent_category_id IS NOT NULL
      GROUP BY parent_category_id
    ) ch ON c.category_id = ch.parent_category_id
    WHERE c.parent_category_id IS NULL
    ORDER BY c.name
  `);

  return (result.rows as Record<string, unknown>[]).map((row) => ({
    category_id: Number(row.category_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    parent_category_id: null,
    parent_name: null,
    children_count: Number(row.children_count) || 0,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  }));
}

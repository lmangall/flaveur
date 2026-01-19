"use server";

import { sql } from "@/lib/db";
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
  const result = await sql`
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
  `;

  return result.map((row) => ({
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
  const result = await sql`
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
  `;

  if (result.length === 0) return null;

  const row = result[0];
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

  // Validate with Zod
  const validation = createCategorySchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid category data");
  }

  const { name, description, parent_category_id } = validation.data;

  // Check if parent exists (if provided)
  if (parent_category_id) {
    const parentExists = await sql`
      SELECT category_id FROM category WHERE category_id = ${parent_category_id}
    `;
    if (parentExists.length === 0) {
      throw new Error("Parent category not found");
    }
  }

  const result = await sql`
    INSERT INTO category (name, description, parent_category_id)
    VALUES (${name.trim()}, ${description?.trim() || null}, ${parent_category_id || null})
    RETURNING *
  `;

  const row = result[0];
  return {
    category_id: Number(row.category_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    parent_category_id: row.parent_category_id ? Number(row.parent_category_id) : null,
    parent_name: null, // New category, need to fetch parent name if needed
    children_count: 0,
    updated_at: row.updated_at ? String(row.updated_at) : null,
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

  // Validate with Zod
  const validation = updateCategorySchema.safeParse(data);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    throw new Error(firstError?.message || "Invalid category data");
  }

  const { name, description, parent_category_id } = validation.data;

  // Check if category exists
  const existingCategory = await sql`
    SELECT category_id FROM category WHERE category_id = ${categoryId}
  `;
  if (existingCategory.length === 0) {
    throw new Error("Category not found");
  }

  // Prevent setting itself as parent
  if (parent_category_id === categoryId) {
    throw new Error("A category cannot be its own parent");
  }

  // Check if new parent exists (if provided)
  if (parent_category_id) {
    const parentExists = await sql`
      SELECT category_id FROM category WHERE category_id = ${parent_category_id}
    `;
    if (parentExists.length === 0) {
      throw new Error("Parent category not found");
    }

    // Prevent circular references - check if new parent is a child of this category
    const isCircular = await sql`
      WITH RECURSIVE children AS (
        SELECT category_id FROM category WHERE parent_category_id = ${categoryId}
        UNION ALL
        SELECT c.category_id FROM category c
        INNER JOIN children ch ON c.parent_category_id = ch.category_id
      )
      SELECT 1 FROM children WHERE category_id = ${parent_category_id}
    `;
    if (isCircular.length > 0) {
      throw new Error("Cannot set a child category as the parent (circular reference)");
    }
  }

  const result = await sql`
    UPDATE category
    SET
      name = COALESCE(${name?.trim() || null}, name),
      description = ${description?.trim() ?? null},
      parent_category_id = ${parent_category_id ?? null},
      updated_at = NOW()
    WHERE category_id = ${categoryId}
    RETURNING *
  `;

  const row = result[0];

  // Fetch parent name if exists
  let parentName: string | null = null;
  if (row.parent_category_id) {
    const parentResult = await sql`
      SELECT name FROM category WHERE category_id = ${row.parent_category_id}
    `;
    if (parentResult.length > 0) {
      parentName = String(parentResult[0].name);
    }
  }

  return {
    category_id: Number(row.category_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    parent_category_id: row.parent_category_id ? Number(row.parent_category_id) : null,
    parent_name: parentName,
    children_count: 0, // Not calculated here
    updated_at: row.updated_at ? String(row.updated_at) : null,
  };
}

export async function deleteCategory(categoryId: number): Promise<{ success: boolean; message: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Check if category exists
  const existingCategory = await sql`
    SELECT category_id, name FROM category WHERE category_id = ${categoryId}
  `;
  if (existingCategory.length === 0) {
    throw new Error("Category not found");
  }

  // Check if category has children
  const children = await sql`
    SELECT COUNT(*) as count FROM category WHERE parent_category_id = ${categoryId}
  `;
  if (Number(children[0].count) > 0) {
    throw new Error("Cannot delete category with subcategories. Delete or reassign subcategories first.");
  }

  // Check if category is used by any flavors
  const flavorsUsingCategory = await sql`
    SELECT COUNT(*) as count FROM flavour WHERE category_id = ${categoryId}
  `;
  if (Number(flavorsUsingCategory[0].count) > 0) {
    throw new Error("Cannot delete category that is assigned to flavors. Reassign flavors first.");
  }

  // Delete the category
  await sql`DELETE FROM category WHERE category_id = ${categoryId}`;

  return { success: true, message: "Category deleted successfully" };
}

export async function getTopLevelCategories(): Promise<CategoryWithDetails[]> {
  const result = await sql`
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
  `;

  return result.map((row) => ({
    category_id: Number(row.category_id),
    name: String(row.name),
    description: row.description ? String(row.description) : null,
    parent_category_id: null,
    parent_name: null,
    children_count: Number(row.children_count) || 0,
    updated_at: row.updated_at ? String(row.updated_at) : null,
  }));
}

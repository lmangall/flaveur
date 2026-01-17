"use server";

import { sql } from "@/lib/db";

export async function getCategories() {
  const result = await sql`SELECT * FROM category`;
  return result;
}

export async function createCategory(data: { name: string; description?: string }) {
  const result = await sql`
    INSERT INTO category (name, description)
    VALUES (${data.name}, ${data.description ?? null})
    RETURNING *
  `;
  return result[0];
}

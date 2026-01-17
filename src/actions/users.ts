"use server";

import { sql } from "@/lib/db";

export async function getUsers() {
  const result = await sql`SELECT * FROM users`;
  return result;
}

export async function createUser(data: { email: string; username?: string }) {
  const result = await sql`
    INSERT INTO users (email, username, created_at)
    VALUES (${data.email}, ${data.username ?? null}, NOW())
    RETURNING *
  `;
  return result[0];
}

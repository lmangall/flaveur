"use server";

import { db } from "@/lib/db";
import { users } from "@/db/schema";

export async function getUsers() {
  return await db.select().from(users);
}

export async function createUser(data: { email: string; username?: string }) {
  const result = await db
    .insert(users)
    .values({
      user_id: crypto.randomUUID(),
      email: data.email,
      username: data.username ?? data.email.split("@")[0],
    })
    .returning();
  return result[0];
}

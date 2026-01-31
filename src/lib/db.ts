import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const neonClient = neon(process.env.DATABASE_URL);
export const sql = neonClient;
export const db = drizzle(neonClient, { schema });

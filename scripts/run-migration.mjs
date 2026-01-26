#!/usr/bin/env node
import { neon } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Load .env.local if DATABASE_URL not set
if (!process.env.DATABASE_URL) {
  const envPath = join(rootDir, ".env.local");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  }
}

// Get migration file from command line args or default to latest
const migrationFile = process.argv[2] || "020_add_document_types.sql";
const migrationPath = join(__dirname, "../src/db/migrations", migrationFile);

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable is not set");
  console.error("Run with: DATABASE_URL=your_url node scripts/run-migration.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log(`Running migration: ${migrationFile}`);

  try {
    const migrationSql = readFileSync(migrationPath, "utf-8");

    // Split by $$ blocks first (for DO blocks), then by semicolons
    // Handle DO $$ ... $$ blocks as single statements
    const doBlockRegex = /DO\s*\$\$[\s\S]*?\$\$\s*;/gi;
    const doBlocks = migrationSql.match(doBlockRegex) || [];
    let remainingSql = migrationSql.replace(doBlockRegex, "");

    // Run DO blocks first
    for (const block of doBlocks) {
      console.log(`Executing DO block...`);
      await sql.query(block);
    }

    // Split remaining by semicolons
    const statements = remainingSql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 60)}...`);
        await sql.query(statement);
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();

/**
 * Migration runner: Apply SQL migration files to the database
 *
 * Run with: npx tsx scripts/run-migration.ts <migration-file>
 *
 * Example: npx tsx scripts/run-migration.ts 013_normalize_functional_groups.sql
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("Usage: npx tsx scripts/run-migration.ts <migration-file>");
  console.error(
    "Example: npx tsx scripts/run-migration.ts 013_normalize_functional_groups.sql"
  );
  process.exit(1);
}

const sql = neon(DATABASE_URL);

/**
 * Parse SQL file into individual statements
 * Handles multi-line statements, inline comments, and dollar-quoted strings
 */
function parseSqlStatements(content: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inString = false;
  let stringChar = "";
  let inDollarQuote = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    // Handle $$ dollar quoting (used for function bodies)
    if (char === "$" && nextChar === "$" && !inString) {
      current += "$$";
      i++; // Skip next $
      inDollarQuote = !inDollarQuote;
      continue;
    }

    // Track string literals (only when not in dollar quote)
    if ((char === "'" || char === '"') && !inString && !inDollarQuote) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar && inString && !inDollarQuote) {
      inString = false;
    }

    // Skip -- comments (but only when not in a string or dollar quote)
    if (char === "-" && nextChar === "-" && !inString && !inDollarQuote) {
      // Skip to end of line
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      current += " "; // Replace comment with space to preserve separation
      continue;
    }

    current += char;

    // Statement ends with semicolon (when not in string or dollar quote)
    if (char === ";" && !inString && !inDollarQuote) {
      const trimmed = current.trim();
      if (trimmed.length > 1) {
        statements.push(trimmed);
      }
      current = "";
    }
  }

  // Handle any remaining content
  const remaining = current.trim();
  if (remaining.length > 0 && remaining !== ";") {
    statements.push(remaining);
  }

  return statements;
}

async function runMigration() {
  const migrationPath = join(__dirname, "../src/db/migrations", migrationFile);

  console.log(`Running migration: ${migrationFile}`);
  console.log(`Path: ${migrationPath}\n`);

  try {
    const migrationSql = readFileSync(migrationPath, "utf-8");
    const statements = parseSqlStatements(migrationSql);

    console.log(`Executing ${statements.length} statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const firstLine = statement.split("\n")[0].substring(0, 60);
      console.log(`[${i + 1}/${statements.length}] ${firstLine}...`);

      try {
        await sql.query(statement);
        console.log("    ✓ OK");
      } catch (err) {
        const error = err as Error;
        // Some errors are expected (e.g., IF NOT EXISTS, ON CONFLICT)
        if (
          error.message.includes("already exists") ||
          error.message.includes("duplicate key")
        ) {
          console.log(`    ⚠ Skipped (already exists)`);
        } else {
          console.error(`    ✗ Failed: ${error.message}`);
          throw err;
        }
      }
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (err) {
    console.error("\n✗ Migration failed:", err);
    process.exit(1);
  }
}

runMigration();

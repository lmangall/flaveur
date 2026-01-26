/**
 * Simple migration runner for Neon Serverless PostgreSQL
 *
 * Usage: npx tsx src/db/run-migration.ts <migration-file>
 * Example: npx tsx src/db/run-migration.ts 021_add_learning.sql
 *
 * Make sure to load environment variables first:
 * - Use dotenv: npx dotenv -e .env.local -- npx tsx src/db/run-migration.ts 021_add_learning.sql
 * - Or export DATABASE_URL manually
 */

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Split SQL into individual statements, handling comments and edge cases
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inComment = false;
  let inString = false;
  let stringChar = "";

  const lines = sql.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines and single-line comments
    if (trimmedLine === "" || trimmedLine.startsWith("--")) {
      continue;
    }

    // Handle multi-line comments (simplistic approach)
    if (trimmedLine.startsWith("/*")) {
      inComment = true;
    }
    if (inComment) {
      if (trimmedLine.includes("*/")) {
        inComment = false;
      }
      continue;
    }

    current += line + "\n";

    // Check if line ends with semicolon (outside of strings)
    // This is a simplistic check; for complex SQL you'd need a proper parser
    if (trimmedLine.endsWith(";")) {
      const statement = current.trim();
      if (statement && statement !== ";") {
        statements.push(statement);
      }
      current = "";
    }
  }

  // Add any remaining content
  if (current.trim() && current.trim() !== ";") {
    statements.push(current.trim());
  }

  return statements;
}

async function runMigration(migrationFile: string) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    console.error("");
    console.error("   To run with .env.local, use:");
    console.error("   npx dotenv -e .env.local -- npx tsx src/db/run-migration.ts 021_add_learning.sql");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  const migrationPath = resolve(__dirname, "migrations", migrationFile);

  console.log(`📁 Reading migration: ${migrationFile}`);

  let migrationSql: string;
  try {
    migrationSql = readFileSync(migrationPath, "utf-8");
  } catch {
    console.error(`❌ Could not read migration file: ${migrationPath}`);
    process.exit(1);
  }

  console.log(`🚀 Running migration...`);
  console.log(`   File: ${migrationPath}`);

  const statements = splitSqlStatements(migrationSql);
  console.log(`   Found ${statements.length} statements to execute`);

  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const preview = statement.substring(0, 60).replace(/\n/g, " ").trim();
      console.log(`   [${i + 1}/${statements.length}] ${preview}...`);

      await sql.query(statement, []);
    }

    console.log(`✅ Migration completed successfully!`);
  } catch (error) {
    console.error(`❌ Migration failed:`);
    console.error(error);
    process.exit(1);
  }
}

// Get migration file from command line args
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("Usage: npx tsx src/db/run-migration.ts <migration-file>");
  console.error("Example: npx tsx src/db/run-migration.ts 021_add_learning.sql");
  console.error("");
  console.error("With .env.local:");
  console.error("  npx dotenv -e .env.local -- npx tsx src/db/run-migration.ts 021_add_learning.sql");
  process.exit(1);
}

runMigration(migrationFile);

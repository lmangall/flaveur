/**
 * Enrichment script: Fetch missing chemical data from PubChem API
 *
 * Run with: npx tsx scripts/enrich-from-pubchem.ts [--limit=N] [--dry-run]
 *
 * Options:
 *   --limit=N    Process only N substances (default: 50)
 *   --dry-run    Preview changes without writing to database
 *
 * Prerequisites:
 * - DATABASE_URL environment variable must be set
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

// Load environment variables from .env.local
config({ path: join(__dirname, "../.env.local") });

const PUBCHEM_API = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";

interface PubChemCompound {
  CID: number;
  MolecularWeight: number;
  MolecularFormula: string;
  CanonicalSMILES: string;
  InChI: string;
  XLogP: number;
  ExactMass: number;
}

async function fetchByName(name: string): Promise<PubChemCompound | null> {
  try {
    const url = `${PUBCHEM_API}/compound/name/${encodeURIComponent(name)}/property/MolecularWeight,MolecularFormula,CanonicalSMILES,InChI,XLogP,ExactMass/JSON`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.PropertyTable?.Properties?.[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchByCAS(cas: string): Promise<PubChemCompound | null> {
  try {
    const url = `${PUBCHEM_API}/compound/name/${encodeURIComponent(cas)}/property/MolecularWeight,MolecularFormula,CanonicalSMILES,InChI,XLogP,ExactMass/JSON`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    return data.PropertyTable?.Properties?.[0] ?? null;
  } catch {
    return null;
  }
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Parse command line arguments
const args = process.argv.slice(2);
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1]) : 50;
const dryRun = args.includes("--dry-run");

async function enrichSubstances() {
  console.log(`PubChem Enrichment Script`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Limit: ${limit} substances\n`);

  // Get substances missing chemical data
  const incomplete = await sql`
    SELECT substance_id, common_name, cas_id
    FROM substance
    WHERE smile IS NULL OR molecular_weight IS NULL OR inchi IS NULL
    LIMIT ${limit}
  `;

  console.log(`Found ${incomplete.length} substances to enrich\n`);

  let enriched = 0;
  let notFound = 0;

  for (const sub of incomplete) {
    const substanceId = sub.substance_id as number;
    const commonName = sub.common_name as string;
    const casId = sub.cas_id as string | null;

    // Try CAS first, then name
    let data: PubChemCompound | null = null;

    if (casId && casId.trim()) {
      data = await fetchByCAS(casId);
    }

    if (!data) {
      data = await fetchByName(commonName);
    }

    if (data) {
      if (!dryRun) {
        await sql`
          UPDATE substance SET
            smile = COALESCE(smile, ${data.CanonicalSMILES}),
            molecular_weight = COALESCE(molecular_weight, ${data.MolecularWeight}),
            molecular_formula = COALESCE(molecular_formula, ${data.MolecularFormula}),
            inchi = COALESCE(inchi, ${data.InChI}),
            xlogp = COALESCE(xlogp, ${data.XLogP}),
            exact_mass = COALESCE(exact_mass, ${data.ExactMass}),
            pubchem_id = COALESCE(pubchem_id, ${data.CID})
          WHERE substance_id = ${substanceId}
        `;
      }
      enriched++;
      console.log(`✓ Enriched: ${commonName} (CID: ${data.CID})`);
    } else {
      notFound++;
      console.log(`✗ Not found: ${commonName}`);
    }

    // Rate limit: 4 requests/second max (250ms between requests)
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("\n--- Enrichment Summary ---");
  console.log(`Enriched: ${enriched}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Total processed: ${incomplete.length}`);
  if (dryRun) {
    console.log("\n(Dry run - no changes were made)");
  }
}

enrichSubstances().catch((err) => {
  console.error("Enrichment failed:", err);
  process.exit(1);
});

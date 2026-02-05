import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { join } from "path";

config({ path: join(__dirname, "../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  const title = "Aromaticien H/F";
  const description = `Robertet, leader des ingrédients naturels pour l'industrie des arômes, de la parfumerie et des actifs beauté, recherche un Aromaticien H/F pour rejoindre son équipe dynamique !

Directement rattaché.e à la Direction des Arômes, vous développerez ou modifierez de nouveaux arômes en réponse à des briefs clients ou à des demandes marketing.

Vos principales missions seront les suivantes :

- Répondre aux études des demandes clients
- Assurer la conformité des arômes vis-à-vis des exigences règlementaires/client
- Réaliser le développement de nouveaux arômes
- Assurer la veille technique et règlementaire (se tenir informé des nouveautés)
- Assurer le rôle de support technico-commercial (visite clients, soutien aux commerciaux)
- Assurer la relation avec le laboratoire d'applications (vérifier la validation de l'arôme)

Profil recherché :
Issu d'une formation Bac +5 type ISIPCA, vous justifiez d'une expérience de 7 ans à un poste similaire. Une bonne connaissance des matières premières et des techniques analytiques ainsi que de la partie règlementaire est requise. Créatif et curieux, vous disposez d'une bonne mémoire olfactive et gustative. Organisé et réactif, vous savez gérer vos priorités. Anglais écrit et oral niveau B1.`;

  const requirements = JSON.stringify([
    "Bac +5 type ISIPCA",
    "7 ans d'expérience minimum à un poste similaire",
    "Bonne connaissance des matières premières et techniques analytiques",
    "Connaissance de la réglementation arômes",
    "Mémoire olfactive et gustative développée",
    "Anglais écrit et oral niveau B1",
  ]);

  const tags = JSON.stringify([
    "aromaticien",
    "arômes",
    "ISIPCA",
    "développement",
    "réglementation",
    "matières premières",
    "Grasse",
  ]);

  // Check for duplicates first
  const existing = await sql`
    SELECT id FROM job_offers
    WHERE source_url = 'https://www.hellowork.com/fr-fr/emplois/74266641.html'
  `;

  if (existing.length > 0) {
    console.log("Job already exists with id:", existing[0].id);
    return;
  }

  const result = await sql`
    INSERT INTO job_offers (
      title, description, company_name, original_company_name,
      through_recruiter, source_website, source_url, location,
      employment_type, salary, requirements, tags, posted_at,
      industry, experience_level, status
    ) VALUES (
      ${title},
      ${description},
      ${"ROBERTET"},
      ${"ROBERTET"},
      ${false},
      ${"hellowork.com"},
      ${"https://www.hellowork.com/fr-fr/emplois/74266641.html"},
      ${"Grasse (06)"},
      ${"CDI"},
      ${"23 900 - 30 700 € / an"},
      ${requirements}::jsonb,
      ${tags}::jsonb,
      ${"2026-02-05"},
      ${"Arômes & Parfumerie"},
      ${"6-10"},
      ${true}
    )
    RETURNING id, title, company_name
  `;

  console.log("Job inserted successfully:", result[0]);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

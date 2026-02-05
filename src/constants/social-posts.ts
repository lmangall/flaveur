// Social media post templates for job offers
// Usage: generate-social-posts.ts script uses these to format posts

export const POST_FORMATS = [
  { value: "daily", label: "Job of the Day" },
  { value: "announcement", label: "New on Platform" },
  { value: "weekly", label: "Weekly Roundup" },
  { value: "spotlight", label: "Industry Spotlight" },
  { value: "story", label: "Quick Story/Reel" },
] as const;

export type PostFormat = (typeof POST_FORMATS)[number]["value"];

export const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", maxLength: 3000 },
  { value: "instagram", label: "Instagram", maxLength: 2200 },
  { value: "x", label: "X (Twitter)", maxLength: 280 },
] as const;

export type Platform = (typeof PLATFORMS)[number]["value"];

export interface JobPost {
  id: string;
  title: string;
  company_name: string | null;
  location: string;
  employment_type: string | null;
  experience_level: string | null;
  salary: string | null;
  requirements: string[] | null;
  tags: string[] | null;
  industry: string;
  source_url: string;
  description: string;
  through_recruiter: boolean;
}

// --- Formatting helpers ---

function formatExperience(level: string | null): string {
  if (!level) return "";
  const map: Record<string, string> = {
    "0-2": "Junior (0-2 ans)",
    "3-5": "Confirmé (3-5 ans)",
    "6-10": "Senior (6-10 ans)",
    "10+": "Expert (10+ ans)",
  };
  return map[level] ?? level;
}

function formatTags(tags: string[] | null, platform: Platform): string {
  if (!tags || tags.length === 0) return "";
  const hashtags = tags.map((t) => `#${t.replace(/\s+/g, "")}`);
  if (platform === "x") return hashtags.slice(0, 3).join(" ");
  return hashtags.join(" ");
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
}

function topRequirements(requirements: string[] | null, count: number): string {
  if (!requirements || requirements.length === 0) return "";
  return requirements
    .slice(0, count)
    .map((r) => `- ${r}`)
    .join("\n");
}

// --- Post generators ---

export function generateDailyPost(job: JobPost, platform: Platform): string {
  const company = job.company_name ?? "Entreprise confidentielle";
  const type = job.employment_type ?? "";
  const loc = job.location;
  const exp = formatExperience(job.experience_level);
  const tags = formatTags(job.tags, platform);
  const reqs = topRequirements(job.requirements, 3);
  const salary = job.salary ? `\nSalaire : ${job.salary}` : "";

  if (platform === "x") {
    return truncate(
      `${type} ${loc}\n${job.title} - ${company}${salary}\n\n${tags} #FlavorJobs`,
      280
    );
  }

  if (platform === "instagram") {
    return [
      `${type} - ${loc}`,
      `${job.title} @ ${company}`,
      "",
      reqs ? `Compétences clés :\n${reqs}` : "",
      exp ? `Expérience : ${exp}` : "",
      salary,
      "",
      `Postuler : lien en bio`,
      "",
      `${tags} #FlavorJobs #Aromaticien #Emploi`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // LinkedIn (default)
  return [
    `${type} - ${loc}`,
    `${job.title} @ ${company}`,
    "",
    job.description.slice(0, 300) + (job.description.length > 300 ? "..." : ""),
    "",
    reqs ? `Profil recherché :\n${reqs}` : "",
    exp ? `\nExpérience : ${exp}` : "",
    salary,
    "",
    `Postuler : ${job.source_url}`,
    "",
    `${tags} #FlavorJobs #Aromaticien #Emploi`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateWeeklyRoundup(
  jobs: JobPost[],
  platform: Platform
): string {
  const count = platform === "x" ? 3 : 5;
  const listed = jobs.slice(0, count);

  if (platform === "x") {
    const lines = listed.map(
      (j) => `${j.title} - ${j.company_name ?? "?"} (${j.location})`
    );
    return truncate(
      `Les offres de la semaine :\n\n${lines.join("\n")}\n\n#FlavorJobs`,
      280
    );
  }

  const lines = listed.map(
    (j, i) =>
      `${i + 1}. ${j.title} - ${j.company_name ?? "Confidentiel"} (${j.location})${j.employment_type ? ` [${j.employment_type}]` : ""}`
  );

  const header =
    platform === "linkedin"
      ? `Les offres de la semaine dans l'industrie des arômes :\n`
      : `Les offres de la semaine :\n`;

  const footer =
    platform === "linkedin"
      ? `\nToutes les offres sur Oumamie\n\n#FlavorJobs #Aromaticien #Emploi #Arômes`
      : `\nToutes les offres : lien en bio\n\n#FlavorJobs #Aromaticien #Emploi`;

  return `${header}\n${lines.join("\n")}${footer}`;
}

export function generateSpotlight(
  jobs: JobPost[],
  industry: string,
  platform: Platform
): string {
  const locations = [...new Set(jobs.map((j) => j.location))];
  const expLevels = [
    ...new Set(jobs.map((j) => j.experience_level).filter(Boolean)),
  ];

  if (platform === "x") {
    return truncate(
      `Le secteur ${industry} recrute ! ${jobs.length} offre(s) disponible(s)\n\n#FlavorJobs #${industry.replace(/\s+/g, "")}`,
      280
    );
  }

  return [
    `Le secteur ${industry} recrute !`,
    "",
    `${jobs.length} poste(s) disponible(s)`,
    `Villes : ${locations.join(", ")}`,
    expLevels.length > 0
      ? `Niveaux : ${expLevels.map(formatExperience).join(", ")}`
      : "",
    "",
    platform === "linkedin"
      ? `Découvrir les offres sur Oumamie`
      : `Lien en bio`,
    "",
    `#FlavorJobs #${industry.replace(/\s+/g, "")} #Emploi`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateStory(job: JobPost): string {
  const company = job.company_name ?? "Confidentiel";
  return [
    `${company} recrute !`,
    `${job.location} | ${job.employment_type ?? ""}`,
    job.title,
    job.salary ? `${job.salary}` : "",
    "",
    `Lien en bio`,
  ]
    .filter(Boolean)
    .join("\n");
}

const PLATFORM_BASE_URL = "https://oumamie.com";

function jobUrl(jobId: string): string {
  return `${PLATFORM_BASE_URL}/jobs/${jobId}`;
}

export function generateAnnouncement(job: JobPost, platform: Platform): string {
  const company = job.company_name ?? "Entreprise confidentielle";
  const type = job.employment_type ?? "";
  const loc = job.location;
  const exp = formatExperience(job.experience_level);
  const tags = formatTags(job.tags, platform);
  const salary = job.salary ? `${job.salary}` : "";
  const url = jobUrl(job.id);

  if (platform === "x") {
    return truncate(
      `Nouvelle offre sur Oumamie !\n\n${job.title} - ${company}\n${loc}${salary ? ` | ${salary}` : ""}\n\nConnectez-vous pour postuler : ${url}\n\n${tags} #FlavorJobs #NouvelleOffre`,
      280
    );
  }

  if (platform === "instagram") {
    return [
      `Nouvelle offre disponible sur Oumamie !`,
      "",
      `${job.title}`,
      `${company}`,
      "",
      `${type} | ${loc}`,
      exp ? `${exp}` : "",
      salary ? `${salary}` : "",
      "",
      `Connectez-vous sur oumamie.com pour consulter l'offre et postuler.`,
      "",
      `Lien en bio`,
      "",
      `${tags} #FlavorJobs #NouvelleOffre #Aromaticien #Emploi`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  // LinkedIn
  return [
    `Nouvelle offre disponible sur Oumamie !`,
    "",
    `${job.title} @ ${company}`,
    `${type} | ${loc}`,
    exp ? `Expérience : ${exp}` : "",
    salary ? `Rémunération : ${salary}` : "",
    "",
    job.description.slice(0, 200) + (job.description.length > 200 ? "..." : ""),
    "",
    `Consultez l'offre et postulez sur Oumamie (connexion requise) : ${url}`,
    "",
    `${tags} #FlavorJobs #NouvelleOffre #Aromaticien #Emploi`,
  ]
    .filter(Boolean)
    .join("\n");
}

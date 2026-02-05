import type { Page } from "puppeteer-core";

export interface ExtractedListing {
  externalId: string;
  title: string;
  company: string | null;
  location: string | null;
  employmentType: string | null;
  salary: string | null;
  listingUrl: string;
}

export interface SiteExtractor {
  name: string;
  extract(page: Page): Promise<ExtractedListing[]>;
}

export interface ExtractedJobDetail {
  title: string;
  description: string;
  company: string | null;
  location: string | null;
  employmentType: string | null;
  contractType: string | null;
  salary: string | null;
  postedAt: string | null;
  expiresAt: string | null;
  experienceMonths: number | null;
  sourceUrl: string;
}

export interface SiteDetailExtractor {
  name: string;
  extractDetail(page: Page): Promise<ExtractedJobDetail>;
}

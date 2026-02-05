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

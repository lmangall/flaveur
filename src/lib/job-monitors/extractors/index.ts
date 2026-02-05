import type { SiteExtractor } from "../types";
import { helloworkExtractor } from "./hellowork";

const extractors: Record<string, SiteExtractor> = {
  hellowork: helloworkExtractor,
};

export function getExtractor(siteKey: string): SiteExtractor | null {
  return extractors[siteKey] || null;
}

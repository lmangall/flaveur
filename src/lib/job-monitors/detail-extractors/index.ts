import type { SiteDetailExtractor } from "../types";
import { helloworkDetailExtractor } from "./hellowork";

const detailExtractors: Record<string, SiteDetailExtractor> = {
  hellowork: helloworkDetailExtractor,
};

export function getDetailExtractor(
  siteKey: string
): SiteDetailExtractor | null {
  return detailExtractors[siteKey] || null;
}

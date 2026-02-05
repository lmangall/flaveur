import type { Page } from "puppeteer-core";
import type { SiteExtractor, ExtractedListing } from "../types";

export const helloworkExtractor: SiteExtractor = {
  name: "HelloWork",

  async extract(page: Page): Promise<ExtractedListing[]> {
    // Wait for job result links to appear
    await page
      .waitForSelector('a[href*="/fr-fr/emplois/"]', { timeout: 15000 })
      .catch(() => null);

    const listings = await page.evaluate(() => {
      const results: Array<{
        externalId: string;
        title: string;
        company: string | null;
        location: string | null;
        employmentType: string | null;
        salary: string | null;
        listingUrl: string;
      }> = [];

      const jobLinks = document.querySelectorAll(
        'a[href*="/fr-fr/emplois/"]'
      );

      for (const link of jobLinks) {
        const href = link.getAttribute("href");
        if (!href || !href.match(/\/fr-fr\/emplois\/\d+\.html/)) continue;

        const idMatch = href.match(/\/(\d+)\.html/);
        if (!idMatch) continue;

        const externalId = idMatch[1];

        const listingUrl = href.startsWith("http")
          ? href
          : `https://www.hellowork.com${href}`;

        // Title from h3 inside the link — collapse whitespace
        const h3 = link.querySelector("h3");
        const title = (h3?.textContent?.trim() || "").replace(/\s+/g, " ");
        if (!title) continue;

        // Navigate to containing list item for sibling data
        const container = link.closest("li") || link.parentElement;
        if (!container) continue;

        const textContent = container.textContent || "";

        let company: string | null = null;
        let location: string | null = null;
        let employmentType: string | null = null;
        let salary: string | null = null;

        // Employment type detection
        const employmentTypes = [
          "CDI",
          "CDD",
          "Intérim",
          "Stage",
          "Alternance",
          "Freelance",
        ];
        for (const type of employmentTypes) {
          if (textContent.includes(type)) {
            employmentType = type;
            break;
          }
        }

        // Salary: "XX € / mois" or "XX - XX € / an" patterns
        const salaryMatch = textContent.match(
          /[\d\s,.]+€\s*\/\s*(mois|an|heure|jour)/i
        );
        if (salaryMatch) {
          salary = salaryMatch[0].trim();
        }

        // Location: "City - DepartmentCode" pattern (e.g., "Grasse - 06")
        const locationMatch = textContent.match(
          /([A-ZÀ-Ÿa-zà-ÿ\s'-]+)\s*-\s*(\d{2,3})/
        );
        if (locationMatch) {
          location = locationMatch[0].trim();
        }

        // Company: try img alt text or find distinct text nodes
        const companyImg = container.querySelector("img[alt]");
        if (companyImg) {
          const alt = companyImg.getAttribute("alt") || "";
          const cleaned = alt.replace(/^(Recrutement|Logo)\s+/i, "").trim();
          if (cleaned && cleaned !== title) {
            company = cleaned;
          }
        }

        // Deduplicate within same page
        if (results.some((r) => r.externalId === externalId)) continue;

        results.push({
          externalId,
          title,
          company,
          location,
          employmentType,
          salary,
          listingUrl,
        });
      }

      return results;
    });

    return listings;
  },
};

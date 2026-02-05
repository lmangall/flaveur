import type { Page } from "puppeteer-core";
import type { SiteDetailExtractor, ExtractedJobDetail } from "../types";

export const helloworkDetailExtractor: SiteDetailExtractor = {
  name: "HelloWork",

  async extractDetail(page: Page): Promise<ExtractedJobDetail> {
    // Wait for the page content to load
    await page
      .waitForSelector('script[type="application/ld+json"]', { timeout: 15000 })
      .catch(() => null);

    const detail = await page.evaluate(() => {
      // --- 1. Parse JSON-LD JobPosting ---
      const ldScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );

      let jobPosting: Record<string, unknown> | null = null;

      for (const script of ldScripts) {
        try {
          const data = JSON.parse(script.textContent || "");
          // Could be an array or a single object
          const candidates = Array.isArray(data) ? data : [data];
          for (const candidate of candidates) {
            if (candidate["@type"] === "JobPosting") {
              jobPosting = candidate;
              break;
            }
          }
          if (jobPosting) break;
        } catch {
          // skip invalid JSON
        }
      }

      if (!jobPosting) {
        throw new Error("No JSON-LD JobPosting found on this page");
      }

      const title = String(jobPosting.title || "");
      const description = String(jobPosting.description || "");

      // Company
      let company: string | null = null;
      const hiringOrg = jobPosting.hiringOrganization as Record<
        string,
        unknown
      > | null;
      if (hiringOrg && hiringOrg.name) {
        company = String(hiringOrg.name);
      }

      // Location: "City (PostalCode)"
      let location: string | null = null;
      const jobLocation = jobPosting.jobLocation as Record<
        string,
        unknown
      > | null;
      if (jobLocation) {
        const address = jobLocation.address as Record<string, unknown> | null;
        if (address) {
          const city = address.addressLocality
            ? String(address.addressLocality)
            : "";
          const postalCode = address.postalCode
            ? String(address.postalCode)
            : "";
          if (city && postalCode) {
            location = `${city} (${postalCode})`;
          } else if (city) {
            location = city;
          }
        }
      }

      // Employment type from JSON-LD
      const employmentType = jobPosting.employmentType
        ? String(jobPosting.employmentType)
        : null;

      // Salary
      let salary: string | null = null;
      const estimatedSalary = jobPosting.estimatedSalary as Record<
        string,
        unknown
      > | null;
      if (estimatedSalary) {
        const minValue = estimatedSalary.minValue;
        const maxValue = estimatedSalary.maxValue;
        const currency = estimatedSalary.currency || "EUR";
        const unitText = estimatedSalary.unitText || "";
        const period =
          unitText === "YEAR"
            ? "an"
            : unitText === "MONTH"
              ? "mois"
              : unitText === "HOUR"
                ? "heure"
                : String(unitText).toLowerCase();

        if (minValue && maxValue) {
          salary = `${minValue} - ${maxValue} ${currency} / ${period}`;
        } else if (minValue) {
          salary = `${minValue} ${currency} / ${period}`;
        }
      }

      // Dates
      const postedAt = jobPosting.datePosted
        ? String(jobPosting.datePosted)
        : null;
      const expiresAt = jobPosting.validThrough
        ? String(jobPosting.validThrough)
        : null;

      // Experience
      let experienceMonths: number | null = null;
      const expReq = jobPosting.experienceRequirements as Record<
        string,
        unknown
      > | null;
      if (expReq && typeof expReq.monthsOfExperience === "number") {
        experienceMonths = expReq.monthsOfExperience;
      }

      // --- 2. Parse dataLayer for French contract type ---
      let contractType: string | null = null;
      try {
        // dataLayer is typically a global array on HelloWork pages
        const dl = (window as unknown as Record<string, unknown[]>).dataLayer;
        if (Array.isArray(dl)) {
          for (const entry of dl) {
            const e = entry as Record<string, unknown>;
            if (e.contrat && typeof e.contrat === "string") {
              contractType = e.contrat;
              break;
            }
          }
        }
      } catch {
        // dataLayer may not exist
      }

      return {
        title,
        description,
        company,
        location,
        employmentType,
        contractType,
        salary,
        postedAt,
        expiresAt,
        experienceMonths,
      };
    });

    return {
      ...detail,
      sourceUrl: page.url(),
    };
  },
};

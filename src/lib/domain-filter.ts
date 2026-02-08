/**
 * Domain Filter Utility
 *
 * Filters substances based on user's preferred domain (flavor vs fragrance).
 * Substances with domain='both' are always included.
 *
 * Usage in SQL queries:
 *   WHERE ${domainFilterSql(userDomain)}
 *
 * Or use getDomainFilter() to get the array of domains to match.
 */

export type SubstanceDomain = "flavor" | "fragrance" | "cosmetic" | "both";
export type UserDomain = "flavor" | "fragrance" | "cosmetic";

/**
 * Get the domains to include based on user preference.
 * Always includes 'both' plus the user's preferred domain.
 *
 * @param userDomain - User's preferred domain ("flavor" or "fragrance")
 * @returns Array of domains to match: [userDomain, "both"]
 *
 * @example
 * const domains = getDomainFilter("flavor");
 * // Returns: ["flavor", "both"]
 */
export function getDomainFilter(userDomain: UserDomain): SubstanceDomain[] {
  return [userDomain, "both"];
}

/**
 * Build a SQL WHERE clause fragment for domain filtering.
 * Use with template literal SQL queries.
 *
 * @param userDomain - User's preferred domain
 * @returns SQL fragment string
 *
 * @example
 * const result = await sql`
 *   SELECT * FROM substance
 *   WHERE ${domainFilterSql("flavor")}
 * `;
 * // Generates: WHERE (domain IN ('flavor', 'both') OR domain IS NULL)
 */
export function domainFilterSql(userDomain: UserDomain): string {
  // Include NULL for backwards compatibility with existing data
  return `(domain IN ('${userDomain}', 'both') OR domain IS NULL)`;
}

/**
 * Build a SQL WHERE clause with AND prefix for appending to existing conditions.
 *
 * @param userDomain - User's preferred domain
 * @returns SQL fragment string with AND prefix
 *
 * @example
 * const result = await sql`
 *   SELECT * FROM substance
 *   WHERE common_name ILIKE ${term}
 *   ${domainFilterAndSql("fragrance")}
 * `;
 */
export function domainFilterAndSql(userDomain: UserDomain): string {
  return `AND (domain IN ('${userDomain}', 'both') OR domain IS NULL)`;
}

/**
 * Map a project type to the corresponding substance domain.
 *
 * @param projectType - The formula project type
 * @returns The corresponding user domain for substance filtering
 */
export function projectTypeToDomain(projectType: string): UserDomain {
  switch (projectType) {
    case "perfume":
      return "fragrance";
    case "cosmetic":
      return "cosmetic";
    default:
      return "flavor";
  }
}

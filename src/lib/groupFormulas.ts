import type { FormulaWithAccess } from "@/actions/formulas";

export type FormulaGroup = {
  groupId: number | null;
  mainFormula: FormulaWithAccess;
  variations: FormulaWithAccess[];
  variationCount: number;
};

/**
 * Groups formulas by their variation_group_id.
 * Standalone formulas (no variation_group_id) become their own group.
 * Returns groups sorted by main formula's updated_at (most recent first).
 */
export function groupFormulasByVariation(
  formulas: FormulaWithAccess[]
): FormulaGroup[] {
  const groupMap = new Map<string, FormulaWithAccess[]>();

  // Group formulas by variation_group_id
  // Use string key to handle null (standalone formulas get unique keys)
  for (const formula of formulas) {
    const groupKey = formula.variation_group_id !== null
      ? `group_${formula.variation_group_id}`
      : `standalone_${formula.formula_id}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
    }
    groupMap.get(groupKey)!.push(formula);
  }

  // Convert to FormulaGroup array
  const groups: FormulaGroup[] = [];

  for (const [, formulaList] of groupMap) {
    // Sort within group: main variation first, then by created_at
    formulaList.sort((a, b) => {
      // Main variation always first
      if (a.is_main_variation && !b.is_main_variation) return -1;
      if (!a.is_main_variation && b.is_main_variation) return 1;
      // Then by created_at (older first for consistent ordering)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    // Main formula is either the one marked as main, or the first one
    const mainFormula = formulaList.find((f) => f.is_main_variation) || formulaList[0];

    groups.push({
      groupId: mainFormula.variation_group_id,
      mainFormula,
      variations: formulaList,
      variationCount: formulaList.length,
    });
  }

  // Sort groups by main formula's updated_at (most recent first)
  groups.sort((a, b) => {
    return new Date(b.mainFormula.updated_at).getTime() - new Date(a.mainFormula.updated_at).getTime();
  });

  return groups;
}

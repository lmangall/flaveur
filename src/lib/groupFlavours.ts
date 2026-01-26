import type { FlavourWithAccess } from "@/actions/flavours";

export type FlavourGroup = {
  groupId: number | null;
  mainFlavour: FlavourWithAccess;
  variations: FlavourWithAccess[];
  variationCount: number;
};

/**
 * Groups flavours by their variation_group_id.
 * Standalone flavours (no variation_group_id) become their own group.
 * Returns groups sorted by main flavour's updated_at (most recent first).
 */
export function groupFlavoursByVariation(
  flavours: FlavourWithAccess[]
): FlavourGroup[] {
  const groupMap = new Map<string, FlavourWithAccess[]>();

  // Group flavours by variation_group_id
  // Use string key to handle null (standalone flavours get unique keys)
  for (const flavour of flavours) {
    const groupKey = flavour.variation_group_id !== null
      ? `group_${flavour.variation_group_id}`
      : `standalone_${flavour.flavour_id}`;

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, []);
    }
    groupMap.get(groupKey)!.push(flavour);
  }

  // Convert to FlavourGroup array
  const groups: FlavourGroup[] = [];

  for (const [, flavourList] of groupMap) {
    // Sort within group: main variation first, then by created_at
    flavourList.sort((a, b) => {
      // Main variation always first
      if (a.is_main_variation && !b.is_main_variation) return -1;
      if (!a.is_main_variation && b.is_main_variation) return 1;
      // Then by created_at (older first for consistent ordering)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    // Main flavour is either the one marked as main, or the first one
    const mainFlavour = flavourList.find((f) => f.is_main_variation) || flavourList[0];

    groups.push({
      groupId: mainFlavour.variation_group_id,
      mainFlavour,
      variations: flavourList,
      variationCount: flavourList.length,
    });
  }

  // Sort groups by main flavour's updated_at (most recent first)
  groups.sort((a, b) => {
    return new Date(b.mainFlavour.updated_at).getTime() - new Date(a.mainFlavour.updated_at).getTime();
  });

  return groups;
}

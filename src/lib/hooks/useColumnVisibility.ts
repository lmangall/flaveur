"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY_PREFIX = "flaveur-column-visibility-";

/**
 * Hook to persist column visibility preferences in localStorage.
 * Uses the variation group ID as the key to store preferences per group.
 */
export function useColumnVisibility(
  groupId: number,
  initialVariationIds: number[]
) {
  const storageKey = `${STORAGE_KEY_PREFIX}${groupId}`;

  // Initialize state with a function to avoid SSR issues
  const [visibleIds, setVisibleIds] = useState<Set<number>>(() => {
    // Default to all visible on initial render (SSR-safe)
    return new Set(initialVariationIds);
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as number[];
        // Filter to only include IDs that still exist in initialVariationIds
        const validIds = parsed.filter((id) => initialVariationIds.includes(id));
        // Ensure at least one column is visible
        if (validIds.length > 0) {
          setVisibleIds(new Set(validIds));
        }
      } catch {
        // Invalid stored data, use defaults
      }
    }
    setIsHydrated(true);
  }, [storageKey, initialVariationIds]);

  // Save to localStorage whenever visibleIds changes (after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(visibleIds)));
    }
  }, [visibleIds, storageKey, isHydrated]);

  // Toggle a single variation's visibility
  const toggleVisibility = useCallback((id: number) => {
    setVisibleIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        // Don't allow removing the last visible column
        if (newSet.size > 1) {
          newSet.delete(id);
        }
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Show all columns
  const showAll = useCallback(() => {
    setVisibleIds(new Set(initialVariationIds));
  }, [initialVariationIds]);

  // Hide all except main (or first if no main)
  const hideAllExceptMain = useCallback(
    (mainId: number | undefined) => {
      const idToKeep = mainId ?? initialVariationIds[0];
      if (idToKeep !== undefined) {
        setVisibleIds(new Set([idToKeep]));
      }
    },
    [initialVariationIds]
  );

  return {
    visibleIds,
    toggleVisibility,
    showAll,
    hideAllExceptMain,
    isHydrated,
  };
}

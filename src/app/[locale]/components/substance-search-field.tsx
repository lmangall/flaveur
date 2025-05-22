"use client";

import { useState, useCallback, useEffect } from "react";
import { SubstanceSearch } from "@/app/[locale]/components/substance-search";
import type { Substance } from "@/app/type";

interface SubstanceSearchFieldProps {
  onSelect?: (substance: Substance) => void;
  onSearch?: (results: Substance[]) => void;
  placeholder?: string;
  className?: string;
  renderResults?: (
    results: Substance[],
    onSelect: (substance: Substance) => void
  ) => React.ReactNode;
}

export function SubstanceSearchField({
  onSelect,
  onSearch,
  className = "",
  renderResults,
}: SubstanceSearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "name" | "profile">(
    "all"
  );
  const [searchResults, setSearchResults] = useState<Substance[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchSubstances = useCallback(
    async (query: string, type: "all" | "name" | "profile") => {
      if (!query) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchParams = new URLSearchParams();
        searchParams.append("query", query);
        searchParams.append("type", type);

        const url = `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/substances?${searchParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();
        const results = Array.isArray(data) ? data : data.results || [];
        setSearchResults(results);
        onSearch?.(results);
      } catch (error) {
        console.error("Error fetching substances:", error);
        setSearchResults([]);
        onSearch?.([]);
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSubstances(searchQuery, searchType);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType, fetchSubstances]);

  const handleSelect = (substance: Substance) => {
    onSelect?.(substance);
    setSearchQuery(substance.common_name || "");
    setSearchResults([]);
  };

  const defaultRenderResults = (
    results: Substance[],
    onSelect: (substance: Substance) => void
  ) => (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
      {results.map((substance) => (
        <div
          key={substance.substance_id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelect(substance)}
        >
          <div className="font-medium">{substance.common_name}</div>
          <div className="text-sm text-muted-foreground">
            FEMA {substance.fema_number}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <SubstanceSearch
        searchQuery={searchQuery}
        searchType={searchType}
        onSearchChange={setSearchQuery}
        onSearchTypeChange={setSearchType}
      />
      {isSearching && (
        <div className="absolute right-2 top-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {searchResults.length > 0 &&
        (renderResults
          ? renderResults(searchResults, handleSelect)
          : defaultRenderResults(searchResults, handleSelect))}
    </div>
  );
}

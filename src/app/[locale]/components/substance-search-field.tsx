"use client";

import { useState, useCallback, useEffect } from "react";
import { SubstanceSearch } from "@/app/[locale]/components/substance-search";
import type { Substance } from "@/app/type";
import { searchSubstances } from "@/actions/substances";
import type { UserDomain } from "@/lib/domain-filter";

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface SearchResponse {
  results: Substance[];
  pagination: PaginationInfo;
}

interface SubstanceSearchFieldProps {
  onSelect?: (substance: Substance) => void;
  onSearch?: (response: SearchResponse) => void;
  placeholder?: string;
  className?: string;
  domain?: UserDomain;
  renderResults?: (
    response: SearchResponse,
    onSelect: (substance: Substance) => void,
    onPageChange: (page: number) => void
  ) => React.ReactNode;
}

export function SubstanceSearchField({
  onSelect,
  onSearch,
  className = "",
  domain = "flavor",
  renderResults,
}: SubstanceSearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "name" | "profile" | "cas_id" | "fema_number"
  >("all");
  const [searchResponse, setSearchResponse] = useState<SearchResponse>({
    results: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
  });
  const [isSearching, setIsSearching] = useState(false);

  const getPlaceholder = () => {
    switch (searchType) {
      case "cas_id":
        return "Search by CAS ID...";
      case "fema_number":
        return "Search by FEMA number...";
      case "name":
        return "Search by name...";
      case "profile":
        return "Search by profile...";
      default:
        return "Search substances...";
    }
  };

  const fetchSubstancesData = useCallback(
    async (
      query: string,
      type: "all" | "name" | "profile" | "cas_id" | "fema_number",
      page: number = 1
    ) => {
      if (!query) {
        setSearchResponse({
          results: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 },
        });
        return;
      }

      setIsSearching(true);
      try {
        const data = await searchSubstances(query, type, page, 10, domain);
        const response = {
          results: data.results as Substance[],
          pagination: data.pagination,
        };
        setSearchResponse(response);
        onSearch?.(response);
      } catch (error) {
        console.error("Error fetching substances:", error);
        setSearchResponse({
          results: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 },
        });
        onSearch?.({
          results: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 },
        });
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch, domain]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSubstancesData(searchQuery, searchType, searchResponse.pagination.page);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [
    searchQuery,
    searchType,
    searchResponse.pagination.page,
    fetchSubstancesData,
  ]);

  const handleSelect = (substance: Substance) => {
    onSelect?.(substance);
    setSearchQuery(substance.common_name || "");
    setSearchResponse({
      results: [],
      pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    });
  };

  const handlePageChange = (page: number) => {
    fetchSubstancesData(searchQuery, searchType, page);
  };

  const defaultRenderResults = (
    response: SearchResponse,
    onSelect: (substance: Substance) => void,
    onPageChange: (page: number) => void
  ) => (
    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
      {response.results.map((substance) => (
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
      {response.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 p-2 border-t">
          {Array.from(
            { length: response.pagination.pages },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              className={`px-2 py-1 rounded ${
                page === response.pagination.page
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <SubstanceSearch
        searchQuery={searchQuery}
        searchType={searchType}
        onSearchChange={setSearchQuery}
        onSearchTypeChange={setSearchType}
        placeholder={getPlaceholder()}
      />
      {isSearching && (
        <div className="absolute right-2 top-2">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      {searchResponse.results.length > 0 &&
        (renderResults
          ? renderResults(searchResponse, handleSelect, handlePageChange)
          : defaultRenderResults(
              searchResponse,
              handleSelect,
              handlePageChange
            ))}
    </div>
  );
}

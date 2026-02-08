"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, Package, User, Users, Building2 } from "lucide-react";
import { Input } from "@/app/[locale]/components/ui/input";
import { searchCompoundFormulas, type CompoundSearchResult } from "@/actions/compounds";

interface CompoundSearchInputProps {
  onSelect: (formula: CompoundSearchResult) => void;
  excludeFormulaId?: number;
  placeholder?: string;
  className?: string;
}

export function CompoundSearchInput({
  onSelect,
  excludeFormulaId,
  placeholder = "Search formulas...",
  className = "",
}: CompoundSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CompoundSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchResults = useCallback(
    async (query: string) => {
      setIsSearching(true);
      try {
        const data = await searchCompoundFormulas(query, excludeFormulaId);
        setResults(data);
        setIsOpen(data.length > 0);
      } catch (error) {
        console.error("Error searching formulas:", error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsSearching(false);
      }
    },
    [excludeFormulaId]
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.length >= 1) {
        fetchResults(searchQuery);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, fetchResults]);

  const handleSelect = (formula: CompoundSearchResult) => {
    onSelect(formula);
    setSearchQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const getSourceIcon = (source: CompoundSearchResult["source"]) => {
    switch (source) {
      case "own":
        return <User className="h-3 w-3" />;
      case "shared":
        return <Users className="h-3 w-3" />;
      case "workspace":
        return <Building2 className="h-3 w-3" />;
    }
  };

  const getSourceLabel = (source: CompoundSearchResult["source"]) => {
    switch (source) {
      case "own":
        return "My formula";
      case "shared":
        return "Shared with me";
      case "workspace":
        return "Workspace";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => {
            // Delay to allow click on result
            setTimeout(() => setIsOpen(false), 200);
          }}
        />
        {isSearching && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((formula) => (
            <div
              key={formula.formula_id}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSelect(formula)}
            >
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium truncate">{formula.name}</span>
                <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                  {getSourceIcon(formula.source)}
                  {getSourceLabel(formula.source)}
                </span>
              </div>
              {formula.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate pl-6">
                  {formula.description}
                </p>
              )}
              <div className="text-xs text-muted-foreground mt-1 pl-6">
                {formula.ingredient_count} ingredient{formula.ingredient_count !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

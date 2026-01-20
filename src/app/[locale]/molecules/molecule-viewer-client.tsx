"use client";

import { useState, useEffect, useCallback } from "react";
import { RDKitRenderer } from "./components/rdkit-renderer";
import { ThreeDmolRenderer } from "./components/three-dmol-renderer";
import { SubstanceSearch } from "@/app/[locale]/components/substance-search";
import { searchSubstancesWithSmiles } from "@/actions/substances";

interface Substance {
  substance_id: number;
  fema_number: number;
  common_name: string | null;
  smile: string | null;
  molecular_formula: string | null;
  pubchem_cid: string | null;
  iupac_name: string | null;
}

interface MoleculeViewerClientProps {
  initialSubstances: Substance[];
}

type ViewMode = "2d" | "3d" | "both";
type SearchType = "all" | "name" | "profile" | "cas_id" | "fema_number";

export function MoleculeViewerClient({
  initialSubstances,
}: MoleculeViewerClientProps) {
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(
    initialSubstances[0] || null
  );
  const [customSmiles, setCustomSmiles] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [searchResults, setSearchResults] = useState<Substance[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const currentSmiles = customSmiles || selectedSubstance?.smile || "";

  const performSearch = useCallback(async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchSubstancesWithSmiles(
        searchQuery,
        searchType,
        20
      );
      setSearchResults(results as unknown as Substance[]);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchType]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(debounce);
  }, [performSearch]);

  const selectSubstance = (substance: Substance) => {
    setSelectedSubstance(substance);
    setCustomSmiles("");
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <SubstanceSearch
          searchQuery={searchQuery}
          searchType={searchType}
          onSearchChange={setSearchQuery}
          onSearchTypeChange={setSearchType}
          placeholder="Search substances with molecular data..."
        />

        {/* Custom SMILES Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Or Enter SMILES Directly
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg border bg-background font-mono text-sm"
            placeholder="e.g., CC(=O)OC1=CC=CC=C1C(=O)O"
            value={customSmiles}
            onChange={(e) => {
              setCustomSmiles(e.target.value);
              if (e.target.value) {
                setSelectedSubstance(null);
              }
            }}
          />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && (
        <div className="border rounded-lg overflow-hidden">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="max-h-60 overflow-auto">
              {searchResults.map((substance) => (
                <button
                  key={substance.substance_id}
                  className={`w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0 ${
                    selectedSubstance?.substance_id === substance.substance_id
                      ? "bg-accent"
                      : ""
                  }`}
                  onClick={() => selectSubstance(substance)}
                >
                  <div className="font-medium">
                    {substance.common_name || substance.iupac_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    FEMA {substance.fema_number}
                    {substance.molecular_formula &&
                      ` • ${substance.molecular_formula}`}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No substances found with molecular data
            </div>
          )}
        </div>
      )}

      {/* Quick Select */}
      {!searchQuery && initialSubstances.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">Quick Select</label>
          <div className="flex flex-wrap gap-2">
            {initialSubstances.slice(0, 8).map((substance) => (
              <button
                key={substance.substance_id}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  selectedSubstance?.substance_id === substance.substance_id &&
                  !customSmiles
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-accent"
                }`}
                onClick={() => selectSubstance(substance)}
              >
                {substance.common_name || `FEMA ${substance.fema_number}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Molecule Info */}
      {currentSmiles && (
        <div className="p-4 rounded-lg border bg-muted/50">
          <h3 className="font-semibold mb-2">
            {customSmiles
              ? "Custom Molecule"
              : selectedSubstance?.common_name || "Selected Molecule"}
          </h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">SMILES:</span>{" "}
              <code className="font-mono bg-background px-1 rounded text-xs break-all">
                {currentSmiles}
              </code>
            </p>
            {!customSmiles && selectedSubstance?.molecular_formula && (
              <p>
                <span className="text-muted-foreground">Formula:</span>{" "}
                {selectedSubstance.molecular_formula}
              </p>
            )}
            {!customSmiles && selectedSubstance?.iupac_name && (
              <p>
                <span className="text-muted-foreground">IUPAC:</span>{" "}
                {selectedSubstance.iupac_name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">View:</span>
        <div className="flex rounded-lg border overflow-hidden">
          {(["2d", "both", "3d"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              className={`px-4 py-2 text-sm transition-colors ${
                viewMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent"
              }`}
              onClick={() => setViewMode(mode)}
            >
              {mode === "2d" ? "2D Only" : mode === "3d" ? "3D Only" : "Both"}
            </button>
          ))}
        </div>
      </div>

      {/* Molecule Visualizations */}
      {currentSmiles ? (
        <div
          className={`grid gap-6 ${
            viewMode === "both" ? "md:grid-cols-2" : ""
          }`}
        >
          {/* 2D Structure */}
          {(viewMode === "2d" || viewMode === "both") && (
            <div className="space-y-2">
              <h3 className="font-medium">2D Structure</h3>
              <RDKitRenderer
                smiles={currentSmiles}
                width={viewMode === "both" ? 350 : 500}
                height={viewMode === "both" ? 350 : 500}
              />
            </div>
          )}

          {/* 3D Structure */}
          {(viewMode === "3d" || viewMode === "both") && (
            <div className="space-y-2">
              <h3 className="font-medium">3D Structure</h3>
              <p className="text-sm text-muted-foreground">
                Rotate with mouse
              </p>
              <ThreeDmolRenderer
                smiles={currentSmiles}
                width={viewMode === "both" ? 350 : 500}
                height={viewMode === "both" ? 350 : 500}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          Search for a substance or enter a SMILES string to visualize
        </div>
      )}
    </div>
  );
}

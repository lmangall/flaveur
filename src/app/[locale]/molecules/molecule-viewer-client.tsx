"use client";

import { useState, useTransition } from "react";
import { RDKitRenderer } from "./components/rdkit-renderer";
import { ThreeDmolRenderer } from "./components/three-dmol-renderer";
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

export function MoleculeViewerClient({
  initialSubstances,
}: MoleculeViewerClientProps) {
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(
    initialSubstances[0] || null
  );
  const [customSmiles, setCustomSmiles] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Substance[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showSearch, setShowSearch] = useState(false);

  const currentSmiles = customSmiles || selectedSubstance?.smile || "";

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      startTransition(async () => {
        const results = (await searchSubstancesWithSmiles(
          query,
          10
        )) as Substance[];
        setSearchResults(results);
        setShowSearch(true);
      });
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const selectFromSearch = (substance: Substance) => {
    setSelectedSubstance(substance);
    setCustomSmiles("");
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  return (
    <div className="space-y-6">
      {/* Search and Input Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Database Search */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">
            Search Database
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg border bg-background"
            placeholder="Search by name, IUPAC, or FEMA number..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
          />
          {isPending && (
            <div className="absolute right-3 top-9 text-muted-foreground text-sm">
              ...
            </div>
          )}

          {/* Search Results Dropdown */}
          {showSearch && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchResults.map((substance) => (
                <button
                  key={substance.substance_id}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                  onClick={() => selectFromSearch(substance)}
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
          )}

          {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && !isPending && (
            <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
              No molecules found with SMILES data
            </div>
          )}
        </div>

        {/* Custom SMILES Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Or Enter SMILES
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

      {/* Quick Select from Initial Data */}
      {initialSubstances.length > 0 && (
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
                onClick={() => {
                  setSelectedSubstance(substance);
                  setCustomSmiles("");
                }}
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
          {/* RDKit 2D */}
          {(viewMode === "2d" || viewMode === "both") && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                2D Structure
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-200">
                  RDKit.js
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Accurate 2D rendering with WASM chemistry toolkit
              </p>
              <RDKitRenderer
                smiles={currentSmiles}
                width={viewMode === "both" ? 350 : 500}
                height={viewMode === "both" ? 350 : 500}
              />
            </div>
          )}

          {/* 3Dmol 3D */}
          {(viewMode === "3d" || viewMode === "both") && (
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                3D Structure
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-200">
                  3Dmol.js
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Interactive 3D visualization (rotate with mouse)
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
          Search for a molecule or enter a SMILES string to visualize
        </div>
      )}
    </div>
  );
}

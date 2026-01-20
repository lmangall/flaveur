"use client";

import { useState } from "react";
import { SmilesDrawerRenderer } from "./components/smiles-drawer";
import { RDKitRenderer } from "./components/rdkit-renderer";
import { ThreeDmolRenderer } from "./components/three-dmol-renderer";
import { KetcherEditor, KetcherSetupInstructions } from "./components/ketcher-editor";

interface Substance {
  substance_id: number;
  fema_number: number;
  common_name: string | null;
  smile: string | null;
  molecular_formula: string | null;
  pubchem_cid: string | null;
  iupac_name: string | null;
}

interface MoleculeTestClientProps {
  substances: Substance[];
}

type TabType = "comparison" | "smiles-drawer" | "rdkit" | "3dmol" | "ketcher";

export function MoleculeTestClient({ substances }: MoleculeTestClientProps) {
  const [selectedSubstance, setSelectedSubstance] = useState<Substance | null>(
    substances[0] || null
  );
  const [customSmiles, setCustomSmiles] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("comparison");
  const [show3D, setShow3D] = useState(false);

  const currentSmiles = customSmiles || selectedSubstance?.smile || "";

  const tabs: { id: TabType; label: string }[] = [
    { id: "comparison", label: "Side-by-Side" },
    { id: "smiles-drawer", label: "SmilesDrawer" },
    { id: "rdkit", label: "RDKit.js" },
    { id: "3dmol", label: "3Dmol.js" },
    { id: "ketcher", label: "Ketcher" },
  ];

  return (
    <div className="space-y-6">
      {/* Substance Selector */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select from Database
          </label>
          <select
            className="w-full p-2 rounded-lg border bg-background"
            value={selectedSubstance?.substance_id || ""}
            onChange={(e) => {
              const found = substances.find(
                (s) => s.substance_id === parseInt(e.target.value)
              );
              setSelectedSubstance(found || null);
              setCustomSmiles("");
            }}
          >
            {substances.map((s) => (
              <option key={s.substance_id} value={s.substance_id}>
                {s.common_name || s.iupac_name || `FEMA ${s.fema_number}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Or Enter Custom SMILES
          </label>
          <input
            type="text"
            className="w-full p-2 rounded-lg border bg-background font-mono text-sm"
            placeholder="e.g., CC(=O)OC1=CC=CC=C1C(=O)O"
            value={customSmiles}
            onChange={(e) => setCustomSmiles(e.target.value)}
          />
        </div>
      </div>

      {/* Current Molecule Info */}
      {currentSmiles && (
        <div className="p-4 rounded-lg border bg-muted/50">
          <h3 className="font-semibold mb-2">
            {selectedSubstance?.common_name || "Custom Molecule"}
          </h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="text-muted-foreground">SMILES:</span>{" "}
              <code className="font-mono bg-background px-1 rounded text-xs break-all">
                {currentSmiles}
              </code>
            </p>
            {selectedSubstance?.molecular_formula && (
              <p>
                <span className="text-muted-foreground">Formula:</span>{" "}
                {selectedSubstance.molecular_formula}
              </p>
            )}
            {selectedSubstance?.iupac_name && (
              <p>
                <span className="text-muted-foreground">IUPAC:</span>{" "}
                {selectedSubstance.iupac_name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "comparison" && currentSmiles && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">2D Renderers</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SmilesDrawer */}
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                SmilesDrawer
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Lightweight
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Pure JS, renders to Canvas. Fast and small bundle size.
              </p>
              <SmilesDrawerRenderer smiles={currentSmiles} width={280} height={280} />
            </div>

            {/* RDKit */}
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                RDKit.js
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  Full-featured
                </span>
              </h3>
              <p className="text-sm text-muted-foreground">
                WASM-based chemistry toolkit. More accurate rendering, larger bundle.
              </p>
              <RDKitRenderer smiles={currentSmiles} width={280} height={280} />
            </div>
          </div>

          {/* 3D Section */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">3D Visualization</h2>
                <p className="text-sm text-muted-foreground">
                  Interactive 3D structure via 3Dmol.js (uses PubChem for coordinates)
                </p>
              </div>
              <button
                onClick={() => setShow3D(!show3D)}
                className="px-4 py-2 rounded-lg border bg-background hover:bg-accent transition-colors"
              >
                {show3D ? "Hide 3D" : "Show 3D"}
              </button>
            </div>

            {show3D && (
              <ThreeDmolRenderer smiles={currentSmiles} width={400} height={400} />
            )}
          </div>
        </div>
      )}

      {activeTab === "smiles-drawer" && currentSmiles && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">SmilesDrawer</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Lightweight (~50KB)</li>
              <li>Pure JavaScript, no WASM</li>
              <li>Canvas or SVG output</li>
              <li>Good for simple visualizations</li>
              <li>MIT License</li>
            </ul>
            <a
              href="https://github.com/reymond-group/smilesDrawer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              GitHub Repository
            </a>
          </div>
          <SmilesDrawerRenderer smiles={currentSmiles} width={400} height={400} />
        </div>
      )}

      {activeTab === "rdkit" && currentSmiles && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">RDKit.js</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Full cheminformatics toolkit</li>
              <li>WASM compiled from C++ RDKit</li>
              <li>Accurate 2D coordinate generation</li>
              <li>Substructure search, fingerprints, etc.</li>
              <li>Larger bundle (~10MB WASM)</li>
              <li>BSD License</li>
            </ul>
            <a
              href="https://github.com/rdkit/rdkit-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              GitHub Repository
            </a>
          </div>
          <RDKitRenderer smiles={currentSmiles} width={400} height={400} />
        </div>
      )}

      {activeTab === "3dmol" && currentSmiles && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">3Dmol.js</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>WebGL-based 3D visualization</li>
              <li>Interactive (rotate, zoom)</li>
              <li>Multiple render styles</li>
              <li>Requires 3D coordinates (uses PubChem API)</li>
              <li>MIT License</li>
            </ul>
            <a
              href="https://3dmol.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              3Dmol.org
            </a>
          </div>
          <ThreeDmolRenderer smiles={currentSmiles} width={500} height={500} />
        </div>
      )}

      {activeTab === "ketcher" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Ketcher Editor</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Full-featured molecule editor</li>
              <li>Draw and edit molecular structures</li>
              <li>Import/export SMILES, MOL, SDF</li>
              <li>React component available</li>
              <li>Apache 2.0 License</li>
            </ul>
            <a
              href="https://github.com/epam/ketcher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              GitHub Repository
            </a>
          </div>

          <KetcherEditor
            smiles={currentSmiles}
            width={900}
            height={600}
            onSmilesChange={(newSmiles) => setCustomSmiles(newSmiles)}
          />

          <KetcherSetupInstructions />
        </div>
      )}

      {!currentSmiles && (
        <div className="text-center py-12 text-muted-foreground">
          Select a substance or enter a SMILES string to visualize
        </div>
      )}

      {/* Library Comparison Table */}
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4">Library Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Library</th>
                <th className="text-left py-2 pr-4">Type</th>
                <th className="text-left py-2 pr-4">Size</th>
                <th className="text-left py-2 pr-4">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">SmilesDrawer</td>
                <td className="py-2 pr-4">2D Canvas/SVG</td>
                <td className="py-2 pr-4">~50KB</td>
                <td className="py-2 pr-4">Simple displays, lists, thumbnails</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">RDKit.js</td>
                <td className="py-2 pr-4">2D SVG (WASM)</td>
                <td className="py-2 pr-4">~10MB</td>
                <td className="py-2 pr-4">Accurate rendering, cheminformatics ops</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">3Dmol.js</td>
                <td className="py-2 pr-4">3D WebGL</td>
                <td className="py-2 pr-4">~500KB</td>
                <td className="py-2 pr-4">3D visualization, molecular dynamics</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium">Ketcher</td>
                <td className="py-2 pr-4">Editor</td>
                <td className="py-2 pr-4">~2MB</td>
                <td className="py-2 pr-4">Drawing molecules, structure input</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

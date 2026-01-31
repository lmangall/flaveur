"use client";

import { useEffect, useRef, useState } from "react";

interface RDKitRendererProps {
  smiles: string;
  width?: number;
  height?: number;
}

// Extend Window interface for RDKit
declare global {
  interface Window {
    initRDKitModule?: () => Promise<RDKitModule>;
    RDKit?: RDKitModule;
  }
}

interface RDKitModule {
  get_mol: (smiles: string) => RDKitMol | null;
  version: () => string;
}

interface RDKitMol {
  get_svg: (width: number, height: number) => string;
  delete: () => void;
}

let rdkitPromise: Promise<RDKitModule> | null = null;
let rdkitInstance: RDKitModule | null = null;

async function loadRDKit(): Promise<RDKitModule> {
  if (rdkitInstance) return rdkitInstance;
  if (rdkitPromise) return rdkitPromise;

  rdkitPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.RDKit) {
      rdkitInstance = window.RDKit;
      resolve(window.RDKit);
      return;
    }

    // Load RDKit script
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@rdkit/rdkit/dist/RDKit_minimal.js";
    script.async = true;

    script.onload = async () => {
      try {
        if (window.initRDKitModule) {
          const RDKit = await window.initRDKitModule();
          window.RDKit = RDKit;
          rdkitInstance = RDKit;
          resolve(RDKit);
        } else {
          reject(new Error("RDKit module not initialized"));
        }
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = () => reject(new Error("Failed to load RDKit script"));
    document.head.appendChild(script);
  });

  return rdkitPromise;
}

export function RDKitRenderer({
  smiles,
  width = 300,
  height = 300,
}: RDKitRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    async function renderMolecule() {
      if (!smiles) return;

      try {
        setLoading(true);
        setError(null);

        const RDKit = await loadRDKit();

        if (!mounted) return;

        const mol = RDKit.get_mol(smiles);
        if (!mol) {
          setError("Invalid SMILES string");
          setLoading(false);
          return;
        }

        const svgString = mol.get_svg(width, height);
        mol.delete(); // Clean up

        if (!mounted) return;

        setSvg(svgString);
        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error("RDKit error:", err);
        setError(err instanceof Error ? err.message : "Failed to render molecule");
        setLoading(false);
      }
    }

    renderMolecule();

    return () => {
      mounted = false;
    };
  }, [smiles, width, height]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-destructive/10 text-destructive text-sm p-4"
        style={{ width, height }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="animate-pulse text-sm text-muted-foreground">
            Loading RDKit (WASM)...
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-lg border bg-white"
        style={{ width, height }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

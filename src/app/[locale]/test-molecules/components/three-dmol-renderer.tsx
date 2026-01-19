"use client";

import { useEffect, useRef, useState } from "react";

interface ThreeDmolRendererProps {
  smiles: string;
  width?: number;
  height?: number;
  style?: "stick" | "sphere" | "cartoon" | "line";
}

declare global {
  interface Window {
    $3Dmol?: {
      createViewer: (
        element: HTMLElement,
        config: { backgroundColor: string }
      ) => Viewer3Dmol;
    };
  }
}

interface Viewer3Dmol {
  addModel: (data: string, format: string) => Model3Dmol;
  setStyle: (sel: object, style: object) => void;
  zoomTo: () => void;
  render: () => void;
  spin: (enabled: boolean) => void;
  clear: () => void;
}

interface Model3Dmol {
  setStyle: (style: object) => void;
}

let loadPromise: Promise<void> | null = null;

async function load3Dmol(): Promise<void> {
  if (window.$3Dmol) return;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // First load jQuery (3Dmol dependency)
    const jquery = document.createElement("script");
    jquery.src = "https://code.jquery.com/jquery-3.6.0.min.js";
    jquery.async = true;

    jquery.onload = () => {
      // Then load 3Dmol
      const script = document.createElement("script");
      script.src = "https://3dmol.org/build/3Dmol-min.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load 3Dmol"));
      document.head.appendChild(script);
    };

    jquery.onerror = () => reject(new Error("Failed to load jQuery"));
    document.head.appendChild(jquery);
  });

  return loadPromise;
}

// Convert SMILES to 3D coordinates via PubChem
async function smilesToSDF(smiles: string): Promise<string> {
  // First get CID from SMILES
  const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`;

  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error("Could not convert SMILES to 3D structure");
  }

  return response.text();
}

export function ThreeDmolRenderer({
  smiles,
  width = 300,
  height = 300,
  style = "stick",
}: ThreeDmolRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer3Dmol | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function render3D() {
      if (!containerRef.current || !smiles) return;

      try {
        setLoading(true);
        setError(null);

        await load3Dmol();

        if (!mounted || !window.$3Dmol) return;

        // Clear previous viewer
        if (viewerRef.current) {
          viewerRef.current.clear();
        }
        containerRef.current.innerHTML = "";

        // Get 3D structure from PubChem
        const sdf = await smilesToSDF(smiles);

        if (!mounted) return;

        // Create viewer
        const viewer = window.$3Dmol.createViewer(containerRef.current, {
          backgroundColor: "white",
        });

        viewerRef.current = viewer;

        // Add molecule
        viewer.addModel(sdf, "sdf");

        // Apply style
        const styleConfig: Record<string, object> = {
          stick: { stick: { radius: 0.15 }, sphere: { scale: 0.25 } },
          sphere: { sphere: { scale: 0.5 } },
          line: { line: {} },
          cartoon: { stick: { radius: 0.1 } },
        };

        viewer.setStyle({}, styleConfig[style] || styleConfig.stick);
        viewer.zoomTo();
        viewer.render();

        setLoading(false);
      } catch (err) {
        if (!mounted) return;
        console.error("3Dmol error:", err);
        setError(err instanceof Error ? err.message : "Failed to render 3D structure");
        setLoading(false);
      }
    }

    render3D();

    return () => {
      mounted = false;
    };
  }, [smiles, width, height, style]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-destructive/10 text-destructive text-sm p-4 text-center"
        style={{ width, height }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <div className="animate-pulse text-sm text-muted-foreground">
            Loading 3D structure...
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-lg border"
        style={{ width, height, position: "relative" }}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

interface SmilesDrawerProps {
  smiles: string;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
}

export function SmilesDrawerRenderer({
  smiles,
  width = 300,
  height = 300,
  theme = "light",
}: SmilesDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function drawMolecule() {
      if (!canvasRef.current || !smiles) return;

      try {
        setLoading(true);
        setError(null);

        // Dynamic import of SmilesDrawer
        const SmilesDrawer = (await import("smiles-drawer")).default;

        if (!mounted) return;

        const options = {
          width,
          height,
          bondThickness: 1.5,
          bondLength: 20,
          shortBondLength: 0.8,
          isomeric: true,
          debug: false,
          terminalCarbons: false,
          explicitHydrogens: false,
          themes: {
            light: {
              C: "#222",
              O: "#e74c3c",
              N: "#3498db",
              F: "#27ae60",
              Cl: "#27ae60",
              Br: "#e67e22",
              I: "#9b59b6",
              P: "#e67e22",
              S: "#f1c40f",
              B: "#e74c3c",
              Si: "#9b59b6",
              H: "#666",
              BACKGROUND: "#fff",
            },
            dark: {
              C: "#fff",
              O: "#e74c3c",
              N: "#3498db",
              F: "#27ae60",
              Cl: "#27ae60",
              Br: "#e67e22",
              I: "#9b59b6",
              P: "#e67e22",
              S: "#f1c40f",
              B: "#e74c3c",
              Si: "#9b59b6",
              H: "#aaa",
              BACKGROUND: "#1a1a1a",
            },
          },
        };

        const drawer = new SmilesDrawer.Drawer(options);

        SmilesDrawer.parse(
          smiles,
          (tree: unknown) => {
            if (!mounted) return;
            drawer.draw(tree, canvasRef.current, theme);
            setLoading(false);
          },
          (err: Error) => {
            if (!mounted) return;
            console.error("SmilesDrawer parse error:", err);
            setError(`Parse error: ${err.message}`);
            setLoading(false);
          }
        );
      } catch (err) {
        if (!mounted) return;
        console.error("SmilesDrawer error:", err);
        setError(err instanceof Error ? err.message : "Failed to load SmilesDrawer");
        setLoading(false);
      }
    }

    drawMolecule();

    return () => {
      mounted = false;
    };
  }, [smiles, width, height, theme]);

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
          <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg border"
      />
    </div>
  );
}

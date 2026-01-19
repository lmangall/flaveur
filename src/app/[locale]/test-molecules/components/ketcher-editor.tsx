"use client";

import { useEffect, useRef, useState } from "react";

interface KetcherEditorProps {
  smiles?: string;
  width?: number;
  height?: number;
  onSmilesChange?: (smiles: string) => void;
}

export function KetcherEditor({
  smiles,
  width = 800,
  height = 500,
  onSmilesChange,
}: KetcherEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ketcher standalone is best used as an iframe
    // Using the official demo for testing
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setLoading(false);

      // Try to set initial SMILES if provided
      if (smiles && iframe.contentWindow) {
        try {
          // Wait a bit for Ketcher to fully initialize
          setTimeout(() => {
            iframe.contentWindow?.postMessage(
              { type: "setSmiles", smiles },
              "*"
            );
          }, 1000);
        } catch (err) {
          console.warn("Could not set initial SMILES:", err);
        }
      }
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [smiles]);

  // Listen for SMILES changes from Ketcher
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "smilesChange" && onSmilesChange) {
        onSmilesChange(event.data.smiles);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onSmilesChange]);

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
    <div className="relative rounded-lg border overflow-hidden" style={{ width, height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <div className="animate-pulse text-sm text-muted-foreground">
            Loading Ketcher editor...
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="https://lifescience.opensource.epam.com/KetcherDemoSA/index.html"
        width={width}
        height={height}
        style={{ border: "none" }}
        title="Ketcher Molecule Editor"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}

// Alternative: Self-hosted Ketcher component instructions
export function KetcherSetupInstructions() {
  return (
    <div className="p-4 rounded-lg border bg-muted text-sm space-y-2">
      <h4 className="font-semibold">Self-Hosting Ketcher</h4>
      <p>For production, install Ketcher as a dependency:</p>
      <pre className="p-2 rounded bg-background font-mono text-xs">
        npm install ketcher-react ketcher-core ketcher-standalone
      </pre>
      <p className="text-muted-foreground">
        Then import and configure the Editor component with your own structure service.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/app/lib/utils";

interface MoleculeImageProps {
  pubchemCid?: string | number | null;
  formula?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}

export function MoleculeImage({
  pubchemCid,
  formula,
  name,
  size = 150,
  className,
}: MoleculeImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!pubchemCid || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border bg-muted text-muted-foreground",
          className
        )}
        style={{ width: size, height: size }}
      >
        <span className="text-xs font-mono text-center px-1 break-all line-clamp-3 overflow-hidden">
          {formula ?? "No structure"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
      <img
        src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${pubchemCid}/PNG`}
        alt={name ?? `Molecule ${pubchemCid}`}
        className={cn(
          "rounded-lg border bg-white object-contain",
          loading && "opacity-0"
        )}
        style={{ width: size, height: size }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { JobForm } from "../components/job-form";
import type { JobFormPrefillData } from "@/lib/job-monitors/field-mapping";

export default function NewJobPage() {
  const searchParams = useSearchParams();
  const isImport = searchParams.get("import") === "true";

  const [prefillData, setPrefillData] = useState<JobFormPrefillData | undefined>();
  const [sourceListingId, setSourceListingId] = useState<number | undefined>();
  const [ready, setReady] = useState(!isImport);

  useEffect(() => {
    if (isImport) {
      try {
        const stored = sessionStorage.getItem("importJobData");
        const storedListingId = sessionStorage.getItem("importListingId");
        if (stored) {
          setPrefillData(JSON.parse(stored));
          sessionStorage.removeItem("importJobData");
        }
        if (storedListingId) {
          setSourceListingId(Number(storedListingId));
          sessionStorage.removeItem("importListingId");
        }
      } catch {
        // ignore storage errors
      }
      setReady(true);
    }
  }, [isImport]);

  if (!ready) return null;

  return (
    <JobForm
      mode="create"
      prefillData={prefillData}
      sourceListingId={sourceListingId}
    />
  );
}

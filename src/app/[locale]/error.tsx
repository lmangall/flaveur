"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/app/[locale]/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  const locale = useLocale();

  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-6">{t("description")}</p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4">
            {t("errorCode")}: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("tryAgain")}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}`}>
              <Home className="h-4 w-4 mr-2" />
              {t("backToHome")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

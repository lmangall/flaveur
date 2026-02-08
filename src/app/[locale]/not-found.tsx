import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { getTranslations, getLocale } from "next-intl/server";
import { Button } from "@/app/[locale]/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  const locale = await getLocale();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">{t("title")}</h2>
        <p className="text-muted-foreground mb-6">{t("description")}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" asChild>
            <Link href={`/${locale}`}>
              <Home className="h-4 w-4 mr-2" />
              {t("backToHome")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/formulas`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("viewFormulas")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { getSampleFlavors, type SampleFlavor } from "@/actions/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Button } from "@/app/[locale]/components/ui/button";
import { FlaskConical, GitBranch, ArrowRight, Beaker } from "lucide-react";
import { DEMO_USER } from "@/constants/samples";
import { getTranslations } from "next-intl/server";
import { SamplesHowItWorks } from "./SamplesHowItWorks";
import { SamplesPageTracker } from "./SamplesPageTracker";

function SampleFlavorCard({ flavor }: { flavor: SampleFlavor }) {
  const hasVariations = flavor.variation_count > 1;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{flavor.name}</CardTitle>
          {hasVariations && (
            <Badge variant="secondary" className="gap-1">
              <GitBranch className="h-3 w-3" />
              {flavor.variation_count} variations
            </Badge>
          )}
        </div>
        {flavor.description && (
          <CardDescription className="line-clamp-2">
            {flavor.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Beaker className="h-4 w-4" />
            {flavor.substance_count} substances
          </span>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-3">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/formulas/${flavor.formula_id}`}>
              View Formula
            </Link>
          </Button>
          {hasVariations && (
            <Button variant="default" size="sm" asChild className="flex-1">
              <Link href={`/formulas/${flavor.formula_id}/compare`}>
                Compare Variations
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

export default async function SamplesPage() {
  const samples = await getSampleFlavors();
  const t = await getTranslations("Samples");

  const samplesWithVariations = samples.filter((s) => s.variation_count > 1);
  const samplesWithoutVariations = samples.filter((s) => s.variation_count <= 1);

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 space-y-8">
      <SamplesPageTracker
        sampleCount={samples.length}
        variationsCount={samplesWithVariations.length}
      />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground max-w-2xl">
          {t("description")}
        </p>
      </div>

      {samples.length === 0 ? (
        <Card className="p-12 text-center">
          <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("noSamples")}</h2>
          <p className="text-muted-foreground">
            {t("noSamplesDesc")}
          </p>
        </Card>
      ) : (
        <>
          {samplesWithVariations.length > 0 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  {t("formulasWithVariations")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("formulasWithVariationsDesc")}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {samplesWithVariations.map((flavor) => (
                  <SampleFlavorCard key={flavor.formula_id} flavor={flavor} />
                ))}
              </div>
            </section>
          )}

          {samplesWithoutVariations.length > 0 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  {t("singleFormulas")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("singleFormulasDesc")}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {samplesWithoutVariations.map((flavor) => (
                  <SampleFlavorCard key={flavor.formula_id} flavor={flavor} />
                ))}
              </div>
            </section>
          )}

          <SamplesHowItWorks />
        </>
      )}
    </div>
  );
}

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
            <Link href={`/flavours/${flavor.flavour_id}`}>
              View Formula
            </Link>
          </Button>
          {hasVariations && (
            <Button variant="default" size="sm" asChild className="flex-1">
              <Link href={`/flavours/${flavor.flavour_id}/compare`}>
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

  const samplesWithVariations = samples.filter((s) => s.variation_count > 1);
  const samplesWithoutVariations = samples.filter((s) => s.variation_count <= 1);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sample Flavors</h1>
        <p className="text-muted-foreground max-w-2xl">
          Explore example formulas created by {DEMO_USER.username}. These samples
          demonstrate features like formula variations, allowing you to compare
          different versions side-by-side.
        </p>
      </div>

      {samples.length === 0 ? (
        <Card className="p-12 text-center">
          <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No samples available yet</h2>
          <p className="text-muted-foreground">
            Sample flavors will appear here once they&apos;re added by the administrator.
          </p>
        </Card>
      ) : (
        <>
          {samplesWithVariations.length > 0 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Formulas with Variations
                </h2>
                <p className="text-sm text-muted-foreground">
                  These samples have multiple variations you can compare. Try the
                  &quot;Compare Variations&quot; feature to see how different concentrations
                  affect the flavor profile.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {samplesWithVariations.map((flavor) => (
                  <SampleFlavorCard key={flavor.flavour_id} flavor={flavor} />
                ))}
              </div>
            </section>
          )}

          {samplesWithoutVariations.length > 0 && (
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Single Formulas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Basic formula examples without variations.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {samplesWithoutVariations.map((flavor) => (
                  <SampleFlavorCard key={flavor.flavour_id} flavor={flavor} />
                ))}
              </div>
            </section>
          )}

          <section className="border rounded-lg p-6 bg-muted/30">
            <h3 className="font-semibold mb-2">How to use the Variation System</h3>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>
                Open any formula and click the <strong>variation pills</strong> at the top
                to switch between versions
              </li>
              <li>
                Use <strong>Compare Variations</strong> to see all versions side-by-side
                with adjustable sliders
              </li>
              <li>
                The <strong>radar chart overlay</strong> shows how flavor profiles differ
                across variations
              </li>
              <li>
                Create your own variations by clicking <strong>&quot;+ Add Variation&quot;</strong> on
                any formula you own
              </li>
            </ol>
          </section>
        </>
      )}
    </div>
  );
}

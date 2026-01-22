import { getDataQualityMetrics } from "@/actions/admin/data-quality";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Progress } from "@/app/[locale]/components/ui/progress";
import {
  Database,
  FlaskConical,
  FileSearch,
  AlertTriangle,
  Shield,
} from "lucide-react";

function MetricCard({
  label,
  value,
  total,
  icon: Icon,
}: {
  label: string;
  value: number;
  total?: number;
  icon?: React.ElementType;
}) {
  const percentage = total ? Math.round((value / total) * 100) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {percentage !== null && (
          <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DataQualityPage() {
  const metrics = await getDataQualityMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Quality Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor substance database completeness and coverage
        </p>
      </div>

      {/* Overall Completeness Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Overall Completeness</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={metrics.completenessScore} className="flex-1" />
            <span className="text-2xl font-bold">
              {metrics.completenessScore}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on CAS ID, SMILES, molecular weight, and InChI coverage
          </p>
        </CardContent>
      </Card>

      {/* Coverage Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Coverage Statistics
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Substances"
            value={metrics.totals.total}
            icon={Database}
          />
          <MetricCard
            label="With CAS ID"
            value={metrics.totals.with_cas}
            total={metrics.totals.total}
          />
          <MetricCard
            label="With SMILES"
            value={metrics.totals.with_smiles}
            total={metrics.totals.total}
          />
          <MetricCard
            label="With FEMA"
            value={metrics.totals.with_fema}
            total={metrics.totals.total}
          />
          <MetricCard
            label="With InChI"
            value={metrics.totals.with_inchi}
            total={metrics.totals.total}
          />
          <MetricCard label="Natural" value={metrics.totals.natural_count} />
          <MetricCard
            label="Synthetic"
            value={metrics.totals.synthetic_count}
          />
        </div>
      </div>

      {/* EU Regulatory Data (FLAVIS) */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          EU Regulatory Data (FLAVIS)
        </h2>
        <Card className="mb-4">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              <strong>FLAVIS</strong> (FLAVouring Information System) is the
              EU&apos;s database of approved food flavouring substances under
              Regulation (EC) No 1334/2008. FL numbers (format XX.XXX) are
              unique identifiers assigned by EFSA. The EU Policy Code links to
              the Food and Feed Information Portal.
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label="With FL Number"
            value={metrics.totals.with_fl_number}
            total={metrics.totals.total}
          />
          <MetricCard
            label="With EU Policy Code"
            value={metrics.totals.with_eu_policy_code}
            total={metrics.totals.total}
          />
        </div>
      </div>

      {/* Functional Groups */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileSearch className="h-5 w-5" />
          Functional Groups
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label="Substances with Groups"
            value={metrics.functionalGroups.substances_with_groups}
            total={metrics.totals.total}
          />
          <MetricCard
            label="Total Groups Defined"
            value={metrics.functionalGroups.total_groups}
          />
        </div>
      </div>

      {/* Missing Data */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Missing Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Missing SMILES</span>
              <span className="font-mono text-muted-foreground">
                {metrics.missing.missing_smiles.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Missing CAS ID</span>
              <span className="font-mono text-muted-foreground">
                {metrics.missing.missing_cas.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Missing FL Number</span>
              <span className="font-mono text-muted-foreground">
                {metrics.missing.missing_fl_number.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Missing EU Policy Code</span>
              <span className="font-mono text-muted-foreground">
                {metrics.missing.missing_eu_policy_code.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Missing InChI</span>
              <span className="font-mono text-muted-foreground">
                {metrics.missing.missing_inchi.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Missing Molecular Weight</span>
              <span className="font-mono text-muted-foreground">
                {metrics.missing.missing_mol_weight.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/app/[locale]/components/ui/button";
import { Card } from "@/app/[locale]/components/ui/card";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Switch } from "@/app/[locale]/components/ui/switch";
import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/[locale]/components/ui/table";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Check,
  X,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import {
  type SubstanceMatchResult,
  previewFormulationImport,
  importFormulation,
} from "@/actions/formulation-import";
import {
  type FormulationData,
  parseFormulationSheet,
} from "@/lib/formulation-parser";
import * as XLSX from "xlsx";

type ImportStep = "upload" | "preview" | "result";

export default function ImportFormulationPage() {
  const router = useRouter();
  const t = useTranslations("ImportFormulation");
  const { fire: fireConfetti } = useConfetti();

  const [step, setStep] = useState<ImportStep>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Parsed data
  const [formulationData, setFormulationData] = useState<FormulationData | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [autoCreateSubstances, setAutoCreateSubstances] = useState(true);
  const [fuzzyThreshold, setFuzzyThreshold] = useState(0.4);

  // Preview results
  const [previewMatches, setPreviewMatches] = useState<SubstanceMatchResult[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // Import results
  const [importResult, setImportResult] = useState<{
    success: boolean;
    flavour_id?: number;
    flavour_name?: string;
    substance_matches: SubstanceMatchResult[];
    errors: string[];
  } | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as (string | number | null | undefined)[][];

      const parsed = parseFormulationSheet(rows);
      setFormulationData(parsed);

      // Auto-select first version
      if (parsed.versions.length > 0) {
        setSelectedVersion(parsed.versions[0].version_label);
      }

      setStep("preview");
      toast.success(`File "${file.name}" parsed successfully`);
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error(error instanceof Error ? error.message : "Failed to parse file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePreview = async () => {
    if (!formulationData || !selectedVersion) return;

    setIsPreviewing(true);
    try {
      const result = await previewFormulationImport(formulationData, {
        version_to_import: selectedVersion,
        fuzzy_threshold: fuzzyThreshold,
      });

      setPreviewMatches(result.substance_matches);
    } catch (error) {
      console.error("Error previewing:", error);
      toast.error("Failed to preview matches");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!formulationData || !selectedVersion) return;

    setIsLoading(true);
    try {
      const result = await importFormulation(formulationData, {
        version_to_import: selectedVersion,
        auto_create_substances: autoCreateSubstances,
        fuzzy_threshold: fuzzyThreshold,
      });

      setImportResult(result);
      setStep("result");

      if (result.success) {
        fireConfetti();
        toast.success(`Flavour "${result.flavour_name}" created successfully!`);
      } else {
        toast.error("Import completed with errors");
      }
    } catch (error) {
      console.error("Error importing:", error);
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: SubstanceMatchResult["status"]) => {
    switch (status) {
      case "found":
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" /> Found</Badge>;
      case "fuzzy_match":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Search className="h-3 w-3 mr-1" /> Fuzzy</Badge>;
      case "created":
        return <Badge className="bg-blue-500 hover:bg-blue-600"><Check className="h-3 w-3 mr-1" /> Created</Badge>;
      case "not_found":
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Not Found</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Import Formulation</h1>
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="p-6 rounded-full bg-muted">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Upload Formulation Sheet</h2>
              <p className="text-muted-foreground max-w-md">
                Upload an Excel file (.xlsx) with your formulation data.
                The file should follow the &quot;Fiche de formulation&quot; template format.
              </p>
            </div>
            <div className="w-full max-w-sm">
              <Label htmlFor="file-upload" className="sr-only">Choose file</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="cursor-pointer"
              />
            </div>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Parsing file...</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === "preview" && formulationData && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Formulation Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs text-muted-foreground">File</Label>
                <p className="font-medium truncate">{fileName}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Formula Name</Label>
                <p className="font-medium">{formulationData.formula_name}</p>
              </div>
              {formulationData.student_name && (
                <div>
                  <Label className="text-xs text-muted-foreground">Student</Label>
                  <p className="font-medium">{formulationData.student_name}</p>
                </div>
              )}
              {formulationData.formulation_date && (
                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium">{formulationData.formulation_date}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Import Options</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="version-select">Version to Import</Label>
                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                  <SelectTrigger id="version-select">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {formulationData.versions.map((v) => (
                      <SelectItem key={v.version_label} value={v.version_label}>
                        Version {v.version_label} ({v.ingredients.length} ingredients)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuzzy-threshold">Fuzzy Match Threshold</Label>
                <Select
                  value={fuzzyThreshold.toString()}
                  onValueChange={(v) => setFuzzyThreshold(parseFloat(v))}
                >
                  <SelectTrigger id="fuzzy-threshold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.3">30% (More matches, less accuracy)</SelectItem>
                    <SelectItem value="0.4">40% (Balanced)</SelectItem>
                    <SelectItem value="0.5">50% (Moderate)</SelectItem>
                    <SelectItem value="0.6">60% (Stricter)</SelectItem>
                    <SelectItem value="0.7">70% (Very strict)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-create"
                  checked={autoCreateSubstances}
                  onCheckedChange={setAutoCreateSubstances}
                />
                <Label htmlFor="auto-create">
                  Auto-create missing substances
                </Label>
              </div>

              <div className="flex items-end">
                <Button onClick={handlePreview} disabled={!selectedVersion || isPreviewing}>
                  {isPreviewing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Preview Matches
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Version Ingredients Preview */}
          {selectedVersion && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Version {selectedVersion} Ingredients
                </h2>
                <Badge variant="outline">
                  {formulationData.versions.find(v => v.version_label === selectedVersion)?.ingredients.length || 0} items
                </Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Ingredient Name</TableHead>
                    <TableHead>Concentration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Match</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formulationData.versions
                    .find(v => v.version_label === selectedVersion)
                    ?.ingredients.map((ing, idx) => {
                      const match = previewMatches.find(m => m.ingredient_name === ing.name);
                      return (
                        <TableRow key={idx}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{ing.name}</TableCell>
                          <TableCell>{ing.concentration}%</TableCell>
                          <TableCell>
                            {match ? getStatusBadge(match.status) : (
                              <Badge variant="secondary">
                                <AlertCircle className="h-3 w-3 mr-1" /> Not checked
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {match?.substance_name || match?.message || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep("upload")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={handleImport} disabled={isLoading || !selectedVersion}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Formulation
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === "result" && importResult && (
        <div className="space-y-6">
          <Card className={`p-6 ${importResult.success ? "border-green-500" : "border-red-500"}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${importResult.success ? "bg-green-100" : "bg-red-100"}`}>
                {importResult.success ? (
                  <Check className="h-8 w-8 text-green-600" />
                ) : (
                  <X className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {importResult.success ? "Import Successful!" : "Import Completed with Issues"}
                </h2>
                {importResult.success && (
                  <p className="text-muted-foreground">
                    Flavour &quot;{importResult.flavour_name}&quot; has been created.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {importResult.errors.length > 0 && (
            <Card className="p-6 border-yellow-500">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Warnings/Errors
              </h3>
              <ul className="space-y-1 text-sm">
                {importResult.errors.map((error, idx) => (
                  <li key={idx} className="text-muted-foreground">- {error}</li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Substance Matching Results</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.substance_matches.filter(m => m.status === "found").length}
                </div>
                <div className="text-xs text-muted-foreground">Exact Match</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {importResult.substance_matches.filter(m => m.status === "fuzzy_match").length}
                </div>
                <div className="text-xs text-muted-foreground">Fuzzy Match</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.substance_matches.filter(m => m.status === "created").length}
                </div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.substance_matches.filter(m => m.status === "not_found").length}
                </div>
                <div className="text-xs text-muted-foreground">Not Found</div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Matched To</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importResult.substance_matches.map((match, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{match.ingredient_name}</TableCell>
                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                    <TableCell>{match.substance_name || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{match.message || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setStep("upload");
              setFormulationData(null);
              setPreviewMatches([]);
              setImportResult(null);
              setFileName(null);
            }}>
              Import Another
            </Button>
            {importResult.success && importResult.flavour_id && (
              <Button onClick={() => router.push(`/flavours/${importResult.flavour_id}`)}>
                View Flavour
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

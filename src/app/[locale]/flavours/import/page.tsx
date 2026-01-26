"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import { Card } from "@/app/[locale]/components/ui/card";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/app/[locale]/components/ui/radio-group";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useConfetti } from "@/app/[locale]/components/ui/confetti";
import {
  type SubstanceMatch,
  searchSubstanceMatches,
  createSubstanceFromImport,
  createFlavourWithSubstancesById,
} from "@/actions/formulation-import";

// ===========================================
// TYPES
// ===========================================

type IngredientRow = {
  id: number;
  name: string;
  supplier: string;
  dilution: string;
  pricePerKg: string;
  concentrationA: string;
  concentrationB: string;
  concentrationC: string;
  concentrationD: string;
};

type ConfirmedIngredient = {
  rowId: number;
  ingredientName: string;
  substanceId: number;
  substanceName: string;
  concentration: number;
  supplier: string | null;
  dilution: string | null;
  pricePerKg: number | null;
  isNewlyCreated: boolean;
};

type ImportStep = "entry" | "confirm" | "result";

// ===========================================
// CONSTANTS
// ===========================================

const EMPTY_ROW: Omit<IngredientRow, "id"> = {
  name: "",
  supplier: "",
  dilution: "",
  pricePerKg: "",
  concentrationA: "",
  concentrationB: "",
  concentrationC: "",
  concentrationD: "",
};

const createEmptyRows = (count: number, startId: number): IngredientRow[] =>
  Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    ...EMPTY_ROW,
  }));

// ===========================================
// MAIN COMPONENT
// ===========================================

export default function ImportFormulationPage() {
  const router = useRouter();
  const { fire: fireConfetti } = useConfetti();

  // Step state
  const [step, setStep] = useState<ImportStep>("entry");
  const [isLoading, setIsLoading] = useState(false);

  // Entry form state
  const [studentName, setStudentName] = useState("");
  const [formulaName, setFormulaName] = useState("");
  const [formulationDate, setFormulationDate] = useState("");
  const [rows, setRows] = useState<IngredientRow[]>(() => createEmptyRows(18, 1));
  const [selectedVersion, setSelectedVersion] = useState<"A" | "B" | "C" | "D">("A");

  // Confirmation state
  const [currentConfirmIndex, setCurrentConfirmIndex] = useState(0);
  const [ingredientsToConfirm, setIngredientsToConfirm] = useState<
    Array<{ row: IngredientRow; concentration: number }>
  >([]);
  const [matches, setMatches] = useState<SubstanceMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubstanceOdor, setNewSubstanceOdor] = useState("");
  const [newSubstanceTaste, setNewSubstanceTaste] = useState("");
  const [confirmedIngredients, setConfirmedIngredients] = useState<ConfirmedIngredient[]>([]);

  // Result state
  const [createdFlavourId, setCreatedFlavourId] = useState<number | null>(null);
  const [createdFlavourName, setCreatedFlavourName] = useState<string | null>(null);

  // ===========================================
  // ENTRY FORM HANDLERS
  // ===========================================

  const updateRow = useCallback((id: number, field: keyof IngredientRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => {
      const maxId = Math.max(...prev.map((r) => r.id));
      return [...prev, { id: maxId + 1, ...EMPTY_ROW }];
    });
  }, []);

  const removeRow = useCallback((id: number) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.id !== id);
    });
  }, []);

  const getConcentrationField = (version: "A" | "B" | "C" | "D"): keyof IngredientRow => {
    const map: Record<"A" | "B" | "C" | "D", keyof IngredientRow> = {
      A: "concentrationA",
      B: "concentrationB",
      C: "concentrationC",
      D: "concentrationD",
    };
    return map[version];
  };

  const calculateTotal = (version: "A" | "B" | "C" | "D"): number => {
    const field = getConcentrationField(version);
    return rows.reduce((sum, row) => {
      const val = parseFloat(row[field] as string);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const handleContinueToConfirm = () => {
    if (!formulaName.trim()) {
      toast.error("Please enter a formula name");
      return;
    }

    const concentrationField = getConcentrationField(selectedVersion);
    const ingredientsWithConcentration = rows
      .filter((row) => {
        const name = row.name.trim();
        const concentration = parseFloat(row[concentrationField] as string);
        return name && !isNaN(concentration) && concentration > 0;
      })
      .map((row) => ({
        row,
        concentration: parseFloat(row[concentrationField] as string),
      }));

    if (ingredientsWithConcentration.length === 0) {
      toast.error("Please add at least one ingredient with a concentration");
      return;
    }

    setIngredientsToConfirm(ingredientsWithConcentration);
    setCurrentConfirmIndex(0);
    setConfirmedIngredients([]);
    setStep("confirm");
  };

  // ===========================================
  // CONFIRMATION HANDLERS
  // ===========================================

  const currentIngredient = ingredientsToConfirm[currentConfirmIndex];

  // Search for matches when current ingredient changes
  useEffect(() => {
    if (step !== "confirm" || !currentIngredient) return;

    const searchMatches = async () => {
      setIsSearching(true);
      setMatches([]);
      setSelectedMatch("");
      setShowCreateForm(false);
      setNewSubstanceOdor("");
      setNewSubstanceTaste("");

      try {
        const results = await searchSubstanceMatches(currentIngredient.row.name, {
          fuzzyThreshold: 0.3,
          limit: 5,
        });
        setMatches(results);

        // Auto-select exact match if found
        const exactMatch = results.find((m) => m.match_type === "exact");
        if (exactMatch) {
          setSelectedMatch(`existing-${exactMatch.substance_id}`);
        }
      } catch (error) {
        console.error("Error searching substances:", error);
        toast.error("Failed to search for substances");
      } finally {
        setIsSearching(false);
      }
    };

    searchMatches();
  }, [step, currentConfirmIndex, currentIngredient]);

  const handleConfirmCurrent = async () => {
    if (!currentIngredient) return;

    const { row, concentration } = currentIngredient;

    if (selectedMatch === "create-new") {
      // Create new substance
      if (!newSubstanceOdor.trim() && !newSubstanceTaste.trim()) {
        toast.error("Please provide at least an odor or taste description");
        return;
      }

      setIsLoading(true);
      try {
        const created = await createSubstanceFromImport({
          name: row.name.trim(),
          odor: newSubstanceOdor.trim() || undefined,
          taste: newSubstanceTaste.trim() || undefined,
        });

        setConfirmedIngredients((prev) => [
          ...prev,
          {
            rowId: row.id,
            ingredientName: row.name,
            substanceId: created.substance_id,
            substanceName: created.common_name,
            concentration,
            supplier: row.supplier.trim() || null,
            dilution: row.dilution.trim() || null,
            pricePerKg: row.pricePerKg ? parseFloat(row.pricePerKg) : null,
            isNewlyCreated: true,
          },
        ]);

        toast.success(`Created substance "${created.common_name}"`);
        moveToNextIngredient();
      } catch (error) {
        console.error("Error creating substance:", error);
        toast.error(error instanceof Error ? error.message : "Failed to create substance");
      } finally {
        setIsLoading(false);
      }
    } else if (selectedMatch.startsWith("existing-")) {
      // Use existing substance
      const substanceId = parseInt(selectedMatch.replace("existing-", ""), 10);
      const match = matches.find((m) => m.substance_id === substanceId);

      if (!match) {
        toast.error("Please select a substance");
        return;
      }

      setConfirmedIngredients((prev) => [
        ...prev,
        {
          rowId: row.id,
          ingredientName: row.name,
          substanceId: match.substance_id,
          substanceName: match.common_name,
          concentration,
          supplier: row.supplier.trim() || null,
          dilution: row.dilution.trim() || null,
          pricePerKg: row.pricePerKg ? parseFloat(row.pricePerKg) : null,
          isNewlyCreated: false,
        },
      ]);

      moveToNextIngredient();
    } else {
      toast.error("Please select a substance or create a new one");
    }
  };

  const moveToNextIngredient = () => {
    if (currentConfirmIndex < ingredientsToConfirm.length - 1) {
      setCurrentConfirmIndex((prev) => prev + 1);
    } else {
      // All ingredients confirmed, move to import
      handleImport();
    }
  };

  const handleSkipIngredient = () => {
    toast.info(`Skipped "${currentIngredient?.row.name}"`);
    moveToNextIngredient();
  };

  // ===========================================
  // IMPORT HANDLER
  // ===========================================

  const handleImport = async () => {
    if (confirmedIngredients.length === 0) {
      toast.error("No ingredients to import");
      setStep("entry");
      return;
    }

    setIsLoading(true);
    try {
      const substancesData = confirmedIngredients.map((ing, index) => ({
        substance_id: ing.substanceId,
        concentration: ing.concentration,
        order_index: index + 1,
        supplier: ing.supplier,
        dilution: ing.dilution,
        price_per_kg: ing.pricePerKg,
      }));

      const flavourResult = await createFlavourWithSubstancesById({
        name: formulaName.trim(),
        description: `Imported from formulation sheet.${studentName ? ` Student: ${studentName}` : ""}${formulationDate ? ` Date: ${formulationDate}` : ""} Version: ${selectedVersion}`,
        substances: substancesData,
      });

      setCreatedFlavourId(flavourResult.flavour_id);
      setCreatedFlavourName(flavourResult.name);
      setStep("result");
      fireConfetti();
      toast.success(`Flavour "${flavourResult.name}" created successfully!`);
    } catch (error) {
      console.error("Error creating flavour:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create flavour");
    } finally {
      setIsLoading(false);
    }
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="container max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Fiche de formulation</h1>
        </div>
        {step === "entry" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Version:</span>
            {(["A", "B", "C", "D"] as const).map((v) => (
              <Button
                key={v}
                variant={selectedVersion === v ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedVersion(v)}
              >
                {v}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className={`flex items-center gap-2 ${step === "entry" ? "text-primary font-medium" : "text-muted-foreground"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "entry" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            1
          </div>
          Entry
        </div>
        <div className="w-8 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step === "confirm" ? "text-primary font-medium" : "text-muted-foreground"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            2
          </div>
          Confirm
        </div>
        <div className="w-8 h-px bg-border" />
        <div className={`flex items-center gap-2 ${step === "result" ? "text-primary font-medium" : "text-muted-foreground"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === "result" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            3
          </div>
          Done
        </div>
      </div>

      {/* Step 1: Entry Form */}
      {step === "entry" && (
        <div className="space-y-6">
          {/* Metadata */}
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="student">Etudiant</Label>
                <Input
                  id="student"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Nom de l'étudiant"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formula">Nom de la formule *</Label>
                <Input
                  id="formula"
                  value={formulaName}
                  onChange={(e) => setFormulaName(e.target.value)}
                  placeholder="Nom de la formule"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formulationDate}
                  onChange={(e) => setFormulationDate(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Ingredients Table */}
          <Card className="p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 w-10">N°</th>
                  <th className="text-left p-2 min-w-[200px]">Constituants</th>
                  <th className="text-left p-2 min-w-[120px]">Fournisseur</th>
                  <th className="text-left p-2 w-24">Dilution</th>
                  <th className="text-left p-2 w-24">Prix/Kg</th>
                  <th className={`text-center p-2 w-20 ${selectedVersion === "A" ? "bg-primary/10" : ""}`}>A (%)</th>
                  <th className={`text-center p-2 w-20 ${selectedVersion === "B" ? "bg-primary/10" : ""}`}>B (%)</th>
                  <th className={`text-center p-2 w-20 ${selectedVersion === "C" ? "bg-primary/10" : ""}`}>C (%)</th>
                  <th className={`text-center p-2 w-20 ${selectedVersion === "D" ? "bg-primary/10" : ""}`}>D (%)</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-b hover:bg-muted/50">
                    <td className="p-1 text-muted-foreground">{index + 1}</td>
                    <td className="p-1">
                      <Input
                        value={row.name}
                        onChange={(e) => updateRow(row.id, "name", e.target.value)}
                        placeholder="Nom du constituant"
                        className="h-8"
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        value={row.supplier}
                        onChange={(e) => updateRow(row.id, "supplier", e.target.value)}
                        placeholder="Fournisseur"
                        className="h-8"
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        value={row.dilution}
                        onChange={(e) => updateRow(row.id, "dilution", e.target.value)}
                        placeholder="ex: 10%"
                        className="h-8"
                      />
                    </td>
                    <td className="p-1">
                      <Input
                        value={row.pricePerKg}
                        onChange={(e) => updateRow(row.id, "pricePerKg", e.target.value)}
                        placeholder="€/kg"
                        className="h-8"
                        type="number"
                        step="0.01"
                      />
                    </td>
                    <td className={`p-1 ${selectedVersion === "A" ? "bg-primary/10" : ""}`}>
                      <Input
                        value={row.concentrationA}
                        onChange={(e) => updateRow(row.id, "concentrationA", e.target.value)}
                        className="h-8 text-center"
                        type="number"
                        step="0.01"
                      />
                    </td>
                    <td className={`p-1 ${selectedVersion === "B" ? "bg-primary/10" : ""}`}>
                      <Input
                        value={row.concentrationB}
                        onChange={(e) => updateRow(row.id, "concentrationB", e.target.value)}
                        className="h-8 text-center"
                        type="number"
                        step="0.01"
                      />
                    </td>
                    <td className={`p-1 ${selectedVersion === "C" ? "bg-primary/10" : ""}`}>
                      <Input
                        value={row.concentrationC}
                        onChange={(e) => updateRow(row.id, "concentrationC", e.target.value)}
                        className="h-8 text-center"
                        type="number"
                        step="0.01"
                      />
                    </td>
                    <td className={`p-1 ${selectedVersion === "D" ? "bg-primary/10" : ""}`}>
                      <Input
                        value={row.concentrationD}
                        onChange={(e) => updateRow(row.id, "concentrationD", e.target.value)}
                        className="h-8 text-center"
                        type="number"
                        step="0.01"
                      />
                    </td>
                    <td className="p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="font-medium bg-muted/50">
                  <td colSpan={5} className="p-2 text-right">TOTAL:</td>
                  <td className={`p-2 text-center ${selectedVersion === "A" ? "bg-primary/10" : ""}`}>
                    {calculateTotal("A").toFixed(2)}
                  </td>
                  <td className={`p-2 text-center ${selectedVersion === "B" ? "bg-primary/10" : ""}`}>
                    {calculateTotal("B").toFixed(2)}
                  </td>
                  <td className={`p-2 text-center ${selectedVersion === "C" ? "bg-primary/10" : ""}`}>
                    {calculateTotal("C").toFixed(2)}
                  </td>
                  <td className={`p-2 text-center ${selectedVersion === "D" ? "bg-primary/10" : ""}`}>
                    {calculateTotal("D").toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <Button variant="outline" size="sm" onClick={addRow} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </Card>

          {/* Continue button */}
          <div className="flex justify-end">
            <Button onClick={handleContinueToConfirm} size="lg">
              Continue to Confirmation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {step === "confirm" && currentIngredient && (
        <div className="space-y-6">
          {/* Progress */}
          <Card className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span>
                Confirming ingredient {currentConfirmIndex + 1} of {ingredientsToConfirm.length}
              </span>
              <span className="text-muted-foreground">
                {confirmedIngredients.length} confirmed
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${((currentConfirmIndex + 1) / ingredientsToConfirm.length) * 100}%`,
                }}
              />
            </div>
          </Card>

          {/* Current ingredient */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">"{currentIngredient.row.name}"</h2>
              <p className="text-muted-foreground">
                Concentration: {currentIngredient.concentration}%
                {currentIngredient.row.supplier && ` • Supplier: ${currentIngredient.row.supplier}`}
                {currentIngredient.row.dilution && ` • Dilution: ${currentIngredient.row.dilution}`}
              </p>
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching for matches...</span>
              </div>
            ) : (
              <RadioGroup value={selectedMatch} onValueChange={setSelectedMatch}>
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.substance_id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        selectedMatch === `existing-${match.substance_id}`
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem
                        value={`existing-${match.substance_id}`}
                        id={`match-${match.substance_id}`}
                        className="mt-1"
                      />
                      <Label
                        htmlFor={`match-${match.substance_id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{match.common_name}</span>
                          {match.match_type === "exact" ? (
                            <Badge className="bg-green-500">Exact match</Badge>
                          ) : (
                            <Badge variant="secondary">
                              {Math.round(match.similarity * 100)}% similar
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {match.fema_number && `FEMA ${match.fema_number}`}
                          {match.cas_id && ` • CAS ${match.cas_id}`}
                          {match.odor && ` • ${match.odor.slice(0, 80)}${match.odor.length > 80 ? "..." : ""}`}
                        </div>
                      </Label>
                    </div>
                  ))}

                  {/* Create new option */}
                  <div
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${
                      selectedMatch === "create-new"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem
                      value="create-new"
                      id="match-create-new"
                      className="mt-1"
                    />
                    <Label
                      htmlFor="match-create-new"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Create new substance "{currentIngredient.row.name}"
                        </span>
                        <Badge variant="outline">New</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create a new substance entry (requires odor or taste description)
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* Create new form */}
            {selectedMatch === "create-new" && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-odor">Odor description</Label>
                  <Textarea
                    id="new-odor"
                    value={newSubstanceOdor}
                    onChange={(e) => setNewSubstanceOdor(e.target.value)}
                    placeholder="Describe the odor characteristics..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-taste">Taste description</Label>
                  <Textarea
                    id="new-taste"
                    value={newSubstanceTaste}
                    onChange={(e) => setNewSubstanceTaste(e.target.value)}
                    placeholder="Describe the taste characteristics..."
                    rows={2}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  At least one description (odor or taste) is required
                </p>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setStep("entry");
                setConfirmedIngredients([]);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Entry
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkipIngredient}>
                Skip
              </Button>
              <Button onClick={handleConfirmCurrent} disabled={isLoading || !selectedMatch}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentConfirmIndex < ingredientsToConfirm.length - 1 ? (
                  <>
                    Confirm & Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Confirm & Import
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === "result" && (
        <div className="space-y-6">
          <Card className="p-6 border-green-500">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Import Successful!</h2>
                <p className="text-muted-foreground">
                  Flavour "{createdFlavourName}" has been created with {confirmedIngredients.length} substances.
                </p>
              </div>
            </div>
          </Card>

          {/* Summary */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Imported Substances</h3>
            <div className="space-y-2">
              {confirmedIngredients.map((ing, idx) => (
                <div
                  key={ing.rowId}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div>
                    <span className="font-medium">{ing.substanceName}</span>
                    <span className="text-muted-foreground ml-2">
                      ({ing.concentration}%)
                    </span>
                    {ing.ingredientName !== ing.substanceName && (
                      <span className="text-xs text-muted-foreground ml-2">
                        from "{ing.ingredientName}"
                      </span>
                    )}
                  </div>
                  {ing.isNewlyCreated && (
                    <Badge variant="outline">Newly created</Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setStep("entry");
                setRows(createEmptyRows(18, 1));
                setStudentName("");
                setFormulaName("");
                setFormulationDate("");
                setConfirmedIngredients([]);
                setCreatedFlavourId(null);
                setCreatedFlavourName(null);
              }}
            >
              Import Another
            </Button>
            {createdFlavourId && (
              <Button onClick={() => router.push(`/flavours/${createdFlavourId}`)}>
                View Flavour
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

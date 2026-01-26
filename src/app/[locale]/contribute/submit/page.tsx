"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Input } from "@/app/[locale]/components/ui/input";
import { Label } from "@/app/[locale]/components/ui/label";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Switch } from "@/app/[locale]/components/ui/switch";
import { Alert, AlertDescription } from "@/app/[locale]/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react";
import {
  substanceFormSchema,
  type SubstanceFormValues,
} from "@/lib/validations/contribution";
import {
  checkDuplicateSubstance,
  createUserSubstance,
} from "@/actions/contributions";

type Step = "basic" | "identifiers" | "sensory" | "additional" | "review";

const STEPS: Step[] = ["basic", "identifiers", "sensory", "additional", "review"];

export default function SubmitSubstancePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  const form = useForm<SubstanceFormValues>({
    resolver: zodResolver(substanceFormSchema),
    defaultValues: {
      common_name: "",
      cas_id: "",
      fema_number: "",
      pubchem_id: "",
      odor: "",
      taste: "",
      flavor_profile: "",
      iupac_name: "",
      description: "",
      is_natural: false,
      synthetic: false,
      molecular_formula: "",
      molecular_weight: "",
      smile: "",
      inchi: "",
      alternative_names: "",
      source_reference: "",
    },
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const formValues = watch();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const currentStepIndex = STEPS.indexOf(currentStep);

  const checkForDuplicate = async (name: string) => {
    if (!name || name.length < 2) {
      setDuplicateWarning(null);
      return;
    }

    setIsCheckingDuplicate(true);
    try {
      const result = await checkDuplicateSubstance(name);
      if (result.exists) {
        setDuplicateWarning(
          `A substance with this name already exists: "${result.matchedSubstance?.common_name}". ` +
            `Consider submitting feedback on that substance instead.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      console.error("Error checking duplicate:", e);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case "basic":
        return !!formValues.common_name && formValues.common_name.length >= 1;
      case "identifiers":
        return !!(
          formValues.cas_id ||
          formValues.fema_number ||
          formValues.pubchem_id
        );
      case "sensory":
        return !!(
          formValues.odor ||
          formValues.taste ||
          formValues.flavor_profile
        );
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const alternativeNames = formValues.alternative_names
        ?.split(",")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);

      await createUserSubstance({
        common_name: formValues.common_name,
        cas_id: formValues.cas_id || undefined,
        fema_number: formValues.fema_number
          ? parseInt(formValues.fema_number)
          : undefined,
        pubchem_id: formValues.pubchem_id
          ? parseInt(formValues.pubchem_id)
          : undefined,
        odor: formValues.odor || undefined,
        taste: formValues.taste || undefined,
        flavor_profile: formValues.flavor_profile || undefined,
        iupac_name: formValues.iupac_name || undefined,
        description: formValues.description || undefined,
        is_natural: formValues.is_natural,
        synthetic: formValues.synthetic,
        molecular_formula: formValues.molecular_formula || undefined,
        molecular_weight: formValues.molecular_weight
          ? parseFloat(formValues.molecular_weight)
          : undefined,
        smile: formValues.smile || undefined,
        inchi: formValues.inchi || undefined,
        alternative_names:
          alternativeNames && alternativeNames.length > 0
            ? alternativeNames
            : undefined,
        source_reference: formValues.source_reference || undefined,
      });

      router.push("/contribute?success=1");
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Failed to submit substance"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit New Substance</h1>
        <p className="text-muted-foreground mt-1">
          Contribute a substance to the database. It will be reviewed by an admin
          before becoming official.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStepIndex
                  ? "bg-green-500 text-white"
                  : index === currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-12 h-1 mx-2 ${
                  index < currentStepIndex ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Step: Basic Info */}
      {currentStep === "basic" && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the substance name. We'll check for duplicates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="common_name">
                Common Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="common_name"
                placeholder="e.g., Vanillin"
                {...register("common_name")}
                onBlur={(e) => checkForDuplicate(e.target.value)}
              />
              {errors.common_name && (
                <p className="text-sm text-red-500">
                  {errors.common_name.message}
                </p>
              )}
              {isCheckingDuplicate && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Checking for duplicates...
                </p>
              )}
              {duplicateWarning && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{duplicateWarning}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternative_names">Alternative Names</Label>
              <Input
                id="alternative_names"
                placeholder="Comma-separated: Vanilla aldehyde, 4-Hydroxy-3-methoxybenzaldehyde"
                {...register("alternative_names")}
              />
              <p className="text-xs text-muted-foreground">
                Other names this substance is known by
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Identifiers */}
      {currentStep === "identifiers" && (
        <Card>
          <CardHeader>
            <CardTitle>Identifiers</CardTitle>
            <CardDescription>
              At least one identifier is required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Provide at least one of: CAS ID, FEMA number, or PubChem ID
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="cas_id">CAS Registry Number</Label>
              <Input
                id="cas_id"
                placeholder="e.g., 121-33-5"
                {...register("cas_id")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fema_number">FEMA Number</Label>
              <Input
                id="fema_number"
                type="number"
                placeholder="e.g., 3107"
                {...register("fema_number")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pubchem_id">PubChem CID</Label>
              <Input
                id="pubchem_id"
                type="number"
                placeholder="e.g., 1183"
                {...register("pubchem_id")}
              />
            </div>

            {!validateStep("identifiers") && (
              <p className="text-sm text-amber-600">
                Please provide at least one identifier to continue.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Sensory Properties */}
      {currentStep === "sensory" && (
        <Card>
          <CardHeader>
            <CardTitle>Sensory Properties</CardTitle>
            <CardDescription>
              At least one sensory description is required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Provide at least one of: odor, taste, or flavor profile
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="odor">Odor Description</Label>
              <Textarea
                id="odor"
                placeholder="e.g., Sweet, vanilla, creamy with balsamic notes"
                rows={3}
                {...register("odor")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taste">Taste Description</Label>
              <Textarea
                id="taste"
                placeholder="e.g., Sweet vanilla, slightly bitter at high concentration"
                rows={3}
                {...register("taste")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flavor_profile">Flavor Profile</Label>
              <Textarea
                id="flavor_profile"
                placeholder="e.g., Vanilla, sweet, creamy, balsamic"
                rows={2}
                {...register("flavor_profile")}
              />
            </div>

            {!validateStep("sensory") && (
              <p className="text-sm text-amber-600">
                Please provide at least one sensory property to continue.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step: Additional Info */}
      {currentStep === "additional" && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Optional but helpful details about the substance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_natural"
                  checked={formValues.is_natural}
                  onCheckedChange={(checked) => setValue("is_natural", checked)}
                />
                <Label htmlFor="is_natural">Natural origin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="synthetic"
                  checked={formValues.synthetic}
                  onCheckedChange={(checked) => setValue("synthetic", checked)}
                />
                <Label htmlFor="synthetic">Synthetic</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="molecular_formula">Molecular Formula</Label>
                <Input
                  id="molecular_formula"
                  placeholder="e.g., C8H8O3"
                  {...register("molecular_formula")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="molecular_weight">Molecular Weight</Label>
                <Input
                  id="molecular_weight"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 152.15"
                  {...register("molecular_weight")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iupac_name">IUPAC Name</Label>
              <Input
                id="iupac_name"
                placeholder="e.g., 4-hydroxy-3-methoxybenzaldehyde"
                {...register("iupac_name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smile">SMILES</Label>
              <Input
                id="smile"
                placeholder="e.g., COC1=C(C=CC(=C1)C=O)O"
                {...register("smile")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Any additional context or information about this substance"
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_reference">Source Reference</Label>
              <Input
                id="source_reference"
                placeholder="Where did you find this data? (URL, paper, book)"
                {...register("source_reference")}
              />
              <p className="text-xs text-muted-foreground">
                Helps admin verify the accuracy of your submission
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Review */}
      {currentStep === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Submission</CardTitle>
            <CardDescription>
              Please review the information before submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="font-medium">Common Name:</span>{" "}
                {formValues.common_name}
              </div>
              {formValues.alternative_names && (
                <div>
                  <span className="font-medium">Alternative Names:</span>{" "}
                  {formValues.alternative_names}
                </div>
              )}
              <div className="border-t pt-3">
                <span className="font-medium">Identifiers:</span>
                <ul className="ml-4 mt-1 text-sm">
                  {formValues.cas_id && <li>CAS: {formValues.cas_id}</li>}
                  {formValues.fema_number && (
                    <li>FEMA: {formValues.fema_number}</li>
                  )}
                  {formValues.pubchem_id && (
                    <li>PubChem: {formValues.pubchem_id}</li>
                  )}
                </ul>
              </div>
              <div className="border-t pt-3">
                <span className="font-medium">Sensory Properties:</span>
                <ul className="ml-4 mt-1 text-sm">
                  {formValues.odor && <li>Odor: {formValues.odor}</li>}
                  {formValues.taste && <li>Taste: {formValues.taste}</li>}
                  {formValues.flavor_profile && (
                    <li>Profile: {formValues.flavor_profile}</li>
                  )}
                </ul>
              </div>
              {(formValues.is_natural || formValues.synthetic) && (
                <div className="border-t pt-3">
                  <span className="font-medium">Classification:</span>
                  <ul className="ml-4 mt-1 text-sm">
                    {formValues.is_natural && <li>Natural origin</li>}
                    {formValues.synthetic && <li>Synthetic</li>}
                  </ul>
                </div>
              )}
              {formValues.source_reference && (
                <div className="border-t pt-3">
                  <span className="font-medium">Source:</span>{" "}
                  {formValues.source_reference}
                </div>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                After submission, your substance will be reviewed by an admin.
                You can use it in your flavors immediately, but it won't appear
                in search results for other users until verified.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentStep === "review" ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !!duplicateWarning}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Submit Substance
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={goToNextStep}
            disabled={!validateStep(currentStep)}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

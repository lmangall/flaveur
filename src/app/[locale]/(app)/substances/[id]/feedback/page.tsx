"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Alert, AlertDescription } from "@/app/[locale]/components/ui/alert";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { ArrowLeft, Send, AlertTriangle, Loader2, Check, Info } from "lucide-react";
import {
  feedbackFormSchema,
  type FeedbackFormValues,
} from "@/lib/validations/contribution";
import {
  FEEDBACK_TYPE_OPTIONS,
  SUBSTANCE_FIELD_OPTIONS,
} from "@/constants";
import {
  getSubstanceForUser,
  createSubstanceFeedback,
} from "@/actions/contributions";
import type { Substance } from "@/app/type";

export default function SubstanceFeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const substanceId = parseInt(params.id as string);
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session;
  const isLoaded = !isPending;

  const [substance, setSubstance] = useState<Substance | null>(null);
  const [isLoadingSubstance, setIsLoadingSubstance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      feedback_type: "",
      target_field: "",
      current_value: "",
      suggested_value: "",
      commentary: "",
      source_reference: "",
    },
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const feedbackType = watch("feedback_type");
  const targetField = watch("target_field");

  useEffect(() => {
    async function loadSubstance() {
      if (!substanceId || isNaN(substanceId)) {
        router.push("/substances");
        return;
      }

      try {
        const data = await getSubstanceForUser(substanceId);
        if (!data) {
          router.push("/substances");
          return;
        }
        setSubstance(data);
      } catch (e) {
        console.error("Error loading substance:", e);
        router.push("/substances");
      } finally {
        setIsLoadingSubstance(false);
      }
    }

    if (isLoaded && isSignedIn) {
      loadSubstance();
    } else if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [substanceId, isLoaded, isSignedIn, router]);

  // Auto-fill current value when target field changes
  useEffect(() => {
    if (substance && targetField) {
      const fieldValue = substance[targetField as keyof Substance];
      if (fieldValue !== null && fieldValue !== undefined) {
        setValue(
          "current_value",
          typeof fieldValue === "object"
            ? JSON.stringify(fieldValue)
            : String(fieldValue)
        );
      } else {
        setValue("current_value", "");
      }
    }
  }, [targetField, substance, setValue]);

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createSubstanceFeedback({
        substance_id: substanceId,
        feedback_type: data.feedback_type as "error_report" | "change_request" | "data_enhancement" | "general",
        target_field: data.target_field || undefined,
        current_value: data.current_value || undefined,
        suggested_value: data.suggested_value || undefined,
        commentary: data.commentary,
        source_reference: data.source_reference || undefined,
      });

      setSubmitSuccess(true);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Failed to submit feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Feedback Submitted</h2>
            <p className="text-muted-foreground">
              Thank you for your contribution! An admin will review your feedback
              and take appropriate action.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => router.push("/contribute")}>
                View My Contributions
              </Button>
              <Button onClick={() => router.push("/substances")}>
                Browse Substances
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Issue</h1>
        <p className="text-muted-foreground mt-1">
          Help improve our database by reporting errors or suggesting changes
        </p>
      </div>

      {isLoadingSubstance ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
        </Card>
      ) : substance ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{substance.common_name}</CardTitle>
              <CardDescription>
                {substance.cas_id && `CAS: ${substance.cas_id}`}
                {substance.fema_number && ` | FEMA: ${substance.fema_number}`}
              </CardDescription>
            </CardHeader>
          </Card>

          {submitError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
                <CardDescription>
                  Describe the issue or suggestion you have for this substance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feedback_type">
                    Feedback Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={feedbackType}
                    onValueChange={(value) => setValue("feedback_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type of feedback" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.feedback_type && (
                    <p className="text-sm text-red-500">
                      {errors.feedback_type.message}
                    </p>
                  )}
                </div>

                {(feedbackType === "change_request" ||
                  feedbackType === "error_report") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="target_field">
                        Which field is affected?
                      </Label>
                      <Select
                        value={targetField}
                        onValueChange={(value) => setValue("target_field", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBSTANCE_FIELD_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {targetField && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="current_value">Current Value</Label>
                          <Input
                            id="current_value"
                            {...register("current_value")}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Auto-filled from the substance data
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="suggested_value">
                            Suggested Value{" "}
                            {feedbackType === "change_request" && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <Input
                            id="suggested_value"
                            placeholder="Enter the correct value"
                            {...register("suggested_value")}
                          />
                          {errors.suggested_value && (
                            <p className="text-sm text-red-500">
                              {errors.suggested_value.message}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="commentary">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="commentary"
                    placeholder="Please describe the issue or your suggestion in detail..."
                    rows={5}
                    {...register("commentary")}
                  />
                  {errors.commentary && (
                    <p className="text-sm text-red-500">
                      {errors.commentary.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Minimum 10 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source_reference">Source Reference</Label>
                  <Input
                    id="source_reference"
                    placeholder="Where did you find the correct information? (URL, paper, book)"
                    {...register("source_reference")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps admin verify your suggestion
                  </p>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your feedback will be reviewed by an admin. You can track the
                status of your submissions in "My Contributions".
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Substance not found</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

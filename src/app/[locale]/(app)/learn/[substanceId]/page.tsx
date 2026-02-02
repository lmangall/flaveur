"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  Save,
  Eye,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import { Checkbox } from "@/app/[locale]/components/ui/checkbox";
import { Label } from "@/app/[locale]/components/ui/label";
import { Textarea } from "@/app/[locale]/components/ui/textarea";
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/[locale]/components/ui/collapsible";
import { cn } from "@/app/lib/utils";
import {
  getMyProgress,
  recordSensoryExperience,
  updateProgressStatus,
  updateProgressNotes,
  addToLearningQueue,
} from "@/actions/learning";
import { getSubstanceWithRelations } from "@/actions/substances";
import { LEARNING_STATUS_OPTIONS } from "@/constants";
import type { SubstanceLearningProgress, Substance } from "@/app/type";
import {
  SubstanceDetailsModal,
  type SubstanceForModal,
} from "@/app/[locale]/components/substance-details-modal";

export default function SubstanceStudyPage() {
  const { data: session, isPending } = useSession();
  const t = useTranslations("Learn");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const substanceId = Number(params.substanceId);

  const [substance, setSubstance] = useState<Substance | null>(null);
  const [progress, setProgress] = useState<SubstanceLearningProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingSmell, setSavingSmell] = useState(false);
  const [savingTaste, setSavingTaste] = useState(false);

  // Form state
  const [notes, setNotes] = useState("");
  const [descriptors, setDescriptors] = useState("");
  const [associations, setAssociations] = useState("");
  const [concentrationNotes, setConcentrationNotes] = useState("");
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!substanceId) return;

    setIsLoading(true);
    try {
      const [substanceData, progressData] = await Promise.all([
        getSubstanceWithRelations(substanceId),
        getMyProgress(substanceId),
      ]);

      setSubstance(substanceData as unknown as Substance);
      setProgress(progressData);

      // Initialize form with existing data
      if (progressData) {
        setNotes(progressData.personal_notes || "");
        setDescriptors(progressData.personal_descriptors?.join(", ") || "");
        setAssociations(progressData.associations || "");
        setConcentrationNotes(progressData.concentration_notes || "");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(t("errorLoadingData") || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [substanceId, t]);

  useEffect(() => {
    if (!isPending && session && substanceId) {
      fetchData();
    }
  }, [isPending, session, substanceId, fetchData]);

  const handleSensoryCheck = async (type: "smell" | "taste") => {
    const setLoading = type === "smell" ? setSavingSmell : setSavingTaste;
    setLoading(true);

    const now = new Date().toISOString();
    const hadProgress = !!progress;

    // Optimistic update
    setProgress((prev) => {
      if (!prev) {
        // Create new progress record optimistically
        return {
          progress_id: 0, // Will be set by server
          user_id: session?.user?.id || "",
          substance_id: substanceId,
          status: "not_started",
          has_smelled: type === "smell" ? true : false,
          has_tasted: type === "taste" ? true : false,
          smelled_at: type === "smell" ? now : null,
          tasted_at: type === "taste" ? now : null,
          personal_notes: null,
          personal_descriptors: [],
          associations: null,
          concentration_notes: null,
          sample_photo_url: null,
          started_at: now,
          mastered_at: null,
          next_review_at: null,
          review_count: 0,
          created_at: now,
          updated_at: now,
        } as SubstanceLearningProgress;
      }
      return {
        ...prev,
        has_smelled: type === "smell" ? true : prev.has_smelled,
        has_tasted: type === "taste" ? true : prev.has_tasted,
        smelled_at: type === "smell" ? now : prev.smelled_at,
        tasted_at: type === "taste" ? now : prev.tasted_at,
      };
    });

    try {
      // If not in queue, add it first
      if (!hadProgress) {
        await addToLearningQueue(substanceId);
      }
      await recordSensoryExperience(substanceId, type);
    } catch (error) {
      console.error("Failed to record sensory experience:", error);
      toast.error(t("errorRecording") || "Failed to record");
      // Revert optimistic update on error
      setProgress(null);
      await fetchData();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const previousStatus = progress?.status;

    // Optimistic update
    setProgress((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: newStatus as SubstanceLearningProgress["status"],
        mastered_at: newStatus === "mastered" ? new Date().toISOString() : prev.mastered_at,
      };
    });

    try {
      await updateProgressStatus(substanceId, newStatus);
      toast.success(t("statusUpdated") || "Status updated!");
    } catch (error) {
      console.error("Failed to update status:", error);
      const message = error instanceof Error ? error.message : "Failed to update status";
      toast.error(message);
      // Revert optimistic update on error
      setProgress((prev) => {
        if (!prev) return prev;
        return { ...prev, status: previousStatus as SubstanceLearningProgress["status"] };
      });
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateProgressNotes(substanceId, {
        personal_notes: notes || undefined,
        personal_descriptors: descriptors ? descriptors.split(",").map((d) => d.trim()) : undefined,
        associations: associations || undefined,
        concentration_notes: concentrationNotes || undefined,
      });
      toast.success(t("notesSaved") || "Notes saved!");
    } catch (error) {
      console.error("Failed to save notes:", error);
      toast.error(t("errorSaving") || "Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("signInRequired") || "Sign in required"}</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push(`/${locale}/auth/sign-in`)}>
              {t("signIn") || "Sign In"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!substance) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t("substanceNotFound") || "Substance not found"}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/${locale}/learn`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToLearning") || "Back to Learning"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canAdvance = progress?.has_smelled && progress?.has_tasted;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push(`/${locale}/learn/queue`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToQueue") || "Back to Queue"}
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{substance.common_name}</h1>
              {progress && (
                <Badge
                  variant={
                    progress.status === "mastered"
                      ? "default"
                      : progress.status === "confident"
                        ? "secondary"
                        : "outline"
                  }
                  className={
                    progress.status === "mastered"
                      ? "bg-green-500"
                      : progress.status === "confident"
                        ? "bg-yellow-500 text-yellow-900"
                        : ""
                  }
                >
                  {progress.status}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              {substance.fema_number && <span>FEMA #{substance.fema_number}</span>}
              {substance.cas_id && <span>CAS: {substance.cas_id}</span>}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsDetailsModalOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("viewDetails") || "View Full Details"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Sensory & Status */}
        <div className="space-y-6">
          {/* Sensory Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t("sensoryExperience") || "Sensory Experience"}
              </CardTitle>
              <CardDescription>
                {t("sensoryDescription") || "Confirm you have experienced this substance"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="smelled"
                    checked={progress?.has_smelled || false}
                    onCheckedChange={() => {
                      if (!progress?.has_smelled && !savingSmell) {
                        handleSensoryCheck("smell");
                      }
                    }}
                    disabled={progress?.has_smelled || savingSmell}
                  />
                  <div>
                    <Label htmlFor="smelled" className="text-base font-medium">
                      {t("iHaveSmelled") || "I have smelled this substance"}
                    </Label>
                    {progress?.smelled_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(progress.smelled_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {savingSmell ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : progress?.has_smelled ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="tasted"
                    checked={progress?.has_tasted || false}
                    onCheckedChange={() => {
                      if (!progress?.has_tasted && !savingTaste) {
                        handleSensoryCheck("taste");
                      }
                    }}
                    disabled={progress?.has_tasted || savingTaste}
                  />
                  <div>
                    <Label htmlFor="tasted" className="text-base font-medium">
                      {t("iHaveTasted") || "I have tasted this substance"}
                    </Label>
                    {progress?.tasted_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(progress.tasted_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {savingTaste ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : progress?.has_tasted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {!canAdvance && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {t("sensoryRequired") || "You must smell and taste this substance before advancing your mastery level."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status Selector - Card buttons */}
          <Card>
            <CardHeader>
              <CardTitle>{t("masteryStatus") || "Mastery Status"}</CardTitle>
              <CardDescription>
                {t("statusDescription") || "Track your learning progress"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {LEARNING_STATUS_OPTIONS.map((option) => {
                  const isSelected = (progress?.status || "not_started") === option.value;
                  const isDisabled = (option.value === "confident" || option.value === "mastered") && !canAdvance;

                  return (
                    <button
                      key={option.value}
                      onClick={() => !isDisabled && handleStatusChange(option.value)}
                      disabled={isDisabled}
                      className={cn(
                        "p-3 rounded-lg border text-sm font-medium transition-all text-left",
                        isSelected && option.value === "mastered" && "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
                        isSelected && option.value === "confident" && "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                        isSelected && option.value === "learning" && "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400",
                        isSelected && option.value === "not_started" && "border-primary bg-primary/10",
                        !isSelected && !isDisabled && "border-muted hover:border-primary/50 hover:bg-muted/50",
                        isDisabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        {option.label}
                      </div>
                    </button>
                  );
                })}
              </div>

              {!canAdvance && (
                <p className="text-xs text-muted-foreground mt-3">
                  {t("unlockAdvanced") || "Complete sensory experience to unlock advanced statuses"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Reference Info - Collapsible */}
          <Collapsible open={isReferenceOpen} onOpenChange={setIsReferenceOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("referenceInfo") || "Reference Information"}</CardTitle>
                    {isReferenceOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {substance.flavor_profile && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("flavorProfile") || "Flavor Profile"}</p>
                      <p className="text-sm">{substance.flavor_profile}</p>
                    </div>
                  )}
                  {substance.fema_flavor_profile && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("femaProfile") || "FEMA Profile"}</p>
                      <p className="text-sm">{substance.fema_flavor_profile}</p>
                    </div>
                  )}
                  {substance.odor && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("odor") || "Odor"}</p>
                      <p className="text-sm">{substance.odor}</p>
                    </div>
                  )}
                  {substance.taste && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("taste") || "Taste"}</p>
                      <p className="text-sm">{substance.taste}</p>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right Column: Notes */}
        <Card>
          <CardHeader>
            <CardTitle>{t("personalNotes") || "Personal Notes"}</CardTitle>
            <CardDescription>
              {t("notesDescription") || "Record your personal observations and associations"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personal-notes">{t("detailedNotes") || "Detailed Notes"}</Label>
              <Textarea
                id="personal-notes"
                placeholder={t("notesPlaceholder") || "Write your observations, impressions, and notes about this substance..."}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptors">{t("flavorDescriptors") || "Flavor Descriptors"}</Label>
              <Input
                id="descriptors"
                placeholder={t("descriptorsPlaceholder") || "Enter descriptors separated by commas (e.g., fruity, sweet, vanilla-like)"}
                value={descriptors}
                onChange={(e) => setDescriptors(e.target.value)}
              />
              {descriptors && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {descriptors.split(",").map((d, i) => {
                    const trimmed = d.trim();
                    if (!trimmed) return null;
                    return (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {trimmed}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="associations">{t("associations") || "Associations"}</Label>
              <Input
                id="associations"
                placeholder={t("associationsPlaceholder") || "What does this remind you of?"}
                value={associations}
                onChange={(e) => setAssociations(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concentration">{t("concentrationNotes") || "Concentration Notes"}</Label>
              <Input
                id="concentration"
                placeholder={t("concentrationPlaceholder") || "Notes about dilution, threshold, etc."}
                value={concentrationNotes}
                onChange={(e) => setConcentrationNotes(e.target.value)}
              />
            </div>

            <Button
              className="w-full mt-2"
              onClick={handleSaveNotes}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("saving") || "Saving..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("saveNotes") || "Save Notes"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Substance Details Modal */}
      <SubstanceDetailsModal
        substance={substance as SubstanceForModal}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        showAddToQueue={false}
      />
    </div>
  );
}

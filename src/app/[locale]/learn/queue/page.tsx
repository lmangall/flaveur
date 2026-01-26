"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  GripVertical,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
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
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/[locale]/components/ui/dialog";
import {
  getMyLearningQueue,
  removeFromQueue,
  addToLearningQueue,
  searchSubstancesForQueue,
} from "@/actions/learning";
import type { LearningQueueItem } from "@/app/type";

type SearchResult = {
  substance_id: number;
  fema_number: number | null;
  common_name: string;
  flavor_profile: string | null;
  in_queue: boolean;
};

export default function LearnQueuePage() {
  const { isLoaded, isSignedIn } = useUser();
  const t = useTranslations("Learn");
  const locale = useLocale();
  const router = useRouter();

  const [queue, setQueue] = useState<LearningQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingSubstanceId, setAddingSubstanceId] = useState<number | null>(null);
  const [removingSubstanceId, setRemovingSubstanceId] = useState<number | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyLearningQueue();
      setQueue(data);
    } catch (error) {
      console.error("Failed to fetch queue:", error);
      toast.error(t("errorLoadingQueue") || "Failed to load queue");
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchQueue();
    }
  }, [isLoaded, isSignedIn, fetchQueue]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchSubstancesForQueue(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAddToQueue = async (substanceId: number) => {
    setAddingSubstanceId(substanceId);
    try {
      await addToLearningQueue(substanceId);
      toast.success(t("addedToQueue") || "Added to queue");
      // Update search results to show it's in queue
      setSearchResults((prev) =>
        prev.map((r) =>
          r.substance_id === substanceId ? { ...r, in_queue: true } : r
        )
      );
      // Refresh queue
      fetchQueue();
    } catch (error) {
      console.error("Failed to add to queue:", error);
      toast.error(t("errorAddingToQueue") || "Failed to add to queue");
    } finally {
      setAddingSubstanceId(null);
    }
  };

  const handleRemoveFromQueue = async (substanceId: number) => {
    setRemovingSubstanceId(substanceId);
    try {
      await removeFromQueue(substanceId);
      setQueue((prev) => prev.filter((item) => item.substance_id !== substanceId));
      toast.success(t("removedFromQueue") || "Removed from queue");
    } catch (error) {
      console.error("Failed to remove from queue:", error);
      toast.error(t("errorRemovingFromQueue") || "Failed to remove from queue");
    } finally {
      setRemovingSubstanceId(null);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
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

  const statusGroups = {
    not_started: queue.filter((q) => q.progress_status === "not_started"),
    learning: queue.filter((q) => q.progress_status === "learning"),
    confident: queue.filter((q) => q.progress_status === "confident"),
    mastered: queue.filter((q) => q.progress_status === "mastered"),
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => router.push(`/${locale}/learn`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToDashboard") || "Back to Dashboard"}
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              {t("learningQueue") || "Learning Queue"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("queuePageDescription") || "Manage substances you want to learn"}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t("addSubstance") || "Add Substance"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{t("addToQueue") || "Add to Queue"}</DialogTitle>
                <DialogDescription>
                  {t("searchSubstances") || "Search for substances to add to your learning queue"}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchPlaceholder") || "Search by name, FEMA #, or CAS..."}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="mt-4 max-h-[300px] overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {t("noResults") || "No substances found"}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div
                          key={result.substance_id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{result.common_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {result.fema_number && `FEMA #${result.fema_number}`}
                              {result.flavor_profile && ` • ${result.flavor_profile}`}
                            </p>
                          </div>
                          {result.in_queue ? (
                            <Badge variant="secondary">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {t("inQueue") || "In Queue"}
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAddToQueue(result.substance_id)}
                              disabled={addingSubstanceId === result.substance_id}
                            >
                              {addingSubstanceId === result.substance_id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  {t("add") || "Add"}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t("notStarted") || "Not Started"}</span>
          </div>
          <p className="text-2xl font-bold mt-1">{statusGroups.not_started.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-blue-500" />
            <span className="text-sm text-muted-foreground">{t("learning") || "Learning"}</span>
          </div>
          <p className="text-2xl font-bold mt-1">{statusGroups.learning.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-yellow-500" />
            <span className="text-sm text-muted-foreground">{t("confident") || "Confident"}</span>
          </div>
          <p className="text-2xl font-bold mt-1">{statusGroups.confident.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">{t("mastered") || "Mastered"}</span>
          </div>
          <p className="text-2xl font-bold mt-1">{statusGroups.mastered.length}</p>
        </Card>
      </div>

      {/* Queue List */}
      {queue.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t("emptyQueueTitle") || "Your queue is empty"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t("emptyQueueDescription") || "Add substances to start learning"}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("addFirstSubstance") || "Add Your First Substance"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {queue.map((item) => (
            <Card
              key={item.queue_id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab" />

                  <div
                    className="flex-1 min-w-0"
                    onClick={() => router.push(`/${locale}/learn/${item.substance_id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium truncate">
                        {item.substance?.common_name}
                      </h3>
                      <Badge
                        variant={
                          item.progress_status === "mastered"
                            ? "default"
                            : item.progress_status === "confident"
                              ? "secondary"
                              : item.progress_status === "learning"
                                ? "outline"
                                : "outline"
                        }
                        className={
                          item.progress_status === "mastered"
                            ? "bg-green-500"
                            : item.progress_status === "confident"
                              ? "bg-yellow-500 text-yellow-900"
                              : item.progress_status === "learning"
                                ? "border-blue-500 text-blue-500"
                                : ""
                        }
                      >
                        {item.progress_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {item.substance?.fema_number && (
                        <span>FEMA #{item.substance.fema_number}</span>
                      )}
                      {item.substance?.flavor_profile && (
                        <span className="truncate">{item.substance.flavor_profile}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {item.has_smelled && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("smelled") || "Smelled"}
                        </span>
                      )}
                      {item.has_tasted && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("tasted") || "Tasted"}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromQueue(item.substance_id);
                    }}
                    disabled={removingSubstanceId === item.substance_id}
                  >
                    {removingSubstanceId === item.substance_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

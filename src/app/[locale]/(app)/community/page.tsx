"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
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
import { Input } from "@/app/[locale]/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/[locale]/components/ui/select";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";
import {
  FlaskConical,
  Users,
  Search,
  Filter,
  Beaker,
  Sparkles,
  Droplet,
  X,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout";
import {
  getCommunityFlavors,
  type CommunityFlavor,
  type CommunityFilters,
} from "@/actions/dashboard";
import { getCategories, type CategoryWithDetails } from "@/actions/categories";

function FlavorCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}

function CommunityFlavorCard({ flavor }: { flavor: CommunityFlavor }) {
  const t = useTranslations("Community");

  const getProjectIcon = (type: string) => {
    switch (type) {
      case "perfume":
        return <Sparkles className="h-3 w-3" />;
      case "cosmetic":
        return <Droplet className="h-3 w-3" />;
      default:
        return <FlaskConical className="h-3 w-3" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate">{flavor.name}</CardTitle>
          <Badge variant="secondary" className="gap-1 flex-shrink-0 ml-2">
            {getProjectIcon(flavor.project_type)}
            {t(`projectType.${flavor.project_type}`)}
          </Badge>
        </div>
        {flavor.description && (
          <CardDescription className="line-clamp-2">
            {flavor.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {flavor.username}
          </span>
          <span className="flex items-center gap-1">
            <Beaker className="h-4 w-4" />
            {flavor.substance_count} {t("substances")}
          </span>
          {flavor.category_name && (
            <Badge variant="outline" className="text-xs">
              {flavor.category_name}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-3">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/formulas/${flavor.formula_id}`}>
            {t("viewFormula")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CommunityPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const t = useTranslations("Community");
  const [flavors, setFlavors] = useState<CommunityFlavor[]>([]);
  const [categories, setCategories] = useState<CategoryWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CommunityFilters>({});
  const [searchInput, setSearchInput] = useState("");

  const fetchData = useCallback(async (currentFilters: CommunityFilters) => {
    try {
      setIsLoading(true);
      const data = await getCommunityFlavors(24, currentFilters);
      setFlavors(data);
    } catch (error) {
      console.error("Error fetching community flavors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    if (isSessionPending) return;
    if (session) {
      fetchData(filters);
      fetchCategories();
    }
  }, [session, isSessionPending, fetchData, fetchCategories, filters]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput || undefined }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: value === "all" ? undefined : Number(value),
    }));
  };

  const handleProjectTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      projectType: value === "all" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchInput("");
  };

  const hasActiveFilters =
    filters.categoryId || filters.projectType || filters.search;

  if (isSessionPending || !session) return null;

  return (
    <PageContainer>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select
              value={filters.categoryId?.toString() || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t("allCategories")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.projectType || "all"}
              onValueChange={handleProjectTypeChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t("allTypes")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTypes")}</SelectItem>
                <SelectItem value="flavor">
                  <span className="flex items-center gap-2">
                    <FlaskConical className="h-3 w-3" />
                    {t("projectType.flavor")}
                  </span>
                </SelectItem>
                <SelectItem value="perfume">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    {t("projectType.perfume")}
                  </span>
                </SelectItem>
                <SelectItem value="cosmetic">
                  <span className="flex items-center gap-2">
                    <Droplet className="h-3 w-3" />
                    {t("projectType.cosmetic")}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                {t("clearFilters")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FlavorCardSkeleton />
          <FlavorCardSkeleton />
          <FlavorCardSkeleton />
          <FlavorCardSkeleton />
          <FlavorCardSkeleton />
          <FlavorCardSkeleton />
        </div>
      ) : flavors.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {t("showingResults", { count: flavors.length })}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flavors.map((flavor) => (
              <CommunityFlavorCard key={flavor.formula_id} flavor={flavor} />
            ))}
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("noResults")}</h2>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters ? t("noResultsFiltered") : t("noResultsEmpty")}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              {t("clearFilters")}
            </Button>
          )}
        </Card>
      )}
    </PageContainer>
  );
}

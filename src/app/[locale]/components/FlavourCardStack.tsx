"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/[locale]/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { MoreHorizontal, Layers, Share2, Users, Star, GitCompare } from "lucide-react";
import type { FlavourWithAccess } from "@/actions/flavours";
import type { FlavourGroup } from "@/lib/groupFlavours";

// Source Badge Component - only show for shared/workspace, not for own
function SourceBadge({ flavour }: { flavour: FlavourWithAccess }) {
  switch (flavour.access_source) {
    case "own":
      return null;
    case "shared":
      return (
        <Badge variant="outline" className="text-[10px] gap-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
          <Share2 className="h-3 w-3" />
          {flavour.shared_by_username || "Shared"}
        </Badge>
      );
    case "workspace":
      return (
        <Badge variant="outline" className="text-[10px] gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
          <Users className="h-3 w-3" />
          {flavour.workspace_name || "Workspace"}
        </Badge>
      );
  }
}

const getStatusBadgeClasses = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "draft":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "archived":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
};

export type FlavourCardTranslations = {
  showProfile: string;
  noDescription: string;
  public: string;
  private: string;
  category: string;
  none: string;
  view: string;
  edit: string;
  duplicate: string;
  delete: string;
  version: string;
  save: string;
  intensity: string;
};

type FlavourCardStackProps = {
  group: FlavourGroup;
  translations: FlavourCardTranslations;
  onDuplicate: (flavourId: number) => void;
  onDelete: (flavour: FlavourWithAccess) => void;
};

export function FlavourCardStack({ group, translations, onDuplicate, onDelete }: FlavourCardStackProps) {
  const router = useRouter();
  const hasVariations = group.variationCount > 1;
  const flavour = group.mainFlavour;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            <Link href={`/flavours/${flavour.flavour_id}`} className="hover:underline">
              {flavour.name}
            </Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/flavours/${flavour.flavour_id}`)}>
                {translations.view}
              </DropdownMenuItem>
              {flavour.can_edit && (
                <DropdownMenuItem onClick={() => router.push(`/flavours/${flavour.flavour_id}/edit`)}>
                  {translations.edit}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(flavour.flavour_id)}>
                {translations.duplicate}
              </DropdownMenuItem>
              {flavour.access_source === "own" && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(flavour)}
                >
                  {translations.delete}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <SourceBadge flavour={flavour} />
          <span className="text-xs text-muted-foreground">v{flavour.version}</span>
          {flavour.variation_label && (
            <Badge variant="secondary" className="text-xs">
              {flavour.variation_label}
            </Badge>
          )}
          {/* Variations dropdown */}
          {hasVariations && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs gap-1">
                  <Layers className="h-3 w-3" />
                  {group.variationCount}
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {group.variations.map((variation) => (
                  <DropdownMenuItem
                    key={variation.flavour_id}
                    onClick={() => router.push(`/flavours/${variation.flavour_id}`)}
                    className="flex items-center gap-2"
                  >
                    {variation.is_main_variation && <Star className="h-3 w-3 text-yellow-500" />}
                    <span className="flex-1">{variation.variation_label || variation.name}</span>
                    <span className="text-xs text-muted-foreground">v{variation.version}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(`/flavours/${flavour.flavour_id}/compare`)}
                  className="flex items-center gap-2"
                >
                  <GitCompare className="h-3 w-3" />
                  Compare all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">{flavour.description || translations.noDescription}</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClasses(flavour.status || "draft")}`}>
              {(flavour.status || "draft").charAt(0).toUpperCase() + (flavour.status || "draft").slice(1)}
            </span>
            <Badge variant="outline">{flavour.is_public ? translations.public : translations.private}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          <span className="font-medium">{translations.category}:</span> {flavour.category_id || translations.none}
        </div>
      </CardFooter>
    </Card>
  );
}

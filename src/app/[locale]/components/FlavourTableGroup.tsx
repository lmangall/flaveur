"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/[locale]/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import { Badge } from "@/app/[locale]/components/ui/badge";
import { TableCell, TableRow } from "@/app/[locale]/components/ui/table";
import { MoreHorizontal, ChevronDown, ChevronRight, Share2, Users } from "lucide-react";
import type { FlavourWithAccess } from "@/actions/flavours";
import type { FlavourGroup } from "@/lib/groupFlavours";
import type { FlavourCardTranslations } from "./FlavourCardStack";

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

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "published":
      return "success" as const;
    case "draft":
      return "warning" as const;
    case "archived":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
};

type FlavourTableGroupProps = {
  group: FlavourGroup;
  translations: FlavourCardTranslations;
  onDuplicate: (flavourId: number) => void;
  onDelete: (flavour: FlavourWithAccess) => void;
};

// Single row for a flavour
function FlavourTableRow({
  flavour,
  translations,
  onDuplicate,
  onDelete,
  isVariation = false,
  isLast = false,
}: {
  flavour: FlavourWithAccess;
  translations: FlavourCardTranslations;
  onDuplicate: (flavourId: number) => void;
  onDelete: (flavour: FlavourWithAccess) => void;
  isVariation?: boolean;
  isLast?: boolean;
}) {
  const router = useRouter();

  return (
    <TableRow className={isVariation ? "bg-muted/30" : ""}>
      <TableCell className={isVariation ? "relative pl-8" : ""}>
        {isVariation && (
          <>
            {/* Tree connector lines */}
            <div
              className="absolute left-4 top-0 w-px bg-border"
              style={{ height: isLast ? "50%" : "100%" }}
            />
            <div className="absolute left-4 top-1/2 w-3 h-px bg-border" />
          </>
        )}
        <div className="flex items-center gap-2">
          <Link href={`/flavours/${flavour.flavour_id}`} className="font-medium hover:underline">
            {flavour.name}
          </Link>
          {isVariation && flavour.variation_label && (
            <Badge variant="secondary" className="text-xs">
              {flavour.variation_label}
            </Badge>
          )}
        </div>
        {flavour.description && (
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{flavour.description}</p>
        )}
      </TableCell>
      <TableCell>
        <SourceBadge flavour={flavour} />
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(flavour.status || "draft")}>
          {(flavour.status || "draft").charAt(0).toUpperCase() + (flavour.status || "draft").slice(1)}
        </Badge>
      </TableCell>
      <TableCell>v{flavour.version}</TableCell>
      <TableCell className="text-right">
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
      </TableCell>
    </TableRow>
  );
}

export function FlavourTableGroup({ group, translations, onDuplicate, onDelete }: FlavourTableGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const hasVariations = group.variationCount > 1;
  const otherVariations = group.variations.filter((v) => v.flavour_id !== group.mainFlavour.flavour_id);

  if (!hasVariations) {
    // Single flavour, no expansion needed
    return (
      <FlavourTableRow
        flavour={group.mainFlavour}
        translations={translations}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    );
  }

  return (
    <>
      {/* Main row with expand toggle */}
      <TableRow className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <Link
              href={`/flavours/${group.mainFlavour.flavour_id}`}
              className="font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {group.mainFlavour.name}
            </Link>
            {group.mainFlavour.variation_label && (
              <Badge variant="secondary" className="text-xs">
                {group.mainFlavour.variation_label}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs gap-1">
              +{group.variationCount - 1} variation{group.variationCount > 2 ? "s" : ""}
            </Badge>
          </div>
          {group.mainFlavour.description && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px] ml-8">
              {group.mainFlavour.description}
            </p>
          )}
        </TableCell>
        <TableCell>
          <SourceBadge flavour={group.mainFlavour} />
        </TableCell>
        <TableCell>
          <Badge variant={getStatusBadgeVariant(group.mainFlavour.status || "draft")}>
            {(group.mainFlavour.status || "draft").charAt(0).toUpperCase() +
              (group.mainFlavour.status || "draft").slice(1)}
          </Badge>
        </TableCell>
        <TableCell>v{group.mainFlavour.version}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/flavours/${group.mainFlavour.flavour_id}`)}>
                {translations.view}
              </DropdownMenuItem>
              {group.mainFlavour.can_edit && (
                <DropdownMenuItem
                  onClick={() => router.push(`/flavours/${group.mainFlavour.flavour_id}/edit`)}
                >
                  {translations.edit}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(group.mainFlavour.flavour_id)}>
                {translations.duplicate}
              </DropdownMenuItem>
              {group.mainFlavour.access_source === "own" && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(group.mainFlavour)}
                >
                  {translations.delete}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Expanded variation rows */}
      {isExpanded &&
        otherVariations.map((variation, index) => (
          <FlavourTableRow
            key={variation.flavour_id}
            flavour={variation}
            translations={translations}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            isVariation
            isLast={index === otherVariations.length - 1}
          />
        ))}
    </>
  );
}

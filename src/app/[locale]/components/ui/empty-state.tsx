"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";
import { Button } from "./button";
import {
  FlaskConical,
  FolderOpen,
  Search,
  Users,
  FileText,
  Inbox,
  Share2,
  Star,
  Globe,
  Bell,
  type LucideIcon,
} from "lucide-react";

const illustrations: Record<string, LucideIcon> = {
  flavors: FlaskConical,
  folder: FolderOpen,
  search: Search,
  users: Users,
  documents: FileText,
  inbox: Inbox,
  share: Share2,
  favorites: Star,
  public: Globe,
  notifications: Bell,
};

interface EmptyStateProps {
  icon?: keyof typeof illustrations | LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const IconComponent =
    typeof icon === "string" ? illustrations[icon] || Inbox : icon;

  const sizeClasses = {
    sm: {
      container: "py-8 px-4",
      iconWrapper: "h-12 w-12",
      icon: "h-6 w-6",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-12 px-6",
      iconWrapper: "h-16 w-16",
      icon: "h-8 w-8",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16 px-8",
      iconWrapper: "h-20 w-20",
      icon: "h-10 w-10",
      title: "text-xl",
      description: "text-base",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-lg border border-dashed bg-muted/30",
        sizes.container,
        className
      )}
    >
      {/* Animated icon container */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-muted/50 mb-4",
          sizes.iconWrapper
        )}
      >
        {/* Subtle pulse ring */}
        <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent" />
        <IconComponent
          className={cn("text-muted-foreground relative z-10", sizes.icon)}
        />
      </div>

      {/* Content */}
      <h3 className={cn("font-semibold text-foreground mb-1", sizes.title)}>
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-muted-foreground max-w-sm mb-4",
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={size === "sm" ? "sm" : "default"}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="ghost"
              size={size === "sm" ? "sm" : "default"}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized empty states for common use cases
export function EmptyFlavors({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <EmptyState
      icon="flavors"
      title="No flavors yet"
      description="Start creating your first flavor composition to see it here."
      action={{
        label: "Create your first flavor",
        onClick: onCreateClick,
      }}
    />
  );
}

export function EmptySearchResults({
  query,
  onClearClick,
}: {
  query?: string;
  onClearClick?: () => void;
}) {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description={
        query
          ? `We couldn't find anything matching "${query}". Try different keywords.`
          : "No items match your current filters."
      }
      action={
        onClearClick
          ? {
              label: "Clear filters",
              onClick: onClearClick,
              variant: "outline",
            }
          : undefined
      }
      size="sm"
    />
  );
}

export function EmptySharedWithMe() {
  return (
    <EmptyState
      icon="share"
      title="Nothing shared with you"
      description="When someone shares a flavor with you, it will appear here."
      size="sm"
    />
  );
}

export function EmptyFavorites({
  onBrowseClick,
}: {
  onBrowseClick: () => void;
}) {
  return (
    <EmptyState
      icon="favorites"
      title="No favorites yet"
      description="Mark flavors as favorites to quickly access them here."
      action={{
        label: "Browse flavors",
        onClick: onBrowseClick,
        variant: "outline",
      }}
      size="sm"
    />
  );
}

export function EmptyPublicFlavors({
  onManageClick,
}: {
  onManageClick: () => void;
}) {
  return (
    <EmptyState
      icon="public"
      title="No public flavors"
      description="Make a flavor public to share it with the community."
      action={{
        label: "Manage flavors",
        onClick: onManageClick,
        variant: "outline",
      }}
      size="sm"
    />
  );
}

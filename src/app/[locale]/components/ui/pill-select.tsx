"use client";

import { Badge } from "@/app/[locale]/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/[locale]/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PillSelectOption {
  value: string;
  label: string;
  className?: string;
}

interface PillSelectProps {
  value: string | null | undefined;
  options: readonly PillSelectOption[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  unassignedLabel?: string;
  allowUnassign?: boolean;
  disabled?: boolean;
  size?: "sm" | "default";
  getOptionClassName?: (value: string) => string;
}

export function PillSelect({
  value,
  options,
  onChange,
  placeholder = "-",
  unassignedLabel = "-",
  allowUnassign = true,
  disabled = false,
  size = "sm",
  getOptionClassName,
}: PillSelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;
  const optionClassName = value && getOptionClassName ? getOptionClassName(value) : "";

  if (disabled) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          size === "sm" && "px-2 py-0.5",
          optionClassName
        )}
      >
        {displayLabel}
      </Badge>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer hover:bg-muted transition-colors",
            size === "sm" && "px-2 py-0.5 text-xs",
            !value && "text-muted-foreground",
            optionClassName
          )}
        >
          {displayLabel}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[120px]">
        {allowUnassign && (
          <DropdownMenuItem
            onClick={() => onChange(null)}
            className={cn(!value && "bg-muted")}
          >
            {unassignedLabel}
          </DropdownMenuItem>
        )}
        {options.map((option) => {
          const itemClassName = getOptionClassName ? getOptionClassName(option.value) : option.className;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                value === option.value && "bg-muted",
                itemClassName
              )}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

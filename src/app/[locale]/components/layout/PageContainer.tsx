import { cn } from "@/app/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "6xl": "max-w-6xl",
  full: "max-w-full",
};

export function PageContainer({
  children,
  maxWidth = "full",
  className,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 md:px-6 py-8 space-y-6",
        maxWidth !== "full" && maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}

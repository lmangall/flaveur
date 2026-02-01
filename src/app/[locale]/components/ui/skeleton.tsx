import { cn } from "@/app/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted/80 relative overflow-hidden",
        "after:absolute after:inset-0",
        "after:bg-[linear-gradient(90deg,transparent_0%,hsl(var(--foreground)/0.08)_50%,transparent_100%)]",
        "after:bg-size-[200%_100%]",
        "after:animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

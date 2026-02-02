import { Skeleton } from "@/app/[locale]/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-background to-pink-50/50 dark:from-amber-950/20 dark:via-background dark:to-pink-950/20" />

        <div className="container relative mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <Skeleton className="h-8 w-48 rounded-full mb-6" />

            {/* Title */}
            <Skeleton className="h-14 w-3/4 mb-4" />

            {/* Subtitle */}
            <Skeleton className="h-7 w-2/3" />
          </div>

          {/* Search Bar Skeleton */}
          <div className="mt-10 max-w-2xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink/10 to-amber-500/10 rounded-2xl blur-xl opacity-30" />
              <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
                <Skeleton className="flex-1 h-12 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-12 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Results count */}
        <Skeleton className="h-5 w-48 mb-8" />

        {/* Featured Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-7 w-48" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-7 w-4/5" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Positions Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-7 w-36" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-6 p-5 rounded-xl border border-border/40 bg-card/50"
              >
                {/* Company Avatar */}
                <Skeleton className="hidden sm:block h-12 w-12 rounded-xl shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="hidden sm:block h-4 w-24" />
                    <Skeleton className="hidden md:block h-4 w-20" />
                  </div>
                </div>

                {/* Tags */}
                <div className="hidden lg:flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Arrow */}
                <Skeleton className="h-5 w-5 shrink-0" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

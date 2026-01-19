import { Skeleton } from "@/app/[locale]/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Settings cards */}
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-64" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

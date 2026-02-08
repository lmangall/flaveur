import { PageContainer } from "@/components/layout";
import { PageHeaderSkeleton, CardGridSkeleton } from "@/app/[locale]/components/ui/skeleton-patterns";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";

export default function FormulasLoading() {
  return (
    <PageContainer>
      <PageHeaderSkeleton />

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Skeleton className="h-10 w-full sm:w-80" />
        <div className="flex items-center gap-2 ml-auto">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>

      <CardGridSkeleton count={6} />
    </PageContainer>
  );
}

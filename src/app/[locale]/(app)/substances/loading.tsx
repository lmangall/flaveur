import { PageContainer } from "@/components/layout";
import { PageHeaderSkeleton, TableSkeleton } from "@/app/[locale]/components/ui/skeleton-patterns";
import { Skeleton } from "@/app/[locale]/components/ui/skeleton";

export default function SubstancesLoading() {
  return (
    <PageContainer>
      <PageHeaderSkeleton />

      {/* Search */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-32" />
      </div>

      <TableSkeleton rows={10} columns={5} />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </PageContainer>
  );
}

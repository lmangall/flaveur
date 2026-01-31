import { SidebarSkeleton } from "@/app/[locale]/components/ui/skeleton-patterns";

export default function AppLoading() {
  return (
    <div className="flex h-screen">
      <SidebarSkeleton />
      <div className="flex-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
          <div className="h-64 w-full bg-muted rounded mt-8" />
        </div>
      </div>
    </div>
  );
}

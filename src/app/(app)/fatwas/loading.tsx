import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the fatwa archive composition.
 *
 * Block for block with the real page, so nothing shifts when the rulings land:
 * the masthead, the four tiles, the search-and-filter panel, the pinned pair, and
 * then the list rows, which are the height of `FatwaCard layout="list"`.
 */
export default function FatwasLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-panel sm:h-36" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-panel" />
        ))}
      </div>

      <div className="space-y-4 rounded-panel border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
        <div className="space-y-3 border-t border-border pt-4">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-48" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-panel" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-panel border border-border bg-surface p-5">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <div className="flex items-center gap-3 border-t border-border pt-3.5">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

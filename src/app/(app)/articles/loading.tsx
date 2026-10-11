import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the article archive.
 *
 * The reads behind this page are three API calls, so the gap before content
 * arrives is real and worth filling — and it has to match the finished layout
 * block for block, because a skeleton that does not is a page that jumps the
 * moment it loads. So: masthead, four stat tiles, the filter panel, the featured
 * piece, then cards on the same grid the real ones use.
 */
export default function ArticlesLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-panel sm:h-36" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-panel" />
        ))}
      </div>

      <div className="space-y-4 rounded-panel border border-border bg-surface p-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-56 rounded-panel" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-panel border border-border bg-surface">
              <Skeleton className="h-36 rounded-none" />
              <div className="space-y-2.5 p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <div className="flex items-center gap-2.5 pt-3">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <Skeleton className="h-3.5 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

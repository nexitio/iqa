import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the scholar directory.
 *
 * The reads behind this page are four API calls, so the gap is real and worth
 * filling — and it has to match the finished layout block for block, because a
 * skeleton that does not is a page that jumps the moment it loads. So: masthead,
 * the four contribution tiles, the directory's search bar and chip rails, the grid
 * of scholar cards, then the responder list beside its rail.
 */
export default function ScholarsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-panel sm:h-36" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-panel" />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-11 w-full rounded-xl lg:max-w-md" />
          <Skeleton className="h-9 w-56 rounded-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-panel border border-border bg-surface p-5">
              <div className="flex items-start gap-3.5">
                <Skeleton className="size-12 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="mt-3.5 h-3.5 w-full" />
              <Skeleton className="mt-2 h-3.5 w-5/6" />
              <Skeleton className="mt-3.5 h-12 w-full rounded-card" />
              <div className="mt-3.5 flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-xl" />
                <Skeleton className="h-9 flex-1 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="rounded-panel border border-border bg-surface px-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3.5 py-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-7 w-16 rounded-lg" />
              </div>
            ))}
          </div>
          <Skeleton className="h-3 w-full max-w-md" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="rounded-panel border border-border bg-surface p-5">
              <Skeleton className="h-4 w-36" />
              <div className="mt-4 space-y-4">
                {Array.from({ length: 4 }, (_, j) => (
                  <div key={j} className="flex items-center gap-3.5">
                    <Skeleton className="size-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

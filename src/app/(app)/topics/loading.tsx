import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the topic index.
 *
 * Two reads stand between the reader and the vocabulary — the topics and the
 * departments — so the gap is real. Block for block, or the page jumps the moment
 * it arrives: masthead, the three stat tiles, the explorer's search row and
 * department rail, the trending panel, then the grouped topic lists beside the
 * name-side rail.
 */
export default function TopicsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-panel sm:h-36" />

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-panel" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <Skeleton className="h-11 rounded-xl lg:max-w-md lg:flex-1" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>

          <div className="space-y-4 rounded-panel border border-border bg-surface p-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-9 w-28 rounded-full" />
              ))}
            </div>
          </div>

          {/* The grouped lists: a heading row per department, then its chips. */}
          {Array.from({ length: 2 }, (_, group) => (
            <div key={group} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-8 shrink-0 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-8 w-32 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-32" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>

          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-36" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

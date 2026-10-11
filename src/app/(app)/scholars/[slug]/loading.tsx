import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the scholar profile.
 *
 * Block for block, or the page visibly reflows the moment the profile arrives:
 * masthead with its badge row and stat bar, then the reading column — bio card,
 * biography, credentials, the tabbed body of work — beside a rail of three cards.
 * The proportions match the real thing, so the shift from skeleton to profile is a
 * fade rather than a jump.
 */
export default function ScholarLoading() {
  return (
    <div className="space-y-6">
      <div className="rounded-panel border border-border bg-surface p-5 shadow-card sm:p-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-6 w-64" />
        <Skeleton className="mt-3 h-3.5 w-full max-w-xl" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-6 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="mt-4 h-14 max-w-2xl rounded-card" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-24" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className={i % 3 === 2 ? "h-3.5 w-4/5" : "h-3.5 w-full"} />
              ))}
            </div>
            <div className="mt-6 space-y-2.5">
              <Skeleton className="h-3 w-28" />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-7 w-24 rounded-full" />
                ))}
              </div>
            </div>
            <div className="mt-6 space-y-2.5">
              <Skeleton className="h-3 w-20" />
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-8 w-28 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-7 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-72 rounded-full" />
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="rounded-panel border border-border bg-surface p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-panel border border-border bg-surface p-5 shadow-card">
              <Skeleton className="h-4 w-32" />
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: i === 0 ? 3 : 4 }, (_, j) => (
                  <Skeleton key={j} className={j % 2 === 0 ? "h-3.5 w-40" : "h-3.5 w-28"} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

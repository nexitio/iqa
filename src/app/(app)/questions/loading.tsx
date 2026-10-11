import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the Q&A index.
 *
 * The page behind this is a dozen API reads — the archive, four status totals, the
 * answers rail and the taxonomy — so the gap before content arrives is real, and
 * the skeleton has to match the finished layout block for block or the page jumps
 * the moment the questions land. So: masthead, the five status figures the header
 * states, the status/department filter panel, then question cards on the same list
 * rhythm the real rows use.
 */
export default function QuestionsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 rounded-panel sm:h-40" />

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-panel border border-border bg-surface p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Skeleton className="h-6 w-40 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="mt-4 h-4 w-3/5" />
              <Skeleton className="mt-2.5 h-3.5 w-full" />
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-24" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="h-3 w-56" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-28 rounded-panel" />
            ))}
          </div>
        </div>
        <Skeleton className="h-56 rounded-panel" />
      </div>
    </div>
  );
}

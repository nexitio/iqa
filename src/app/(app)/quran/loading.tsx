import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the Qur'an index composition.
 *
 * It has to match the real layout block for block, or the page visibly reflows
 * the moment content arrives — which is the one thing a skeleton exists to
 * prevent. So: slim masthead, chip rail, sticky toolbar, then list rows of the
 * same height and rhythm as `SurahListRow`.
 */
export default function QuranLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-40 rounded-panel sm:h-36" />

      <div className="space-y-2.5">
        <Skeleton className="h-5 w-32" />
        <div className="no-scrollbar flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-32 shrink-0 rounded-full" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />

        <div className="flex flex-wrap items-center gap-2 rounded-panel border border-border bg-surface p-2.5">
          <Skeleton className="h-9 min-w-[11rem] flex-1 rounded-xl" />
          <Skeleton className="h-9 w-44 rounded-full" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>

        <Skeleton className="h-4 w-56" />

        <div className="overflow-hidden rounded-panel border border-border bg-surface">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-border px-3.5 py-2.5 last:border-b-0"
            >
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="hidden h-3 w-16 sm:block" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

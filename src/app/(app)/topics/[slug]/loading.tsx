import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors one topic page.
 *
 * This page fans out into a section per content kind, so its gap is the longest
 * one in the section — and a skeleton that did not match would hand the reader a
 * jump at the end of it. So: masthead with its badge row, then the content column
 * — questions, articles, rulings, hadith, threads — beside the rail.
 */
export default function TopicLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-panel sm:h-36" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {[3, 2, 2].map((rows, block) => (
            <div key={block} className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="rounded-panel border border-border bg-surface p-2">
                {Array.from({ length: rows }, (_, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5">
                    <Skeleton className="size-8 shrink-0 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-40" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>

          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-9 w-full rounded-xl" />
            <Skeleton className="mt-2 h-9 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}

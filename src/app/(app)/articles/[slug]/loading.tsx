import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the article page's composition.
 *
 * Block for block, or the page visibly reflows the moment the article arrives:
 * masthead, cover band, then the reading column — byline card, body, evidence —
 * beside a rail of two cards. The proportions match the real thing, so the shift
 * from skeleton to article is a fade rather than a jump.
 */
export default function ArticleLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-panel sm:h-36" />
      <Skeleton className="h-40 rounded-panel sm:h-56" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>

          <div className="rounded-panel border border-border bg-surface p-5 shadow-card sm:p-8">
            <div className="space-y-3">
              <Skeleton className="h-6 w-52" />
              {Array.from({ length: 9 }, (_, i) => (
                <Skeleton key={i} className={i % 3 === 2 ? "h-3.5 w-4/5" : "h-3.5 w-full"} />
              ))}
              <Skeleton className="h-24 w-full rounded-xl" />
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className={i === 4 ? "h-3.5 w-2/3" : "h-3.5 w-full"} />
              ))}
            </div>
          </div>

          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-48" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="rounded-xl border border-border p-4">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="mt-2.5 h-4 w-full" />
                  <Skeleton className="mt-2 h-3 w-3/5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className={i % 2 === 0 ? "h-3 w-40" : "h-3 w-28"} />
              ))}
            </div>
          </div>

          <div className="rounded-panel border border-border bg-surface p-5 shadow-card">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="mt-4 h-9 w-full rounded-xl" />
          </div>
        </aside>
      </div>
    </div>
  );
}

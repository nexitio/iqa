import { Skeleton } from "@/components/ui";

/**
 * Loading state that mirrors the question page.
 *
 * Block for block, or the page visibly reflows when the question arrives:
 * breadcrumb, the question card with its status strip, the answers section, and the
 * rail of three cards. The proportions match the real thing so the swap reads as a
 * fade rather than a jump.
 */
export default function QuestionLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-20" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-4 py-3 sm:px-5">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="ml-auto h-3 w-24" />
            </div>
            <div className="p-4 sm:p-5">
              <Skeleton className="h-6 w-full max-w-md" />
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {Array.from({ length: 2 }, (_, i) => (
                  <Skeleton key={i} className="h-7 w-24 rounded-full" />
                ))}
              </div>
              <div className="mt-5 space-y-3 border-t border-border pt-5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className={i === 4 ? "h-3.5 w-2/3" : "h-3.5 w-full"} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-56" />
          </div>

          <div className="space-y-5">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
                <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
                  <Skeleton className="size-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-3 p-4 sm:p-5">
                  {Array.from({ length: 4 }, (_, line) => (
                    <Skeleton key={line} className={line === 3 ? "h-3.5 w-3/5" : "h-3.5 w-full"} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="rounded-panel border border-border bg-surface p-5 shadow-card">
              <Skeleton className="h-4 w-36" />
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 3 }, (_, line) => (
                  <Skeleton key={line} className={line % 2 === 0 ? "h-3 w-40" : "h-3 w-28"} />
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

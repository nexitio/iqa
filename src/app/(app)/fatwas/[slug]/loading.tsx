import { Skeleton } from "@/components/ui";

/**
 * Loading state for one ruling.
 *
 * The fatwa is read from the API before anything can be drawn, so this mirrors the
 * page block for block — masthead, the ruling panel that leads it, the question
 * card, the body, then the mufti card and the reading rail — because a skeleton
 * that does not match the real layout makes the page jump the moment the ruling
 * arrives, which is the one thing it exists to prevent.
 */
export default function FatwaDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Masthead: eyebrow, title, description, actions. */}
      <div className="space-y-3 rounded-panel border border-border bg-surface p-5 sm:p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {/* The ruling panel. */}
          <div className="rounded-panel border border-primary/20 bg-primary-soft/40 p-5 sm:p-6">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-5/6" />
            <div className="mt-4 flex gap-4 border-t border-primary/20 pt-4">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>

          {/* The question card. */}
          <div className="rounded-panel border border-border bg-surface-2 p-5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
            <div className="mt-3.5 flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          </div>

          {/* The body, at the height of a ruling with analysis. */}
          <div className="space-y-3 rounded-panel border border-border bg-surface p-5 sm:p-8">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-3.5 w-10/12" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>

          {/* The mufti, with credentials and facts. */}
          <div className="rounded-panel border border-border bg-surface p-5">
            <div className="flex items-start gap-3.5">
              <Skeleton className="size-14 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3.5 w-full max-w-lg" />
                <Skeleton className="h-5 w-32 rounded-full" />
              </div>
            </div>
            <div className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-44" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Reading rail. */}
        <aside className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-panel border border-border bg-surface p-5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

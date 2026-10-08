"use client";

import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/data/personal";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime } from "@/lib/utils";
import { CountPill } from "@/components/ui";
import { NotificationKindIcon } from "@/components/personal/notification-item";

/**
 * The bell's dropdown.
 *
 * Before this the bell was a link: the only way to learn what had happened was
 * to leave the page you were reading. The panel answers the question in place —
 * what arrived, from which kind of event, how long ago — and the full page is
 * still one click away for the archive.
 *
 * Read state is owned by `Topbar` (it also drives the badge on the trigger),
 * so this component stays presentational.
 */
export function NotificationMenu({
  read,
  unread,
  onRead,
  onMarkAllRead,
  onClose,
}: {
  read: Record<string, boolean>;
  unread: number;
  onRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  const { t, locale } = useI18n();

  // Sorted here rather than trusting the dataset's order, so "most recent
  // first" is a property of the panel and not of how the fixture was written.
  const recent = [...NOTIFICATIONS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div
      role="dialog"
      aria-label={t("nav.notifications")}
      /*
        Below `sm` the panel is a sheet under the header instead of a card
        hanging off the bell. Anchored to a 36px trigger near the right edge, a
        22rem panel has nowhere to go on a phone — it ran off the *left* of the
        screen, and further in the consoles, where the bell is not the rightmost
        control. `fixed` is safe because this panel's only home is a sticky,
        viewport-wide header: the containing block a header's backdrop-filter
        creates is the header itself, which is the thing the sheet hangs from.
      */
      className="fixed inset-x-4 top-14 z-50 mt-2 animate-scale-in overflow-hidden rounded-panel border border-border bg-surface shadow-overlay sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-[22rem] sm:max-w-[calc(100vw-2rem)]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2 px-3.5 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[0.875rem] font-semibold text-foreground">
            {t("nav.notifications")}
          </p>
          {unread > 0 ? <CountPill value={unread} tone="danger" /> : null}
        </div>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={unread === 0}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[0.6875rem] font-medium text-primary transition-colors hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-45"
        >
          <CheckCheck className="size-3.5" aria-hidden />
          {t("action.markAllRead")}
        </button>
      </div>

      {recent.length === 0 ? (
        <p className="px-4 py-10 text-center text-[0.8125rem] text-muted-foreground">
          {t("state.noResults")}
        </p>
      ) : (
        <ul className="max-h-[22rem] space-y-0.5 overflow-y-auto p-1.5">
          {recent.map((notification) => {
            const isUnread = !read[notification.id];
            return (
              <li key={notification.id}>
                <Link
                  href={notification.href}
                  onClick={() => {
                    onRead(notification.id);
                    onClose();
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-3",
                    isUnread && "bg-primary-soft/30",
                  )}
                >
                  <NotificationKindIcon kind={notification.kind} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[0.8125rem] leading-snug",
                          isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                        )}
                      >
                        {notification.titleBn}
                      </span>
                      {isUnread ? (
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      ) : null}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[0.75rem] leading-relaxed text-muted-foreground">
                      {notification.bodyBn}
                    </span>
                    <span className="mt-1 block text-[0.6875rem] text-subtle-foreground">
                      {relativeTime(notification.createdAt, locale)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="border-t border-border p-1.5">
        <Link
          href="/notifications"
          onClick={onClose}
          className="flex items-center justify-center rounded-xl px-3 py-2 text-[0.8125rem] font-medium text-primary transition-colors hover:bg-primary-soft"
        >
          {t("action.viewAll")}
        </Link>
      </div>
    </div>
  );
}

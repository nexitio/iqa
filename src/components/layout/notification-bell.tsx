"use client";

import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/data/personal";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useDismissable } from "@/lib/use-dismissable";
import { NotificationMenu } from "./notification-menu";

/**
 * The header bell: its trigger, its dropdown, and the read state behind both.
 *
 * It started life inside the public `Topbar`, and the consoles grew a second,
 * dumber bell of their own — a link with a permanently lit red dot, which told
 * every reader the same thing whether or not anything had arrived. The bell is
 * now one component: the same trigger, the same panel, and the same badge that
 * counts what is actually unread, in every header that has one. Two headers
 * showing different unread counts for the same reader was the tell that this
 * belonged in one place.
 *
 * Read state lives here rather than inside the panel because the badge on the
 * trigger and the list inside the panel are two views of a single truth — marking
 * everything read has to clear the counter the reader is looking at. It seeds
 * from the fixture and stays component-local until notifications have a real
 * store, so each header keeps its own copy; `onUnreadChange` exists for a host
 * that mirrors the count elsewhere (the public header's account menu does).
 *
 * `open` is optional on purpose. A host that has to coordinate this panel with
 * another one controls it; a host that does not leaves it alone. Everything else
 * — the badge, dismissal, the reset on navigation — is the same either way.
 */
export function NotificationBell({
  open,
  onOpenChange,
  onUnreadChange,
  className,
  triggerClassName,
}: {
  /** Controlled open state; omit to let the bell own it. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Reported whenever the unread count changes. */
  onUnreadChange?: (unread: number) => void;
  className?: string;
  triggerClassName?: string;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;
  const rootRef = useRef<HTMLDivElement>(null);

  const [read, setRead] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATIONS.map((notification) => [notification.id, notification.read])),
  );
  const unread = NOTIFICATIONS.filter((notification) => !read[notification.id]).length;

  const setOpen = (next: boolean) => {
    setOwnOpen(next);
    onOpenChange?.(next);
  };

  /** One path for every way the state can change, so the count never drifts. */
  const applyRead = (next: Record<string, boolean>) => {
    setRead(next);
    onUnreadChange?.(NOTIFICATIONS.filter((notification) => !next[notification.id]).length);
  };

  // Outside pointer-down and Escape, on the document. Not a `fixed inset-0`
  // sheet: a header's `backdrop-blur` makes it a containing block for fixed
  // descendants, so such a sheet only ever covers the bar itself.
  useDismissable(isOpen, () => setOpen(false), (target) =>
    Boolean(rootRef.current?.contains(target)),
  );

  // A route change closes the panel. Only the bell's own state is reset here —
  // a host that controls `open` resets it alongside its other overlays.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (ownOpen) setOwnOpen(false);
  }

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t("nav.notifications")}
        title={t("nav.notifications")}
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground",
          isOpen && "bg-surface-3 text-foreground",
          triggerClassName,
        )}
      >
        <Bell className="size-[1.15rem]" />
        {unread > 0 ? (
          <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-danger text-[0.5625rem] font-bold text-white ring-2 ring-surface">
            {unread}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <NotificationMenu
          read={read}
          unread={unread}
          onRead={(id) => applyRead({ ...read, [id]: true })}
          onMarkAllRead={() =>
            applyRead(Object.fromEntries(NOTIFICATIONS.map((notification) => [notification.id, true])))
          }
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}

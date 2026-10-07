"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  BellRing,
  Bookmark,
  CheckCheck,
  Info,
  MessageCircleQuestion,
  Route,
  Share2,
  ShieldAlert,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import type { AppNotification, NotificationKind } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime } from "@/lib/utils";
import { Badge, Button, Card, EmptyState, softTone, type Tone } from "@/components/ui";

/**
 * Notifications list with real local interaction.
 *
 * Read/dismiss state lives in the component until the backend exists; the
 * affordances are genuine rather than decorative, so the interaction can be
 * evaluated properly. Bengali day buckets are derived from the notification
 * timestamps instead of being hard-coded.
 */

const KIND_META: Record<NotificationKind, { icon: LucideIcon; tone: Tone; labelBn: string }> = {
  answer: { icon: MessageCircleQuestion, tone: "success", labelBn: "উত্তর" },
  mention: { icon: AtSign, tone: "info", labelBn: "উল্লেখ" },
  follow: { icon: UserPlus, tone: "primary", labelBn: "ফলো" },
  reshare: { icon: Share2, tone: "accent", labelBn: "শেয়ার" },
  moderation: { icon: ShieldAlert, tone: "warning", labelBn: "মডারেশন" },
  daily: { icon: Sparkles, tone: "primary", labelBn: "দৈনিক" },
  journey: { icon: Route, tone: "accent", labelBn: "যাত্রা" },
  system: { icon: Info, tone: "neutral", labelBn: "সিস্টেম" },
};

function bengaliDayKey(iso: string): string {
  const then = new Date(iso).getTime();
  const diffDays = Math.floor((Date.now() - then) / 86_400_000);
  if (diffDays <= 0) return "আজ";
  if (diffDays === 1) return "গতকাল";
  if (diffDays < 7) return "এই সপ্তাহে";
  if (diffDays < 30) return "এই মাসে";
  return "আগে";
}

const GROUP_ORDER = ["আজ", "গতকাল", "এই সপ্তাহে", "এই মাসে", "আগে"];

export function NotificationsList({ notifications }: { notifications: AppNotification[] }) {
  const { t, locale } = useI18n();
  const [read, setRead] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notifications.map((n) => [n.id, n.read])),
  );
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const visible = useMemo(
    () => notifications.filter((n) => !dismissed[n.id]),
    [notifications, dismissed],
  );

  const unreadIds = visible.filter((n) => !read[n.id]).map((n) => n.id);
  const unread = unreadIds.length;

  const grouped = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    for (const notification of visible) {
      const key = bengaliDayKey(notification.createdAt);
      const list = map.get(key) ?? [];
      list.push(notification);
      map.set(key, list);
    }
    return GROUP_ORDER.filter((key) => map.has(key)).map((key) => [key, map.get(key)!] as const);
  }, [visible]);

  function markAllRead() {
    setRead(Object.fromEntries(visible.map((n) => [n.id, true])));
  }

  function toggleRead(id: string) {
    setRead((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (visible.length === 0) {
    return (
      <Card flush>
        <EmptyState
          icon={BellRing}
          title="কোনো বিজ্ঞপ্তি নেই"
          description="আপনার প্রশ্নের উত্তর এলে, ফলো করা আলেম নতুন কিছু প্রকাশ করলে বা আজকের আয়াত প্রস্তুত হলে এখানে জানানো হবে।"
          action={
            <Button href="/settings" variant="outline" size="md">
              {t("settings.notifications")}
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className={cn("grid size-10 place-items-center rounded-xl", softTone.primary)}>
            <BellRing className="size-5" />
          </span>
          <div>
            <p className="text-[0.875rem] font-semibold text-foreground">
              {unread > 0 ? `${unread}টি অপঠিত বিজ্ঞপ্তি` : "সব বিজ্ঞপ্তি পড়া হয়েছে"}
            </p>
            <p className="text-[0.6875rem] text-subtle-foreground">
              মোট {visible.length}টি বিজ্ঞপ্তি দেখানো হচ্ছে
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={markAllRead}
            disabled={unread === 0}
          >
            সব পড়া হয়েছে বলে চিহ্নিত করুন
          </Button>
        </div>
      </div>

      {grouped.map(([day, items]) => (
        <section key={day}>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="font-display text-[0.9375rem] font-semibold text-foreground">{day}</h2>
            <span className="h-px flex-1 bg-border" aria-hidden />
            <Badge tone="neutral" size="xs">
              {items.length}টি
            </Badge>
          </div>

          <ul className="space-y-2.5">
            {items.map((notification) => {
              const meta = KIND_META[notification.kind];
              const Icon = meta.icon;
              const isUnread = !read[notification.id];
              return (
                <li key={notification.id}>
                  <Card
                    padding="sm"
                    className={cn(
                      "transition-colors",
                      isUnread ? "border-primary/35 bg-primary-soft/25" : undefined,
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", softTone[meta.tone])}>
                        <Icon className="size-5" aria-hidden />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={meta.tone} size="xs">
                            {meta.labelBn}
                          </Badge>
                          {isUnread ? (
                            <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-primary">
                              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                              নতুন
                            </span>
                          ) : null}
                          <span className="ml-auto shrink-0 text-[0.6875rem] text-subtle-foreground">
                            {relativeTime(notification.createdAt, locale)}
                          </span>
                        </div>

                        <Link
                          href={notification.href}
                          onClick={() => setRead((prev) => ({ ...prev, [notification.id]: true }))}
                          className="group mt-2 block"
                        >
                          <p className="text-[0.875rem] font-semibold leading-snug text-foreground group-hover:text-primary">
                            {notification.titleBn}
                          </p>
                          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                            {notification.bodyBn}
                          </p>
                        </Link>
                      </div>

                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleRead(notification.id)}
                          aria-label={isUnread ? "পড়া হয়েছে বলে চিহ্নিত করুন" : "অপঠিত হিসেবে রাখুন"}
                          title={isUnread ? "পড়া হয়েছে বলে চিহ্নিত করুন" : "অপঠিত হিসেবে রাখুন"}
                          className={cn(
                            "grid size-7 place-items-center rounded-full border transition-colors",
                            isUnread
                              ? "border-primary/40 text-primary hover:bg-primary-soft"
                              : "border-border text-subtle-foreground hover:bg-surface-3",
                          )}
                        >
                          <CheckCheck className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDismissed((prev) => ({ ...prev, [notification.id]: true }))}
                          aria-label="সরিয়ে ফেলুন"
                          title="সরিয়ে ফেলুন"
                          className="grid size-7 place-items-center rounded-full border border-border text-subtle-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="flex items-center gap-2 text-[0.75rem] text-subtle-foreground">
        <Bookmark className="size-3.5" aria-hidden />
        পড়া হয়েছে বলে চিহ্নিত করা ও সরানো এখন এই ব্রাউজারে সীমিত; অ্যাকাউন্ট যুক্ত হলে সব ডিভাইসে এক থাকবে।
      </p>
    </div>
  );
}

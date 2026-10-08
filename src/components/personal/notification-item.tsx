import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  Info,
  MessageCircleQuestion,
  Route,
  Share2,
  ShieldAlert,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type { NotificationKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { softTone, type Tone } from "@/components/ui";

/**
 * One kind table for every notification surface.
 *
 * The full page and the header dropdown render the same events, so the icon,
 * tone and label live here rather than in each of them — otherwise "moderation"
 * would quietly pick up a different colour the moment one of the two is edited.
 */
export const NOTIFICATION_KIND: Record<
  NotificationKind,
  { icon: LucideIcon; tone: Tone; labelBn: string }
> = {
  answer: { icon: MessageCircleQuestion, tone: "success", labelBn: "উত্তর" },
  mention: { icon: AtSign, tone: "info", labelBn: "উল্লেখ" },
  follow: { icon: UserPlus, tone: "primary", labelBn: "ফলো" },
  reshare: { icon: Share2, tone: "accent", labelBn: "শেয়ার" },
  moderation: { icon: ShieldAlert, tone: "warning", labelBn: "মডারেশন" },
  daily: { icon: Sparkles, tone: "primary", labelBn: "দৈনিক" },
  journey: { icon: Route, tone: "accent", labelBn: "যাত্রা" },
  system: { icon: Info, tone: "neutral", labelBn: "সিস্টেম" },
};

/** Tinted kind tile, sized for the full page (`md`) or the dropdown (`sm`). */
export function NotificationKindIcon({
  kind,
  size = "md",
}: {
  kind: NotificationKind;
  size?: "sm" | "md";
}) {
  const { icon: Icon, tone } = NOTIFICATION_KIND[kind];
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl",
        size === "sm" ? "size-8 rounded-lg" : "size-10",
        softTone[tone],
      )}
      aria-hidden
    >
      <Icon className={size === "sm" ? "size-4" : "size-5"} />
    </span>
  );
}

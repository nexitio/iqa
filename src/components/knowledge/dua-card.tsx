"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  HandHeart,
  HeartPulse,
  Home,
  LifeBuoy,
  MoonStar,
  Plane,
  Sparkles,
  Utensils,
} from "lucide-react";
import type { Dua, DuaCategory } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge, Card } from "@/components/ui";

/**
 * The icon of a dua category.
 *
 * Categories carry an icon *name* the way departments do, so the data stays
 * plain and the map lives here — one place to look when a category is added.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  MoonStar,
  Sparkles,
  Utensils,
  Plane,
  HeartPulse,
  BookOpen,
  LifeBuoy,
  Home,
};

export function duaCategoryIcon(name?: string): LucideIcon {
  return (name ? CATEGORY_ICONS[name] : undefined) ?? HandHeart;
}

/**
 * One dua, as a collapsible card.
 *
 * Native `<details>` rather than a state-driven accordion: it opens without
 * JavaScript, it is keyboard- and screen-reader-correct for free, and its
 * "expanded" semantics are the ones a reader's assistive tech already expects.
 * The copy and save buttons deliberately sit in the *body* — anything interactive
 * inside a `<summary>` hijacks the toggle.
 *
 * The Arabic leads and is never truncated, because the whole point of the card is
 * the words themselves; the meaning is a translation underneath, not a summary.
 */
export function DuaCard({
  dua,
  category,
  defaultOpen = false,
  className,
}: {
  dua: Dua;
  category?: DuaCategory;
  /** The day's dua opens itself; the rest wait for a click. */
  defaultOpen?: boolean;
  className?: string;
}) {
  const { t, pick, isBn } = useI18n();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const Icon = CATEGORY_ICONS[category?.icon ?? ""] ?? HandHeart;

  /** What lands on the clipboard is what gets sent to someone else. */
  const copy = async () => {
    const text = [
      dua.arabic,
      dua.transliterationBn,
      pick(dua.meaning),
      `${pick(dua.reference)}`,
    ].join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* the clipboard can be blocked; the state change is still honest */
    }
  };

  return (
    <Card padding="none" className={cn("overflow-hidden", className)}>
      <details className="group" open={defaultOpen}>
        <summary className="flex cursor-pointer list-none items-start gap-3 p-3.5 transition-colors hover:bg-surface-2/60 sm:p-4">
          <span
            className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
            aria-hidden
          >
            <Icon className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
              {pick(dua.title)}
            </span>
            <span className="mt-0.5 block text-[0.75rem] text-muted-foreground">
              {pick(dua.occasion)}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2 pt-1">
            {dua.repeat ? (
              <Badge tone="info" size="xs" className="hidden sm:inline-flex">
                {pick(dua.repeat)}
              </Badge>
            ) : null}
            <ChevronDown
              className="size-4 text-subtle-foreground transition-transform group-open:rotate-180"
              aria-hidden
            />
          </span>
        </summary>

        <div className="border-t border-border px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
          <p className="arabic text-right text-[1.375rem] leading-[2.1] text-foreground">
            {dua.arabic}
          </p>

          <p className="mt-3 text-[0.8125rem] italic leading-relaxed text-muted-foreground">
            {dua.transliterationBn}
          </p>

          <p className="mt-3 text-[0.9375rem] leading-loose text-foreground">{pick(dua.meaning)}</p>

          {dua.repeat ? (
            <p className="mt-2 text-[0.75rem] text-muted-foreground sm:hidden">
              {pick(dua.repeat)}
            </p>
          ) : null}

          {dua.virtue ? (
            <p className="mt-3 rounded-card bg-accent-soft/60 px-3 py-2 text-[0.8125rem] leading-relaxed text-accent-soft-foreground">
              {pick(dua.virtue)}
            </p>
          ) : null}

          <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="text-[0.75rem] font-medium text-subtle-foreground">
              {pick(dua.reference)}
            </span>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={copy}
                aria-label={t("action.copyLink")}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied ? (isBn ? "কপি হয়েছে" : "Copied") : isBn ? "কপি" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => setSaved((value) => !value)}
                aria-pressed={saved}
                aria-label={saved ? t("action.saved") : t("action.save")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-medium transition-colors",
                  saved
                    ? "border-primary/40 bg-primary-soft text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                <Bookmark className={cn("size-3.5", saved && "fill-current")} aria-hidden />
                {saved ? t("action.saved") : t("action.save")}
              </button>
            </div>
          </div>
        </div>
      </details>
    </Card>
  );
}

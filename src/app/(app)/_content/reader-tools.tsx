"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Check, Link2, Share2 } from "lucide-react";
import type { Localized } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { setStored, useStoredValue } from "@/lib/client-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import type { OutlineItem } from "./outline";

/**
 * Reading tools.
 *
 * These are the only client-side pieces of an article or fatwa page; everything
 * else — the body, the citations, the related content — renders on the server.
 */

/* ------------------------------------------------------------------ save/share */

/**
 * Save and share for a single piece of content. The saved state persists in
 * localStorage so the toggle behaves the way a reader expects while the backend
 * is still to come.
 */
export function SaveShareBar({
  /** Stable identity for persistence, e.g. the slug. */
  id,
  title,
  className,
  compact = false,
}: {
  id: string;
  /** Bilingual content title, resolved in the reader's language. */
  title: Localized | string;
  className?: string;
  compact?: boolean;
}) {
  const { t, pick } = useI18n();
  const shareTitle = typeof title === "string" ? title : pick(title);
  const storageKey = `ilm.saved.${id}`;
  // Storage is the source of truth: read through `useSyncExternalStore` rather
  // than restoring from an effect, so the toggle is correct on the first client
  // render and there is no cascading render (or hydration mismatch).
  const saved = useStoredValue(storageKey) === "1";
  const [copied, setCopied] = useState(false);

  const toggleSave = useCallback(() => {
    setStored(storageKey, saved ? "0" : "1");
  }, [storageKey, saved]);

  const flashCopied = useCallback(() => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, []);

  const copyLink = useCallback(async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      flashCopied();
    } catch {
      flashCopied();
    }
  }, [flashCopied]);

  const share = useCallback(async () => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url });
        return;
      } catch {
        /* the reader dismissed the sheet — fall through to copying */
      }
    }
    await copyLink();
  }, [copyLink, shareTitle]);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        variant={saved ? "soft" : "outline"}
        size="sm"
        icon={saved ? BookmarkCheck : Bookmark}
        onClick={toggleSave}
        aria-pressed={saved}
      >
        {saved ? t("action.saved") : t("action.save")}
      </Button>
      <Button variant="outline" size="sm" icon={Share2} onClick={share}>
        {compact ? "" : t("action.share")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={copied ? Check : Link2}
        onClick={copyLink}
        aria-live="polite"
      >
        {copied ? t("action.copied") : compact ? "" : t("action.copyLink")}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ contents */

/**
 * Table of contents for a rendered body.
 *
 * The headings are addressed by their position among the body's `h2` elements,
 * which avoids threading generated ids through the shared `Prose` renderer.
 * The active section is highlighted as the reader scrolls.
 */
export function TableOfContents({
  items,
  className,
  bodySelector = "[data-reading-body]",
}: {
  items: OutlineItem[];
  className?: string;
  bodySelector?: string;
}) {
  const { t } = useI18n();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(`${bodySelector} h2`),
    );
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!visible) return;
        const index = headings.indexOf(visible.target as HTMLElement);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 1] },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [bodySelector, items.length]);

  if (items.length < 2) return null;

  return (
    <nav aria-label={t("console.preview")} className={className}>
      <ol className="space-y-0.5 border-l border-border">
        {items.map((item, i) => (
          <li key={`${item.index}-${i}`}>
            <button
              type="button"
              onClick={() => {
                const headings = document.querySelectorAll<HTMLElement>(
                  `${bodySelector} h2`,
                );
                headings[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn(
                "-ml-px block w-full border-l-2 py-1.5 pl-3 text-left text-[0.8125rem] leading-snug transition-colors",
                i === active
                  ? "border-primary font-medium text-primary"
                  : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

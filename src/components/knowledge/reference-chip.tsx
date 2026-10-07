"use client";

import { useState } from "react";
import { BookOpen, BookMarked, ChevronDown, ScrollText, Quote } from "lucide-react";
import type { ContentReference } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge, type Tone } from "@/components/ui";

/**
 * Citation components.
 *
 * Attaching Qur'an and Hadith evidence is what separates a scholarly answer from
 * an opinion, so these components are deliberately the most authoritative-looking
 * surfaces in the product: full Arabic in a naskh face, the Bangla translation
 * beneath it, and an explicit source label that never leaves the reader guessing
 * whether they are reading revelation or narration.
 */

const SOURCE: Record<
  ContentReference["kind"],
  { tone: Tone; labelBn: string; labelEn: string; Icon: typeof BookOpen }
> = {
  ayah: { tone: "primary", labelBn: "কুরআন", labelEn: "Qur'an", Icon: BookOpen },
  hadith: { tone: "accent", labelBn: "হাদীস", labelEn: "Hadith", Icon: ScrollText },
};

/** Tiny "কুরআন" / "হাদীস" source label. */
export function ReferenceSourceBadge({
  kind,
  size = "xs",
  className,
}: {
  kind: ContentReference["kind"];
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const { isBn } = useI18n();
  const source = SOURCE[kind];
  return (
    <Badge tone={source.tone} size={size} icon={source.Icon} className={className}>
      {isBn ? source.labelBn : source.labelEn}
    </Badge>
  );
}

/** Small "৩ রেফারেন্স" pill used in card footers. */
export function ReferenceCount({ count, className }: { count: number; className?: string }) {
  const { t } = useI18n();
  return (
    <Badge tone="primary" size="xs" icon={BookMarked} className={cn("tabular", className)}>
      {count} {t("label.references")}
    </Badge>
  );
}

/**
 * A single citation pill that expands in place. Letting the reader open the
 * evidence without losing their position in the answer is the whole point of the
 * feature, so the expansion is inline rather than a modal or a new page.
 */
export function ReferenceChip({
  reference,
  className,
  defaultOpen = false,
}: {
  reference: ContentReference;
  className?: string;
  defaultOpen?: boolean;
}) {
  const { isBn } = useI18n();
  const [open, setOpen] = useState(defaultOpen);
  const source = SOURCE[reference.kind];

  return (
    <div className={cn("w-full", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "inline-flex max-w-full items-center gap-2 rounded-full border px-2.5 py-1 text-[0.75rem] font-medium transition-colors",
          reference.kind === "ayah"
            ? "border-primary/30 bg-primary-soft text-primary-soft-foreground hover:border-primary/55"
            : "border-accent/30 bg-accent-soft text-accent-soft-foreground hover:border-accent/55",
        )}
      >
        <source.Icon className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{reference.refBn}</span>
        <ChevronDown
          className={cn("size-3 shrink-0 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="mt-2 animate-fade-up rounded-xl border border-border bg-surface p-3.5 shadow-card">
          <p className="arabic text-[1.25rem] leading-[2.1] text-foreground">{reference.arabic}</p>
          <div className="my-3 h-px bg-border" />
          <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
            {reference.translationBn}
          </p>
          {reference.note ? (
            <p className="mt-2.5 border-l-2 border-primary/40 pl-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
              {reference.note}
            </p>
          ) : null}
          <p className="mt-3 text-[0.6875rem] text-subtle-foreground">
            {isBn ? source.labelBn : source.labelEn} · {reference.refBn}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The "দলিল / রেফারেন্স" block. Every answer, fatwa and article renders its
 * evidence through this component so citations look identical everywhere.
 */
export function ReferenceList({
  references,
  title,
  className,
  layout = "stack",
}: {
  references: ContentReference[];
  /** Defaults to the shared "রেফারেন্স" label. */
  title?: string;
  className?: string;
  layout?: "stack" | "compact";
}) {
  const { t, isBn } = useI18n();
  if (references.length === 0) return null;

  const heading = title ?? (isBn ? "দলিল ও রেফারেন্স" : "Evidence & references");

  return (
    <section
      aria-label={heading}
      className={cn(
        "overflow-hidden rounded-panel border border-border bg-surface shadow-card",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-3">
        <h3 className="flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-foreground">
          <span className="grid size-7 place-items-center rounded-lg bg-primary-soft text-primary">
            <BookMarked className="size-3.5" aria-hidden />
          </span>
          {heading}
        </h3>
        <Badge tone="neutral" size="xs" className="tabular">
          {references.length} {t("label.references")}
        </Badge>
      </header>

      <ol className={cn("divide-y divide-border", layout === "compact" && "text-[0.8125rem]")}>
        {references.map((reference, index) => {
          const source = SOURCE[reference.kind];
          return (
            <li key={reference.id || `${reference.ref}-${index}`} className="flex gap-3 p-4">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-bold tabular",
                  reference.kind === "ayah"
                    ? "bg-primary-soft text-primary-soft-foreground"
                    : "bg-accent-soft text-accent-soft-foreground",
                )}
                aria-hidden
              >
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex items-center gap-1.5 text-[0.75rem] font-semibold", reference.kind === "ayah" ? "text-primary" : "text-accent")}>
                    <source.Icon className="size-3.5" aria-hidden />
                    {reference.refBn}
                  </span>
                  <ReferenceSourceBadge kind={reference.kind} />
                </div>

                <p
                  className={cn(
                    "arabic mt-2.5 text-foreground",
                    layout === "compact" ? "text-[1.125rem]" : "text-[1.375rem]",
                  )}
                >
                  {reference.arabic}
                </p>

                <p
                  className={cn(
                    "mt-2.5 leading-relaxed text-muted-foreground",
                    layout === "compact" ? "text-[0.8125rem]" : "text-[0.875rem]",
                  )}
                >
                  {reference.translationBn}
                </p>

                {reference.note && layout !== "compact" ? (
                  <p className="mt-2.5 flex gap-2 rounded-lg bg-surface-2 p-2.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                    <Quote className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                    {reference.note}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="border-t border-border bg-surface-2 px-4 py-2.5">
        <p className="text-[0.6875rem] leading-relaxed text-subtle-foreground">
          {t("misc.footerDisclaimer")}
        </p>
      </footer>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BookOpen, ChevronRight, ScrollText, Sparkles, X } from "lucide-react";
import type { CitationFact } from "@/lib/reference-index";
import type { HadithGrade } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

/**
 * Put the panel on the document body rather than where it was opened.
 *
 * A citation lives inside a paragraph — and sometimes inside a heading — and a
 * `div` cannot be a child of either. React reports that as invalid nesting and a
 * hydration error, and it is exactly the kind of markup a reader would be served
 * if it ever survived to the HTML. A portal keeps the panel on the page while the
 * chip stays a `button` in the sentence.
 *
 * It only ever runs for a panel that is open, which takes a click, so there is
 * always a document by then.
 */
function portal(node: ReactNode) {
  return typeof document === "undefined" ? null : createPortal(node, document.body);
}

/**
 * A citation, wherever it is written.
 *
 * The evidence attached to a piece belongs next to the sentence that leans on it,
 * not only in a list further down the page. So a reference reads inline — set
 * apart with a tint and a small source glyph, the way a link is set apart — and
 * opening it answers the only questions a reader has about a citation: what does
 * it say, what does it mean, and where do I read it in full.
 *
 * The chip knows nothing about the corpus. It is handed the finished citation
 * (text, translation, source page) and shows it; resolving the written reference
 * back to that object is the index's job. That keeps this file a component and
 * keeps the citation grammar in one place.
 */

/** How each kind of evidence introduces itself. */
const SOURCE = {
  ayah: {
    labelBn: "কুরআন",
    labelEn: "Qur'an",
    readBn: "কুরআনে পড়ুন",
    readEn: "Read in the Qur'an",
    Icon: BookOpen,
  },
  hadith: {
    labelBn: "হাদীস",
    labelEn: "Hadith",
    readBn: "সংকলনে পড়ুন",
    readEn: "Read in the collection",
    Icon: ScrollText,
  },
} as const;

/** The shape both the chip and the dialog need — the index's detail exactly. */
export interface CitationView {
  kind: "ayah" | "hadith";
  refBn: string;
  arabic: string;
  translationBn: string;
  contextBn?: string;
  note?: string;
  href?: string;
  transliterationBn?: string;
  tafsirBn?: string;
  lessonBn?: string;
  grade?: HadithGrade;
  facts?: CitationFact[];
}

/** Provenance rows, labelled here rather than in the data layer. */
const FACT_LABELS: Record<CitationFact["kind"], { bn: string; en: string }> = {
  collection: { bn: "সংকলন", en: "Collection" },
  book: { bn: "কিতাব", en: "Book" },
  number: { bn: "হাদীস নম্বর", en: "Hadith no." },
  narrator: { bn: "বর্ণনাকারী", en: "Narrator" },
};

/** Grading labels are the shared `grade.*` strings, as everywhere else. */
const GRADE_KEYS: Record<HadithGrade, string> = {
  sahih: "grade.sahih",
  hasan: "grade.hasan",
  daif: "grade.daif",
  "muttafaqun-alaih": "grade.muttafaqunAlaih",
};

/**
 * The evidence, opened.
 *
 * A modal rather than an in-place expansion because the reader is mid-sentence:
 * the point is to answer the question and hand their place back, and the panel
 * closes on Escape, on the backdrop, or on the button, leaving focus where it was.
 */
export function ReferenceDetailDialog({
  detail,
  onClose,
}: {
  detail: CitationView;
  onClose: () => void;
}) {
  const { isBn, t } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const source = SOURCE[detail.kind];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh]">
      <div
        className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={detail.refBn}
        className="relative flex max-h-[84vh] w-full max-w-lg animate-scale-in flex-col overflow-hidden rounded-panel border border-border bg-surface shadow-overlay outline-none"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border bg-surface-2 px-4 py-3.5">
          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
                detail.kind === "ayah"
                  ? "bg-primary-soft text-primary-soft-foreground"
                  : "bg-accent-soft text-accent-soft-foreground",
              )}
            >
              <source.Icon className="size-3" aria-hidden />
              {isBn ? source.labelBn : source.labelEn}
            </span>
            <h2 className="mt-2 font-display text-[1rem] font-semibold text-foreground">
              {detail.refBn}
            </h2>
            {detail.contextBn ? (
              <p className="mt-0.5 text-[0.75rem] text-subtle-foreground">{detail.contextBn}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("action.close")}
            className="grid size-8 shrink-0 place-items-center rounded-full text-subtle-foreground transition-colors hover:bg-surface-3 hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p lang="ar" dir="rtl" className="arabic text-[1.5rem] leading-[2.2] text-foreground">
            {detail.arabic}
          </p>

          {/* How to say it, for a reader who cannot read the Arabic fluently. */}
          {detail.transliterationBn ? (
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-subtle-foreground">
              <span className="font-semibold text-foreground">{t("citation.transliteration")}</span>{" — "}
              {detail.transliterationBn}
            </p>
          ) : null}

          <div className="my-4 h-px bg-border" />

          <p className="text-[1.0625rem] leading-[1.9] text-foreground">{detail.translationBn}</p>

          {detail.facts && detail.facts.length > 0 ? (
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 rounded-xl border border-border bg-surface-2 p-3">
              {detail.facts.map((fact) => (
                <div key={fact.kind} className="contents">
                  <dt className="text-[0.6875rem] font-semibold text-subtle-foreground">
                    {isBn ? FACT_LABELS[fact.kind].bn : FACT_LABELS[fact.kind].en}
                  </dt>
                  <dd className="min-w-0 text-[0.75rem] text-muted-foreground">{fact.valueBn}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {detail.grade ? (
            <div className="mt-2.5 flex items-center gap-2">
              <Badge tone={detail.grade === "daif" ? "danger" : "success"} size="xs">
                {t(GRADE_KEYS[detail.grade])}
              </Badge>
              <span className="text-[0.6875rem] text-subtle-foreground">
                {t("citation.gradeLabel")}
              </span>
            </div>
          ) : null}

          {detail.tafsirBn ? (
            <section className="mt-4 rounded-xl border border-border bg-surface-2 p-3.5">
              <h3 className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-foreground">
                <BookOpen className="size-3.5 text-primary" aria-hidden />
                {t("citation.tafsir")}
              </h3>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                {detail.tafsirBn}
              </p>
            </section>
          ) : null}

          {detail.lessonBn ? (
            <section className="mt-3 rounded-xl border border-border bg-surface-2 p-3.5">
              <h3 className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-foreground">
                <Sparkles className="size-3.5 text-accent" aria-hidden />
                {t("citation.lesson")}
              </h3>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                {detail.lessonBn}
              </p>
            </section>
          ) : null}

          {detail.note ? (
            <p className="mt-3 rounded-xl border border-border bg-surface-2 p-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              {detail.note}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-3">
          {/* Only citations this app holds the source text for can be followed;
              for the rest the panel *is* the fullest view, and says so. */}
          <p className="text-[0.6875rem] leading-relaxed text-subtle-foreground">
            {detail.href ? t("citation.verifiedHint") : t("citation.noSourcePage")}
          </p>
          {detail.href ? (
            <Button href={detail.href} size="sm" variant="outline" icon={ChevronRight}>
              {isBn ? source.readBn : source.readEn}
            </Button>
          ) : null}
        </footer>
      </div>
    </div>
  );
}

/**
 * The reference as it stands in the sentence.
 *
 * Deliberately shaped like a link rather than like a badge: it sits inside a
 * paragraph, so it has to inherit the line's type and rhythm, tint slightly on
 * hover, and never change the line's height. Clicking it opens the evidence
 * without disturbing the text around it.
 */
export function CitationChip({
  detail,
  label,
  className,
}: {
  detail: CitationView;
  /**
   * What the sentence itself says. A body may write "(সূরা আত-তালাক, ২)" where
   * the canonical label reads "সূরা আত-তালাক, আয়াত ২" — the reader keeps the
   * author's words, and the dialog supplies the canonical one.
   */
  label?: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const source = SOURCE[detail.kind];
  const shown = label ?? detail.refBn;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t("citation.view")}
        aria-label={`${shown} — ${t("citation.view")}`}
        className={cn(
          "mx-0.5 inline-flex items-baseline gap-1 rounded-md border px-1.5 py-px font-semibold transition-colors",
          detail.kind === "ayah"
            ? "border-primary/35 bg-primary-soft text-primary-soft-foreground hover:border-primary/60"
            : "border-accent/35 bg-accent-soft text-accent-soft-foreground hover:border-accent/60",
          className,
        )}
      >
        <source.Icon className="size-[0.85em] shrink-0 self-center" aria-hidden />
        <span className="underline decoration-current/40 decoration-dotted underline-offset-2">
          {shown}
        </span>
      </button>
      {open ? portal(<ReferenceDetailDialog detail={detail} onClose={() => setOpen(false)} />) : null}
    </>
  );
}

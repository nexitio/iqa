"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Info,
  Library,
  Lightbulb,
  RefreshCw,
  ScrollText,
  Sparkles,
  TextQuote,
  Trash2,
} from "lucide-react";
import type { ContentReference, ReferenceSuggestion } from "@/lib/types";
import {
  getSuggestionsForKeywords,
  REFERENCE_SUGGESTIONS,
} from "@/lib/data/questions";
import { citationDetailFor } from "@/lib/reference-index";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { cn } from "@/lib/utils";
import {
  Badge,
  Button,
  EmptyState,
  Progress,
  ReferenceDetailDialog,
  SectionHeader,
  type CitationView,
} from "@/components/ui";

/**
 * Smart References — the scholar's writing assistant.
 *
 * As a scholar drafts an answer, article or fatwa, matching Qur'anic verses and
 * hadith surface beside the editor with the reasoning shown, so a citation can
 * be attached in one click instead of hunted for in another tab. This is the
 * feature that makes authored content on Ilm faster *and* better evidenced than
 * writing anywhere else.
 */

const KIND_META = {
  ayah: {
    label: { bn: "আয়াত", en: "Ayah" },
    icon: BookOpen,
    tone: "primary" as const,
  },
  hadith: {
    label: { bn: "হাদীস", en: "Hadith" },
    icon: ScrollText,
    tone: "accent" as const,
  },
};

/** Relevance chip built from the 0–1 score. */
export function MatchChip({ score, className }: { score: number; className?: string }) {
  const { locale } = useI18n();
  const value = Math.round(score * 100);
  const tone = value >= 90 ? "success" : value >= 75 ? "primary" : "info";
  return (
    <Badge tone={tone} size="xs" className={className}>
      {formatNumber(value, locale)}% মিল
    </Badge>
  );
}

function ReasonDisclosure({ reasonBn }: { reasonBn: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-primary transition-colors hover:text-primary-hover"
      >
        <Lightbulb className="size-3.5" aria-hidden />
        {t("label.whyThis")}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <p className="mt-2 rounded-xl bg-surface-2 p-3 text-[0.75rem] leading-relaxed text-muted-foreground">
          {reasonBn}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A single suggested verse or hadith.
 *
 * Its two buttons are the picker's two gestures: `onInsert(suggestion)` writes
 * the citation into the sentence, `onInsert(suggestion, true)` writes the whole
 * quotation — the same pair Enter and Shift+Enter produce while typing `#`.
 */
export function ReferenceSuggestionCard({
  suggestion,
  onInsert,
  className,
}: {
  suggestion: ReferenceSuggestion;
  onInsert?: (suggestion: ReferenceSuggestion, asQuote?: boolean) => void;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const meta = KIND_META[suggestion.kind];
  const Icon = meta.icon;

  return (
    <article
      className={cn(
        "rounded-card border border-border bg-surface p-4 shadow-card transition-colors hover:border-primary/30",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg",
              suggestion.kind === "ayah" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent-soft-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-semibold text-foreground">{suggestion.refBn}</p>
            <p className="truncate text-[0.6875rem] text-subtle-foreground">{suggestion.contextBn}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge tone={meta.tone} size="xs">
            {meta.label[locale]}
          </Badge>
          <MatchChip score={suggestion.score} />
        </div>
      </header>

      <div className="mt-3.5 rounded-xl border border-border bg-surface-2 px-4 py-3">
        <p className="arabic text-[1.15rem] text-foreground">{suggestion.arabic}</p>
        <p className="mt-2.5 border-t border-border pt-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {suggestion.translationBn}
        </p>
      </div>

      {suggestion.matchedTerms.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[0.6875rem] font-medium text-subtle-foreground">মিলে গেছে:</span>
          {suggestion.matchedTerms.map((term) => (
            <span
              key={term}
              className="rounded-md bg-success-soft px-1.5 py-0.5 text-[0.6875rem] font-medium text-success-soft-foreground"
            >
              {term}
            </span>
          ))}
        </div>
      ) : null}

      <ReasonDisclosure reasonBn={suggestion.reasonBn} />

      <footer className="mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
        <span className="text-[0.6875rem] tabular text-subtle-foreground">
          {formatNumber(Math.round(suggestion.score * 100), locale)}/১০০
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={TextQuote}
            onClick={() => onInsert?.(suggestion, true)}
          >
            {t("editor.insertQuote")}
          </Button>
          <Button size="sm" icon={Sparkles} onClick={() => onInsert?.(suggestion)}>
            {t("action.useReference")}
          </Button>
        </div>
      </footer>
    </article>
  );
}

/**
 * The suggestion panel. Recomputes from the scholar's live draft, so the list
 * shifts as the topic of the writing shifts.
 */
export function ReferenceSuggester({
  draftText,
  onInsert,
  className,
}: {
  draftText: string;
  /** Inline citation, or the full quotation block when `asQuote` is set. */
  onInsert?: (suggestion: ReferenceSuggestion, asQuote?: boolean) => void;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const [deepSearch, setDeepSearch] = useState(false);

  const trimmed = draftText.trim();

  const suggestions = useMemo(() => {
    if (trimmed.length < 3) return [];
    if (deepSearch) {
      // "More suggestions" broadens beyond the keyword hits to the whole corpus.
      return [...REFERENCE_SUGGESTIONS].sort((a, b) => b.score - a.score).slice(0, 10);
    }
    return getSuggestionsForKeywords(trimmed);
  }, [trimmed, deepSearch]);

  // Nudge the scholar when a real keyword match exists but they are browsing.
  const keywordHitCount = useMemo(
    () => (trimmed.length < 3 ? 0 : getSuggestionsForKeywords(trimmed).length),
    [trimmed],
  );

  return (
    <section className={cn("flex flex-col", className)} aria-label={t("console.suggestedRefs")}>
      <SectionHeader
        size="sm"
        icon={Sparkles}
        tone="accent"
        title={t("console.suggestedRefs")}
        description={t("console.suggestedRefsHelp")}
        action={
          <Button
            variant="ghost"
            size="xs"
            icon={RefreshCw}
            onClick={() => setDeepSearch((v) => !v)}
            disabled={trimmed.length < 3}
          >
            {t("console.refreshSuggestions")}
          </Button>
        }
      />

      {trimmed.length < 3 ? (
        <EmptyState
          compact
          icon={Lightbulb}
          tone="accent"
          title="লেখা শুরু করুন"
          description="আপনি লিখতে শুরু করলে বিষয়ের সাথে মিলে যাওয়া আয়াত ও হাদীস এখানে প্রস্তাব হিসেবে দেখা যাবে।"
        />
      ) : suggestions.length === 0 ? (
        <EmptyState
          compact
          icon={Library}
          title="কোনো রেফারেন্স মেলেনি"
          description="আপনার লেখার বিষয়ে সরাসরি মিলে যাওয়া কোনো আয়াত বা হাদীস পাওয়া যায়নি। বিষয়ভিত্তিক শব্দ যোগ করে দেখুন, যেমন ‘সুদ’, ‘যাকাত’, ‘মা-বাবা’।"
        />
      ) : (
        <>
          <p className="mb-3 flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
            <Info className="size-3.5 shrink-0" aria-hidden />
            {deepSearch
              ? "সবচেয়ে প্রাসঙ্গিক রেফারেন্সগুলো দেখানো হচ্ছে"
              : `${formatNumber(keywordHitCount, locale)}টি রেফারেন্স আপনার লেখার সাথে মিলে গেছে`}
          </p>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <ReferenceSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onInsert={onInsert}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/**
 * One attached reference.
 *
 * The row is the attached snapshot, so it stays short; opening it shows the
 * reference itself — the full Arabic from the index where the index knows it,
 * the scholar's own reason for attaching it, and the page the source lives on.
 */
function AttachedReferenceRow({
  reference,
  onRemove,
}: {
  reference: ContentReference;
  onRemove?: (id: string) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const meta = KIND_META[reference.kind];
  const Icon = meta.icon;

  // The rail keeps the scholar's own snapshot in the row; the dialog completes it
  // with the index — full Arabic, pronunciation, provenance, grading — so an
  // attached reference reads exactly like the same one cited in the draft.
  const detail: CitationView = citationDetailFor(reference);

  return (
    <li className="flex items-start gap-3 rounded-card border border-border bg-surface p-3.5">
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg",
          reference.kind === "ayah"
            ? "bg-primary-soft text-primary"
            : "bg-accent-soft text-accent-soft-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`${reference.refBn} — ${t("citation.view")}`}
        className="group min-w-0 flex-1 text-left"
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[0.8125rem] font-semibold text-foreground underline decoration-transparent decoration-dotted underline-offset-2 transition-colors group-hover:decoration-current">
            {reference.refBn}
          </span>
          <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium text-subtle-foreground transition-colors group-hover:text-primary">
            {t("citation.view")}
            <ChevronRight className="size-3" aria-hidden />
          </span>
        </span>
        <span className="arabic mt-1 line-clamp-2 block text-[0.9375rem] text-muted-foreground">
          {reference.arabic}
        </span>
        {reference.note ? (
          <span className="mt-1.5 block text-[0.6875rem] leading-relaxed text-subtle-foreground">
            {reference.note}
          </span>
        ) : null}
      </button>
      {onRemove ? (
        <button
          type="button"
          onClick={() => onRemove(reference.id)}
          aria-label={`${reference.refBn} সরান`}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-subtle-foreground transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      ) : null}

      {open ? <ReferenceDetailDialog detail={detail} onClose={() => setOpen(false)} /> : null}
    </li>
  );
}

/**
 * The evidence attached to the draft, each one openable and removable.
 *
 * Titled "দলিল ও রেফারেন্স" like every other evidence block in the product: this
 * is the same list a reader will see under the published piece, shown to the
 * scholar while the piece is still a draft.
 */
export function AttachedReferenceList({
  references,
  onRemove,
  className,
}: {
  references: ContentReference[];
  onRemove?: (id: string) => void;
  className?: string;
}) {
  const { t, locale } = useI18n();

  return (
    <section className={className} aria-label={t("console.attachedRefs")}>
      <SectionHeader
        size="sm"
        icon={Library}
        tone="primary"
        title={t("console.attachedRefs")}
        action={
          references.length > 0 ? (
            <Badge tone="primary" size="xs">
              {formatNumber(references.length, locale)}
            </Badge>
          ) : null
        }
      />

      {references.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong bg-surface-2/60 px-4 py-6 text-center text-[0.8125rem] text-muted-foreground">
          {t("console.noRefsYet")}
        </p>
      ) : (
        <>
          <ul className="space-y-2.5">
            {references.map((reference) => (
              <AttachedReferenceRow
                key={reference.id}
                reference={reference}
                onRemove={onRemove}
              />
            ))}
          </ul>
          <p className="mt-2.5 text-[0.6875rem] leading-relaxed text-subtle-foreground">
            {t("citation.hint")}
          </p>
        </>
      )}
    </section>
  );
}

/** Compact summary of how well evidenced the current draft is. */
export function SmartReferenceCounter({
  attached,
  suggested,
  className,
}: {
  attached: number;
  suggested: number;
  className?: string;
}) {
  const { locale } = useI18n();
  const coverage = suggested > 0 ? Math.min(100, (attached / suggested) * 100) : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-card border border-border bg-surface-2 px-4 py-3",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[0.75rem] font-semibold text-foreground">দলিলের ভারসাম্য</p>
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
          {formatNumber(attached, locale)}টি যুক্ত · {formatNumber(suggested, locale)}টি প্রস্তাবিত
        </p>
        <Progress value={coverage} size="xs" tone="accent" className="mt-2" />
      </div>
      <Badge tone={coverage >= 50 ? "success" : "warning"} size="sm">
        {coverage >= 50 ? "ভালো" : "আরও দলিল দিন"}
      </Badge>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  Headphones,
  Minus,
  Plus,
  Share2,
  Sparkles,
} from "lucide-react";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { getSurah } from "@/lib/data/quran";
import { useI18n } from "@/lib/i18n";
import type { ContentReference, QuranAyah } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";
import { Badge, Button, Callout, Card, Chip } from "@/components/ui";

/**
 * Arabic size ladder.
 *
 * Qur'anic Arabic needs far more vertical room than Latin text, and Bangladeshi
 * readers often prefer a noticeably larger face, so the top of the range is
 * deliberately generous.
 */
const ARABIC_SIZES = [
  "text-2xl leading-[2.5]",
  "text-[1.75rem] leading-[2.4]",
  "text-[2rem] leading-[2.3]",
  "text-[2.3rem] leading-[2.2]",
  "text-[2.6rem] leading-[2.15]",
];

const DEFAULT_SIZE = 2;

/** Copies to the clipboard with a brief visual confirmation. */
function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard can be blocked (insecure origin / permissions). Fall back to
      // a hidden textarea so the action still works rather than failing silently.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing more we can do */
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), timeout);
  };

  return { copied, copy };
}

/** Small ghost icon button used for the per-ayah action row. */
function IconAction({
  icon: Icon,
  label,
  active = false,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      className={cn(
        "inline-grid size-8 place-items-center rounded-full transition-colors",
        active
          ? "bg-primary-soft text-primary"
          : "text-subtle-foreground hover:bg-surface-3 hover:text-foreground",
        className,
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function AyahCard({
  ayah,
  index,
  surahName,
  showActions = true,
  defaultShowTranslation = true,
  defaultShowTransliteration = true,
  className,
}: {
  ayah: QuranAyah;
  /** Optional display position, defaults to the ayah's own number. */
  index?: number;
  /** Overrides the surah label shown in the header. */
  surahName?: string;
  showActions?: boolean;
  defaultShowTranslation?: boolean;
  defaultShowTransliteration?: boolean;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const { copied, copy } = useCopy();

  const [size, setSize] = useState(DEFAULT_SIZE);
  const [showTranslation, setShowTranslation] = useState(defaultShowTranslation);
  const [showTransliteration, setShowTransliteration] = useState(defaultShowTransliteration);
  const [showTafsir, setShowTafsir] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const surah = getSurah(ayah.surah);
  const heading = surahName ?? (surah ? pick(surah.name) : `${ayah.surah}`);
  const position = index ?? ayah.number;
  const translation = locale === "bn" ? ayah.translationBn : ayah.translationEn;

  const share = async () => {
    const url = `${window.location.origin}/quran/${ayah.surah}?ayah=${ayah.number}`;
    const payload = { title: `${heading} — ${formatRefLabel(ayah.ref, locale)}`, url };
    try {
      if (navigator.share) {
        await navigator.share(payload);
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user dismissed the share sheet — not an error */
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  return (
    <Card
      variant="parchment"
      className={cn("scroll-mt-24 overflow-hidden", className)}
      id={`ayah-${ayah.number}`}
    >
      {/* Header: position, source, and reading controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-[0.9375rem] font-bold text-primary-foreground shadow-card"
            aria-hidden
          >
            {toBnDigits(position)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[0.9375rem] font-semibold text-foreground">
              {t("label.surah")} {heading}
            </p>
            <p className="mt-0.5 flex items-center gap-2 text-[0.6875rem] text-subtle-foreground">
              <span>
                {t("label.ayah")} {formatNumber(ayah.number, locale)}
              </span>
              {surah ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{t(`revelation.${surah.revelation}`)}</span>
                </>
              ) : null}
              {ayah.sajda ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="font-semibold text-accent">সাজদা</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setSize((s) => Math.max(0, s - 1))}
            disabled={size === 0}
            aria-label={`${t("label.fontSize")} কম`}
            title={t("label.fontSize")}
            className="grid size-8 place-items-center rounded-full text-subtle-foreground transition-colors hover:bg-surface-3 hover:text-foreground disabled:opacity-40"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-6 text-center text-[0.6875rem] font-semibold tabular text-subtle-foreground">
            {toBnDigits(size + 1)}
          </span>
          <button
            type="button"
            onClick={() => setSize((s) => Math.min(ARABIC_SIZES.length - 1, s + 1))}
            disabled={size === ARABIC_SIZES.length - 1}
            aria-label={`${t("label.fontSize")} বেশি`}
            title={t("label.fontSize")}
            className="grid size-8 place-items-center rounded-full text-subtle-foreground transition-colors hover:bg-surface-3 hover:text-foreground disabled:opacity-40"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* The Arabic itself — the centrepiece of the page */}
      <div className="pt-5">
        <p className={cn("arabic font-quran text-foreground", ARABIC_SIZES[size])} lang="ar" dir="rtl">
          {ayah.arabic}
        </p>
      </div>

      {showTransliteration && ayah.transliterationBn ? (
        <p className="mt-4 rounded-xl bg-surface-2 px-3.5 py-3 text-[0.875rem] leading-relaxed text-muted-foreground">
          <span className="mr-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            {t("label.transliteration")}
          </span>
          {ayah.transliterationBn}
        </p>
      ) : null}

      {showTranslation ? (
        <p className="mt-4 font-display text-[1.0625rem] leading-[1.95] text-foreground">{translation}</p>
      ) : null}

      {showTafsir && ayah.tafsirBn ? (
        <Callout
          tone="accent"
          icon={Sparkles}
          title={t("label.tafsir")}
          className="mt-4 animate-fade-up"
        >
          {ayah.tafsirBn}
        </Callout>
      ) : null}

      {showActions ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-3.5">
          <div className="flex items-center gap-1">
            <IconAction
              icon={Bookmark}
              label={saved ? t("action.saved") : t("action.save")}
              active={saved}
              onClick={() => setSaved((v) => !v)}
            />
            <IconAction
              icon={copied ? Check : Copy}
              label={t("label.copyArabic")}
              active={copied}
              onClick={() => copy(`${ayah.arabic}\n\n${translation}\n— ${ayah.ref}`)}
            />
            <IconAction
              icon={shared ? Check : Share2}
              label={t("action.share")}
              active={shared}
              onClick={share}
            />
            <IconAction icon={Headphones} label={t("label.audio")} />
          </div>

          {copied ? (
            <Badge tone="success" icon={Check} className="animate-fade-in">
              {t("action.copied")}
            </Badge>
          ) : null}

          <div className="ml-auto flex items-center gap-1.5">
            {ayah.tafsirBn ? (
              <Button
                variant="ghost"
                size="sm"
                iconRight={ChevronDown}
                onClick={() => setShowTafsir((v) => !v)}
                className={cn(showTafsir && "[&_svg:last-child]:rotate-180")}
              >
                {t("label.tafsir")}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTransliteration((v) => !v)}
              className={cn(!showTransliteration && "opacity-60")}
            >
              {t("label.transliteration")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTranslation((v) => !v)}
              className={cn(!showTranslation && "opacity-60")}
            >
              {t("label.translation")}
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function formatRefLabel(ref: string, locale: "bn" | "en") {
  return locale === "bn" ? toBnDigits(ref) : ref;
}

/**
 * Compact citation block used inside articles, fatwas and answers.
 * Renders from the reference snapshot so it needs no extra lookup.
 */
export function AyahInline({
  reference,
  className,
}: {
  reference: ContentReference;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <figure
      className={cn(
        "rounded-panel border border-border bg-surface-2 p-4",
        className,
      )}
    >
      <figcaption className="flex flex-wrap items-center gap-2">
        <Chip tone="primary" size="sm" icon={BookOpen}>
          {t("label.ayah")}
        </Chip>
        <span className="text-[0.75rem] font-semibold text-foreground">{reference.refBn}</span>
      </figcaption>

      <p className="arabic arabic-ui mt-3 text-[1.375rem] text-foreground" lang="ar" dir="rtl">
        {reference.arabic}
      </p>

      <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {truncate(reference.translationBn, 320)}
      </p>

      {reference.note ? (
        <p className="mt-2 text-[0.75rem] leading-relaxed text-subtle-foreground">{reference.note}</p>
      ) : null}
    </figure>
  );
}

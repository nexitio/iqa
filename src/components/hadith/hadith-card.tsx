"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  Copy,
  GraduationCap,
  Link2,
  ScrollText,
  Share2,
  UserRound,
} from "lucide-react";
import { getCollection } from "@/lib/data/hadith";
import { useI18n } from "@/lib/i18n";
import type { ContentReference, Hadith, HadithGrade } from "@/lib/types";
import { cn, truncate } from "@/lib/utils";
import { Badge, Callout, Card, Chip, StatusBadge, statusTone } from "@/components/ui";

/** Copies with a transient confirmation — mirrors the ayah card behaviour. */
function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
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
        /* no further fallback available */
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), timeout);
  };

  return { copied, copy };
}

const GRADE_KEYS: Record<HadithGrade, string> = {
  sahih: "grade.sahih",
  hasan: "grade.hasan",
  daif: "grade.daif",
  "muttafaqun-alaih": "grade.muttafaqunAlaih",
};

/** Classical authenticity classification, colour-coded by strength. */
export function GradeBadge({
  grade,
  size = "xs",
  className,
}: {
  grade: HadithGrade;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <StatusBadge
      status={grade}
      label={t(GRADE_KEYS[grade] ?? "grade.sahih")}
      size={size}
      className={cn("whitespace-nowrap", className)}
    />
  );
}

function IconAction({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
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
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function HadithCard({
  hadith,
  showActions = true,
  className,
}: {
  hadith: Hadith;
  showActions?: boolean;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const { copied, copy } = useCopy();
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const collection = getCollection(hadith.collectionSlug);
  const translation = locale === "bn" ? hadith.translationBn : hadith.translationEn;
  const ref = locale === "bn" ? hadith.refBn : hadith.refEn;

  const share = async () => {
    const url = `${window.location.origin}/hadith/${hadith.collectionSlug}/${hadith.id}`;
    try {
      if (navigator.share) await navigator.share({ title: ref, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* dismissed share sheet */
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  return (
    <Card variant="parchment" className={cn("overflow-hidden", className)} id={hadith.id}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-2xl",
              statusTone(hadith.grade) === "success"
                ? "bg-success-soft text-success-soft-foreground"
                : "bg-primary-soft text-primary",
            )}
            aria-hidden
          >
            <ScrollText className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-[0.9375rem] font-semibold text-foreground">{ref}</p>
            <p className="mt-0.5 truncate text-[0.6875rem] text-subtle-foreground">
              {pick(hadith.bookName)}
            </p>
          </div>
        </div>
        <GradeBadge grade={hadith.grade} size="sm" />
      </div>

      <p className="arabic font-quran mt-5 text-[1.75rem] leading-[2.2] text-foreground" lang="ar" dir="rtl">
        {hadith.arabic}
      </p>

      <p className="mt-4 font-display text-[1.0625rem] leading-[1.95] text-foreground">{translation}</p>

      {hadith.lessonBn && locale === "bn" ? (
        <Callout tone="accent" icon={GraduationCap} title="শিক্ষা" className="mt-4">
          {hadith.lessonBn}
        </Callout>
      ) : null}

      {/* Narration chain metadata — readers in Bangladesh look for the narrator first */}
      <dl className="mt-5 grid gap-x-5 gap-y-3 border-t border-border pt-4 sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
            <UserRound className="size-3.5" aria-hidden />
            {t("label.narrator")}
          </dt>
          <dd className="mt-1 text-[0.8125rem] font-medium leading-snug text-foreground">
            {pick(hadith.narrator)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
            <Link2 className="size-3.5" aria-hidden />
            {t("label.collection")}
          </dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2 text-[0.8125rem] font-medium text-foreground">
            {pick(hadith.collectionName)}
            {collection?.authentic ? (
              <Badge tone="success" size="xs">
                সহীহ
              </Badge>
            ) : null}
          </dd>
        </div>
      </dl>

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
              label={t("action.copyLink")}
              active={copied}
              onClick={() => copy(`${hadith.arabic}\n\n${translation}\n— ${ref}`)}
            />
            <IconAction
              icon={shared ? Check : Share2}
              label={t("action.share")}
              active={shared}
              onClick={share}
            />
          </div>

          {copied ? (
            <Badge tone="success" icon={Check} className="animate-fade-in">
              {t("action.copied")}
            </Badge>
          ) : null}

          <Chip
            href={`/hadith/${hadith.collectionSlug}`}
            tone="info"
            size="sm"
            className="ml-auto"
          >
            {pick(hadith.collectionName)}
          </Chip>
        </div>
      ) : null}
    </Card>
  );
}

/** Compact citation used inside articles, fatwas and answers. */
export function HadithInline({
  reference,
  className,
}: {
  reference: ContentReference;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <figure className={cn("rounded-panel border border-border bg-surface-2 p-4", className)}>
      <figcaption className="flex flex-wrap items-center gap-2">
        <Chip tone="info" size="sm" icon={ScrollText}>
          {t("label.hadith")}
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

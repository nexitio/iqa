"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bookmark,
  FileText,
  Flame,
  HandHeart,
  MessageCircleQuestion,
  MessagesSquare,
  Play,
  Route,
  Scale,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { cn, relativeTime } from "@/lib/utils";
import type { Bookmark as BookmarkRecord, BookmarkCollection, Journey, ReadingProgress } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  DayDots,
  Progress,
  Ring,
  asTone,
  softTone,
  type Tone,
} from "@/components/ui";

/* -------------------------------------------------------------------------- */

const KIND_ICONS: Record<BookmarkRecord["kind"], LucideIcon> = {
  ayah: BookOpen,
  hadith: ScrollText,
  dua: HandHeart,
  article: FileText,
  fatwa: Scale,
  answer: MessageCircleQuestion,
  question: MessageCircleQuestion,
  discussion: MessagesSquare,
};

const KIND_TONES: Record<BookmarkRecord["kind"], Tone> = {
  ayah: "primary",
  hadith: "accent",
  dua: "info",
  article: "info",
  fatwa: "success",
  answer: "scholar",
  question: "warning",
  discussion: "user",
};

const PROGRESS_ICONS: Record<ReadingProgress["kind"], LucideIcon> = {
  quran: BookOpen,
  article: FileText,
  hadith: ScrollText,
  journey: Route,
};

/* -------------------------------------------------------------------------- */

export function ContinueLearningCard({
  item,
  className,
}: {
  item: ReadingProgress;
  className?: string;
}) {
  const { t, locale } = useI18n();
  const Icon = PROGRESS_ICONS[item.kind];

  return (
    <Card interactive className={cn("flex h-full flex-col", className)}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[0.9375rem] font-semibold text-foreground">
            {item.titleBn}
          </p>
          <p className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">{item.subtitleBn}</p>
        </div>
        <Badge tone="neutral" size="xs">
          {toBnDigits(item.progress)}%
        </Badge>
      </div>

      <div className="mt-4">
        <Progress value={item.progress} size="sm" tone={item.progress === 100 ? "success" : "primary"} />
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 text-[0.75rem] font-medium text-primary">
        <Play className="size-3.5" aria-hidden />
        {item.resumeLabelBn}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-[0.6875rem] text-subtle-foreground">
          {relativeTime(item.lastReadAt, locale)}
        </span>
        <Button href={item.href} size="sm" variant="soft">
          {t("action.resume")}
        </Button>
      </div>
    </Card>
  );
}

export function ContinueLearningRail({
  items,
  className,
}: {
  items: ReadingProgress[];
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className={cn("no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-1", className)}>
      {items.map((item) => (
        <div key={item.id} className="w-[19rem] shrink-0">
          <ContinueLearningCard item={item} />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function JourneyCard({ journey, className }: { journey: Journey; className?: string }) {
  const { t, locale } = useI18n();
  const tone = asTone(journey.tone);
  const percent = journey.totalDays > 0 ? (journey.completedDays / journey.totalDays) * 100 : 0;
  const started = journey.completedDays > 0;
  const finished = journey.totalDays > 0 && journey.completedDays >= journey.totalDays;

  return (
    <Card interactive className={cn("flex h-full flex-col", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone={tone} size="xs">
            {journey.categoryBn}
          </Badge>
          <h3 className="mt-2 font-display text-base font-bold leading-snug text-foreground">
            {journey.titleBn}
          </h3>
        </div>
        <Ring value={percent} size={54} thickness={5} tone={finished ? "success" : tone}>
          <span className="text-[0.625rem] font-bold tabular text-foreground">
            {toBnDigits(journey.completedDays)}/{toBnDigits(journey.totalDays)}
          </span>
        </Ring>
      </div>

      <p className="mt-2.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {journey.descriptionBn}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.6875rem] text-subtle-foreground">
        <span className="font-medium text-foreground">{journey.durationLabelBn}</span>
        <span className="text-border-strong">·</span>
        <span>
          {formatNumber(journey.enrolled, locale)} {t("journey.enrolled")}
        </span>
      </div>

      <div className="mt-3.5">
        <DayDots total={journey.totalDays} completed={journey.completedDays} tone={tone} />
      </div>

      <div className="mt-auto pt-4">
        <Button
          href={`/journey/${journey.slug}`}
          size="sm"
          full
          variant={started ? "primary" : "outline"}
        >
          {finished ? t("journey.completed") : started ? t("journey.continueJourney") : t("action.startLearning")}
        </Button>
      </div>
    </Card>
  );
}

export function JourneyRow({ journey, className }: { journey: Journey; className?: string }) {
  const { t } = useI18n();
  const tone = asTone(journey.tone);
  const percent = journey.totalDays > 0 ? (journey.completedDays / journey.totalDays) * 100 : 0;

  return (
    <Link
      href={`/journey/${journey.slug}`}
      className={cn(
        "flex items-center gap-4 rounded-panel border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised",
        className,
      )}
    >
      <Ring value={percent} size={48} thickness={5} tone={tone}>
        <span className="text-[0.5625rem] font-bold tabular text-foreground">
          {toBnDigits(journey.completedDays)}/{toBnDigits(journey.totalDays)}
        </span>
      </Ring>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[0.875rem] font-semibold text-foreground">
          {journey.titleBn}
        </p>
        <p className="mt-0.5 truncate text-[0.75rem] text-muted-foreground">
          {journey.durationLabelBn}
          <span className="mx-1.5 text-border-strong">·</span>
          {journey.categoryBn}
        </p>
        <div className="mt-2">
          <Progress value={percent} size="xs" tone={tone} />
        </div>
      </div>
      <span className="shrink-0 text-[0.75rem] font-medium text-primary">{t("action.resume")}</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */

export function BookmarkCard({ bookmark, className }: { bookmark: BookmarkRecord; className?: string }) {
  const { t, locale } = useI18n();
  const Icon = KIND_ICONS[bookmark.kind];
  const tone = KIND_TONES[bookmark.kind];
  const kindLabel: Record<BookmarkRecord["kind"], string> = {
    ayah: t("label.ayah"),
    hadith: t("label.hadith"),
    dua: t("nav.duas"),
    article: t("label.article"),
    fatwa: t("label.fatwa"),
    answer: t("label.answer"),
    question: t("label.question"),
    discussion: t("label.discussion"),
  };

  return (
    <Card interactive className={cn("flex h-full flex-col", className)}>
      <div className="flex items-start justify-between gap-3">
        <Badge tone={tone} size="xs" icon={Icon}>
          {kindLabel[bookmark.kind]}
        </Badge>
        <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
          {relativeTime(bookmark.savedAt, locale)}
        </span>
      </div>

      <h3 className="mt-2.5 font-display text-[0.875rem] font-semibold leading-snug text-foreground">
        {bookmark.titleBn}
      </h3>
      <p className="mt-1.5 line-clamp-3 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
        {bookmark.previewBn}
      </p>

      <div className="mt-3 border-t border-border pt-3">
        <p className="truncate text-[0.6875rem] font-medium text-accent">{bookmark.refBn}</p>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button href={bookmark.href} size="xs" variant="soft" full>
          {t("action.readMore")}
        </Button>
        <Button size="icon-sm" variant="ghost" aria-label={t("action.save")}>
          <Bookmark className="size-4 text-primary" />
        </Button>
      </div>
    </Card>
  );
}

export function BookmarkCollectionCard({
  collection,
  className,
}: {
  collection: BookmarkCollection;
  className?: string;
}) {
  const tone = asTone(collection.tone);
  return (
    <Link
      href={`/library?collection=${collection.id}`}
      className={cn(
        "flex items-center gap-3 rounded-panel border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-raised",
        className,
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", softTone[tone])}>
        <Bookmark className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.875rem] font-semibold text-foreground">
          {collection.nameBn}
        </span>
        <span className="mt-0.5 block text-[0.6875rem] text-subtle-foreground">
          {toBnDigits(collection.count)} টি সংরক্ষিত
        </span>
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */

export function StreakCard({
  streakDays,
  className,
}: {
  streakDays: number;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <Card padding="sm" className={cn("flex items-center gap-3", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning-soft-foreground">
        <Flame className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle-foreground">
          {t("label.streak")}
        </p>
        <p className="font-display text-lg font-bold leading-tight tabular text-foreground">
          {toBnDigits(streakDays)} {t("label.days")}
        </p>
      </div>
      <Sparkles className="size-4 shrink-0 text-warning" aria-hidden />
    </Card>
  );
}

"use client";

import { Headphones, Languages, Sparkles, Type } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge, Select } from "@/components/ui";

/** Reciters commonly listened to in Bangladesh and across South Asia. */
export const RECITERS = [
  { id: "afasy", labelBn: "মিশরী রাশেদ আল-আফাসী", labelEn: "Mishary Rashid Alafasy" },
  { id: "sudais", labelBn: "আব্দুর রহমান আস-সুদাইস", labelEn: "Abdur-Rahman as-Sudais" },
  { id: "shuraim", labelBn: "সৌদ আশ-শুরাইম", labelEn: "Saud ash-Shuraim" },
  { id: "husary", labelBn: "মাহমুদ খলীল আল-হুসারী", labelEn: "Mahmoud Khalil Al-Husary" },
  { id: "minshawi", labelBn: "মুহাম্মদ সিদ্দীক আল-মিনশাবী", labelEn: "Muhammad Siddiq al-Minshawi" },
] as const;

export type ReciterId = (typeof RECITERS)[number]["id"];

/**
 * Sticky reading toolbar.
 *
 * Every control here governs the whole surah, so the bar has to cost as little
 * height as possible: it stays on screen the entire time the reader is reading
 * and it sits above the text they came for. One row, no explanation, no second
 * tier. The earlier version spent a whole extra row explaining that audio is not
 * wired up yet, which is a lot of permanent screen for a temporary gap — a
 * "coming soon" badge beside the reciter picker says the same thing in 20px.
 *
 * There is deliberately no play button: a control that does nothing is worse
 * than no control.
 */
export function ReaderControls({
  arabicSize = 2,
  onArabicSize,
  showTranslation = true,
  onShowTranslation,
  showTransliteration = true,
  onShowTransliteration,
  showTafsir = false,
  onShowTafsir,
  reciter,
  onReciter,
  className,
}: {
  arabicSize?: number;
  onArabicSize?: (size: number) => void;
  showTranslation?: boolean;
  onShowTranslation?: (value: boolean) => void;
  showTransliteration?: boolean;
  onShowTransliteration?: (value: boolean) => void;
  showTafsir?: boolean;
  onShowTafsir?: (value: boolean) => void;
  reciter?: ReciterId;
  onReciter?: (id: ReciterId) => void;
  className?: string;
}) {
  const { t, pick } = useI18n();

  // Bangla letters as the ladder: they read as "small → large" to this audience
  // far faster than 1/2/3/4 do.
  const sizes = ["ক", "খ", "গ", "ঘ"];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-panel border border-border bg-surface/92 px-3 py-2 shadow-card backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <Type className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
        <div className="flex items-center gap-0.5 rounded-full bg-surface-3 p-0.5">
          {sizes.map((label, level) => (
            <button
              key={label}
              type="button"
              onClick={() => onArabicSize?.(level)}
              aria-pressed={arabicSize === level}
              aria-label={`${t("label.fontSize")} ${level + 1}`}
              className={cn(
                "grid size-6 place-items-center rounded-full font-display text-[0.75rem] font-semibold transition-colors",
                arabicSize === level
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:bg-surface",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <span className="hidden h-5 w-px shrink-0 bg-border sm:block" aria-hidden />

      <div className="flex flex-wrap items-center gap-1.5">
        <TogglePill
          icon={Languages}
          active={showTransliteration}
          label={t("label.transliteration")}
          onClick={() => onShowTransliteration?.(!showTransliteration)}
        />
        <TogglePill
          icon={Languages}
          active={showTranslation}
          label={t("label.translation")}
          onClick={() => onShowTranslation?.(!showTranslation)}
        />
        <TogglePill
          icon={Sparkles}
          active={showTafsir}
          label={t("label.tafsir")}
          onClick={() => onShowTafsir?.(!showTafsir)}
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Headphones className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
        <span className="hidden text-[0.75rem] font-medium text-muted-foreground lg:inline">
          {t("label.reciter")}
        </span>
        <Select
          aria-label={t("label.reciter")}
          value={reciter ?? "afasy"}
          onChange={(e) => onReciter?.(e.target.value as ReciterId)}
          className="h-7 w-auto min-w-[9.5rem] text-[0.75rem]"
        >
          {RECITERS.map((r) => (
            <option key={r.id} value={r.id}>
              {pick({ bn: r.labelBn, en: r.labelEn })}
            </option>
          ))}
        </Select>
        <Badge tone="info" size="xs" className="hidden sm:inline-flex">
          {t("state.comingSoon")}
        </Badge>
      </div>
    </div>
  );
}

function TogglePill({
  icon: Icon,
  active,
  label,
  onClick,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[0.75rem] font-medium transition-colors",
        active
          ? "border-primary/45 bg-primary-soft text-primary-soft-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {Icon ? <Icon className="size-3.5" aria-hidden /> : null}
      {label}
    </button>
  );
}

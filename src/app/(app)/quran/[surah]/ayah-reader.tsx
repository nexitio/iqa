"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, Check, Copy, Share2, Sparkles } from "lucide-react";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import type { QuranAyah } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ReaderControls, type ReciterId } from "@/components/quran";
import { Badge, Callout, Card } from "@/components/ui";

/**
 * Arabic size ladder — mirrors the ReaderControls levels.
 *
 * Qur'anic Arabic needs far more vertical room than Bangla or Latin, and readers
 * in Bangladesh often prefer a noticeably larger face, so the top of the range
 * is deliberately generous.
 */
const ARABIC_SIZES = [
  "text-2xl leading-[2.5]",
  "text-[1.75rem] leading-[2.4]",
  "text-[2rem] leading-[2.3]",
  "text-[2.3rem] leading-[2.2]",
] as const;

const BISMILLAH_ARABIC = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

/** Copies to the clipboard, falling back when the API is blocked. */
async function copyText(text: string) {
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
      /* nothing further we can do */
    }
    document.body.removeChild(area);
  }
}

/** Small ghost action button for the per-ayah row. */
function AyahAction({
  icon: Icon,
  label,
  active = false,
  tone = "primary",
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  tone?: "primary" | "success" | "info";
  onClick?: () => void;
}) {
  const activeTone = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success-soft-foreground",
    info: "bg-info-soft text-info-soft-foreground",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      className={cn(
        "inline-grid size-7 place-items-center rounded-full transition-colors",
        active ? activeTone : "text-subtle-foreground hover:bg-surface-3 hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

/**
 * The reading surface.
 *
 * A surah is one continuous text, so it is rendered as one surface: a single
 * container divided by hairlines, not a card per verse. Each ayah contributes
 * two things — a thin line carrying its number, reference and its three actions,
 * and the text itself. The previous version gave every ayah its own framed card
 * with a repeated "সূরা …, আয়াত …" masthead and a numbered tile, which meant the
 * chrome between two verses was taller than most verses are, and a 286-ayah
 * surah was a pile of nearly identical boxes rather than something to read.
 *
 * The toolbar governs the whole surah — font size, translation, transliteration
 * and tafsir apply to every ayah at once, which is how continuous reading should
 * behave. Sizing and viewing preferences belong to the session, not to an
 * individual verse.
 */
export function AyahReader({
  ayahs,
  surahName,
  surahNumber,
  initialAyah,
}: {
  ayahs: QuranAyah[];
  surahName: string;
  surahNumber: number;
  /** Deep-link target from `?ayah=`, scrolled to and highlighted on mount. */
  initialAyah?: number;
}) {
  const { t, locale, isBn } = useI18n();

  const [arabicSize, setArabicSize] = useState(2);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [reciter, setReciter] = useState<ReciterId>("afasy");

  const [savedRefs, setSavedRefs] = useState<string[]>([]);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);
  const [sharedRef, setSharedRef] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<number | null>(initialAyah ?? null);

  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const flash = useCallback((setter: (value: string | null) => void, ref: string) => {
    setter(ref);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setter(null), 1900);
  }, []);

  /**
   * Deep links (?ayah=255) must land on the right verse.
   *
   * Two things quietly defeat the obvious implementation, and both end the same
   * way — the reader arrives at the top of the surah with no sign that the verse
   * they followed a link to is even there:
   *
   * - The App Router scrolls a freshly navigated route to the top as part of the
   *   navigation, and that reset is not ordered against this effect, so a single
   *   attempt can be undone a moment later.
   * - `behavior: "smooth"` can silently do nothing at all. If the tab is not
   *   being painted, or the reader has asked for reduced motion, the animation
   *   never runs and the scroll position does not budge.
   *
   * So the scroll is attempted more than once, it is verified by measuring rather
   * than assumed, and it falls back to an immediate jump when the smooth one did
   * not move anything.
   */
  useEffect(() => {
    if (!initialAyah) return;

    const timers: number[] = [];
    const stop = () => timers.forEach((id) => window.clearTimeout(id));
    const target = () => document.getElementById(`ayah-${initialAyah}`);
    const onScreen = () => {
      const el = target();
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    };

    const place = () => {
      const el = target();
      if (!el) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        el.scrollIntoView({ behavior: "instant", block: "center" });
        return;
      }

      const from = window.scrollY;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      timers.push(
        window.setTimeout(() => {
          if (Math.abs(window.scrollY - from) < 2 && !onScreen()) {
            target()?.scrollIntoView({ behavior: "instant", block: "center" });
          }
        }, 280),
      );
    };

    for (const delay of [120, 520]) {
      timers.push(
        window.setTimeout(() => {
          if (!onScreen()) place();
        }, delay),
      );
    }

    timers.push(window.setTimeout(() => setHighlight(null), 4200));
    return stop;
  }, [initialAyah]);

  const toggleSaved = (ref: string) =>
    setSavedRefs((prev) => (prev.includes(ref) ? prev.filter((r) => r !== ref) : [...prev, ref]));

  const share = async (ayah: QuranAyah) => {
    const url = `${window.location.origin}/quran/${ayah.surah}?ayah=${ayah.number}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${surahName} — ${ayah.ref}`, url });
      } else {
        await copyText(url);
      }
    } catch {
      /* the reader dismissed the share sheet — not an error */
    }
    flash(setSharedRef, ayah.ref);
  };

  const tafsirCount = ayahs.filter((a) => a.tafsirBn).length;
  // Al-Fatihah includes the Bismillah as its first ayah, and At-Tawbah has none.
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  return (
    <div className="space-y-4">
      {/* Docked flush under the header (`--header-h`), not at `--pin-top`.
          `--pin-top` includes the gap the content block leaves below the
          header, and a toolbar that sticks *there* leaves a 28px strip of
          half-scrolled text visible between itself and the header — which is
          exactly the kind of untidiness a reading surface cannot afford. */}
      <div className="sticky top-[var(--header-h)] z-30">
        <ReaderControls
          arabicSize={arabicSize}
          onArabicSize={setArabicSize}
          showTranslation={showTranslation}
          onShowTranslation={setShowTranslation}
          showTransliteration={showTransliteration}
          onShowTransliteration={setShowTransliteration}
          showTafsir={showTafsir}
          onShowTafsir={setShowTafsir}
          reciter={reciter}
          onReciter={setReciter}
        />
      </div>

      {showTafsir && tafsirCount > 0 ? (
        <p className="px-0.5 text-[0.75rem] leading-relaxed text-subtle-foreground">
          {isBn
            ? `এই সূরার ${toBnDigits(tafsirCount)} টি আয়াতের সংক্ষিপ্ত তাফসীর যুক্ত আছে; যেগুলোতে এখনো নেই সেখানে আলাদাভাবে উল্লেখ করা হয়েছে।`
            : `${tafsirCount} ayahs in this surah have a short tafsir note; the rest are marked where it is missing.`}
        </p>
      ) : null}

      <Card flush className="overflow-hidden">
        {showBismillah ? (
          <div className="border-b border-border bg-surface-2/60 px-4 py-3.5 text-center sm:px-5">
            <p className="arabic font-quran text-[1.5rem] leading-[2.2] text-primary" lang="ar" dir="rtl">
              {BISMILLAH_ARABIC}
            </p>
            <p className="mt-1 text-[0.75rem] text-muted-foreground">{t("quran.bismillah")}</p>
          </div>
        ) : null}

        <div className="divide-y divide-border">
          {ayahs.map((ayah) => {
            const saved = savedRefs.includes(ayah.ref);
            const copied = copiedRef === ayah.ref;
            const shared = sharedRef === ayah.ref;
            const translation = locale === "bn" ? ayah.translationBn : ayah.translationEn;
            const isTarget = highlight === ayah.number;

            return (
              <article
                key={ayah.ref}
                id={`ayah-${ayah.number}`}
                className={cn(
                  // `scroll-mt` clears the header *and* the pinned toolbar.
                  "relative scroll-mt-40 px-4 py-4 transition-colors sm:px-5",
                  isTarget && "bg-primary-soft/40",
                )}
              >
                {isTarget ? (
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" aria-hidden />
                ) : null}

                {/* One line of chrome per ayah: which verse it is, and what you
                    can do with it. Confirmation appears in this same line so
                    copying a verse never changes the height of the page. */}
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary-soft font-display text-[0.75rem] font-bold leading-none text-primary">
                    {toBnDigits(ayah.number)}
                  </span>
                  <span className="text-[0.6875rem] text-subtle-foreground">
                    <span className="sr-only">
                      {t("label.ayah")} {formatNumber(ayah.number, locale)} ·{" "}
                    </span>
                    {ayah.ref}
                  </span>
                  {ayah.sajda ? (
                    <Badge tone="accent" size="xs">
                      সাজদা
                    </Badge>
                  ) : null}

                  <span className="ml-auto flex shrink-0 items-center gap-1.5">
                    {copied ? (
                      <Badge tone="success" size="xs" icon={Check} className="animate-fade-in">
                        {t("action.copied")}
                      </Badge>
                    ) : null}
                    {shared ? (
                      <Badge tone="info" size="xs" icon={Check} className="animate-fade-in">
                        {t("action.copied")}
                      </Badge>
                    ) : null}
                    <span className="flex items-center gap-0.5">
                      <AyahAction
                        icon={Bookmark}
                        label={saved ? t("action.saved") : t("action.save")}
                        active={saved}
                        onClick={() => toggleSaved(ayah.ref)}
                      />
                      <AyahAction
                        icon={copied ? Check : Copy}
                        label={t("label.copyArabic")}
                        active={copied}
                        tone="success"
                        onClick={() => {
                          void copyText(`${ayah.arabic}\n\n${translation}\n— ${ayah.ref}`);
                          flash(setCopiedRef, ayah.ref);
                        }}
                      />
                      <AyahAction
                        icon={shared ? Check : Share2}
                        label={t("action.share")}
                        active={shared}
                        tone="info"
                        onClick={() => void share(ayah)}
                      />
                    </span>
                  </span>
                </div>

                <p
                  className={cn("arabic font-quran mt-2.5 text-foreground", ARABIC_SIZES[arabicSize])}
                  lang="ar"
                  dir="rtl"
                >
                  {ayah.arabic}
                </p>

                {/* Transliteration is told apart from the translation by
                    typography rather than by being boxed: a label, muted colour
                    and a smaller size, against the translation's display face.
                    Boxing it cost a surface and about 30px of height per ayah. */}
                {showTransliteration && ayah.transliterationBn ? (
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    <span className="eyebrow mr-1.5 text-subtle-foreground">
                      {t("label.transliteration")}
                    </span>
                    {ayah.transliterationBn}
                  </p>
                ) : null}

                {showTranslation ? (
                  <p className="mt-2.5 font-display text-[1rem] leading-[1.95] text-foreground">
                    {translation}
                  </p>
                ) : null}

                {showTafsir ? (
                  ayah.tafsirBn ? (
                    <Callout
                      tone="accent"
                      icon={Sparkles}
                      title={t("label.tafsir")}
                      className="mt-3.5 animate-fade-up"
                    >
                      {ayah.tafsirBn}
                    </Callout>
                  ) : (
                    <p className="mt-3 text-[0.6875rem] text-subtle-foreground">
                      {isBn
                        ? "এই আয়াতের সংক্ষিপ্ত তাফসীর এখনো যুক্ত করা হয়নি।"
                        : "No short tafsir note has been added for this ayah yet."}
                    </p>
                  )
                ) : null}
              </article>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useI18n } from "@/lib/i18n";
import { formatNumber, formatRef, gregorianDateBn, hijriDate, toBnDigits } from "@/lib/bn";
import { relativeTime } from "@/lib/utils";
import type { Localized } from "@/lib/types";

/**
 * Locale bridges.
 *
 * Pages are server components and cannot read React context, and neither can
 * they call `useI18n` — but every page still has to follow the visitor's
 * Bangla/English choice. These small client components are the seam: the page
 * keeps all of its data, routing and layout on the server and only these leaves
 * are client-rendered.
 *
 *   <T k="qa.title" />                    — an interface string
 *   <TList k="discussions.rules" />       — a dictionary list, as <li> items
 *   <Pick value={department.name} />      — a bilingual data field
 *   <Num value={1234} />                  — ১,২৩৪ or 1,234
 *   <Ref value="2:255" />                 — ২:২৫৫ or 2:255
 *   <TimeAgo iso={iso} />                 — "৩ ঘন্টা আগে" or "3h ago"
 *   <HijriDate /> / <GregDate />          — localized dates
 */

export function T({
  k,
  vars,
}: {
  k: string;
  vars?: Record<string, string | number>;
}) {
  const { t } = useI18n();
  return <>{t(k, vars)}</>;
}

/** Renders a dictionary list entry (e.g. the discussion rules) as <li> items. */
export function TList({ k, className }: { k: string; className?: string }) {
  const { tList } = useI18n();
  const items = tList(k);
  if (items.length === 0) return null;
  return (
    <>
      {items.map((item, i) => (
        <li key={i} className={className}>
          {item}
        </li>
      ))}
    </>
  );
}

export function Pick({ value, fallback }: { value: Localized | undefined; fallback?: string }) {
  const { pick } = useI18n();
  return <>{pick(value, fallback)}</>;
}

/** Locale-aware number, e.g. ১,২৩৪ / 1,234. */
export function Num({ value, className }: { value: number; className?: string }) {
  const { locale } = useI18n();
  return <span className={className}>{formatNumber(value, locale)}</span>;
}

/** Locale-aware verse/hadith reference, e.g. ২:২৫৫ / 2:255. */
export function Ref({ value, className }: { value: string; className?: string }) {
  const { locale } = useI18n();
  return <span className={className}>{formatRef(value, locale)}</span>;
}

/** Bengali numerals only when the site language is Bangla. */
export function Digits({ value, className }: { value: string | number; className?: string }) {
  const { isBn } = useI18n();
  return <span className={className}>{isBn ? toBnDigits(value) : String(value)}</span>;
}

export function TimeAgo({ iso, className }: { iso: string; className?: string }) {
  const { locale } = useI18n();
  return <span className={className}>{relativeTime(iso, locale)}</span>;
}

export function HijriDate({ className, day }: { className?: string; day?: Date }) {
  const { locale } = useI18n();
  return <span className={className}>{hijriDate(day ?? new Date(), locale)}</span>;
}

export function GregDate({ className, day }: { className?: string; day?: Date }) {
  const { locale } = useI18n();
  return <span className={className}>{gregorianDateBn(day ?? new Date(), locale)}</span>;
}

/** Exposes the active locale's *name* — used by language pickers. */
export function LocaleName({ className }: { className?: string }) {
  const { locale } = useI18n();
  return <span className={className}>{locale === "bn" ? "বাংলা" : "English"}</span>;
}

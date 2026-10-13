import type { ThemeColors } from "./tokens";

/**
 * One tone vocabulary for the whole interface, ported from the web's `tone.ts`.
 *
 * On the web each tone maps to Tailwind class strings; here it maps to explicit
 * `{ background, foreground, border }` triples resolved from the active theme,
 * so colours never drift between screens.
 */
export type Tone =
  | "primary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "scholar"
  | "user"
  | "admin";

export const TONES: Tone[] = [
  "primary",
  "accent",
  "info",
  "success",
  "warning",
  "danger",
  "neutral",
  "scholar",
  "user",
  "admin",
];

export interface ToneStyle {
  background: string;
  foreground: string;
  border: string;
}

/** Soft pill: tinted background + matching readable foreground. */
export function softTone(colors: ThemeColors): Record<Tone, ToneStyle> {
  return {
    primary: { background: colors.primarySoft, foreground: colors.primarySoftFg, border: "transparent" },
    accent: { background: colors.accentSoft, foreground: colors.accentSoftFg, border: "transparent" },
    info: { background: colors.infoSoft, foreground: colors.infoSoftFg, border: "transparent" },
    success: { background: colors.successSoft, foreground: colors.successSoftFg, border: "transparent" },
    warning: { background: colors.warningSoft, foreground: colors.warningSoftFg, border: "transparent" },
    danger: { background: colors.dangerSoft, foreground: colors.dangerSoftFg, border: "transparent" },
    neutral: { background: colors.surface3, foreground: colors.fgMuted, border: "transparent" },
    scholar: { background: colors.roleScholarSoft, foreground: colors.roleScholar, border: "transparent" },
    user: { background: colors.roleUserSoft, foreground: colors.roleUser, border: "transparent" },
    admin: { background: colors.roleAdminSoft, foreground: colors.roleAdmin, border: "transparent" },
  };
}

/** Solid fill for dots, bars and separators. */
export function solidTone(colors: ThemeColors): Record<Tone, string> {
  return {
    primary: colors.primary,
    accent: colors.accent,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    neutral: colors.fgSubtle,
    scholar: colors.roleScholar,
    user: colors.roleUser,
    admin: colors.roleAdmin,
  };
}

/** Foreground-only, for text that should be tinted without a background. */
export function textTone(colors: ThemeColors): Record<Tone, string> {
  return {
    primary: colors.primary,
    accent: colors.accent,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    neutral: colors.fgMuted,
    scholar: colors.roleScholar,
    user: colors.roleUser,
    admin: colors.roleAdmin,
  };
}

/** Soft border + tint, for outlined surfaces like alert panels. */
export function outlineTone(colors: ThemeColors): Record<Tone, ToneStyle> {
  return {
    primary: { background: colors.primarySoft, foreground: colors.primarySoftFg, border: colors.primary },
    accent: { background: colors.accentSoft, foreground: colors.accentSoftFg, border: colors.accent },
    info: { background: colors.infoSoft, foreground: colors.infoSoftFg, border: colors.info },
    success: { background: colors.successSoft, foreground: colors.successSoftFg, border: colors.success },
    warning: { background: colors.warningSoft, foreground: colors.warningSoftFg, border: colors.warning },
    danger: { background: colors.dangerSoft, foreground: colors.dangerSoftFg, border: colors.danger },
    neutral: { background: colors.surface2, foreground: colors.fg, border: colors.border },
    scholar: { background: colors.roleScholarSoft, foreground: colors.roleScholar, border: colors.roleScholar },
    user: { background: colors.roleUserSoft, foreground: colors.roleUser, border: colors.roleUser },
    admin: { background: colors.roleAdminSoft, foreground: colors.roleAdmin, border: colors.roleAdmin },
  };
}

/** Safe fallback when data carries a free-form tone string. */
export function asTone(value: string | undefined): Tone {
  return TONES.includes(value as Tone) ? (value as Tone) : "neutral";
}

export const STATUS_TONES: Record<string, Tone> = {
  open: "info",
  routed: "warning",
  answered: "success",
  closed: "neutral",
  draft: "neutral",
  "in-review": "warning",
  published: "success",
  "changes-requested": "danger",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  suspended: "danger",
  active: "success",
  clean: "success",
  "under-review": "warning",
  locked: "neutral",
  resolved: "success",
  dismissed: "neutral",
  sahih: "success",
  hasan: "info",
  daif: "danger",
  "muttafaqun-alaih": "primary",
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export function statusTone(status: string): Tone {
  return STATUS_TONES[status] ?? "neutral";
}

/**
 * One tone vocabulary for the whole interface.
 *
 * Tailwind needs literal class names, so each tone maps to complete class
 * strings rather than interpolated fragments. Every tinted component
 * (Badge, Chip, StatCard, DepartmentPill…) reads from here so colours never
 * drift between pages.
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

/** Soft pill: tinted background + matching readable foreground. */
export const softTone: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  accent: "bg-accent-soft text-accent-soft-foreground",
  info: "bg-info-soft text-info-soft-foreground",
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  danger: "bg-danger-soft text-danger-soft-foreground",
  neutral: "bg-surface-3 text-muted-foreground",
  scholar: "bg-role-scholar-soft text-role-scholar",
  user: "bg-role-user-soft text-role-user",
  admin: "bg-role-admin-soft text-role-admin",
};

/** Solid fill for dots, bars and chart segments. */
export const solidTone: Record<Tone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-subtle-foreground",
  scholar: "bg-role-scholar",
  user: "bg-role-user",
  admin: "bg-role-admin",
};

/** Foreground-only, for text that should be tinted without a background. */
export const textTone: Record<Tone, string> = {
  primary: "text-primary",
  accent: "text-accent",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-muted-foreground",
  scholar: "text-role-scholar",
  user: "text-role-user",
  admin: "text-role-admin",
};

/** Soft border + tint, for outlined surfaces like alert panels. */
export const outlineTone: Record<Tone, string> = {
  primary: "border-primary/35 bg-primary-soft/45",
  accent: "border-accent/35 bg-accent-soft/45",
  info: "border-info/35 bg-info-soft/45",
  success: "border-success/35 bg-success-soft/45",
  warning: "border-warning/35 bg-warning-soft/45",
  danger: "border-danger/35 bg-danger-soft/45",
  neutral: "border-border bg-surface-2",
  scholar: "border-role-scholar/35 bg-role-scholar-soft/45",
  user: "border-role-user/35 bg-role-user-soft/45",
  admin: "border-role-admin/35 bg-role-admin-soft/45",
};

/** SVG stroke/fill tokens, for the hand-rolled charts. */
export const chartTone: Record<Tone, string> = {
  primary: "var(--chart-1)",
  accent: "var(--chart-2)",
  info: "var(--chart-3)",
  success: "var(--chart-5)",
  warning: "var(--chart-2)",
  danger: "var(--chart-4)",
  neutral: "var(--fg-subtle)",
  scholar: "var(--chart-1)",
  user: "var(--chart-3)",
  admin: "var(--chart-4)",
};

/** Safe fallback when data carries a free-form tone string. */
export function asTone(value: string | undefined): Tone {
  return TONES.includes(value as Tone) ? (value as Tone) : "neutral";
}

export const STATUS_TONES: Record<string, Tone> = {
  // questions
  open: "info",
  routed: "warning",
  answered: "success",
  closed: "neutral",
  // editorial
  draft: "neutral",
  "in-review": "warning",
  published: "success",
  "changes-requested": "danger",
  // moderation & applications
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
  // hadith grades
  sahih: "success",
  hasan: "info",
  daif: "danger",
  "muttafaqun-alaih": "primary",
  // severity
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export function statusTone(status: string): Tone {
  return STATUS_TONES[status] ?? "neutral";
}

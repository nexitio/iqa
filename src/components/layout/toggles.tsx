"use client";

import { useTheme } from "next-themes";
import { Languages, Monitor, Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useHydrated } from "@/lib/use-now";
import { cn } from "@/lib/utils";

/**
 * Bangla ⇄ English switch. The control is a single pill so it stays discoverable
 * without taking up room in a crowded header.
 */
export function LocaleToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale, toggleLocale, t } = useI18n();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t("misc.languageToggle")}
      title={t("misc.languageToggle")}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-[0.75rem] font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
        compact ? "h-8" : "h-9",
        className,
      )}
    >
      <Languages className="size-3.5" aria-hidden />
      <span className={locale === "bn" ? "text-primary" : undefined}>বাং</span>
      <span className="text-border-strong">/</span>
      <span className={locale === "en" ? "text-primary" : undefined}>EN</span>
    </button>
  );
}

/**
 * Cycles light → dark → system. Renders a stable placeholder until mounted so
 * the server and first client render agree.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();
  const hydrated = useHydrated();

  const order = ["light", "dark", "system"] as const;
  // Until hydration the stored theme is unknown, so render the neutral
  // "system" state. Without this the server emits "system" and the client
  // immediately emits the resolved theme, which React reports as a mismatch.
  const current = (hydrated ? theme ?? "system" : "system") as (typeof order)[number];
  const Icon = current === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => {
        const from = hydrated ? current : (theme ?? "system") as (typeof order)[number];
        const next = order[(order.indexOf(from) + 1) % order.length];
        setTheme(next);
      }}
      aria-label={t("misc.themeToggle")}
      title={current === "light" ? t("settings.light") : current === "dark" ? t("settings.dark") : t("settings.system")}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

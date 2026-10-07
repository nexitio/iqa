"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { FOOTER_LINKS } from "./nav-config";

export function Footer() {
  const { t, pick } = useI18n();

  return (
    <footer className="mt-12 border-t border-border bg-surface-2/60">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card"
                aria-hidden
              >
                <span className="font-display text-lg font-bold leading-none">ع</span>
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-none text-foreground">ইলম</p>
                <p className="text-[0.6875rem] text-subtle-foreground">Ilm</p>
              </div>
            </div>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground">
              {t("misc.footerAbout")}
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-[0.75rem] text-subtle-foreground">
              <Heart className="size-3.5 text-danger" aria-hidden />
              {t("misc.madeWithAdab")}
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <nav key={group.title.en} aria-label={pick(group.title)}>
              <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-foreground">
                {pick(group.title)}
              </p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={`${group.title.en}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-[0.8125rem] text-muted-foreground transition-colors hover:text-primary"
                    >
                      {pick(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
            {t("misc.footerDisclaimer")}
          </p>
          <p className="shrink-0 text-[0.75rem] text-subtle-foreground">
            © {new Date().getFullYear()} Ilm · বাংলাদেশ
          </p>
        </div>
      </div>
    </footer>
  );
}

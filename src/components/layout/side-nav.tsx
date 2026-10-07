"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { CountPill } from "@/components/ui";
import { SIDEBAR_GROUPS, SIDEBAR_TOP, type NavLink } from "./nav-config";

export function SideNav({
  className,
  /** Rendered under the links — used for the prayer widget and streak card. */
  extra,
}: {
  className?: string;
  extra?: ReactNode;
}) {
  const pathname = usePathname();
  const { t, pick } = useI18n();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  /** One row, shared by the top link and the groups so the two cannot drift. */
  const row = (link: NavLink, key: string) => {
    const active = isActive(link.href);
    return (
      <li key={key}>
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-colors",
            active
              ? "bg-primary-soft text-primary-soft-foreground"
              : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
          )}
        >
          <link.icon
            className={cn("size-4 shrink-0", active ? "text-primary" : "text-subtle-foreground")}
            aria-hidden
          />
          <span className="truncate">{pick(link.label)}</span>
          {link.badge ? <CountPill value={link.badge} tone="primary" className="ml-auto" /> : null}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label={t("nav.menu")} className={cn("flex flex-col gap-6", className)}>
      <ul className="space-y-0.5">{SIDEBAR_TOP.map((link) => row(link, link.href))}</ul>

      {SIDEBAR_GROUPS.map((group) => (
        <div key={group.title.en}>
          <p className="px-3 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            {pick(group.title)}
          </p>
          <ul className="mt-2 space-y-0.5">
            {group.links
              .filter((link) => !link.secondary)
              .map((link) => row(link, `${group.title.en}-${link.href}`))}
          </ul>
        </div>
      ))}

      {extra ? <div className="mt-1">{extra}</div> : null}
    </nav>
  );
}

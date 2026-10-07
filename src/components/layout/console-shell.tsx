"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, Bell, ShieldCheck, GraduationCap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Avatar, Badge, Button, CountPill } from "@/components/ui";
import { LocaleToggle, ThemeToggle } from "./toggles";
import { ADMIN_NAV, SCHOLAR_NAV } from "./nav-config";

/**
 * Console shell shared by the Scholar and Admin workspaces.
 *
 * Deliberately distinct from the public shell: denser, task-oriented, with the
 * role identity always visible so a scholar never confuses the two contexts.
 */
export function ConsoleShell({
  role,
  children,
}: {
  role: "scholar" | "admin";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { t, pick } = useI18n();

  const nav = role === "scholar" ? SCHOLAR_NAV : ADMIN_NAV;
  const isScholar = role === "scholar";

  const identity = isScholar
    ? {
        name: "মুফতি আব্দুর রহমান",
        meta: "ফিকহ ও ইবাদত বিভাগ",
        badge: t("nav.scholarConsole"),
        tone: "scholar" as const,
        icon: GraduationCap,
        color: "#0d6b4f",
      }
    : {
        name: "ইলম অ্যাডমিন",
        meta: "সুপার অ্যাডমিন",
        badge: t("nav.adminConsole"),
        tone: "admin" as const,
        icon: ShieldCheck,
        color: "#a3405f",
      };

  const isActive = (href: string) =>
    href === "/scholar" || href === "/admin"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-background-subtle">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span
              className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-card"
              aria-hidden
            >
              <span className="font-display text-lg font-bold leading-none">ع</span>
            </span>
            <span className="hidden leading-none sm:block">
              <span className="block font-display text-base font-bold text-foreground">ইলম</span>
              <span className="mt-0.5 block text-[0.625rem] text-subtle-foreground">{identity.badge}</span>
            </span>
          </Link>

          <Badge tone={identity.tone} icon={identity.icon} className="ml-1 hidden sm:inline-flex">
            {identity.badge}
          </Badge>

          <div className="ml-auto flex items-center gap-2">
            <LocaleToggle className="hidden sm:inline-flex" />
            <ThemeToggle className="hidden sm:grid" />
            <Link
              href="/notifications"
              aria-label={t("nav.notifications")}
              className="relative grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-surface-3 hover:text-foreground"
            >
              <Bell className="size-5" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" />
            </Link>
            <Button href="/" variant="ghost" size="sm" icon={ArrowLeft} className="hidden md:inline-flex">
              {t("action.back")}
            </Button>
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface p-1 pr-3">
              <Avatar name={identity.name} color={identity.color} size="sm" verified />
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-[0.75rem] font-semibold leading-tight text-foreground">
                  {identity.name}
                </span>
                <span className="block truncate text-[0.625rem] text-subtle-foreground">{identity.meta}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-[16rem] shrink-0 border-r border-border bg-surface lg:block">
          <div className="no-scrollbar sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto p-3">
            <nav aria-label={identity.badge}>
              <ul className="space-y-0.5">
                {nav.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-colors",
                          active
                            ? "bg-primary-soft text-primary-soft-foreground"
                            : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                        )}
                      >
                        <item.icon
                          className={cn("size-4 shrink-0", active ? "text-primary" : "text-subtle-foreground")}
                          aria-hidden
                        />
                        <span className="truncate">{pick(item.label)}</span>
                        {item.badge ? <CountPill value={item.badge} tone="primary" className="ml-auto" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-4 rounded-panel border border-border bg-surface-2 p-4">
              <p className="text-[0.75rem] font-semibold text-foreground">
                {isScholar ? t("console.yourDepartments") : t("admin.departmentManagement")}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(isScholar
                  ? ["ফিকহ", "ইবাদত", "অর্থনীতি"]
                  : ["ফিকহ", "পরিবার", "অর্থনীতি", "তরুণ"]
                ).map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-surface px-2 py-1 text-[0.6875rem] font-medium text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 lg:pb-10">{children}</main>
      </div>

      {/* Compact console tab bar on small screens */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="flex items-stretch justify-between">
          {nav.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-medium",
                    active ? "text-primary" : "text-subtle-foreground",
                  )}
                >
                  <item.icon className="size-5" strokeWidth={active ? 2.4 : 1.9} aria-hidden />
                  <span className="truncate">{pick(item.label)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

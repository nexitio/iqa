"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { CURRENT_USER, NOTIFICATIONS } from "@/lib/data/personal";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useDismissable } from "@/lib/use-dismissable";
import { Avatar, CountPill } from "@/components/ui";
import { LocaleToggle, ThemeToggle } from "./toggles";
import { NotificationBell } from "./notification-bell";
import { SIDEBAR_GROUPS, SIDEBAR_TOP, ACCOUNT_NAV } from "./nav-config";

/**
 * The bar is 3.5rem (56px), not the 4.25rem it started at.
 *
 * Nothing in it needs more: every control is a 36px square and the wordmark is
 * two lines of small type. The extra 12px bought nothing and cost the reader a
 * strip of content on every page. `--header-h` in globals.css is derived from
 * this value, so the pinned columns and the reader's docked toolbar follow.
 */
const BAR_HEIGHT = "h-14";

/** Brand lockup: an Arabic letterform tile plus the bilingual wordmark. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Ilm">
      <span
        className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-card transition-transform duration-200 group-hover:scale-[1.04]"
        aria-hidden
      >
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent" />
        <span className="font-display text-[1.05rem] font-bold leading-none">ع</span>
      </span>
      {!compact ? (
        <span className="hidden leading-none sm:block">
          <span className="block font-display text-[1.0625rem] font-bold tracking-tight text-foreground">
            ইলম
          </span>
          <span className="mt-0.5 block text-[0.625rem] font-medium tracking-[0.14em] text-subtle-foreground">
            ILM · জ্ঞান
          </span>
        </span>
      ) : null}
    </Link>
  );
}

/** One square, quiet control — the shared shape of the ask, bell and menu buttons. */
const iconButton =
  "grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground";

export function Topbar() {
  const pathname = usePathname();
  const { t, pick } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  /**
   * The bell owns read state and the badge on its own trigger; this mirrors the
   * count so the account menu can show the same number beside its
   * "notifications" row. Seeded from the fixture so the first paint is right.
   */
  const [unread, setUnread] = useState(
    () => NOTIFICATIONS.filter((notification) => !notification.read).length,
  );

  const closeAccount = () => setAccountOpen(false);
  const closeNotifications = () => setNotificationsOpen(false);

  // Outside pointer-down and Escape, on the document. Not a `fixed inset-0`
  // sheet: the bar's `backdrop-blur` makes it a containing block for fixed
  // descendants, so that sheet only ever covered the bar itself.
  useDismissable(accountOpen, closeAccount, (target) =>
    Boolean(accountRef.current?.contains(target)),
  );

  // Reset every transient overlay when the route changes. Adjusting state during
  // render (rather than in an effect) is React's documented pattern for
  // resetting on a prop change, and avoids a cascading render pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (menuOpen) setMenuOpen(false);
    if (accountOpen) setAccountOpen(false);
    if (notificationsOpen) setNotificationsOpen(false);
  }

  /**
   * The search palette is mounted and owned by `AppShell`, which also owns the
   * ⌘K shortcut — the header only asks it to open. Keeping one owner is what
   * stops two palettes from existing at once.
   */
  const openSearch = () => window.dispatchEvent(new CustomEvent("ilm:open-search"));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  /** The section the current route belongs to, for the header's orientation label. */
  const section = [...SIDEBAR_TOP, ...SIDEBAR_GROUPS.flatMap((group) => group.links)]
    .filter((link) => !link.secondary)
    .find((link) => isActive(link.href));

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className={cn("mx-auto flex w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8", BAR_HEIGHT)}>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav.menu")}
            className={cn(iconButton, "lg:hidden")}
          >
            <Menu className="size-[1.15rem]" />
          </button>

          <BrandMark />

          {/* No navigation links here on desktop: the sidebar is the single
              source of navigation, and a second copy of the same five links in
              the header made the reader choose between two identical menus.
              What the header keeps is orientation — where you are right now. */}
          {section ? (
            <div className="ml-3 hidden items-center gap-2 border-l border-border pl-3 lg:flex">
              <section.icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="text-[0.875rem] font-medium text-foreground">
                {pick(section.label)}
              </span>
            </div>
          ) : null}

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              className="hidden h-9 w-52 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 text-left text-[0.8125rem] text-subtle-foreground transition-colors hover:border-border-strong hover:bg-surface md:flex xl:w-64"
            >
              <Search className="size-[0.95rem] shrink-0" aria-hidden />
              <span className="flex-1 truncate">{t("action.search")}</span>
              <kbd className="hidden shrink-0 rounded border border-border bg-surface px-1.5 py-0.5 font-sans text-[0.625rem] font-medium text-subtle-foreground xl:inline-block">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={openSearch}
              aria-label={t("action.search")}
              className={cn(iconButton, "md:hidden")}
            >
              <Search className="size-[1.15rem]" />
            </button>

            {/* No ask button here. Composing has one home — the add disc on a
                large screen, the tab bar's centre on a small one — and a second
                door in the header made three controls in a row that all asked
                the reader to create something. What the bar keeps is the bell
                and the account menu: the things a reader checks, not the thing
                they do. */}

            {/* Controlled here only so the two menus cannot be open at once:
                opening the bell closes the account menu, and opening the account
                menu closes the bell. */}
            <NotificationBell
              open={notificationsOpen}
              onOpenChange={(next) => {
                setNotificationsOpen(next);
                if (next) setAccountOpen(false);
              }}
              onUnreadChange={setUnread}
            />

            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((open) => !open);
                  closeNotifications();
                }}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-1 rounded-full p-0.5 transition-colors hover:bg-surface-3"
              >
                <Avatar
                  name={CURRENT_USER.name}
                  color={CURRENT_USER.avatarColor}
                  size="sm"
                  verified={CURRENT_USER.isVerified}
                />
                <ChevronDown
                  className={cn(
                    "hidden size-3.5 text-subtle-foreground transition-transform sm:block",
                    accountOpen && "rotate-180",
                  )}
                />
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-[17rem] animate-scale-in overflow-hidden rounded-panel border border-border bg-surface shadow-overlay"
                >
                  <div className="flex items-center gap-3 border-b border-border bg-surface-2 p-4">
                    <Avatar name={CURRENT_USER.name} color={CURRENT_USER.avatarColor} size="md" verified />
                    <div className="min-w-0">
                      <p className="truncate text-[0.875rem] font-semibold text-foreground">
                        {CURRENT_USER.name}
                      </p>
                      <p className="truncate text-[0.75rem] text-muted-foreground">{CURRENT_USER.email}</p>
                    </div>
                  </div>

                  <div className="p-1.5">
                    {ACCOUNT_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={closeAccount}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.8125rem] text-foreground transition-colors hover:bg-surface-3"
                      >
                        <item.icon className="size-4 text-subtle-foreground" aria-hidden />
                        {pick(item.label)}
                        {item.href === "/notifications" && unread > 0 ? (
                          <CountPill value={unread} tone="danger" className="ml-auto" />
                        ) : null}
                      </Link>
                    ))}
                  </div>

                  {/* Locale and theme live here too, so the bar stays calm. */}
                  <div className="flex items-center justify-between gap-2 border-t border-border p-3">
                    <LocaleToggle />
                    <ThemeToggle />
                  </div>

                  <div className="border-t border-border p-1.5">
                    <Link
                      href="/scholar"
                      role="menuitem"
                      onClick={closeAccount}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.8125rem] text-foreground transition-colors hover:bg-surface-3"
                    >
                      <GraduationCap className="size-4 text-role-scholar" aria-hidden />
                      {t("nav.scholarConsole")}
                    </Link>
                    <Link
                      href="/admin"
                      role="menuitem"
                      onClick={closeAccount}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.8125rem] text-foreground transition-colors hover:bg-surface-3"
                    >
                      <ShieldCheck className="size-4 text-role-admin" aria-hidden />
                      {t("nav.adminConsole")}
                    </Link>
                  </div>

                  <div className="border-t border-border p-1.5">
                    <Link
                      href="/login"
                      role="menuitem"
                      onClick={closeAccount}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.8125rem] text-danger transition-colors hover:bg-danger-soft"
                    >
                      <LogOut className="size-4" aria-hidden />
                      {t("action.signOut")}
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[86vw] animate-slide-left flex-col bg-surface shadow-overlay">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <BrandMark />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t("action.close")}
                className={iconButton}
              >
                <X className="size-[1.15rem]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <Link
                href="/questions/ask"
                className="mb-5 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-[0.875rem] font-semibold text-primary-foreground shadow-card"
              >
                <Plus className="size-4" strokeWidth={2.5} aria-hidden />
                {t("action.askScholar")}
              </Link>
              <nav className="space-y-5">
                {/* Same order as the desktop rail: the home feed first, then the
                    groups — the drawer is this sidebar on a small screen. */}
                <ul className="space-y-0.5">
                  {SIDEBAR_TOP.map((link) => {
                    const active = isActive(link.href);
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-colors",
                            active
                              ? "bg-primary-soft text-primary-soft-foreground"
                              : "text-foreground hover:bg-surface-3",
                          )}
                        >
                          <link.icon
                            className={cn("size-4 shrink-0", active ? "text-primary" : "text-subtle-foreground")}
                            aria-hidden
                          />
                          {pick(link.label)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {SIDEBAR_GROUPS.map((group) => (
                  <div key={group.title.en}>
                    <p className="eyebrow px-2">{pick(group.title)}</p>
                    <ul className="mt-2 space-y-0.5">
                      {group.links
                        .filter((l) => !l.secondary)
                        .map((link) => {
                          const active = isActive(link.href);
                          return (
                            <li key={`${group.title.en}-${link.href}`}>
                              <Link
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-colors",
                                  active
                                    ? "bg-primary-soft text-primary-soft-foreground"
                                    : "text-foreground hover:bg-surface-3",
                                )}
                              >
                                <link.icon
                                  className={cn(
                                    "size-4 shrink-0",
                                    active ? "text-primary" : "text-subtle-foreground",
                                  )}
                                  aria-hidden
                                />
                                {pick(link.label)}
                              </Link>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Shared identity chip reused by the consoles. */
export function UserChip({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Avatar name={CURRENT_USER.name} color={CURRENT_USER.avatarColor} size="sm" verified />
      <div className="min-w-0">
        <p className="truncate text-[0.8125rem] font-semibold leading-tight text-foreground">
          {CURRENT_USER.name}
        </p>
        <p className="flex items-center gap-1 text-[0.6875rem] text-subtle-foreground">
          <UserRound className="size-3" aria-hidden />
          {CURRENT_USER.email}
        </p>
      </div>
    </div>
  );
}

export { Settings };

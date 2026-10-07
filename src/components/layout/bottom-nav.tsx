"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV } from "./nav-config";

/**
 * Mobile tab bar. Five slots with the centre reserved for the primary action,
 * which is the habit the product most wants to encourage.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { t, pick } = useI18n();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const left = BOTTOM_NAV.slice(0, 2);
  const right = BOTTOM_NAV.slice(2);

  const renderItem = (item: (typeof BOTTOM_NAV)[number]) => (
    <Link
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[0.625rem] font-medium transition-colors",
        isActive(item.href) ? "text-primary" : "text-subtle-foreground",
      )}
    >
      <item.icon className="size-5" strokeWidth={isActive(item.href) ? 2.4 : 1.9} aria-hidden />
      {pick(item.label)}
    </Link>
  );

  return (
    <nav
      aria-label={t("nav.menu")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch">
        {left.map(renderItem)}
        <div className="relative flex w-16 shrink-0 justify-center">
          {/* No caption: a raised action disc sits over the caption row, so the
              text was unreadable behind it. The label stays for screen readers. */}
          <Link
            href="/questions/ask"
            aria-label={t("action.ask")}
            className="absolute -top-5 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-overlay ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="size-6" strokeWidth={2.4} />
          </Link>
        </div>
        {right.map(renderItem)}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountPill } from "./badge";

export interface TabItem {
  id: string;
  // ReactNode so labels can carry the <T k="..." /> localization bridge.
  label: ReactNode;
  icon?: LucideIcon;
  count?: number | string;
  /** Optional content rendered under the tab strip when this tab is active. */
  content?: ReactNode;
  disabled?: boolean;
}

/**
 * Uncontrolled tab strip with panels. Kept client-side because the panel
 * switching is purely presentational.
 */
export function Tabs({
  items,
  defaultTab,
  className,
  panelClassName,
  variant = "underline",
}: {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
  panelClassName?: string;
  variant?: "underline" | "pill";
}) {
  const [active, setActive] = useState(defaultTab ?? items[0]?.id);
  const baseId = useId();
  const activeItem = items.find((i) => i.id === active);

  return (
    <div className={className}>
      <div
        role="tablist"
        className={cn(
          "no-scrollbar flex items-center gap-1 overflow-x-auto",
          variant === "underline"
            ? "border-b border-border"
            : "w-fit rounded-full border border-border bg-surface-2 p-1",
        )}
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              id={`${baseId}-tab-${item.id}`}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${item.id}`}
              disabled={item.disabled}
              onClick={() => setActive(item.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[0.8125rem] font-medium transition-colors disabled:opacity-50",
                variant === "underline"
                  ? cn(
                      "-mb-px border-b-2 px-3 pb-2.5 pt-1",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
                    )
                  : cn(
                      "h-8 rounded-full px-3.5",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-card"
                        : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                    ),
              )}
            >
              {item.icon ? <item.icon className="size-3.5" aria-hidden /> : null}
              {item.label}
              {item.count !== undefined ? (
                <CountPill value={item.count} tone={isActive && variant === "pill" ? "primary" : "neutral"} />
              ) : null}
            </button>
          );
        })}
      </div>
      {activeItem?.content !== undefined ? (
        <div
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.id}`}
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          className={cn("pt-5", panelClassName)}
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}

/**
 * URL-driven tabs. Use when the tab should be shareable/bookmarkable — the
 * server page reads `searchParams.tab` and renders the matching panel.
 */
export function TabLinks({
  items,
  active,
  className,
  variant = "underline",
}: {
  items: { id: string; label: ReactNode; href: string; icon?: LucideIcon; count?: number | string }[];
  active: string;
  className?: string;
  variant?: "underline" | "pill";
}) {
  return (
    <div
      className={cn(
        "no-scrollbar flex items-center gap-1 overflow-x-auto",
        variant === "underline"
          ? "border-b border-border"
          : "w-fit rounded-full border border-border bg-surface-2 p-1",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[0.8125rem] font-medium transition-colors",
              variant === "underline"
                ? cn(
                    "-mb-px border-b-2 px-3 pb-2.5 pt-1",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )
                : cn(
                    "h-8 rounded-full px-3.5",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                  ),
            )}
          >
            {item.icon ? <item.icon className="size-3.5" aria-hidden /> : null}
            {item.label}
            {item.count !== undefined ? (
              <CountPill value={item.count} tone={isActive && variant === "pill" ? "primary" : "neutral"} />
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

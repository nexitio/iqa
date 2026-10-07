"use client";

import { useEffect, useState, type ReactNode } from "react";
import { SideNav } from "./side-nav";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";
import { SearchCommand } from "./search-command";

/**
 * Public application shell.
 *
 * Desktop is a three-column frame — navigation, content, optional rail — that
 * uses the full window rather than leaving dead gutters. Mobile collapses to a
 * tab bar with a raised ask action.
 *
 * Note the sidebar deliberately has no `max-height`/`overflow` wrapper: an inner
 * scroll container produced a second, permanently visible scrollbar beside the
 * page one. The nav is simply sticky and scrolls with the page on short
 * viewports.
 */
export function AppShell({
  children,
  /** Content pinned under the sidebar links (prayer times, streak, …). */
  sidebarExtra,
  /** Optional right-hand column, e.g. related knowledge or filters. */
  rail,
}: {
  children: ReactNode;
  sidebarExtra?: ReactNode;
  rail?: ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Allows non-header triggers (empty states, keyboard hint) to open the palette.
  useEffect(() => {
    const onOpen = () => setSearchOpen(true);
    window.addEventListener("ilm:open-search", onOpen);
    return () => window.removeEventListener("ilm:open-search", onOpen);
  }, []);

  // ⌘K / Ctrl+K toggles the palette from anywhere. It lives here, not in the
  // palette itself, because the palette is unmounted while closed.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Ambient wash: gives the flat app background a little depth. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[22rem] bg-gradient-to-b from-primary-soft/50 to-transparent"
        aria-hidden
      />

      {/* The header must be a direct child of the page-height container.
          Wrapping it in a div made that div the sticky containing block, so the
          header's sticky range was its own height and it scrolled away. */}
      <Topbar />

      {/* Columns stretch to the row's full height on purpose: a sticky child
          can only stick inside its containing block, so a start-aligned column
          that is only as tall as its own nav stops pinning the moment the
          reader scrolls past it. Stretching is invisible (the columns are
          transparent) and gives both the nav and the rail a full-page range. */}
      {/* `--pin-top` is declared in globals.css and equals the header plus the
          padding below it, so a pinned column starts exactly where a static one
          does and never shifts by a pixel when scrolling begins. */}
      {/* The bottom gap lives on `main`, not on this row: a sticky child is
          bounded by its container's *content* box, so bottom padding here would
          push the pinned columns up by that much at the end of the page. */}
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 gap-6 px-4 pt-6 sm:px-6 lg:gap-8 lg:px-8 lg:pt-7">
        <aside className="hidden w-[15.5rem] shrink-0 lg:block">
          {/* A pinned column taller than the viewport strands its own bottom:
              it sticks at the top and the rest can never be scrolled into view.
              Capping the height and letting the column scroll inside itself
              keeps every link (and the prayer widget) reachable while it stays
              pinned. The scrollbar is hidden so the page never shows two. */}
          <div className="no-scrollbar sticky top-[var(--pin-top)] max-h-[var(--pin-room)] overflow-y-auto">
            <SideNav extra={sidebarExtra} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-12">{children}</main>

        {rail ? (
          <aside className="hidden w-[21rem] shrink-0 xl:block">
            <div className="no-scrollbar sticky top-[var(--pin-top)] max-h-[var(--pin-room)] space-y-4 overflow-y-auto">
              {rail}
            </div>
          </aside>
        ) : null}
      </div>

      {/* No footer: it repeated the sidebar's destinations a third time, and
          skipping it also means the pinned columns end with the content instead
          of being pushed up by a block that sits below their container. */}
      <BottomNav />
      {searchOpen ? <SearchCommand onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}

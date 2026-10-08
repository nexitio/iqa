"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui";
import { PostCard, PostCardSkeleton, type ResolvedPost } from "@/components/social";
import { toBnDigits } from "@/lib/bn";
import { cn } from "@/lib/utils";

/**
 * The feed's endless stream, plus the "new posts" pill.
 *
 * The first page is server-rendered, so the feed holds real content before any
 * JavaScript runs, and further pages are appended as a sentinel scrolls into
 * view. The delay before each append is where the API's page request will live;
 * until then it stands in for the network so the skeleton is visible.
 *
 * The mock set is finite, so the stream recycles it — each pass gets distinct
 * keys — and stops after `MAX_ROUNDS` with an honest end-of-feed line. An
 * endless scroll over a finite dataset should announce its end rather than
 * pretend there is more.
 *
 * A reader part-way down the feed should never have new posts injected above
 * them — that moves the text they are reading. Arrivals are therefore held in a
 * queue while they are scrolled down, and the pill is the only way they enter
 * the stream: pages are appended, arrivals are prepended, and only ever on
 * request.
 */
const PAGE_SIZE = 6;
const MAX_ROUNDS = 6;
const LOAD_DELAY_MS = 300;

/** Where the simulated arrival source lives until a realtime feed exists. */
const FIRST_ARRIVAL_MS = 12_000;
const ARRIVAL_EVERY_MS = 20_000;
/** Below this scroll offset the reader is "at the top" and needs no pill. */
const AT_TOP_PX = 320;
/** How long a new arrival must stay on screen before its marker is spent. */
const SEEN_AFTER_MS = 1600;

/**
 * An arrival, marked until it has been read.
 *
 * The pill promises "৩ টি নতুন পোস্ট", so the posts themselves have to show which
 * three are new — otherwise the promise evaporates the moment the list scrolls.
 * The marker is spent by *dwell*: the card must hold a third of the viewport for
 * a moment, so a glance past it mid-scroll does not consume the claim. Both the
 * chip and the ring fade rather than vanish, which reads as "read" instead of
 * "disappeared".
 */
function ArrivalCard({ post }: { post: ResolvedPost }) {
  const [seen, setSeen] = useState(false);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = card.current;
    if (!el) return;

    // Without an observer we cannot tell when the card is read, so the marker
    // simply expires — better than leaving a permanent "new" claim on a post.
    if (typeof IntersectionObserver === "undefined") {
      const fallback = window.setTimeout(() => setSeen(true), SEEN_AFTER_MS * 3);
      return () => window.clearTimeout(fallback);
    }

    let dwell: number | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            if (dwell === null) {
              dwell = window.setTimeout(() => setSeen(true), SEEN_AFTER_MS);
            }
          } else if (dwell !== null) {
            window.clearTimeout(dwell);
            dwell = null;
          }
        }
      },
      { threshold: [0.35] },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (dwell !== null) window.clearTimeout(dwell);
    };
  }, []);

  return (
    <div ref={card} className="relative">
      <span
        aria-hidden={seen}
        className={cn(
          // Inside the row's own top-right corner: with rows touching, a chip
          // floated above the card would sit on the divider of the item before it.
          "pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-primary-foreground transition-all duration-500",
          seen ? "opacity-0" : "opacity-100",
        )}
      >
        নতুন
      </span>
      <PostCard
        post={post}
        className={cn(
          "transition-all duration-500",
          // A ring rather than a border colour: rings compose with the card's
          // own shadow instead of fighting the border utility already on it.
          seen ? undefined : "ring-1 ring-primary/40",
        )}
      />
    </div>
  );
}

export function FeedStream({
  posts,
  initial = PAGE_SIZE,
}: {
  posts: ResolvedPost[];
  /** How many posts the server renders. */
  initial?: number;
}) {
  const total = posts.length * MAX_ROUNDS;
  const [count, setCount] = useState(Math.min(initial, total));
  const [loading, setLoading] = useState(false);
  /** Arrivals already in the stream — newest first. */
  const [arrived, setArrived] = useState<ResolvedPost[]>([]);
  /** Arrivals waiting for the reader: shown only through the pill. */
  const [queued, setQueued] = useState<ResolvedPost[]>([]);
  const sentinel = useRef<HTMLDivElement>(null);
  const stream = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  /** How many arrivals this component has ever published — arrival ids, not per-effect ones. */
  const arrivalTick = useRef(0);

  const exhausted = count >= total;

  const loadMore = useCallback(() => {
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setCount((c) => Math.min(c + PAGE_SIZE, total));
      setLoading(false);
      timer.current = null;
    }, LOAD_DELAY_MS);
  }, [total]);

  // Drop a pending append if the reader navigates away mid-load.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    const el = sentinel.current;
    if (!el || exhausted || loading || typeof IntersectionObserver === "undefined") {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      // Start fetching a little before the sentinel is reached, so the next
      // posts are usually already there by the time the reader arrives.
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [exhausted, loading, loadMore, count]);

  /**
   * Stand-in for the realtime feed.
   *
   * It re-publishes items from the resolved set with a fresh timestamp and an
   * honest reason, cycling from the end of the list so an arrival is rarely the
   * post already on screen. Replace this effect with the subscription/refetch;
   * everything downstream already behaves correctly.
   */
  useEffect(() => {
    if (posts.length === 0) return;

    const arrive = () => {
      // The counter lives in a ref, not in this effect's closure.
      //
      // It is the arrival's identity: it is what makes the key unique. A counter
      // declared inside the effect restarts at zero every time the effect runs,
      // so a second run would mint `-live-1` again while the first run's arrival
      // is still in state — two children with the same key, which React resolves
      // by dropping or duplicating one. Effect re-runs are not hypothetical: Fast
      // Refresh does it on every edit, and any change to the `posts` prop would
      // do it in production too.
      const tick = (arrivalTick.current += 1);
      const source = posts[(posts.length - tick + posts.length * 2) % posts.length];
      if (!source) return;
      const post: ResolvedPost = {
        ...source,
        id: `${source.id}-live-${tick}`,
        createdAt: new Date().toISOString(),
        reasonBn: "এইমাত্র প্রকাশিত — আপনার আগ্রহের বিভাগ থেকে",
      };
      // Only queue behind the reader's position; at the top it can just appear.
      if (window.scrollY > AT_TOP_PX) setQueued((q) => [post, ...q]);
      else setArrived((a) => [post, ...a]);
    };

    const first = window.setTimeout(arrive, FIRST_ARRIVAL_MS);
    const interval = window.setInterval(arrive, ARRIVAL_EVERY_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [posts]);

  /** Scrolling back to the top yourself reveals them too — no tap needed. */
  useEffect(() => {
    if (queued.length === 0) return;
    const onScroll = () => {
      if (window.scrollY <= AT_TOP_PX) {
        setArrived((a) => [...queued, ...a]);
        setQueued([]);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [queued]);

  const reveal = useCallback(() => {
    setArrived((a) => [...queued, ...a]);
    setQueued([]);
    stream.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [queued]);

  if (posts.length === 0) return null;

  const items = Array.from({ length: count }, (_, i) => {
    const post = posts[i % posts.length];
    return { key: `${post.id}-${Math.floor(i / posts.length)}`, post, index: i };
  });

  return (
    <>
      {/*
        A zero-height sticky rail: the pill floats just under the header while
        the feed is in view, and costs no layout space when there is nothing
        waiting, so the feed's rhythm never shifts.
      */}
      <div className="sticky top-[var(--pin-top)] z-30 h-0">
        {queued.length > 0 ? (
          <div className="flex justify-center pt-2.5" aria-live="polite">
            <button
              type="button"
              onClick={reveal}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-3.5 text-[0.8125rem] font-semibold text-primary-foreground shadow-overlay transition-all hover:bg-primary-hover active:translate-y-px"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} aria-hidden />
              {toBnDigits(queued.length)} টি নতুন পোস্ট
            </button>
          </div>
        ) : null}
      </div>

      {/*
        One column, no gap between items, and no radius or corner.

        The rows touch, and the column is framed by a rule down each side, so an
        item's edges are drawn rather than merely implied by where the next one
        starts. The frame is also why the ink can stay quiet: the rules carry the
        standard hairline (`--border`) rather than the palette's strongest neutral,
        because with a two-sided frame and a rule between every pair the shape of
        an item is already unmistakable — a heavier line here would only darken the
        page.

        Two-sided rather than per-item: with no gap the vertical rules line up
        edge to edge, and one element drawing them cannot drift out of register
        with itself the way repeated per-row borders can.

        Separation is not supposed to come from space *between* items at all —
        each row supplies its own breathing room as padding inside itself and
        indents its content into a column beside the avatar. The rule above the
        first row separates the feed from its heading.

        The column is the one thing on the phone that takes the page's gutter
        back: the feed is what a reader scrolls here, so it gets the full width.
        Everything else on the page — the heading, today's strip, the buttons
        below — keeps its inset, and from `sm` up the column sits inside the page
        again.

        The side rules go with the gutter. A hairline belongs to a column that
        starts somewhere, and at the full width of the screen the column *is* the
        screen: a frame drawn there would be a line against the display edge,
        saying nothing about where the list begins or ends. The rule above the
        first row and the rules between rows still do their work — a phone shows
        an edge-to-edge feed of ruled rows, which is the shape a feed wants.
        From `sm` up the frame returns with the gutter.
      */}
      <div
        ref={stream}
        className="scroll-mt-[var(--pin-top)] -mx-4 divide-y divide-border border-x-0 border-t border-border sm:mx-0 sm:border-x"
      >
        {arrived.map((post) => (
          <div key={post.id} className="animate-fade-up">
            <ArrivalCard post={post} />
          </div>
        ))}

        {items.map(({ key, post, index }) => (
          <div
            key={key}
            className="animate-fade-up"
            // Stagger each new page so it settles rather than flashing in.
            style={{ animationDelay: `${Math.min(index % PAGE_SIZE, 5) * 60}ms` }}
          >
            <PostCard post={post} />
          </div>
        ))}

        {loading ? <PostCardSkeleton /> : null}
      </div>

      {/* Zero-height marker that decides when the next page is needed. */}
      <div ref={sentinel} className="h-px" aria-hidden />

      {exhausted ? (
        <p className="py-2 text-center text-[0.75rem] text-subtle-foreground">
          ফিড এখানেই শেষ — নতুন উত্তর বা প্রবন্ধ এলে এখানে দেখা যাবে।
        </p>
      ) : (
        // Mostly below the fold, since the sentinel loads automatically: this is
        // here for readers without IntersectionObserver, and for anyone who
        // wants more now rather than when they reach the bottom.
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={loadMore} disabled={loading}>
            {loading ? "আরও লোড হচ্ছে…" : "আরও দেখুন"}
          </Button>
        </div>
      )}
    </>
  );
}

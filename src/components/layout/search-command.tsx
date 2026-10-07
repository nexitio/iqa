"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  FileText,
  MessageCircleQuestion,
  Scale,
  ScrollText,
  Search,
  Users,
  X,
  Compass,
  CornerDownLeft,
} from "lucide-react";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SCHOLARS } from "@/lib/data/scholars";
import { QURAN_SURAHS } from "@/lib/data/quran";
import { ARTICLES, FATWAS } from "@/lib/data/content";
import { QUESTIONS } from "@/lib/data/questions";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";

interface Hit {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Global search palette (⌘K / Ctrl+K).
 *
 * Results are computed locally from the dataset across every knowledge surface,
 * so the interaction is fully explorable before the backend exists.
 *
 * The shell mounts this only while the palette is open. That is deliberate: the
 * query and cursor reset for free on every open (there is no "reset state when a
 * prop changes" effect to get wrong), and the ⌘K shortcut lives in `AppShell`,
 * which is always mounted.
 */
export function SearchCommand({ onClose }: { onClose: () => void }) {
  const { t, pick } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the field once the overlay has mounted — a DOM side effect, not state.
  useEffect(() => {
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, []);

  const index = useMemo<Hit[]>(
    () => [
      ...QURAN_SURAHS.map((s) => ({
        id: `surah-${s.number}`,
        title: `${pick(s.name)} · ${s.number}`,
        subtitle: `${pick(s.meaning)} · ${s.ayahCount} ${t("label.ayahs")}`,
        href: `/quran/${s.number}`,
        group: t("nav.quran"),
        icon: BookOpen,
      })),
      ...SCHOLARS.map((s) => ({
        id: `scholar-${s.id}`,
        title: `${pick(s.honorific)} ${pick(s.name)}`,
        subtitle: pick(s.madrasah),
        href: `/scholars/${s.slug}`,
        group: t("nav.scholars"),
        icon: Users,
      })),
      ...DEPARTMENTS.map((d) => ({
        id: `dept-${d.slug}`,
        title: pick(d.name),
        subtitle: pick(d.description),
        href: `/departments/${d.slug}`,
        group: t("label.departments"),
        icon: Compass,
      })),
      ...ARTICLES.filter((a) => a.status === "published").map((a) => ({
        id: `article-${a.id}`,
        title: a.title.bn,
        subtitle: a.excerpt.bn,
        href: `/articles/${a.slug}`,
        group: t("label.articles"),
        icon: FileText,
      })),
      ...FATWAS.filter((f) => f.status === "published").map((f) => ({
        id: `fatwa-${f.id}`,
        title: f.questionBn,
        subtitle: f.rulingBn,
        href: `/fatwas/${f.slug}`,
        group: t("label.fatwas"),
        icon: Scale,
      })),
      ...QUESTIONS.map((q) => ({
        id: `q-${q.id}`,
        title: q.titleBn,
        subtitle: q.bodyBn,
        href: `/questions/${q.slug}`,
        group: t("label.questions"),
        icon: MessageCircleQuestion,
      })),
    ],
    [pick, t],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 7);
    const terms = q.split(/\s+/);
    return index
      .map((hit) => {
        const haystack = `${hit.title} ${hit.subtitle} ${hit.group}`.toLowerCase();
        let score = 0;
        for (const term of terms) {
          if (hit.title.toLowerCase().includes(term)) score += 3;
          else if (haystack.includes(term)) score += 1;
        }
        return { hit, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((r) => r.hit);
  }, [index, query]);

  // Group while preserving relevance order.
  const grouped = useMemo(() => {
    const map = new Map<string, Hit[]>();
    for (const hit of results) {
      const list = map.get(hit.group) ?? [];
      list.push(hit);
      map.set(hit.group, list);
    }
    return [...map.entries()];
  }, [results]);

  const flat = useMemo(() => grouped.flatMap(([, hits]) => hits), [grouped]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(flat.length - 1, c + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === "Enter" && flat[cursor]) {
        e.preventDefault();
        router.push(flat[cursor].href);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flat, cursor, router, onClose]);

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh]">
      <div className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("action.search")}
        className="relative w-full max-w-2xl animate-scale-in overflow-hidden rounded-panel border border-border bg-surface shadow-overlay"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-5 shrink-0 text-subtle-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            placeholder={t("action.searchPlaceholder")}
            aria-label={t("action.search")}
            className="h-14 flex-1 bg-transparent text-[0.9375rem] text-foreground outline-none placeholder:text-subtle-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("action.close")}
            className="grid size-8 shrink-0 place-items-center rounded-full text-subtle-foreground hover:bg-surface-3"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <p className="px-4 py-10 text-center text-[0.875rem] text-muted-foreground">
              {t("state.noResults")}
            </p>
          ) : (
            grouped.map(([group, hits]) => (
              <div key={group} className="mb-1">
                <p className="px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                  {group}
                </p>
                <ul>
                  {hits.map((hit) => {
                    runningIndex += 1;
                    const active = runningIndex === cursor;
                    const idx = runningIndex;
                    return (
                      <li key={hit.id}>
                        <button
                          type="button"
                          onMouseEnter={() => setCursor(idx)}
                          onClick={() => {
                            router.push(hit.href);
                            onClose();
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                            active ? "bg-primary-soft" : "hover:bg-surface-3",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-lg",
                              active ? "bg-primary text-primary-foreground" : "bg-surface-3 text-muted-foreground",
                            )}
                          >
                            <hit.icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.875rem] font-medium text-foreground">
                              {hit.title}
                            </span>
                            <span className="block truncate text-[0.75rem] text-muted-foreground">
                              {hit.subtitle}
                            </span>
                          </span>
                          {active ? (
                            <CornerDownLeft className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-2.5">
          <div className="flex items-center gap-3 text-[0.6875rem] text-subtle-foreground">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans">↑↓</kbd>
              {t("action.next")}
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 font-sans">↵</kbd>
              {t("action.search")}
            </span>
          </div>
          <Badge tone="primary" size="xs" icon={ScrollText}>
            {t("nav.quran")} · {t("nav.hadith")} · {t("label.fatwas")}
          </Badge>
        </div>
      </div>
    </div>
  );
}

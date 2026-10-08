"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Italic,
  List,
  Quote,
  Search,
  TextQuote,
  Wand2,
} from "lucide-react";
import type { ReferenceHit } from "@/lib/reference-index";
import { REFERENCE_CORPUS, searchReferences } from "@/lib/reference-index";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { cn } from "@/lib/utils";

/**
 * The writing surface for a draft body.
 *
 * It is a textarea with a grammar, not a contenteditable: the draft's body is
 * stored as text and rendered by `Prose`, so the editor's job is to make that
 * grammar *usable* — a toolbar that writes it, shortcuts that speed it up, and a
 * picker that inserts citations — without changing what a draft is made of.
 * Nothing here is a dependency, and nothing typed is invisible: `**bold**` and
 * `## Heading` are exactly what the reader will get.
 *
 * The picker is the part that earns the surface. Typing `#` searches every ayah
 * in the dataset and `@` every hadith (both search both — see
 * `searchReferences`), and the chosen citation is inserted at the caret *and*
 * handed to the composer, which attaches the full text to the draft. So the
 * scholar writes the reference where it belongs in the sentence, and the panel
 * keeps the verse beside it.
 */

/** The popup's preferred width; a narrow editor gets a narrower menu. */
const PICKER_WIDTH = 22 * 16;

/**
 * How far past the trigger character the picker keeps listening.
 *
 * Citations are multi-word — "সহীহ বুখারী ১", "বাকারা ২৭৫" — so a space cannot
 * close the picker the way a mention menu would. The window is bounded instead,
 * in characters (the pattern) and in words (below): once the query reads like a
 * sentence rather than a search, the menu bows out and leaves the scholar their
 * prose.
 */
const TRIGGER = /(?:^|\s)([#@])([^\n#@]{0,24})$/;
const QUERY_MAX_WORDS = 3;

interface PickerState {
  /** The character that opened it. */
  trigger: "#" | "@";
  query: string;
  /** Where the trigger character sits in the body. */
  start: number;
  /** The caret, i.e. the end of the query. */
  end: number;
  active: number;
}

/** Toolbar buttons share this so the row reads as one instrument. */
const toolButton =
  "grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground disabled:pointer-events-none disabled:opacity-45";

/**
 * Where the caret is, in the editor wrapper's coordinate space.
 *
 * A textarea exposes no caret geometry, so the standard trick is a mirror: a
 * hidden clone with the same typography and padding holding the text up to the
 * caret plus a marker span, whose position is then the caret's. The mirror is
 * laid on the textarea's own border box and measured against it, so the numbers
 * that come back are the wrapper's — the space the popup is positioned in — and
 * the toolbar above the textarea cancels out instead of skewing the anchor.
 */
function caretPoint(el: HTMLTextAreaElement, index: number) {
  const style = window.getComputedStyle(el);
  const mirror = document.createElement("div");
  // Kebab-case, because `getPropertyValue` only knows the CSS spelling: a
  // camelCase name reads back as the empty string, so nothing would be copied.
  const copied = [
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "letter-spacing",
    "line-height",
    "text-transform",
    "word-spacing",
    "text-indent",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
    "box-sizing",
    "white-space",
    "overflow-wrap",
    "tab-size",
  ];
  for (const property of copied) mirror.style.setProperty(property, style.getPropertyValue(property));
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  // Land the mirror exactly on the textarea's border box — same width, same
  // origin — so a point in the mirror is that point in the textarea.
  mirror.style.top = `${el.offsetTop}px`;
  mirror.style.left = `${el.offsetLeft}px`;
  mirror.style.width = `${el.offsetWidth}px`;
  mirror.style.height = "auto";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.textContent = el.value.slice(0, index);

  const marker = document.createElement("span");
  marker.textContent = el.value.slice(index, index + 1) || ".";
  mirror.appendChild(marker);

  const parent = el.offsetParent ?? document.body;
  parent.appendChild(mirror);
  // Rects rather than `offsetTop`: the mirror is itself positioned, so it is the
  // marker's offset parent and would report the caret relative to the mirror —
  // never the textarea. Measured against each other, both rects answer the same
  // question in the same coordinates.
  const frame = mirror.getBoundingClientRect();
  const caret = marker.getBoundingClientRect();
  const top = caret.top - frame.top;
  const left = caret.left - frame.left;
  mirror.remove();

  return {
    top: el.offsetTop + top,
    left: el.offsetLeft + left,
    lineHeight: Number.parseFloat(style.lineHeight) || 22,
  };
}

export function RichTextEditor({
  id,
  value,
  onChange,
  onReference,
  placeholder,
  className,
  ariaLabel,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  /** Called with the chosen citation so the composer can attach its text. */
  onReference?: (hit: ReferenceHit) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const { t, locale } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [picker, setPicker] = useState<PickerState | null>(null);
  // Where the popup goes, and how wide it may be: on a phone the editor is
  // narrower than the popup's preferred width, and a menu that hangs off the
  // side of the page is worse than a narrower one.
  const [anchor, setAnchor] = useState({ top: 24, left: 12, width: PICKER_WIDTH });
  const listRef = useRef<HTMLDivElement>(null);

  const hits = useMemo(
    () =>
      picker
        ? searchReferences(picker.query, {
            limit: 6,
            prefer: picker.trigger === "#" ? "ayah" : "hadith",
          })
        : [],
    [picker],
  );

  // Keep the highlighted row in view while arrowing through the list.
  useEffect(() => {
    if (!picker) return;
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${picker.active}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [picker]);

  /** Apply an edit and put the selection back where the caller wants it. */
  function edit(run: (el: HTMLTextAreaElement) => { text: string; start: number; end: number }) {
    const el = textareaRef.current;
    if (!el) return;
    const { text, start, end } = run(el);
    onChange(text);
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, end);
    });
  }

  /** Toolbar wrap: `**bold**`, `*italic*` — around the selection, or a word. */
  function wrap(marker: string) {
    edit((el) => {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const chosen = el.value.slice(start, end);
      const inner = chosen || (marker === "**" ? "গুরুত্বপূর্ণ" : "প্রবল");
      const text = `${el.value.slice(0, start)}${marker}${inner}${marker}${el.value.slice(end)}`;
      const cursor = start + marker.length;
      return { text, start: cursor, end: cursor + inner.length };
    });
  }

  /**
   * Line prefix: `## `, `- `, `> ` — and pressing the same button again takes
   * the prefix off, so a heading is a toggle rather than a text edit to undo.
   */
  function prefix(marker: string) {
    edit((el) => {
      const text = el.value;
      const from = text.lastIndexOf("\n", el.selectionStart - 1) + 1;
      const block = text.slice(from, el.selectionEnd);
      const lines = block.split("\n");
      const applied = lines.every((line) => line.startsWith(marker));
      const next = lines
        .map((line) => (applied ? line.slice(marker.length) : `${marker}${line}`))
        .join("\n");
      return { text: text.slice(0, from) + next + text.slice(el.selectionEnd), start: from, end: from + next.length };
    });
  }

  /** Insert a citation: plain in the sentence, or as a full quotation block. */
  function insertReference(hit: ReferenceHit, asQuote: boolean) {
    const el = textareaRef.current;
    const state = picker;
    if (!el || !state) return;
    const citation = `**${hit.refBn}**`;
    // A quotation is a paragraph: if the scholar is mid-sentence, it opens on a
    // line of its own first, or the `> ` prefix would sit behind their words
    // and the renderer — which reads quotes by line — would not see a quote.
    const atLineStart = state.start === 0 || /\n\s*$/.test(el.value.slice(0, state.start));
    const lead = asQuote && !atLineStart ? "\n\n" : "";
    const replacement = asQuote
      ? `${lead}> ${citation}\n> ${hit.arabic}\n> ${hit.translationBn}\n\n`
      : `${citation} `;
    const text = el.value.slice(0, state.start) + replacement + el.value.slice(state.end);
    const caret = state.start + replacement.length;
    onChange(text);
    onReference?.(hit);
    setPicker(null);
    window.requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  /** Open the picker at the caret with no query (the toolbar's entry point). */
  function openPickerAtCaret(trigger: "#" | "@") {
    const el = textareaRef.current;
    if (!el) return;
    const at = el.selectionStart;
    setPicker({ trigger, query: "", start: at, end: at, active: 0 });
    updateAnchor(at);
  }

  function updateAnchor(index: number) {
    const el = textareaRef.current;
    if (!el) return;
    const width = Math.min(PICKER_WIDTH, Math.max(220, el.offsetWidth - 8));
    try {
      const point = caretPoint(el, index);
      setAnchor({
        top: point.top - el.scrollTop + point.lineHeight + 6,
        left: Math.max(4, Math.min(point.left, el.offsetWidth - width - 4)),
        width,
      });
    } catch {
      // Measurement is a nicety; the picker still works pinned low in the box.
      setAnchor({ top: el.clientHeight - 8, left: 12, width });
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = event.target.value;
    const caret = event.target.selectionStart;
    onChange(next);

    // A trigger character at a word boundary opens the picker; anything else in
    // the text closes it, so `#` inside an ordinary word never pops a menu.
    const before = next.slice(0, caret);
    const match = TRIGGER.exec(before);
    const query = match?.[2] ?? "";
    const words = query.trim().split(/\s+/).filter(Boolean).length;
    if (!match || words > QUERY_MAX_WORDS) {
      setPicker(null);
      return;
    }
    const start = caret - query.length - 1;
    setPicker({ trigger: match[1] as "#" | "@", query, start, end: caret, active: 0 });
    updateAnchor(caret);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    const meta = event.metaKey || event.ctrlKey;
    if (meta && !event.shiftKey && event.key.toLowerCase() === "b") {
      event.preventDefault();
      wrap("**");
      return;
    }
    if (meta && !event.shiftKey && event.key.toLowerCase() === "i") {
      event.preventDefault();
      wrap("*");
      return;
    }
    if (meta && event.shiftKey && event.key.toLowerCase() === "7") {
      event.preventDefault();
      prefix("- ");
      return;
    }

    if (!picker) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (hits.length === 0) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      setPicker((state) =>
        state ? { ...state, active: (state.active + step + hits.length) % hits.length } : state,
      );
      return;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const hit = hits[picker.active];
      if (hit) insertReference(hit, event.shiftKey);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setPicker(null);
    }
  }

  const activeHit = picker ? hits[picker.active] : undefined;

  return (
    <div className={cn("relative", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-b-0 border-border bg-surface-2 px-2 py-1.5">
        <button type="button" className={toolButton} onClick={() => wrap("**")} title={`${t("editor.bold")} (⌘B)`} aria-label={t("editor.bold")}>
          <Bold className="size-4" aria-hidden />
        </button>
        <button type="button" className={toolButton} onClick={() => wrap("*")} title={`${t("editor.italic")} (⌘I)`} aria-label={t("editor.italic")}>
          <Italic className="size-4" aria-hidden />
        </button>
        <button type="button" className={toolButton} onClick={() => prefix("## ")} title={t("editor.heading")} aria-label={t("editor.heading")}>
          <Heading2 className="size-4" aria-hidden />
        </button>
        <button type="button" className={toolButton} onClick={() => prefix("- ")} title={t("editor.list")} aria-label={t("editor.list")}>
          <List className="size-4" aria-hidden />
        </button>
        <button type="button" className={toolButton} onClick={() => prefix("> ")} title={t("editor.quote")} aria-label={t("editor.quote")}>
          <Quote className="size-4" aria-hidden />
        </button>
        <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />
        <button
          type="button"
          onClick={() => openPickerAtCaret("#")}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[0.75rem] font-medium text-primary transition-colors hover:bg-primary-soft"
          aria-label={t("editor.reference")}
        >
          <Wand2 className="size-4" aria-hidden />
          {t("editor.reference")}
        </button>
      </div>

      <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setPicker(null)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="min-h-80 w-full resize-y rounded-b-xl border border-border bg-surface px-3.5 py-3 text-[0.9375rem] leading-7 text-foreground outline-none transition-colors placeholder:text-subtle-foreground focus:border-primary"
      />

      {/* What the surface can do, said once, under it. */}
      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-subtle-foreground">
        <span className="inline-flex items-center gap-1">
          <Search className="size-3" aria-hidden />
          {t("editor.hintTrigger")}
        </span>
        <span className="inline-flex items-center gap-1">
          <TextQuote className="size-3" aria-hidden />
          {t("editor.hintQuote")}
        </span>
      </p>

      {/* Citation picker */}
      {picker ? (
        <div
          className="absolute z-30 overflow-hidden rounded-panel border border-border bg-surface shadow-overlay"
          style={{ top: anchor.top, left: anchor.left, width: anchor.width }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2 px-3 py-2">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
              {picker.trigger === "#" ? t("editor.pickerAyat") : t("editor.pickerHadith")}
            </span>
            <span className="truncate text-[0.6875rem] text-subtle-foreground">
              {picker.query ? `“${picker.query}”` : t("editor.pickerEmpty")}
            </span>
          </div>

          {hits.length === 0 ? (
            <p className="px-3 py-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              {t("editor.pickerNone", {
                ayat: formatNumber(REFERENCE_CORPUS.ayat, locale),
                ahadith: formatNumber(REFERENCE_CORPUS.ahadith, locale),
              })}
            </p>
          ) : (
            <div ref={listRef} className="max-h-64 overflow-y-auto py-1">
              {hits.map((hit, index) => (
                <button
                  key={hit.id}
                  type="button"
                  data-index={index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => insertReference(hit, false)}
                  className={cn(
                    "flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors",
                    index === picker.active ? "bg-primary-soft" : "hover:bg-surface-3",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[0.625rem] font-semibold",
                      hit.kind === "ayah"
                        ? "bg-info-soft text-info-soft-foreground"
                        : "bg-accent-soft text-accent-soft-foreground",
                    )}
                  >
                    {hit.kind === "ayah" ? t("editor.kindAyah") : t("editor.kindHadith")}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.8125rem] font-medium text-foreground">{hit.refBn}</span>
                    <span className="mt-0.5 line-clamp-2 block text-[0.75rem] leading-relaxed text-muted-foreground">
                      {hit.translationBn}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-2 px-3 py-1.5 text-[0.6875rem] text-subtle-foreground">
            <span>{t("editor.pickerKeys")}</span>
            {activeHit ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertReference(activeHit, true)}
                className="font-medium text-primary transition-colors hover:text-primary-hover"
              >
                {t("editor.insertQuote")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

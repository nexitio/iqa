"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { formatNumber } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useDismissable } from "@/lib/use-dismissable";

/**
 * Ilm's own select — the native `<select>` was the one control in the design
 * system that could not be styled: its popup is drawn by the operating system,
 * so it ignored the surface, radius, elevation and type scale everything else
 * shares, and on a 64-option district list it was unusable.
 *
 * Three things the native control could not do are load-bearing here:
 *
 *  1. `searchable` — a filter field above the list. It switches itself on past
 *     a handful of options, because scrolling 64 districts is the actual
 *     complaint, and stays off for a 3-item list where it is pure noise.
 *  2. `multiple` — real multi-select (checkbox rows, chips in the trigger,
 *     clear-all) for filters where several values are valid at once.
 *  3. Theme fidelity — same surface, hairline border, focus ring, elevation and
 *     scale as `Input`, in both light and dark.
 *
 * The panel is portalled to `<body>`: several of these live inside the sticky
 * sidebar, which is an `overflow-y-auto` column, and an absolutely positioned
 * list would be clipped at the column's edge. Fixed positioning plus a portal
 * also keeps it clear of the header's `backdrop-blur`, which establishes a
 * containing block for fixed descendants.
 */
export interface SelectOption {
  value: string;
  /** Primary line, in the trigger and in the list. */
  label: string;
  /** Extra search text that is not shown — e.g. an English name or a division. */
  keywords?: string;
  /** Quiet second line, list only. */
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface SelectBase {
  options: SelectOption[];
  /** Force the search field on or off. Defaults to on when there are > 8 options. */
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Hidden input for form participation. */
  name?: string;
  /**
   * Hyphenated on purpose: `aria-label` is what every call site already writes,
   * and a camelCase alias would be silently dropped on the ones that forget.
   */
  "aria-label"?: string;
  /** Trigger classes — the same escape hatch the old control had. */
  className?: string;
  menuClassName?: string;
}

interface SingleSelectProps extends SelectBase {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

interface MultiSelectProps extends SelectBase {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
  /** Chips shown in the trigger before it collapses into a "+n" counter. */
  maxChips?: number;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

const GAP = 6;
const EDGE = 8;
const MIN_ROOM = 200;

export function Select(props: SelectProps) {
  const { t, locale } = useI18n();
  const listboxId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(""); // cleared on every open and close
  const [active, setActive] = useState(0);
  const [anchor, setAnchor] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxHeight: number;
    flipped: boolean;
  } | null>(null);

  const { options } = props;
  const multiple = props.multiple === true;
  const selected: string[] = props.multiple ? props.value : props.value ? [props.value] : [];
  const canSearch = props.searchable ?? options.length > 8;
  const placeholder = props.placeholder ?? t("action.select");

  /**
   * Highlight the current value on open rather than the first row — in a
   * 64-district list those differ, and landing on 0 loses the reader's place.
   */
  const openAt = () => {
    const index = options.findIndex((option) => selected.includes(option.value));
    setActive(index > 0 ? index : 0);
    setQuery("");
    setOpen(true);
  };

  const close = () => {
    setQuery("");
    setOpen(false);
  };

  const emit = (next: string[]) => {
    if (props.multiple) props.onChange(next);
    else props.onChange(next[0] ?? "");
  };

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    if (!props.multiple) {
      emit([option.value]);
      close();
      return;
    }
    const set = new Set(selected);
    if (set.has(option.value)) set.delete(option.value);
    else set.add(option.value);
    emit([...set]);
    setQuery("");
    searchRef.current?.focus();
  };

  /** Re-anchor to the trigger. Called on open, scroll and resize. */
  const measure = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const roomBelow = window.innerHeight - rect.bottom - GAP - EDGE;
    const roomAbove = rect.top - GAP - EDGE;
    // Prefer downwards, but flip when that side is cramped and the other is not.
    const flipped = roomBelow < MIN_ROOM && roomAbove > roomBelow;
    const room = Math.max(MIN_ROOM, flipped ? roomAbove : roomBelow);
    const width = Math.min(
      Math.max(rect.width, 12 * 16),
      window.innerWidth - EDGE * 2,
    );
    setAnchor({
      top: flipped ? undefined : rect.bottom + GAP,
      bottom: flipped ? window.innerHeight - rect.top + GAP : undefined,
      left: Math.min(Math.max(EDGE, rect.left), window.innerWidth - width - EDGE),
      width,
      maxHeight: Math.min(room, 22 * 16),
      flipped,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, measure]);

  // The panel is a portal, so "inside" spans the trigger and the panel.
  useDismissable(open, close, (target) =>
    Boolean(triggerRef.current?.contains(target)) ||
    Boolean(panelRef.current?.contains(target)),
  );

  // Focus the field once the list is showing — a DOM side effect, not state.
  useEffect(() => {
    if (!open || !canSearch) return;
    const id = window.setTimeout(() => searchRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open, canSearch]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      `${option.label} ${option.keywords ?? ""} ${option.description ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const move = (delta: number) => {
    if (visible.length === 0) return;
    let next = active;
    for (let step = 0; step < visible.length; step += 1) {
      next = (next + delta + visible.length) % visible.length;
      if (!visible[next].disabled) break;
    }
    setActive(next);
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openAt();
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      // Refocus once the panel has unmounted: the search field is inside it, and
      // removing the focused node would otherwise drop focus onto <body>.
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    } else if (event.key === "Tab") {
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(visible.length - 1);
    } else if (event.key === "Enter" && visible[active]) {
      event.preventDefault();
      choose(visible[active]);
    } else if (event.key === "Backspace" && multiple && query === "" && selected.length > 0) {
      emit(selected.slice(0, -1));
    }
  };

  const selectedOptions = options.filter((option) => selected.includes(option.value));
  const label = selectedOptions[0]?.label;

  const chips = props.multiple ? selectedOptions.slice(0, props.maxChips ?? 2) : [];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        id={props.id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        aria-label={props["aria-label"]}
        disabled={props.disabled}
        onClick={() => (open ? close() : openAt())}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex h-11 w-full items-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-left text-[0.875rem] text-foreground transition-colors",
          "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/12",
          "disabled:cursor-not-allowed disabled:bg-surface-3 disabled:opacity-70",
          open && "border-primary ring-4 ring-primary/12",
          props.className,
        )}
      >
        {multiple ? (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
            {chips.length === 0 ? (
              <span className="truncate text-subtle-foreground">{placeholder}</span>
            ) : (
              chips.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex max-w-[9rem] shrink-0 items-center rounded-full bg-primary-soft px-2 py-0.5 text-[0.75rem] font-medium text-primary-soft-foreground"
                >
                  <span className="truncate">{option.label}</span>
                </span>
              ))
            )}
            {selectedOptions.length > chips.length ? (
              <span className="shrink-0 rounded-full bg-surface-3 px-2 py-0.5 text-[0.75rem] font-medium text-muted-foreground">
                +{formatNumber(selectedOptions.length - chips.length, locale)}
              </span>
            ) : null}
          </span>
        ) : (
          <span className={cn("min-w-0 flex-1 truncate", !label && "text-subtle-foreground")}>
            {label ?? placeholder}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-subtle-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {props.name ? (
        <input
          type="hidden"
          name={props.name}
          value={props.multiple ? props.value.join(",") : props.value}
        />
      ) : null}

      {open && anchor
        ? createPortal(
            <div
              ref={panelRef}
              style={{
                top: anchor.top,
                bottom: anchor.bottom,
                left: anchor.left,
                width: anchor.width,
                maxHeight: anchor.maxHeight,
              }}
              className={cn(
                "fixed z-[70] flex flex-col overflow-hidden rounded-panel border border-border bg-surface shadow-overlay",
                anchor.flipped ? "origin-bottom animate-scale-in" : "origin-top animate-scale-in",
                props.menuClassName,
              )}
            >
              {canSearch ? (
                <div className="flex shrink-0 items-center gap-2 border-b border-border px-3">
                  <Search className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={t("action.search")}
                    aria-label={t("action.search")}
                    className="h-10 min-w-0 flex-1 bg-transparent text-[0.8125rem] text-foreground outline-none placeholder:text-subtle-foreground"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        searchRef.current?.focus();
                      }}
                      aria-label={t("action.clear")}
                      className="grid size-6 shrink-0 place-items-center rounded-full text-subtle-foreground hover:bg-surface-3"
                    >
                      <X className="size-3" />
                    </button>
                  ) : null}
                </div>
              ) : null}

              <ul
                id={listboxId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                aria-label={props["aria-label"]}
                className="min-h-0 flex-1 overflow-y-auto p-1.5"
              >
                {visible.length === 0 ? (
                  <li className="px-3 py-8 text-center text-[0.8125rem] text-muted-foreground">
                    {t("state.noResults")}
                  </li>
                ) : (
                  visible.map((option, index) => {
                    const isSelected = selected.includes(option.value);
                    const isActive = index === active;
                    return (
                      <li
                        key={option.value}
                        ref={isActive ? activeRef : undefined}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled || undefined}
                        onClick={() => choose(option)}
                        onMouseMove={() => setActive(index)}
                        className={cn(
                          "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] transition-colors",
                          isSelected ? "font-medium text-primary" : "text-foreground",
                          isActive && "bg-surface-3",
                          option.disabled && "pointer-events-none opacity-50",
                        )}
                      >
                        {option.icon ? (
                          <option.icon className="size-4 shrink-0 text-subtle-foreground" aria-hidden />
                        ) : null}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{option.label}</span>
                          {option.description ? (
                            <span className="block truncate text-[0.6875rem] font-normal text-subtle-foreground">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                        {multiple ? (
                          <span
                            className={cn(
                              "grid size-4 shrink-0 place-items-center rounded-[0.3rem] border transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border-strong",
                            )}
                            aria-hidden
                          >
                            {isSelected ? <Check className="size-3" strokeWidth={3} /> : null}
                          </span>
                        ) : isSelected ? (
                          <Check className="size-4 shrink-0" strokeWidth={2.6} aria-hidden />
                        ) : null}
                      </li>
                    );
                  })
                )}
              </ul>

              {multiple ? (
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface-2 px-3 py-2 text-[0.6875rem] text-muted-foreground">
                  <span>
                    {t("action.selected")} · {formatNumber(selectedOptions.length, locale)}
                  </span>
                  {selectedOptions.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => emit([])}
                      className="font-medium text-primary transition-colors hover:text-primary-hover"
                    >
                      {t("action.clear")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

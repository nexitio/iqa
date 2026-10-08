"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  MessagesSquare,
  MessageCircleQuestion,
  PenLine,
  Plus,
  Scale,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { CURRENT_USER } from "@/lib/data/personal";
import type { Role } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { useDismissable } from "@/lib/use-dismissable";
import { cn } from "@/lib/utils";
import { softTone, type Tone } from "@/components/ui/tone";

/**
 * The one "add" affordance, in both shapes the shell needs it.
 *
 * There used to be three: a pen icon in the top bar, a disc in the bottom bar and
 * a labelled pill floating over the content. The pill covered the corner of every
 * desktop page, the header icon competed with the bell beside it, and on a phone
 * all three were reachable within one thumb — three doors into the same room.
 *
 * What replaces them is one menu behind two triggers, one per input mode: a
 * floating disc on a large screen, the centre of the tab bar on a small one. Both
 * open the same list, and the list itself is not fixed — what a reader can add
 * depends on the seat they are sitting in. A scholar's contribution is an article,
 * a ruling or an answer; everyone else's is a question or a discussion.
 */

interface ComposeAction {
  href: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  tone: Tone;
}

/**
 * What this viewer may add, in the order it matters to them.
 *
 * Role is read from the signed-in account rather than guessed from the route, so
 * the menu says the same thing wherever it is opened.
 */
function actionsFor(role: Role, t: (key: string) => string): ComposeAction[] {
  if (role === "scholar") {
    return [
      {
        href: "/scholar/write?kind=article",
        label: t("compose.newArticle"),
        hint: t("compose.newArticleHint"),
        icon: PenLine,
        tone: "primary",
      },
      {
        href: "/scholar/write?kind=fatwa",
        label: t("compose.newFatwa"),
        hint: t("compose.newFatwaHint"),
        icon: Scale,
        tone: "accent",
      },
      {
        href: "/scholar/write?kind=answer",
        label: t("compose.newAnswer"),
        hint: t("compose.newAnswerHint"),
        icon: MessageCircleQuestion,
        tone: "info",
      },
    ];
  }

  if (role === "admin") {
    return [
      {
        href: "/admin/review",
        label: t("compose.reviewQueue"),
        hint: t("compose.reviewQueueHint"),
        icon: FileText,
        tone: "warning",
      },
      {
        href: "/admin/questions",
        label: t("compose.moderateQuestions"),
        hint: t("compose.moderateQuestionsHint"),
        icon: ShieldCheck,
        tone: "info",
      },
      {
        href: "/admin/scholars/new",
        label: t("compose.addScholar"),
        hint: t("compose.addScholarHint"),
        icon: UserPlus,
        tone: "success",
      },
    ];
  }

  return [
    {
      href: "/questions/ask",
      label: t("compose.newQuestion"),
      hint: t("compose.newQuestionHint"),
      icon: MessageCircleQuestion,
      tone: "primary",
    },
    {
      href: "/discussions",
      label: t("compose.newDiscussion"),
      hint: t("compose.newDiscussionHint"),
      icon: MessagesSquare,
      tone: "accent",
    },
  ];
}

/** The list itself. Rendered by whichever trigger is on screen. */
export function ComposeMenu({
  role,
  onClose,
  className,
}: {
  role: Role;
  onClose: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const actions = actionsFor(role, t);

  return (
    <div
      role="menu"
      aria-label={t("compose.title")}
      className={cn(
        "w-[min(21rem,88vw)] animate-scale-in overflow-hidden rounded-panel border border-border bg-surface shadow-overlay",
        className,
      )}
    >
      <p className="eyebrow border-b border-border bg-surface-2 px-4 py-2.5">{t("compose.title")}</p>
      <div className="p-1.5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            role="menuitem"
            onClick={onClose}
            className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-3"
          >
            <span
              className={cn(
                "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                softTone[action.tone],
              )}
              aria-hidden
            >
              <action.icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.875rem] font-medium leading-snug text-foreground">
                {action.label}
              </span>
              <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-muted-foreground">
                {action.hint}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** The trigger disc, shared so both surfaces turn the same way. */
function AddDisc({ open, onClick }: { open: boolean; onClick: () => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="menu"
      aria-label={t("action.add")}
      title={t("action.add")}
      className={cn(
        "grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-overlay ring-1 ring-primary/25 transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0",
        open && "rotate-45",
      )}
    >
      <Plus className="size-6" strokeWidth={2.4} aria-hidden />
    </button>
  );
}

/**
 * Desktop: a disc in the bottom-right corner of the content.
 *
 * Below `lg` this is not rendered at all — the tab bar's centre is the add
 * button there, and two of them on one phone screen would be one too many.
 */
export function ComposeFab({ role = CURRENT_USER.role }: { role?: Role }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismissable(open, () => setOpen(false), (target) =>
    Boolean(rootRef.current?.contains(target)),
  );

  return (
    <div
      ref={rootRef}
      className="fixed bottom-8 right-6 z-40 hidden flex-col items-end gap-3 lg:flex lg:right-8"
    >
      {open ? <ComposeMenu role={role} onClose={() => setOpen(false)} /> : null}
      <AddDisc open={open} onClick={() => setOpen((value) => !value)} />
    </div>
  );
}

/**
 * Small screen: the centre of the tab bar.
 *
 * The panel opens *above* the bar rather than as a sheet from the bottom, so the
 * trigger that opened it stays visible and one tap closes it again.
 *
 * It is portalled to the body because the tab bar carries `backdrop-blur`, and a
 * filtered ancestor becomes the containing block for `position: fixed`
 * descendants — inside the bar, a "full screen" backdrop was only ever 57px tall
 * and covered the bar itself. The same trap that the account menu's dismiss hook
 * documents, so the outside-tap layer is rendered where the viewport is real.
 */
export function ComposeNavButton({ role = CURRENT_USER.role }: { role?: Role }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useDismissable(open, () => setOpen(false), (target) =>
    Boolean(triggerRef.current?.contains(target) || panelRef.current?.contains(target)),
  );

  return (
    <>
      <div ref={triggerRef} className="relative z-50 flex w-16 shrink-0 justify-center">
        <div className="absolute -top-5">
          <AddDisc open={open} onClick={() => setOpen((value) => !value)} />
        </div>
      </div>

      {open
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-40 animate-fade-in bg-overlay/40 backdrop-blur-[2px] lg:hidden"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              {/* Clears the raised disc, which stands 20px proud of the bar. */}
              <div
                ref={panelRef}
                className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 lg:hidden"
              >
                <ComposeMenu role={role} onClose={() => setOpen(false)} />
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}

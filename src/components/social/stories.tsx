"use client";

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui";
import { CURRENT_USER } from "@/lib/data/personal";
import { TRENDING_TOPICS, getDepartment } from "@/lib/data/departments";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * "জ্ঞানের ধারা" — the daily rail plus the compose entry point, in one card.
 *
 * The familiar circular-avatar rail is the fastest way to make the home feel
 * like an app people open daily, and here it does real work: it surfaces today's
 * fresh content from the scholars and departments the reader follows, plus their
 * own pending questions. A gold/emerald ring marks what is new since last visit.
 *
 * `composer` folds the ask-anything row into the same surface: a separate
 * composer card above it repeated the same call to action on a second border.
 */

interface StoryNode {
  id: string;
  label: string;
  href: string;
  color: string;
  name: string;
  verified?: boolean;
  isNew: boolean;
}

/** Drops the honorific so a narrow column shows a name, not a title fragment. */
function nameWithoutHonorific(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts.slice(1).join(" ") : (parts[0] ?? name);
}

export function KnowledgeStories({
  className,
  composer = false,
}: {
  className?: string;
  /** Renders the one-line "ask a scholar" row above the rail. */
  composer?: boolean;
}) {
  const { t, pick } = useI18n();

  const scholarStories: StoryNode[] = CURRENT_USER.followingScholarIds
    .map((id, index): StoryNode | null => {
      const scholar = SCHOLAR_BY_ID[id];
      if (!scholar) return null;
      return {
        id: `scholar-${id}`,
        label: nameWithoutHonorific(pick(scholar.name)),
        href: `/scholars/${scholar.slug}`,
        color: scholar.avatarColor,
        name: scholar.name.bn,
        verified: scholar.verified,
        // Earlier entries in the follow list read as "fresh" for demo purposes.
        isNew: index < 3,
      };
    })
    .filter((s): s is StoryNode => s !== null);

  const departmentStories: StoryNode[] = CURRENT_USER.followingDepartmentSlugs
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .map((department) => ({
      id: `dept-${department.slug}`,
      label: department.shortName.bn,
      href: `/departments/${department.slug}`,
      color: "#0a6b4c",
      name: department.name.bn,
      isNew: false,
    }));

  const topicStories: StoryNode[] = TRENDING_TOPICS.slice(0, 3).map((topic) => ({
    id: `topic-${topic.slug}`,
    label: topic.name.bn,
    href: `/topics/${topic.slug}`,
    color: "#a67c22",
    name: topic.name.bn,
    isNew: true,
  }));

  const nodes = [...scholarStories, ...departmentStories, ...topicStories];

  return (
    <section
      aria-label={t("home.followedScholars")}
      className={cn(
        "rounded-panel border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      {composer ? (
        <div className="mb-3 flex items-center gap-2.5 border-b border-border pb-3">
          <Avatar
            name={CURRENT_USER.name}
            color={CURRENT_USER.avatarColor}
            size="sm"
            verified
          />
          <Link
            href="/questions/ask"
            className="flex h-9 min-w-0 flex-1 items-center rounded-full border border-border bg-surface-2 px-3.5 text-[0.8125rem] text-subtle-foreground transition-colors hover:border-primary/40 hover:bg-surface"
          >
            <span className="truncate">
              আপনার প্রশ্ন লিখুন, আলেম উত্তর দেবেন…
            </span>
          </Link>
        </div>
      ) : null}

      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-[0.9375rem] font-semibold text-foreground">
          <Sparkles className="size-4 text-primary" aria-hidden />
          জ্ঞানের ধারা
        </h2>
        <Link
          href="/scholars"
          className="text-[0.75rem] font-medium text-primary transition-colors hover:text-primary-hover"
        >
          {t("action.viewAll")}
        </Link>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-0.5">
        {/* The reader's own entry point, mirroring the "your story" slot. */}
        <Link
          href="/questions/ask"
          className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
        >
          <span className="relative grid size-14 place-items-center rounded-full border-2 border-dashed border-border-strong bg-surface-2 transition-colors group-hover:border-primary group-hover:bg-primary-soft">
            <Plus
              className="size-5 text-muted-foreground transition-colors group-hover:text-primary"
              strokeWidth={2.4}
            />
          </span>
          <span className="line-clamp-2 text-center text-[0.6875rem] font-medium leading-tight text-muted-foreground">
            প্রশ্ন করুন
          </span>
        </Link>

        {nodes.map((node) => (
          <Link
            key={node.id}
            href={node.href}
            className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5"
            title={node.name}
          >
            <span
              className={cn(
                "grid size-14 place-items-center rounded-full p-[2px] transition-transform duration-200 group-hover:scale-[1.04]",
                node.isNew
                  ? "bg-gradient-to-br from-primary via-primary to-accent"
                  : "bg-border",
              )}
            >
              <span className="grid size-full place-items-center rounded-full bg-surface p-[2px]">
                <Avatar
                  name={node.name}
                  color={node.color}
                  size="lg"
                  verified={node.verified}
                  className="size-full"
                />
              </span>
            </span>
            <span className="line-clamp-2 text-center text-[0.6875rem] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
              {node.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

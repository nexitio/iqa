"use client";

import { useMemo, useState } from "react";
import { Compass, Inbox, Pin } from "lucide-react";
import type { Discussion } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { Chip, ChipList, EmptyState } from "@/components/ui";
import { DiscussionCard } from "@/components/knowledge";

/**
 * Department filtering for the discussion board. Pinned threads stay at the top
 * of every view so the community's standing guidance is never lost in a filter.
 */
export function DiscussionBrowser({ discussions }: { discussions: Discussion[] }) {
  const { t, isBn, pick, locale } = useI18n();
  const [department, setDepartment] = useState<string | null>(null);

  const activeDepartments = useMemo(() => {
    const used = new Set(discussions.flatMap((d) => d.departmentIds));
    return DEPARTMENTS.filter((d) => used.has(d.slug) || used.has(d.id));
  }, [discussions]);

  const filtered = useMemo(() => {
    const list = department
      ? discussions.filter((d) => d.departmentIds.includes(department))
      : discussions;
    // Pinned first, then most recently active.
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [discussions, department]);

  return (
    <div className="space-y-5">
      <ChipList label={t("label.departments")}>
        <Chip
          size="sm"
          active={department === null}
          onClick={() => setDepartment(null)}
          icon={Compass}
        >
          {isBn ? "সব আলোচনা" : "All discussions"}
        </Chip>
        {activeDepartments.map((item) => (
          <Chip
            key={item.slug}
            size="sm"
            tone={item.tone}
            active={department === item.slug}
            onClick={() => setDepartment(department === item.slug ? null : item.slug)}
          >
            {pick(item.shortName)}
          </Chip>
        ))}
      </ChipList>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={t("state.noResults")}
          description={
            isBn
              ? "এই বিভাগে এখনো কোনো আলোচনা শুরু হয়নি। আপনিই শুরু করতে পারেন।"
              : "No discussions in this department yet."
          }
        />
      ) : (
        <>
          {filtered.some((d) => d.pinned) ? (
            <p className="flex items-center gap-2 text-[0.75rem] font-medium text-accent">
              <Pin className="size-3.5" aria-hidden />
              {isBn ? "পিন করা আলোচনা সবার আগে" : "Pinned discussions first"}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((discussion) => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))}
          </div>
          <p className="text-[0.75rem] text-subtle-foreground">
            {isBn
              ? `${formatNumber(filtered.length, locale)}টি আলোচনা দেখানো হচ্ছে`
              : `Showing ${filtered.length} discussions`}
          </p>
        </>
      )}
    </div>
  );
}

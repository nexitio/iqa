"use client";

import { useMemo, useState } from "react";
import { Compass, Flame, Search } from "lucide-react";
import {
  DEPARTMENTS,
  TOPICS,
  TRENDING_TOPICS,
  getDepartment,
} from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import {
  Button,
  Card,
  Chip,
  ChipList,
  EmptyState,
  SectionHeader,
  SearchInput,
} from "@/components/ui";
import { departmentIcon } from "@/components/people";

/**
 * Topic explorer.
 *
 * Topics are the vocabulary readers actually think in ("যৌতুক", "সুদ ও ব্যাংক")
 * rather than the institutional department names, so this view groups the topic
 * vocabulary under the department that owns it.
 */
export function TopicExplorer() {
  const { t, pick, locale, isBn } = useI18n();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string | null>(null);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    return TOPICS.filter((topic) => {
      if (department && !topic.departmentSlugs.includes(department)) return false;
      if (!q) return true;
      const haystack = [
        topic.name.bn,
        topic.name.en,
        topic.description.bn,
        topic.description.en,
        topic.slug,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [q, department]);

  // Group by the topic's primary department so the page reads as a curriculum.
  const grouped = useMemo(() => {
    const map = new Map<string, typeof TOPICS>();
    for (const topic of results) {
      const key = topic.departmentSlugs[0] ?? "other";
      const list = map.get(key) ?? [];
      list.push(topic);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [results]);

  const isFiltered = Boolean(q) || department !== null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="বিষয় খুঁজুন — যেমন যৌতুক, সুদ, পর্দা…"
          aria-label={t("action.search")}
          wrapperClassName="lg:max-w-md lg:flex-1"
        />
        <p className="text-[0.8125rem] text-muted-foreground">
          <span className="font-semibold tabular text-foreground">
            {formatNumber(results.length, locale)}
          </span>{" "}
          {t("label.topics")}
        </p>
      </div>

      <ChipList label={t("label.departments")}>
        <Chip tone="primary" active={department === null} onClick={() => setDepartment(null)}>
          {t("label.topics")}
        </Chip>
        {DEPARTMENTS.map((item) => (
          <Chip
            key={item.id}
            tone={item.tone}
            icon={departmentIcon(item.icon)}
            active={department === item.slug}
            onClick={() => setDepartment((prev) => (prev === item.slug ? null : item.slug))}
          >
            {pick(item.shortName)}
          </Chip>
        ))}
      </ChipList>

      {/* Trending topics get their own spotlight — this is what draws a reader in. */}
      {!isFiltered ? (
        <Card variant="parchment">
          <SectionHeader
            title={isBn ? "এখন আলোচিত বিষয়" : "Trending topics"}
            description="এই মুহূর্তে সবচেয়ে বেশি জিজ্ঞাসিত বিষয়"
            icon={Flame}
            tone="danger"
            size="sm"
          />
          <div className="flex flex-wrap gap-1.5">
            {TRENDING_TOPICS.map((topic) => (
              <Chip
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                tone="danger"
                size="md"
                count={topic.contentCount}
              >
                {pick(topic.name)}
              </Chip>
            ))}
          </div>
        </Card>
      ) : null}

      {grouped.length === 0 ? (
        <EmptyState
          title={t("state.noResults")}
          description="অন্য শব্দে খুঁজুন বা বিভাগ ফিল্টার সরিয়ে নিন।"
          icon={Compass}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setDepartment(null);
              }}
            >
              {t("action.clear")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([slug, topics]) => {
            const dept = getDepartment(slug);
            const Icon = departmentIcon(dept?.icon);
            return (
              <section key={slug}>
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-[0.9375rem] font-semibold text-foreground">
                      {dept ? pick(dept.name) : "অন্যান্য"}
                    </h2>
                    <p className="text-[0.6875rem] text-subtle-foreground">
                      {formatNumber(topics.length, locale)} {t("label.topics")}
                    </p>
                  </div>
                  {dept ? (
                    <Button
                      href={`/departments/${dept.slug}`}
                      variant="ghost"
                      size="xs"
                      className="ml-auto"
                    >
                      {pick(dept.shortName)} →
                    </Button>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topics.map((topic) => (
                    <Chip
                      key={topic.slug}
                      href={`/topics/${topic.slug}`}
                      tone={dept?.tone ?? "neutral"}
                      size="sm"
                      count={topic.contentCount}
                      title={pick(topic.description)}
                    >
                      {pick(topic.name)}
                    </Chip>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

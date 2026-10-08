"use client";

import { useMemo, useState } from "react";
import { Compass, HandHeart, Search } from "lucide-react";
import { DUA_CATEGORIES, DUAS, duaSearchText } from "@/lib/data/duas";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/bn";
import { Button, Chip, ChipList, EmptyState, SearchInput } from "@/components/ui";
import { DuaCard, duaCategoryIcon } from "@/components/knowledge";

/**
 * The dua collection, grouped by occasion.
 *
 * Filtering is local and instant: twenty-five entries are nothing for a browser
 * to hold, and a library of daily-use text should never wait on a round trip to
 * show the words someone is standing up to recite.
 *
 * Grouping follows the data's own category order rather than the order results
 * happen to arrive in, so the same category always sits in the same place on the
 * page — a reader who learned where "সফর" lives does not have to re-find it.
 */
export function DuaLibrary({ initialCategory = null }: { initialCategory?: string | null }) {
  const { t, pick, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(initialCategory);

  const q = query.trim().toLowerCase();

  const results = useMemo(
    () =>
      DUAS.filter((dua) => {
        if (category && dua.categorySlug !== category) return false;
        if (!q) return true;
        return duaSearchText(dua).includes(q);
      }),
    [q, category],
  );

  const grouped = useMemo(
    () =>
      DUA_CATEGORIES.map((item) => ({
        category: item,
        items: results.filter((dua) => dua.categorySlug === item.slug),
      })).filter((group) => group.items.length > 0),
    [results],
  );

  const isFiltered = Boolean(q) || category !== null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          icon={Search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="দুআ খুঁজুন — ঘুম, সফর, ব্যথা, ঋণ…"
          aria-label={t("action.search")}
          wrapperClassName="lg:max-w-md lg:flex-1"
        />
        <p className="text-[0.8125rem] text-muted-foreground">
          <span className="font-semibold tabular text-foreground">
            {formatNumber(results.length, locale)}
          </span>{" "}
          {t("dua.countLabel")}
        </p>
      </div>

      <ChipList label={t("dua.categories")}>
        <Chip tone="primary" active={category === null} onClick={() => setCategory(null)}>
          {t("dua.all")}
        </Chip>
        {DUA_CATEGORIES.map((item) => (
          <Chip
            key={item.slug}
            tone={item.tone}
            icon={duaCategoryIcon(item.icon)}
            active={category === item.slug}
            count={DUAS.filter((dua) => dua.categorySlug === item.slug).length}
            onClick={() => setCategory((previous) => (previous === item.slug ? null : item.slug))}
          >
            {pick(item.name)}
          </Chip>
        ))}
      </ChipList>

      {grouped.length === 0 ? (
        <EmptyState
          title={t("state.noResults")}
          description="অন্য শব্দে খুঁজুন, বা বিভাগ ফিল্টার সরিয়ে নিন।"
          icon={Compass}
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setCategory(null);
              }}
            >
              {t("action.clear")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(({ category: item, items }) => {
            const Icon = duaCategoryIcon(item.icon);
            return (
              <section key={item.slug} id={item.slug} className="scroll-mt-24">
                <div className="mb-3 flex items-center gap-2.5">
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary"
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-[0.9375rem] font-semibold text-foreground">
                      {pick(item.name)}
                    </h2>
                    <p className="text-[0.6875rem] text-subtle-foreground">{pick(item.description)}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[0.6875rem] text-subtle-foreground">
                    {formatNumber(items.length, locale)} {t("dua.countLabel")}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((dua) => (
                    <div key={dua.slug} id={dua.slug} className="scroll-mt-24">
                      <DuaCard dua={dua} category={item} />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {!isFiltered ? (
        <p className="flex items-center justify-center gap-1.5 pt-1 text-[0.75rem] text-subtle-foreground">
          <HandHeart className="size-3.5" aria-hidden />
          প্রতিটি দুআর সঙ্গে তার সূত্র দেওয়া আছে — সূত্র ছাড়া কিছু এখানে নেই।
        </p>
      ) : null}
    </div>
  );
}

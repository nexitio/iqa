"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Department, District, Scholar } from "@/lib/types";
import { formatNumber } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  Button,
  ButtonGroup,
  Chip,
  ChipList,
  EmptyState,
  SearchInput,
  SegmentButton,
} from "@/components/ui";
import { ScholarCard, departmentIcon } from "@/components/people";

type SortKey = "contribution" | "followers" | "response";

/**
 * The scholar directory.
 *
 * The scholars, the departments and the districts all arrive as props, read from
 * the API by the page above — this used to filter the bundled dataset, which meant
 * the directory and the profiles it links to could disagree about who exists.
 *
 * Filtering still happens client-side, and the *shape* of the controls is
 * unchanged: department as a multi-select, district as a single choice, sort as an
 * enum. What is left to the client is the part the API has no opinion about —
 * fuzzy text over the fetched page, and four orderings of the same list — so each
 * keystroke stays instant instead of waiting on a request.
 */
export function ScholarDirectory({
  scholars,
  departments,
  districts,
}: {
  scholars: Scholar[];
  departments: Department[];
  districts: District[];
}) {
  const { t, pick, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [district, setDistrict] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("contribution");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  /** A department by id or slug — the two keys a row may be tagged with. */
  const departmentOf = useMemo(
    () => (key: string) =>
      departments.find((department) => department.id === key || department.slug === key),
    [departments],
  );

  // Only the districts scholars actually live in, in the API's own order, so the
  // rail cannot offer a filter that can only ever empty the list.
  const activeDistricts = useMemo(() => {
    const used = new Set(scholars.map((scholar) => scholar.district));
    return districts.filter((item) => used.has(item.id));
  }, [scholars, districts]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = scholars.filter((scholar) => {
      if (verifiedOnly && !scholar.verified) return false;
      if (district && scholar.district !== district) return false;

      // A scholar matches when they belong to *any* of the selected departments.
      if (departmentIds.length > 0) {
        const owns = departmentIds.some((d) => scholar.departmentIds.includes(d));
        if (!owns) return false;
      }

      if (!q) return true;
      const haystack = [
        scholar.name.bn,
        scholar.name.en,
        scholar.honorific.bn,
        scholar.honorific.en,
        scholar.madrasah.bn,
        scholar.madrasah.en,
        scholar.shortBio.bn,
        scholar.shortBio.en,
        ...scholar.specialization.flatMap((s) => [s.bn, s.en]),
        ...scholar.departmentIds.flatMap((id) => {
          const d = departmentOf(id);
          return d ? [d.name.bn, d.name.en, d.shortName.bn, d.shortName.en] : [];
        }),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    return filtered.sort((a, b) => {
      if (sort === "followers") return b.stats.followers - a.stats.followers;
      if (sort === "response") return a.responseTimeHours - b.responseTimeHours;
      const contribution = (s: typeof a) =>
        s.stats.answers + s.stats.articles * 3 + s.stats.fatwas * 2;
      return contribution(b) - contribution(a);
    });
  }, [scholars, query, departmentIds, district, sort, verifiedOnly, departmentOf]);

  const activeFilters =
    departmentIds.length + (district ? 1 : 0) + (query ? 1 : 0) + (verifiedOnly ? 1 : 0);

  const clearAll = () => {
    setQuery("");
    setDepartmentIds([]);
    setDistrict(null);
    setVerifiedOnly(false);
  };

  const sortLabels: Record<SortKey, string> = {
    contribution: t("scholars.sortRank"),
    followers: t("scholars.sortFollowers"),
    response: t("scholars.sortResponse"),
  };

  return (
    <div className="space-y-5">
      {/* Search + sort bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("nav.scholars") + " — নাম, মাদরাসা বা বিশেষজ্ঞতা"}
          aria-label={t("action.search")}
          wrapperClassName="lg:max-w-md lg:flex-1"
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-muted-foreground">
            <SlidersHorizontal className="size-3.5" aria-hidden />
            {t("action.sort")}
          </span>
          <ButtonGroup>
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <SegmentButton key={key} active={sort === key} onClick={() => setSort(key)}>
                {sortLabels[key]}
              </SegmentButton>
            ))}
          </ButtonGroup>
        </div>
      </div>

      {/* Department rail */}
      <div className="space-y-2">
        <ChipList label={t("label.departments")}>
          <Chip
            tone="primary"
            active={departmentIds.length === 0}
            onClick={() => setDepartmentIds([])}
          >
            {t("label.departments")}
          </Chip>
          {departments.map((department) => (
            <Chip
              key={department.id}
              tone={department.tone}
              icon={departmentIcon(department.icon)}
              active={departmentIds.includes(department.id)}
              onClick={() =>
                setDepartmentIds((prev) =>
                  prev.includes(department.id)
                    ? prev.filter((id) => id !== department.id)
                    : [...prev, department.id],
                )
              }
              count={department.scholarIds.length}
            >
              {pick(department.shortName)}
            </Chip>
          ))}
        </ChipList>

        {activeDistricts.length > 0 ? (
          <ChipList label={t("label.district")}>
            {activeDistricts.map((item) => (
              <Chip
                key={item.id}
                size="sm"
                variant="outline"
                active={district === item.id}
                onClick={() => setDistrict((prev) => (prev === item.id ? null : item.id))}
              >
                {pick(item.name)}
              </Chip>
            ))}
          </ChipList>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] text-muted-foreground">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            {t("label.verifiedScholar")}
          </label>
          {activeFilters > 0 ? (
            <Button variant="ghost" size="sm" icon={X} onClick={clearAll}>
              {t("action.clear")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-baseline justify-between gap-3 border-t border-border pt-4">
        <p className="text-[0.8125rem] text-muted-foreground">
          <span className="font-semibold tabular text-foreground">
            {formatNumber(results.length, locale)}
          </span>{" "}
          {t("nav.scholars")}
        </p>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title={t("state.noResults")}
          description={
            scholars.length === 0
              ? "এখনো কোনো আলেমের প্রোফাইল যুক্ত হয়নি।"
              : "অন্য বিভাগ বা জেলা বেছে নিয়ে আবার চেষ্টা করুন।"
          }
          action={
            scholars.length === 0 ? undefined : (
              <Button variant="outline" onClick={clearAll}>
                {t("action.clear")}
              </Button>
            )
          }
        />
      ) : (
        <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3")}>
          {results.map((scholar) => (
            <ScholarCard key={scholar.id} scholar={scholar} layout="grid" />
          ))}
        </div>
      )}
    </div>
  );
}

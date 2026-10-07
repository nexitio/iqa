"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { SCHOLARS } from "@/lib/data/scholars";
import { DEPARTMENTS, getDepartment } from "@/lib/data/departments";
import { findDistrict, formatNumber } from "@/lib/bn";
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
 * Filtering happens client-side over the local dataset, but the *shape* of the
 * controls mirrors how the backend will need to be queried (department as a
 * multi-select, district as a single choice, sort as an enum), so swapping in
 * a fetch later does not change the interface.
 */
export function ScholarDirectory() {
  const { t, pick, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  const [district, setDistrict] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("contribution");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const districts = useMemo(
    () => [...new Set(SCHOLARS.map((s) => s.district))].sort(),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = SCHOLARS.filter((scholar) => {
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
          const d = getDepartment(id);
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
  }, [query, departmentIds, district, sort, verifiedOnly]);

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
          {DEPARTMENTS.map((department) => (
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

        <ChipList label={t("label.district")}>
          {districts.map((id) => {
            const d = findDistrict(id);
            return (
              <Chip
                key={id}
                size="sm"
                variant="outline"
                active={district === id}
                onClick={() => setDistrict((prev) => (prev === id ? null : id))}
              >
                {d.name[locale]}
              </Chip>
            );
          })}
        </ChipList>

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
          description="অন্য বিভাগ বা জেলা বেছে নিয়ে আবার চেষ্টা করুন।"
          action={
            <Button variant="outline" onClick={clearAll}>
              {t("action.clear")}
            </Button>
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

"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import type { Scholar } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { districtOptions } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { Digits } from "@/components/i18n-text";
import { ScholarTable } from "@/components/console";
import { Badge, Button, Chip, ChipList, SearchInput, Select } from "@/components/ui";

type SortKey = "contribution" | "followers" | "response" | "name";

/**
 * Searchable admin view of the scholar directory.
 *
 * The console `ScholarTable` renders the rows; this component owns the control
 * bar and the filtering so an admin can narrow a directory that will grow into
 * the hundreds.
 */
export function ScholarDirectory({
  scholars,
  className,
}: {
  scholars: Scholar[];
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  // Several districts at once: an admin comparing coverage across a division
  // should not have to re-pick the filter for every district in it.
  const [districts, setDistricts] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("contribution");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const toggleDept = (slug: string) =>
    setDeptFilter((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scholars.filter((scholar) => {
      if (verifiedOnly && !scholar.verified) return false;
      if (districts.length > 0 && !districts.includes(scholar.district)) return false;
      if (deptFilter.length > 0 && !deptFilter.some((slug) => scholar.departmentIds.includes(slug))) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        scholar.name.bn,
        scholar.name.en,
        scholar.madrasah.bn,
        scholar.madrasah.en,
        scholar.honorific.bn,
        scholar.specialization.map((s) => s.bn).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...list].sort((a, b) => {
      switch (sort) {
        case "followers":
          return b.stats.followers - a.stats.followers;
        case "response":
          return a.responseTimeHours - b.responseTimeHours;
        case "name":
          return a.name.bn.localeCompare(b.name.bn, "bn");
        default:
          return (
            b.stats.answers + b.stats.articles * 3 + b.stats.fatwas * 4 -
            (a.stats.answers + a.stats.articles * 3 + a.stats.fatwas * 4)
          );
      }
    });
  }, [scholars, query, deptFilter, districts, sort, verifiedOnly]);

  const activeFilters = deptFilter.length + (districts.length > 0 ? 1 : 0) + (verifiedOnly ? 1 : 0);

  const reset = () => {
    setQuery("");
    setDeptFilter([]);
    setDistricts([]);
    setVerifiedOnly(false);
  };

  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <SlidersHorizontal className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {t("admin.scholarsTable")}
          </h2>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground">
            {t("admin.scholars.dir.intro")}
          </p>
        </div>
      </div>

      <div className="rounded-panel border border-border bg-surface p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem_13rem_auto]">
          <SearchInput
            icon={Search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin.scholars.dir.searchPlaceholder")}
            aria-label={t("admin.scholars.dir.searchLabel")}
          />
          <Select
            multiple
            value={districts}
            onChange={setDistricts}
            aria-label={t("admin.scholars.dir.districtFilter")}
            placeholder={t("admin.scholars.dir.allDistricts")}
            options={districtOptions(locale)}
          />
          <Select
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
            aria-label={t("admin.scholars.dir.sortBy")}
            options={[
              { value: "contribution", label: t("scholars.sortRank") },
              { value: "followers", label: t("scholars.sortFollowers") },
              { value: "response", label: t("scholars.sortResponse") },
              { value: "name", label: t("admin.scholars.dir.sortName") },
            ]}
          />
          <div className="flex items-center gap-2">
            <Button
              variant={verifiedOnly ? "primary" : "outline"}
              size="md"
              icon={ShieldCheck}
              onClick={() => setVerifiedOnly((v) => !v)}
              aria-pressed={verifiedOnly}
            >
              {t("admin.scholars.dir.verifiedOnly")}
            </Button>
            {activeFilters > 0 || query ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={reset}
                aria-label={t("admin.scholars.dir.clearFilters")}
              >
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            {t("admin.scholars.dir.byDepartment")}
          </p>
          <ChipList label={t("admin.scholars.dir.departmentFilter")}>
            {DEPARTMENTS.map((department) => (
              <Chip
                key={department.slug}
                tone={department.tone}
                active={deptFilter.includes(department.slug)}
                onClick={() => toggleDept(department.slug)}
                count={<Digits value={department.scholarIds.length} />}
              >
                {pick(department.shortName)}
              </Chip>
            ))}
          </ChipList>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Badge tone="primary" size="sm">
            {t("admin.scholars.dir.showing", { count: results.length })}
          </Badge>
          <span className="text-[0.75rem] text-subtle-foreground">
            {t("admin.scholars.dir.ofTotal", { count: scholars.length })}
          </span>
          {deptFilter.map((slug) => {
            const department = DEPARTMENTS.find((d) => d.slug === slug);
            if (!department) return null;
            return (
              <Chip key={slug} tone={department.tone} onRemove={() => toggleDept(slug)}>
                {pick(department.shortName)}
              </Chip>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {results.length === 0 ? (
          <div className="rounded-panel border border-dashed border-border-strong bg-surface-2 p-10 text-center">
            <p className="text-[0.875rem] font-medium text-foreground">
              {t("admin.scholars.dir.noResults")}
            </p>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              {t("admin.scholars.dir.noResultsHelp")}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
              {t("admin.scholars.dir.clearFilters")}
            </Button>
          </div>
        ) : (
          <ScholarTable scholars={results} />
        )}
      </div>
    </section>
  );
}

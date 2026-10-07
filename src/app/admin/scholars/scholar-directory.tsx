"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import type { Scholar } from "@/lib/types";
import { DEPARTMENTS } from "@/lib/data/departments";
import { DISTRICTS } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
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
  const { pick } = useI18n();
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string[]>([]);
  const [district, setDistrict] = useState("all");
  const [sort, setSort] = useState<SortKey>("contribution");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const toggleDept = (slug: string) =>
    setDeptFilter((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scholars.filter((scholar) => {
      if (verifiedOnly && !scholar.verified) return false;
      if (district !== "all" && scholar.district !== district) return false;
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
  }, [scholars, query, deptFilter, district, sort, verifiedOnly]);

  const activeFilters = deptFilter.length + (district !== "all" ? 1 : 0) + (verifiedOnly ? 1 : 0);

  const reset = () => {
    setQuery("");
    setDeptFilter([]);
    setDistrict("all");
    setVerifiedOnly(false);
  };

  return (
    <section className={className}>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <SlidersHorizontal className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">আলেম তালিকা</h2>
          <p className="mt-0.5 text-[0.75rem] text-muted-foreground">
            বিভাগ, জেলা ও যাচাই অবস্থা অনুযায়ী খুঁজুন — কার কোন বিভাগে দায়িত্ব আছে তা এখানেই নির্ধারিত হয়।
          </p>
        </div>
      </div>

      <div className="rounded-panel border border-border bg-surface p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem_13rem_auto]">
          <SearchInput
            icon={Search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="নাম, মাদরাসা বা বিশেষজ্ঞতা দিয়ে খুঁজুন…"
            aria-label="আলেম খুঁজুন"
          />
          <Select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            aria-label="জেলা নির্বাচন"
          >
            <option value="all">সব জেলা</option>
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name.bn}
              </option>
            ))}
          </Select>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="সাজানোর ধরন"
          >
            <option value="contribution">অবদান অনুসারে</option>
            <option value="followers">অনুসারী অনুসারে</option>
            <option value="response">দ্রুত উত্তরদাতা</option>
            <option value="name">নাম অনুসারে</option>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant={verifiedOnly ? "primary" : "outline"}
              size="md"
              icon={ShieldCheck}
              onClick={() => setVerifiedOnly((v) => !v)}
              aria-pressed={verifiedOnly}
            >
              শুধু যাচাইকৃত
            </Button>
            {activeFilters > 0 || query ? (
              <Button variant="ghost" size="icon" onClick={reset} aria-label="ফিল্টার মুছুন">
                <X className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            বিভাগ অনুসারে
          </p>
          <ChipList label="বিভাগ ফিল্টার">
            {DEPARTMENTS.map((department) => (
              <Chip
                key={department.slug}
                tone={department.tone}
                active={deptFilter.includes(department.slug)}
                onClick={() => toggleDept(department.slug)}
                count={department.scholarIds.length}
              >
                {pick(department.shortName)}
              </Chip>
            ))}
          </ChipList>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Badge tone="primary" size="sm">
            {results.length} জন দেখানো হচ্ছে
          </Badge>
          <span className="text-[0.75rem] text-subtle-foreground">
            মোট {scholars.length} জনের মধ্যে
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
            <p className="text-[0.875rem] font-medium text-foreground">কোনো আলেম পাওয়া যায়নি</p>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              ফিল্টার বদলে আবার চেষ্টা করুন বা নতুন আলেম যোগ করুন।
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={reset}>
              ফিল্টার মুছুন
            </Button>
          </div>
        ) : (
          <ScholarTable scholars={results} />
        )}
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  Scale,
  ScrollText,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import type { ReviewItem } from "@/lib/data/admin";
import { ARTICLE_BY_SLUG, FATWA_BY_SLUG, REFERENCES } from "@/lib/data/content";
import { getDepartment } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { formatNumber, toBnDigits } from "@/lib/bn";
import { cn, relativeTime } from "@/lib/utils";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  EmptyState,
  Progress,
  Prose,
  StatusBadge,
} from "@/components/ui";
import { ReferenceList } from "@/components/knowledge";

type Decision = "pending" | "in-review" | "changes-requested" | "approved" | "rejected";

const DECISION_META: Record<Decision, { label: string; status: string }> = {
  pending: { label: "অপেক্ষমাণ", status: "pending" },
  "in-review": { label: "পর্যালোচনায়", status: "in-review" },
  "changes-requested": { label: "পরিবর্তন প্রয়োজন", status: "changes-requested" },
  approved: { label: "অনুমোদিত", status: "published" },
  rejected: { label: "প্রত্যাখ্যাত", status: "rejected" },
};

/**
 * Recovers the citations actually quoted in a body.
 *
 * Authored content stores `referenceCount`, not a link table, so the real
 * citations are the ones whose source name appears in the Bangla body text.
 * Recovering them is better than showing a count the reviewer cannot verify.
 */
function citedReferences(body: string[]) {
  const text = body.join("\n");
  return REFERENCES.filter((reference) => {
    const source = reference.refBn.split(/[,\s]+/).slice(0, 2).join(" ");
    return source.length > 3 && text.includes(source);
  }).slice(0, 8);
}

/**
 * Editorial review board.
 *
 * Every decision updates local state so an item visibly leaves the queue, and
 * the detail panel resolves the real article or fatwa so a reviewer reads the
 * actual prose and its evidence before approving. Persisting the decision
 * belongs to the backend.
 */
export function ReviewBoard({
  items,
  className,
}: {
  items: ReviewItem[];
  className?: string;
}) {
  const { pick, t, locale } = useI18n();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? "");
  const [filter, setFilter] = useState<"to-review" | "all" | "flagged">("to-review");

  const resolve = (item: ReviewItem): Decision =>
    (decisions[item.id] ?? item.status) as Decision;

  const visible = useMemo(() => {
    return items.filter((item) => {
      const decision = resolve(item);
      if (filter === "to-review") return decision === "pending" || decision === "in-review";
      if (filter === "flagged") return item.flaggedReferences > 0;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, decisions, filter]);

  const selected = items.find((i) => i.id === selectedId) ?? visible[0] ?? items[0];

  const resolvedContent = useMemo(() => {
    if (!selected) return null;
    const article = Object.values(ARTICLE_BY_SLUG).find(
      (a) => a.title.bn === selected.titleBn || a.slug === selected.titleBn,
    );
    if (article) {
      return { kind: "article" as const, titleBn: article.title.bn, body: article.bodyBn, references: citedReferences(article.bodyBn) };
    }
    const fatwa = Object.values(FATWA_BY_SLUG).find((f) => f.questionBn === selected.titleBn);
    if (fatwa) {
      return {
        kind: "fatwa" as const,
        titleBn: fatwa.rulingBn,
        body: fatwa.bodyBn,
        references: citedReferences(fatwa.bodyBn),
      };
    }
    return null;
  }, [selected]);

  const decide = (id: string, decision: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: decision }));

  const counters = {
    pending: items.filter((i) => resolve(i) === "pending").length,
    inReview: items.filter((i) => resolve(i) === "in-review").length,
    changes: items.filter((i) => resolve(i) === "changes-requested").length,
    approved: items.filter((i) => resolve(i) === "approved").length,
    rejected: items.filter((i) => resolve(i) === "rejected").length,
    flagged: items.filter((i) => i.flaggedReferences > 0).length,
  };

  const totalResolved = counters.approved + counters.rejected;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "অপেক্ষমাণ", value: counters.pending, tone: "warning" as const, icon: Clock },
          { label: "পর্যালোচনায়", value: counters.inReview, tone: "info" as const, icon: Eye },
          {
            label: "সতর্ক রেফারেন্স",
            value: counters.flagged,
            tone: counters.flagged > 0 ? ("danger" as const) : ("success" as const),
            icon: AlertTriangle,
          },
          { label: "এই সেশনে নিষ্পত্তি", value: totalResolved, tone: "success" as const, icon: Check },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-panel border border-border bg-surface p-4 shadow-card"
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl",
                stat.tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
                stat.tone === "info" && "bg-info-soft text-info-soft-foreground",
                stat.tone === "danger" && "bg-danger-soft text-danger-soft-foreground",
                stat.tone === "success" && "bg-success-soft text-success-soft-foreground",
              )}
            >
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="text-[0.6875rem] text-subtle-foreground">{stat.label}</p>
              <p className="font-display text-xl font-bold tabular leading-none text-foreground">
                {formatNumber(stat.value, locale)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            { id: "to-review" as const, label: "পর্যালোচনার অপেক্ষায়" },
            { id: "flagged" as const, label: "সতর্ক রেফারেন্স" },
            { id: "all" as const, label: "সব জমা" },
          ]
        ).map((option) => (
          <Button
            key={option.id}
            size="sm"
            variant={filter === option.id ? "primary" : "outline"}
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <ul className="space-y-3">
          {visible.length === 0 ? (
            <li>
              <EmptyState
                icon={ClipboardCheck}
                tone="success"
                title="এই তালিকা খালি"
                description="নির্বাচিত ফিল্টারে কোনো কনটেন্ট নেই। সব জমা দেখতে ফিল্টার বদলান।"
                className="rounded-panel border border-border bg-surface"
              />
            </li>
          ) : (
            visible.map((item) => {
              const decision = resolve(item);
              const isSelected = selected?.id === item.id;
              const departments = item.departments
                .map((slug) => getDepartment(slug))
                .filter((d): d is NonNullable<typeof d> => Boolean(d));

              return (
                <li key={item.id}>
                  <Card
                    interactive
                    className={cn(
                      "cursor-pointer",
                      isSelected && "border-primary/45 ring-1 ring-primary/20",
                    )}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="flex items-start gap-3.5">
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl",
                          item.kind === "article"
                            ? "bg-primary-soft text-primary"
                            : "bg-accent-soft text-accent-soft-foreground",
                        )}
                      >
                        {item.kind === "article" ? (
                          <FileText className="size-5" />
                        ) : (
                          <Scale className="size-5" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            status={DECISION_META[decision].status}
                            label={DECISION_META[decision].label}
                            size="xs"
                          />
                          <Badge tone={item.kind === "article" ? "primary" : "accent"} size="xs">
                            {item.kind === "article" ? t("label.article") : t("label.fatwa")}
                          </Badge>
                          {item.flaggedReferences > 0 && decision !== "approved" ? (
                            <Badge tone="danger" size="xs" icon={AlertTriangle}>
                              {toBnDigits(item.flaggedReferences)}টি দুর্বল রেফারেন্স
                            </Badge>
                          ) : null}
                        </div>

                        <p className="mt-2 font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
                          {item.titleBn}
                        </p>
                        <p className="mt-1 text-[0.75rem] text-muted-foreground">
                          {item.authorNameBn} · জমা {relativeTime(item.submittedAt, locale)}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {departments.map((department) => (
                            <Chip
                              key={department.slug}
                              size="sm"
                              tone={department.tone}
                              className="h-6 px-2 text-[0.6875rem]"
                            >
                              {pick(department.shortName)}
                            </Chip>
                          ))}
                          <span className="inline-flex items-center gap-1 text-[0.6875rem] tabular text-subtle-foreground">
                            <ScrollText className="size-3" aria-hidden />
                            {formatNumber(item.wordCount, locale)} শব্দ
                          </span>
                          <span className="inline-flex items-center gap-1 text-[0.6875rem] tabular text-subtle-foreground">
                            <BookOpen className="size-3" aria-hidden />
                            {formatNumber(item.referenceCount, locale)} রেফারেন্স
                          </span>
                        </div>
                      </div>
                    </div>

                    <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                      <Button
                        size="sm"
                        icon={Check}
                        disabled={decision === "approved"}
                        onClick={(e) => {
                          e.stopPropagation();
                          decide(item.id, "approved");
                        }}
                      >
                        অনুমোদন
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Undo2}
                        onClick={(e) => {
                          e.stopPropagation();
                          decide(item.id, "changes-requested");
                        }}
                      >
                        পরিবর্তন চান
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={X}
                        onClick={(e) => {
                          e.stopPropagation();
                          decide(item.id, "rejected");
                        }}
                      >
                        প্রত্যাখ্যান
                      </Button>
                      {decision !== (item.status as Decision) ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDecisions((prev) => {
                              const next = { ...prev };
                              delete next[item.id];
                              return next;
                            });
                          }}
                        >
                          আগের অবস্থায় ফেরান
                        </Button>
                      ) : null}
                    </footer>
                  </Card>
                </li>
              );
            })
          )}
        </ul>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          {selected ? (
            <Card>
              <CardHeader
                icon={Eye}
                tone="primary"
                title="পর্যালোচনা প্যানেল"
                subtitle={selected.titleBn}
              />

              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <StatusBadge
                  status={DECISION_META[resolve(selected)].status}
                  label={DECISION_META[resolve(selected)].label}
                  size="xs"
                />
                <Badge tone="neutral" size="xs">
                  {selected.authorNameBn}
                </Badge>
                {selected.flaggedReferences > 0 ? (
                  <Badge tone="danger" size="xs" icon={AlertTriangle}>
                    {toBnDigits(selected.flaggedReferences)}টি রেফারেন্স যাচাই প্রয়োজন
                  </Badge>
                ) : (
                  <Badge tone="success" size="xs" icon={Check}>
                    রেফারেন্স সতর্কতা নেই
                  </Badge>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 rounded-card border border-border bg-surface-2 p-3">
                <div>
                  <p className="text-[0.625rem] text-subtle-foreground">শব্দ</p>
                  <p className="font-display text-base font-bold tabular text-foreground">
                    {formatNumber(selected.wordCount, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.625rem] text-subtle-foreground">রেফারেন্স</p>
                  <p className="font-display text-base font-bold tabular text-foreground">
                    {formatNumber(selected.referenceCount, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-[0.625rem] text-subtle-foreground">যাচাই বাকি</p>
                  <p
                    className={cn(
                      "font-display text-base font-bold tabular",
                      selected.flaggedReferences > 0 ? "text-danger" : "text-success",
                    )}
                  >
                    {formatNumber(selected.flaggedReferences, locale)}
                  </p>
                </div>
              </div>

              {resolvedContent ? (
                <>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[0.75rem] font-semibold text-foreground">মূল লেখা</p>
                    <Badge tone={resolvedContent.kind === "article" ? "primary" : "accent"} size="xs">
                      {resolvedContent.kind === "article" ? t("label.article") : t("label.fatwa")}
                    </Badge>
                  </div>
                  <div className="mt-2 max-h-72 overflow-y-auto rounded-card border border-border bg-surface-2 p-4">
                    <Prose paragraphs={resolvedContent.body} className="text-[0.875rem]" />
                  </div>

                  {resolvedContent.references.length > 0 ? (
                    <div className="mt-4">
                      <p className="mb-2 text-[0.75rem] font-semibold text-foreground">
                        লেখায় উদ্ধৃত দলিল
                      </p>
                      <div className="max-h-56 overflow-y-auto">
                        <ReferenceList
                          references={resolvedContent.references}
                          layout="compact"
                        />
                      </div>
                    </div>
                  ) : (
                    <Callout tone="warning" className="mt-4" icon={AlertTriangle}>
                      লেখাটিতে স্পষ্টভাবে চিহ্নিত কোনো দলিল পাওয়া যায়নি — অনুমোদনের আগে রেফারেন্স যুক্ত করতে বলুন।
                    </Callout>
                  )}
                </>
              ) : (
                <Callout tone="info" className="mt-4" icon={Sparkles}>
                  এই আইটেমের মূল লেখা এখনো প্রকাশিত সংকলনে নেই, তাই শুধু মেটাডেটা দেখা যাচ্ছে।
                </Callout>
              )}

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[0.6875rem] text-subtle-foreground">রেফারেন্স যাচাইয়ের অগ্রগতি</p>
                  <span className="text-[0.6875rem] tabular text-muted-foreground">
                    {formatNumber(
                      resolve(selected) === "approved" ? selected.referenceCount : 0,
                      locale,
                    )}
                    /{formatNumber(selected.referenceCount, locale)}
                  </span>
                </div>
                <Progress
                  value={
                    selected.referenceCount > 0 && resolve(selected) === "approved"
                      ? 100
                      : selected.referenceCount > 0
                        ? Math.round(
                            ((selected.referenceCount - selected.flaggedReferences) /
                              selected.referenceCount) *
                              100,
                          )
                        : 0
                  }
                  tone={selected.flaggedReferences > 0 ? "warning" : "primary"}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <Button size="sm" icon={Check} onClick={() => decide(selected.id, "approved")}>
                  অনুমোদন করে প্রকাশ করুন
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => decide(selected.id, "changes-requested")}
                >
                  পরিবর্তন চেয়ে ফেরত
                </Button>
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader icon={ClipboardCheck} tone="info" title="পর্যালোচনার মানদণ্ড" />
            <ul className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                প্রতিটি আয়াত ও হাদীসের রেফারেন্স যাচাই করুন — ভুল সন্বর্ধনা বা ভুল সূত্র সবচেয়ে বড় ক্ষতি।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                দলাদলিমূলক বা কোনো দলকে আক্রমণ করে এমন ভাষা থাকলে প্রকাশ করা যাবে না।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                শর্তহীন বা অতি-কঠোর রায় হলে কারণ ও ব্যতিক্রম স্পষ্ট করা লাগবে।
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                বিভাগ ঠিক আছে কি না দেখুন — ভুল বিভাগে প্রকাশিত ফতোয়া ভুল পাঠকের কাছে পৌঁছায়।
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}

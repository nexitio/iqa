"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  Check,
  ExternalLink,
  Flag,
  Lock,
  ShieldAlert,
  Undo2,
  X,
} from "lucide-react";
import type { ContentReport } from "@/lib/data/admin";
import { DISCUSSIONS } from "@/lib/data/community";
import { useI18n } from "@/lib/i18n";
import { cn, relativeTime } from "@/lib/utils";
import { formatNumber } from "@/lib/bn";
import { DiscussionRow } from "@/components/knowledge";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  EmptyState,
  StatusBadge,
} from "@/components/ui";

type Decision = "pending" | "resolved" | "dismissed";
type FilterId = "pending" | "high" | "all";

/* Both tables hold dictionary keys rather than wording: they sit at module scope,
 * where no hook can translate them, so the label is resolved at render time. */
const SEVERITY_META: Record<
  ContentReport["severity"],
  { labelKey: string; tone: "danger" | "warning" | "neutral" }
> = {
  high: { labelKey: "admin.queue.severityHigh", tone: "danger" },
  medium: { labelKey: "admin.queue.severityMedium", tone: "warning" },
  low: { labelKey: "admin.queue.severityLow", tone: "neutral" },
};

const CONTENT_TYPE_KEY: Record<ContentReport["contentType"], string> = {
  question: "label.question",
  answer: "label.answer",
  article: "label.article",
  fatwa: "label.fatwa",
  discussion: "label.discussion",
  comment: "admin.queue.typeComment",
};

/**
 * Moderation report board.
 *
 * Resolving or dismissing a report updates local state immediately so the queue
 * visibly empties, and the decision can be undone while the session lasts.
 * Persisting the outcome is a backend concern.
 */
export function ReportBoard({
  reports,
  className,
}: {
  reports: ContentReport[];
  className?: string;
}) {
  const { locale, t } = useI18n();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [filter, setFilter] = useState<FilterId>("pending");
  const [hidden, setHidden] = useState<string[]>([]);
  const [locked, setLocked] = useState<string[]>([]);

  const resolve = (report: ContentReport): Decision =>
    decisions[report.id] ?? (report.status as Decision);

  const visible = useMemo(() => {
    return reports.filter((report) => {
      const decision = resolve(report);
      if (filter === "pending") return decision === "pending";
      if (filter === "high") return report.severity === "high";
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, decisions, filter]);

  const counts = {
    pending: reports.filter((r) => resolve(r) === "pending").length,
    high: reports.filter((r) => r.severity === "high").length,
    resolved: reports.filter((r) => resolve(r) === "resolved").length,
    dismissed: reports.filter((r) => resolve(r) === "dismissed").length,
  };

  const flaggedThreads = DISCUSSIONS.filter((d) => d.moderationState !== "clean");

  const decide = (id: string, decision: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: decision }));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            labelKey: "status.pending",
            value: counts.pending,
            tone: "warning" as const,
            icon: Flag,
          },
          {
            labelKey: "admin.queue.statHighSeverity",
            value: counts.high,
            tone: "danger" as const,
            icon: ShieldAlert,
          },
          {
            labelKey: "admin.queue.resolved",
            value: counts.resolved,
            tone: "success" as const,
            icon: Check,
          },
          {
            labelKey: "admin.queue.dismissed",
            value: counts.dismissed,
            tone: "neutral" as const,
            icon: X,
          },
        ].map((stat) => (
          <div
            key={stat.labelKey}
            className="flex items-center gap-3 rounded-panel border border-border bg-surface p-4 shadow-card"
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl",
                stat.tone === "warning" && "bg-warning-soft text-warning-soft-foreground",
                stat.tone === "danger" && "bg-danger-soft text-danger-soft-foreground",
                stat.tone === "success" && "bg-success-soft text-success-soft-foreground",
                stat.tone === "neutral" && "bg-surface-3 text-muted-foreground",
              )}
            >
              <stat.icon className="size-5" />
            </span>
            <div>
              <p className="text-[0.6875rem] text-subtle-foreground">{t(stat.labelKey)}</p>
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
            { id: "pending" as const, labelKey: "admin.queue.filterPendingReports" },
            { id: "high" as const, labelKey: "admin.queue.statHighSeverity" },
            { id: "all" as const, labelKey: "admin.queue.filterAllReports" },
          ]
        ).map((option) => (
          <Button
            key={option.id}
            size="sm"
            variant={filter === option.id ? "primary" : "outline"}
            onClick={() => setFilter(option.id)}
            aria-pressed={filter === option.id}
          >
            {t(option.labelKey)}
          </Button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Check}
          tone="success"
          title={t("admin.queue.listEmpty")}
          description={t("admin.queue.emptyReportsBody")}
          className="rounded-panel border border-border bg-surface"
        />
      ) : (
        <ul className="space-y-3">
          {visible.map((report) => {
            const decision = resolve(report);
            const severity = SEVERITY_META[report.severity];
            const isHidden = hidden.includes(report.contentHref);
            const isLocked = locked.includes(report.contentHref);

            return (
              <li key={report.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={severity.tone} size="xs" icon={AlertTriangle}>
                          {t("admin.queue.severityLabel", { level: t(severity.labelKey) })}
                        </Badge>
                        <Badge tone="neutral" size="xs">
                          {t(CONTENT_TYPE_KEY[report.contentType])}
                        </Badge>
                        <StatusBadge
                          status={decision}
                          label={
                            decision === "pending"
                              ? t("status.pending")
                              : decision === "resolved"
                                ? t("admin.queue.resolved")
                                : t("admin.queue.dismissed")
                          }
                          size="xs"
                        />
                        {isHidden ? (
                          <Badge tone="danger" size="xs" icon={Ban}>
                            {t("admin.queue.contentHidden")}
                          </Badge>
                        ) : null}
                        {isLocked ? (
                          <Badge tone="neutral" size="xs" icon={Lock}>
                            {t("admin.queue.threadLocked")}
                          </Badge>
                        ) : null}
                      </div>

                      <p className="mt-2.5 font-display text-[0.9375rem] font-semibold leading-snug text-foreground">
                        {report.contentTitleBn}
                      </p>
                      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                        {report.reasonLabelBn}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-subtle-foreground">
                        <span>{t("admin.queue.reportedBy", { name: report.reportedByBn })}</span>
                        <span aria-hidden>·</span>
                        <span>{relativeTime(report.reportedAt, locale)}</span>
                        {report.assignedToBn ? (
                          <>
                            <span aria-hidden>·</span>
                            <span>
                              {t("admin.queue.assignedTo", { name: report.assignedToBn })}
                            </span>
                          </>
                        ) : (
                          <>
                            <span aria-hidden>·</span>
                            <span className="text-warning">{t("admin.queue.noAssignee")}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <Button
                      href={report.contentHref}
                      size="sm"
                      variant="ghost"
                      iconRight={ExternalLink}
                      className="shrink-0"
                    >
                      {t("admin.queue.viewContent")}
                    </Button>
                  </div>

                  <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <Button
                      size="sm"
                      icon={Check}
                      disabled={decision === "resolved"}
                      onClick={() => decide(report.id, "resolved")}
                    >
                      {t("admin.queue.resolveReport")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Ban}
                      onClick={() => {
                        setHidden((prev) =>
                          prev.includes(report.contentHref)
                            ? prev.filter((h) => h !== report.contentHref)
                            : [...prev, report.contentHref],
                        );
                        decide(report.id, "resolved");
                      }}
                    >
                      {isHidden ? t("admin.queue.unhideContent") : t("admin.queue.hideContent")}
                    </Button>
                    {report.contentType === "discussion" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={Lock}
                        onClick={() => {
                          setLocked((prev) =>
                            prev.includes(report.contentHref)
                              ? prev.filter((h) => h !== report.contentHref)
                              : [...prev, report.contentHref],
                          );
                        }}
                      >
                        {isLocked ? t("admin.queue.unlockThread") : t("admin.queue.lockThread")}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={X}
                      disabled={decision === "dismissed"}
                      onClick={() => decide(report.id, "dismissed")}
                    >
                      {t("admin.queue.dismissReport")}
                    </Button>
                    {decision !== (report.status as Decision) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Undo2}
                        className="ml-auto"
                        onClick={() =>
                          setDecisions((prev) => {
                            const next = { ...prev };
                            delete next[report.id];
                            return next;
                          })
                        }
                      >
                        {t("admin.queue.revert")}
                      </Button>
                    ) : null}
                  </footer>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {flaggedThreads.length > 0 ? (
        <Card>
          <CardHeader
            icon={ShieldAlert}
            tone="warning"
            title={t("admin.queue.flaggedThreads")}
            subtitle={t("admin.queue.flaggedThreadsHelp")}
          />
          <ul className="mt-4 space-y-1">
            {flaggedThreads.map((discussion) => (
              <li key={discussion.id}>
                <DiscussionRow discussion={discussion} />
              </li>
            ))}
          </ul>
          <Callout tone="info" className="mt-4">
            {t("admin.queue.flaggedThreadsNote")}
          </Callout>
        </Card>
      ) : null}
    </div>
  );
}

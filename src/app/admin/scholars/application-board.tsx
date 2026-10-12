"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Check,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  UserPlus,
  Users,
  X,
  Eye,
} from "lucide-react";
import type { ScholarApplication } from "@/lib/data/admin";
import { getDepartment } from "@/lib/data/departments";
import { findDistrict } from "@/lib/bn";
import { useI18n } from "@/lib/i18n";
import { relativeTime } from "@/lib/utils";
import {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  Chip,
  EmptyState,
  StatusBadge,
  Switch,
} from "@/components/ui";

type Decision = "pending" | "approved" | "rejected";

/** Each decision is shown with the shared `status.*` wording. */
const DECISION_KEY: Record<Decision, string> = {
  pending: "status.pending",
  approved: "status.approved",
  rejected: "status.rejected",
};

/**
 * Application review board.
 *
 * Each card is fully interactive: approving or rejecting moves the application
 * out of the pending queue immediately and records the decision in local state,
 * so an admin can see the effect of their decision rather than pressing a
 * control that does nothing. Persisting the decision is a backend concern.
 */
export function ApplicationBoard({
  applications,
  className,
}: {
  applications: ScholarApplication[];
  className?: string;
}) {
  const { t, pick, locale } = useI18n();
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [verifying, setVerifying] = useState(true);
  const [notifyApplicant, setNotifyApplicant] = useState(true);
  const [showDecided, setShowDecided] = useState(false);

  const resolve = (app: ScholarApplication): Decision => decisions[app.id] ?? app.status;

  const pending = useMemo(
    () => applications.filter((a) => resolve(a) === "pending"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applications, decisions],
  );
  const decided = useMemo(
    () => applications.filter((a) => resolve(a) !== "pending"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applications, decisions],
  );

  const decide = (id: string, decision: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: decision }));

  const approved = decided.filter((a) => resolve(a) === "approved").length;
  const rejected = decided.filter((a) => resolve(a) === "rejected").length;

  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning-soft-foreground">
            <UserPlus className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("admin.scholars.board.title")}
            </h2>
            <p className="mt-0.5 text-[0.75rem] text-muted-foreground">
              {t("admin.scholars.board.intro")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning" size="sm">
            {t("admin.scholars.board.pendingBadge", { count: pending.length })}
          </Badge>
          <Badge tone="success" size="sm">
            {t("admin.scholars.board.approvedBadge", { count: approved })}
          </Badge>
          <Badge tone="danger" size="sm">
            {t("admin.scholars.board.rejectedBadge", { count: rejected })}
          </Badge>
        </div>
      </div>

      <Card className="mb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Switch
            id="verify-profile"
            checked={verifying}
            onChange={setVerifying}
            label={t("admin.scholars.board.verifyPublish")}
            description={t("admin.scholars.board.verifyPublishHelp")}
          />
          <Switch
            id="notify-applicant"
            checked={notifyApplicant}
            onChange={setNotifyApplicant}
            label={t("admin.scholars.board.notifyDecision")}
            description={t("admin.scholars.board.notifyDecisionHelp")}
          />
        </div>
      </Card>

      {pending.length === 0 ? (
        <EmptyState
          icon={Check}
          tone="success"
          title={t("admin.scholars.board.emptyTitle")}
          description={t("admin.scholars.board.emptyBody")}
          className="rounded-panel border border-border bg-surface"
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {pending.map((application) => {
            const district = findDistrict(application.district);
            return (
              <li key={application.id}>
                <Card className="flex h-full flex-col">
                  <header className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar name={application.nameBn} color="#a3405f" size="lg" />
                      <div className="min-w-0">
                        <p className="truncate font-display text-[1.0625rem] font-semibold text-foreground">
                          {application.nameBn}
                        </p>
                        <p className="truncate text-[0.75rem] text-muted-foreground">{application.nameEn}</p>
                        <p className="mt-1 inline-flex flex-wrap items-center gap-1.5 text-[0.75rem] text-subtle-foreground">
                          <MapPin className="size-3" aria-hidden />
                          {pick(district.name)}
                          <span aria-hidden>·</span>
                          {t("admin.scholars.board.experience", { count: application.experienceYears })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status="pending" label={t(DECISION_KEY.pending)} />
                  </header>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                        <Building2 className="size-3.5" aria-hidden />
                        {t("label.madrasah")}
                      </p>
                      <p className="mt-1 text-[0.8125rem] leading-snug text-foreground">
                        {application.madrasahBn}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
                        <Mail className="size-3.5" aria-hidden />
                        <span className="truncate">{application.email}</span>
                      </p>
                    </div>
                    <div>
                      <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                        <GraduationCap className="size-3.5" aria-hidden />
                        {t("admin.scholars.credentials")}
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {application.credentialsBn.map((credential) => (
                          <li
                            key={credential}
                            className="flex items-start gap-2 text-[0.8125rem] leading-snug text-muted-foreground"
                          >
                            <Check className="mt-1 size-3 shrink-0 text-success" strokeWidth={3} aria-hidden />
                            {credential}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                      <Users className="size-3.5" aria-hidden />
                      {t("admin.scholars.board.proposedDepartments")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {application.departments.map((slug) => {
                        const department = getDepartment(slug);
                        if (!department) return null;
                        return (
                          <Chip key={slug} href={`/departments/${slug}`} size="sm" tone={department.tone}>
                            {pick(department.name)}
                          </Chip>
                        );
                      })}
                    </div>
                    {application.departments.length < 2 ? (
                      <p className="mt-2 text-[0.6875rem] text-warning">
                        {t("admin.scholars.board.fewDepartments", {
                          count: application.departments.length,
                        })}
                      </p>
                    ) : null}
                  </div>

                  <footer className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    <span className="mr-auto inline-flex items-center gap-1.5 text-[0.6875rem] text-subtle-foreground">
                      <Clock className="size-3" aria-hidden />
                      {t("admin.scholars.board.submitted", {
                        time: relativeTime(application.submittedAt, locale),
                      })}
                    </span>
                    <Button
                      size="sm"
                      icon={Check}
                      onClick={() => decide(application.id, "approved")}
                      title={verifying ? t("admin.scholars.board.approveVerified") : t("action.approve")}
                    >
                      {t("action.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => decide(application.id, "pending")}
                      disabled
                    >
                      {t("admin.scholars.board.backToReview")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={X}
                      onClick={() => decide(application.id, "rejected")}
                    >
                      {t("action.reject")}
                    </Button>
                  </footer>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {decided.length > 0 ? (
        <div className="mt-5">
          <Button variant="ghost" size="sm" onClick={() => setShowDecided((v) => !v)}>
            {showDecided
              ? t("admin.scholars.board.hideDecided")
              : t("admin.scholars.board.showDecided", { count: decided.length })}
          </Button>
          {showDecided ? (
            <ul className="mt-3 space-y-2">
              {decided.map((application) => {
                const decision = resolve(application);
                return (
                  <li
                    key={application.id}
                    className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface px-4 py-3"
                  >
                    <Avatar name={application.nameBn} color="#5c6b64" size="sm" />
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-foreground">
                      {application.nameBn}
                    </span>
                    <StatusBadge
                      status={decision === "approved" ? "approved" : "rejected"}
                      label={t(DECISION_KEY[decision])}
                      size="xs"
                    />
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => decide(application.id, "pending")}
                    >
                      {t("admin.scholars.board.undo")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      <Callout tone="info" className="mt-5">
        {t("admin.scholars.board.note")}
      </Callout>
    </section>
  );
}

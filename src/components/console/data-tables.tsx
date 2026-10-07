"use client";

import type { ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  Check,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  GraduationCap,
  Mail,
  MapPin,
  PenLine,
  ShieldAlert,
  Scale,
  ThumbsDown,
  UserRound,
  X,
} from "lucide-react";
import type { Department, Scholar } from "@/lib/types";
import type {
  AdminUserRow,
  ContentReport,
  ReviewItem,
  ScholarApplication,
} from "@/lib/data/admin";
import { getScholar } from "@/lib/data/scholars";
import { getDepartment } from "@/lib/data/departments";
import { useI18n } from "@/lib/i18n";
import { findDistrict, formatNumber } from "@/lib/bn";
import { cn, relativeTime } from "@/lib/utils";
import {
  Avatar,
  AvatarStack,
  Badge,
  Button,
  Card,
  Chip,
  CountPill,
  ScoreBadge,
  StatusBadge,
} from "@/components/ui";

/**
 * Admin data grids.
 *
 * These are the screens an administrator lives in, so density matters: fixed
 * row rhythm, tabular Bengali numerals, one clear status colour per row, and a
 * horizontal scroll wrapper so nothing becomes unreadable on a phone.
 */

function TableShell({
  head,
  children,
  className,
  minWidth = 880,
}: {
  head: ReactNode;
  children: ReactNode;
  className?: string;
  minWidth?: number;
}) {
  return (
    <Card padding="none" className={cn("overflow-hidden", className)}>
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth }}>
          <thead className="border-b border-border bg-surface-2">
            <tr className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
              {head}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
    </Card>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("whitespace-nowrap px-4 py-3 font-semibold", className)}>{children}</th>;
}

function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-[0.8125rem]", className)}>{children}</td>;
}

const ROLE_TONE = {
  admin: "admin",
  scholar: "scholar",
  user: "user",
} as const;

const ROLE_LABEL = {
  admin: "অ্যাডমিন",
  scholar: "আলেম",
  user: "ব্যবহারকারী",
} as const;

/* --------------------------------------------------------------- scholars */

export function ScholarTable({
  scholars,
  className,
}: {
  scholars: Scholar[];
  className?: string;
}) {
  const { t, pick, locale } = useI18n();

  return (
    <TableShell
      className={className}
      minWidth={1020}
      head={
        <>
          <Th>{t("label.name")}</Th>
          <Th>{t("label.madrasah")}</Th>
          <Th>{t("label.departments")}</Th>
          <Th className="text-center">{t("console.helpfulRate")}</Th>
          <Th className="text-center">{t("label.answers")}</Th>
          <Th className="text-center">{t("label.articles")}</Th>
          <Th className="text-center">{t("label.fatwas")}</Th>
          <Th className="text-center">{t("label.followers")}</Th>
          <Th>{t("label.status")}</Th>
          <Th className="text-right">{t("action.more")}</Th>
        </>
      }
    >
      {scholars.map((scholar) => {
        const departments = scholar.departmentIds
          .map((id) => getDepartment(id))
          .filter((d): d is Department => Boolean(d));

        return (
          <tr key={scholar.id} className="transition-colors hover:bg-surface-2">
            <Td>
              <div className="flex items-center gap-3">
                <Avatar
                  name={scholar.name.bn}
                  color={scholar.avatarColor}
                  size="md"
                  verified={scholar.verified}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {pick(scholar.honorific)} {pick(scholar.name)}
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-[0.6875rem] text-subtle-foreground">
                    <MapPin className="size-3" aria-hidden />
                    {pick(findDistrict(scholar.district).name)}
                  </p>
                </div>
              </div>
            </Td>
            <Td className="text-muted-foreground">
              <span className="line-clamp-2 max-w-56">{pick(scholar.madrasah)}</span>
            </Td>
            <Td>
              <div className="flex max-w-64 flex-wrap gap-1">
                {departments.slice(0, 2).map((department) => (
                  <Chip key={department.slug} size="sm" tone={department.tone}>
                    {pick(department.shortName)}
                  </Chip>
                ))}
                {departments.length > 2 ? (
                  <CountPill value={`+${formatNumber(departments.length - 2, locale)}`} />
                ) : null}
              </div>
            </Td>
            <Td className="text-center">
              <ScoreBadge value={`${formatNumber(scholar.rating, locale)}`} tone="accent" />
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(scholar.stats.answers, locale)}
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(scholar.stats.articles, locale)}
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(scholar.stats.fatwas, locale)}
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(scholar.stats.followers, locale)}
            </Td>
            <Td>
              {scholar.verified ? (
                <Badge tone="primary" size="sm" icon={BadgeCheck}>
                  {t("label.verified")}
                </Badge>
              ) : (
                <Badge tone="warning" size="sm" icon={ShieldAlert}>
                  যাচাই বাকি
                </Badge>
              )}
              <p className="mt-1.5 text-[0.6875rem] text-subtle-foreground">
                {scholar.availableForQuestions ? t("label.available") : t("label.busy")}
              </p>
            </Td>
            <Td className="text-right">
              <div className="inline-flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  href={`/scholars/${scholar.slug}`}
                  icon={ExternalLink}
                >
                  {t("action.readMore")}
                </Button>
                <Button variant="outline" size="xs" icon={PenLine}>
                  {t("action.edit")}
                </Button>
              </div>
            </Td>
          </tr>
        );
      })}
    </TableShell>
  );
}

/* ----------------------------------------------------------- applications */

export function ApplicationCard({
  application,
  className,
}: {
  application: ScholarApplication;
  className?: string;
}) {
  const { pick, locale } = useI18n();

  return (
    <Card className={cn("flex flex-col", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={application.nameBn} color="#0d6b4f" size="lg" />
          <div className="min-w-0">
            <p className="truncate font-display text-[1.0625rem] font-semibold text-foreground">
              {application.nameBn}
            </p>
            <p className="truncate text-[0.75rem] text-muted-foreground">{application.nameEn}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[0.75rem] text-subtle-foreground">
              <MapPin className="size-3" aria-hidden />
              {pick(findDistrict(application.district).name)}
              <span aria-hidden>·</span>
              {formatNumber(application.experienceYears, locale)} বছরের অভিজ্ঞতা
            </p>
          </div>
        </div>
        <StatusBadge
          status={application.status}
          label={
            application.status === "pending"
              ? "অপেক্ষমাণ"
              : application.status === "approved"
                ? "অনুমোদিত"
                : "প্রত্যাখ্যাত"
          }
        />
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            <Building2 className="size-3.5" aria-hidden />
            মাদরাসা
          </p>
          <p className="mt-1 text-[0.8125rem] text-foreground">{application.madrasahBn}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
            <Mail className="size-3.5" aria-hidden />
            <span className="truncate">{application.email}</span>
          </p>
        </div>
        <div>
          <p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
            <GraduationCap className="size-3.5" aria-hidden />
            যোগ্যতা
          </p>
          <ul className="mt-1.5 space-y-1">
            {application.credentialsBn.map((credential) => (
              <li key={credential} className="flex items-start gap-2 text-[0.8125rem] text-muted-foreground">
                <Check className="mt-1 size-3 shrink-0 text-success" strokeWidth={3} aria-hidden />
                {credential}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {application.departments.map((slug) => {
          const department = getDepartment(slug);
          if (!department) return null;
          return (
            <Chip key={slug} size="sm" tone={department.tone}>
              {pick(department.name)}
            </Chip>
          );
        })}
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="mr-auto text-[0.6875rem] text-subtle-foreground">
          জমা দিয়েছেন {relativeTime(application.submittedAt, locale)}
        </span>
        <Button size="sm" icon={Check} disabled={application.status !== "pending"}>
          {application.status === "pending" ? "অনুমোদন" : "অনুমোদিত"}
        </Button>
        <Button variant="outline" size="sm" icon={Eye}>
          পর্যালোচনা
        </Button>
        <Button variant="ghost" size="sm" icon={X} disabled={application.status !== "pending"}>
          প্রত্যাখ্যান
        </Button>
      </footer>
    </Card>
  );
}

/* ----------------------------------------------------------- review queue */

export function ReviewQueueTable({
  items,
  className,
}: {
  items: ReviewItem[];
  className?: string;
}) {
  const { pick, locale } = useI18n();

  return (
    <TableShell
      className={className}
      minWidth={960}
      head={
        <>
          <Th>কনটেন্ট</Th>
          <Th>লেখক</Th>
          <Th>বিভাগ</Th>
          <Th className="text-center">শব্দ</Th>
          <Th className="text-center">রেফারেন্স</Th>
          <Th className="text-center">সতর্কতা</Th>
          <Th>জমা</Th>
          <Th>অবস্থা</Th>
          <Th className="text-right">কার্যক্রম</Th>
        </>
      }
    >
      {items.map((item) => (
        <tr key={item.id} className="transition-colors hover:bg-surface-2">
          <Td>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg",
                  item.kind === "article" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent-soft-foreground",
                )}
              >
                {item.kind === "article" ? (
                  <FileText className="size-4" aria-hidden />
                ) : (
                  <Scale className="size-4" aria-hidden />
                )}
              </span>
              <div className="min-w-0">
                <p className="max-w-72 font-medium leading-snug text-foreground">{item.titleBn}</p>
                <p className="mt-0.5 text-[0.6875rem] text-subtle-foreground">
                  {item.kind === "article" ? "প্রবন্ধ" : "ফতোয়া"}
                </p>
              </div>
            </div>
          </Td>
          <Td className="whitespace-nowrap text-muted-foreground">{item.authorNameBn}</Td>
          <Td>
            <div className="flex max-w-56 flex-wrap gap-1">
              {item.departments.slice(0, 2).map((slug) => {
                const department = getDepartment(slug);
                if (!department) return null;
                return (
                  <Chip key={slug} size="sm" tone={department.tone}>
                    {pick(department.shortName)}
                  </Chip>
                );
              })}
            </div>
          </Td>
          <Td className="text-center tabular text-muted-foreground">
            {formatNumber(item.wordCount, locale)}
          </Td>
          <Td className="text-center tabular text-muted-foreground">
            {formatNumber(item.referenceCount, locale)}
          </Td>
          <Td className="text-center">
            {item.flaggedReferences > 0 ? (
              <Badge tone="danger" size="sm" icon={Flag}>
                {formatNumber(item.flaggedReferences, locale)}
              </Badge>
            ) : (
              <Badge tone="success" size="sm" icon={Check}>
                ঠিক আছে
              </Badge>
            )}
          </Td>
          <Td className="whitespace-nowrap text-[0.75rem] text-subtle-foreground">
            {relativeTime(item.submittedAt, locale)}
          </Td>
          <Td>
            <StatusBadge
              status={item.status}
              label={
                item.status === "pending"
                  ? "অপেক্ষমাণ"
                  : item.status === "in-review"
                    ? "পর্যালোচনায়"
                    : "পরিবর্তন প্রয়োজন"
              }
            />
          </Td>
          <Td className="text-right">
            <Button variant="outline" size="xs" icon={Eye}>
              পর্যালোচনা
            </Button>
          </Td>
        </tr>
      ))}
    </TableShell>
  );
}

/* --------------------------------------------------------------- reports */

export function ReportTable({
  reports,
  className,
}: {
  reports: ContentReport[];
  className?: string;
}) {
  const { locale } = useI18n();

  return (
    <TableShell
      className={className}
      minWidth={960}
      head={
        <>
          <Th>কনটেন্ট</Th>
          <Th>ধরন</Th>
          <Th>কারণ</Th>
          <Th>রিপোর্টকারী</Th>
          <Th>সময়</Th>
          <Th className="text-center">গুরুত্ব</Th>
          <Th>দায়িত্বে</Th>
          <Th>অবস্থা</Th>
          <Th className="text-right">কার্যক্রম</Th>
        </>
      }
    >
      {reports.map((report) => (
        <tr key={report.id} className="transition-colors hover:bg-surface-2">
          <Td>
            <p className="max-w-72 font-medium leading-snug text-foreground">{report.contentTitleBn}</p>
            <p className="mt-0.5 text-[0.6875rem] text-subtle-foreground">{report.contentHref}</p>
          </Td>
          <Td>
            <Badge tone="neutral" size="sm">
              {report.contentType === "question"
                ? "প্রশ্ন"
                : report.contentType === "answer"
                  ? "উত্তর"
                  : report.contentType === "article"
                    ? "প্রবন্ধ"
                    : report.contentType === "fatwa"
                      ? "ফতোয়া"
                      : report.contentType === "discussion"
                        ? "আলোচনা"
                        : "মন্তব্য"}
            </Badge>
          </Td>
          <Td className="max-w-64 text-muted-foreground">{report.reasonLabelBn}</Td>
          <Td className="whitespace-nowrap text-muted-foreground">{report.reportedByBn}</Td>
          <Td className="whitespace-nowrap text-[0.75rem] text-subtle-foreground">
            {relativeTime(report.reportedAt, locale)}
          </Td>
          <Td className="text-center">
            <Badge
              tone={report.severity === "high" ? "danger" : report.severity === "medium" ? "warning" : "neutral"}
              size="sm"
            >
              {report.severity === "high" ? "উচ্চ" : report.severity === "medium" ? "মধ্যম" : "নিম্ন"}
            </Badge>
          </Td>
          <Td className="whitespace-nowrap text-[0.75rem] text-muted-foreground">
            {report.assignedToBn ?? "—"}
          </Td>
          <Td>
            <StatusBadge
              status={report.status}
              label={
                report.status === "pending"
                  ? "অপেক্ষমাণ"
                  : report.status === "resolved"
                    ? "নিষ্পত্তি"
                    : "খারিজ"
              }
            />
          </Td>
          <Td className="text-right">
            {report.status === "pending" ? (
              <div className="inline-flex items-center gap-1.5">
                <Button size="xs" icon={Check}>
                  নিষ্পত্তি
                </Button>
                <Button variant="ghost" size="xs" icon={ThumbsDown}>
                  খারিজ
                </Button>
              </div>
            ) : (
              <span className="text-[0.75rem] text-subtle-foreground">সম্পন্ন</span>
            )}
          </Td>
        </tr>
      ))}
    </TableShell>
  );
}

/* ----------------------------------------------------------------- users */

export function UserTable({
  users,
  selectedId,
  onSelect,
  className,
}: {
  users: AdminUserRow[];
  /** Row currently open in the inspector beside the table. */
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const { t, pick, locale } = useI18n();

  return (
    <TableShell
      className={className}
      minWidth={900}
      head={
        <>
          <Th>{t("label.name")}</Th>
          <Th>{t("label.role")}</Th>
          <Th>{t("label.district")}</Th>
          <Th className="text-center">অবদান</Th>
          <Th>{t("label.joinedOn")}</Th>
          <Th>{t("label.status")}</Th>
          <Th className="text-right">{t("action.more")}</Th>
        </>
      }
    >
      {users.map((user) => (
        <tr
          key={user.id}
          onClick={onSelect ? () => onSelect(user.id) : undefined}
          aria-selected={selectedId ? selectedId === user.id : undefined}
          className={cn(
            "transition-colors",
            selectedId === user.id
              ? "bg-primary-soft/50 hover:bg-primary-soft/70"
              : "hover:bg-surface-2",
            onSelect && "cursor-pointer",
          )}
        >
          <Td>
            <div className="flex items-center gap-3">
              <Avatar name={user.nameBn} color="#256d8c" size="sm" />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{user.nameBn}</p>
                <p className="truncate text-[0.6875rem] text-subtle-foreground">{user.email}</p>
              </div>
            </div>
          </Td>
          <Td>
            <Badge tone={ROLE_TONE[user.role]} size="sm" icon={user.role === "scholar" ? GraduationCap : UserRound}>
              {ROLE_LABEL[user.role]}
            </Badge>
          </Td>
          <Td className="whitespace-nowrap text-muted-foreground">
            {pick(findDistrict(user.district).name)}
          </Td>
          <Td className="text-center tabular text-muted-foreground">
            {formatNumber(user.contributions, locale)}
          </Td>
          <Td className="whitespace-nowrap text-[0.75rem] text-subtle-foreground">
            {relativeTime(user.joinedAt, locale)}
          </Td>
          <Td>
            <StatusBadge
              status={user.status}
              label={user.status === "active" ? "সক্রিয়" : user.status === "suspended" ? "স্থগিত" : "অপেক্ষমাণ"}
            />
          </Td>
          <Td className="text-right">
            <Button variant="ghost" size="xs" disabled={user.status === "suspended"}>
              {user.status === "suspended" ? "স্থগিত" : "স্থগিত করুন"}
            </Button>
          </Td>
        </tr>
      ))}
    </TableShell>
  );
}

/* ----------------------------------------------------------- departments */

export function DepartmentTable({
  departments,
  className,
}: {
  departments: Department[];
  className?: string;
}) {
  const { t, pick, locale } = useI18n();

  return (
    <TableShell
      className={className}
      minWidth={980}
      head={
        <>
          <Th>{t("label.department")}</Th>
          <Th>{t("admin.scholarCount")}</Th>
          <Th className="text-center">{t("label.questions")}</Th>
          <Th className="text-center">উত্তর দেওয়া</Th>
          <Th className="text-center">{t("label.articles")}</Th>
          <Th className="text-center">{t("label.fatwas")}</Th>
          <Th className="text-center">{t("label.followers")}</Th>
          <Th className="text-right">{t("action.more")}</Th>
        </>
      }
    >
      {departments.map((department) => {
        const scholars = department.scholarIds
          .map((id) => getScholar(id))
          .filter((s): s is Scholar => Boolean(s));
        const answeredRate =
          department.stats.questions > 0
            ? Math.round((department.stats.answered / department.stats.questions) * 100)
            : 0;

        return (
          <tr key={department.id} className="transition-colors hover:bg-surface-2">
            <Td>
              <div className="min-w-0">
                <p className="font-medium text-foreground">{pick(department.name)}</p>
                <p className="mt-0.5 max-w-80 truncate text-[0.6875rem] text-subtle-foreground">
                  {pick(department.description)}
                </p>
              </div>
            </Td>
            <Td>
              <div className="flex items-center gap-2.5">
                <AvatarStack
                  people={scholars.slice(0, 3).map((s) => ({ name: s.name.bn, color: s.avatarColor }))}
                  max={3}
                  size="xs"
                />
                <span className="text-[0.75rem] tabular text-muted-foreground">
                  {formatNumber(department.scholarIds.length, locale)}
                </span>
              </div>
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(department.stats.questions, locale)}
            </Td>
            <Td className="text-center">
              <Badge tone={answeredRate >= 80 ? "success" : answeredRate >= 60 ? "warning" : "danger"} size="sm">
                {formatNumber(answeredRate, locale)}%
              </Badge>
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(department.stats.articles, locale)}
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(department.stats.fatwas, locale)}
            </Td>
            <Td className="text-center tabular text-muted-foreground">
              {formatNumber(department.stats.followers, locale)}
            </Td>
            <Td className="text-right">
              <div className="inline-flex items-center gap-1.5">
                <Button variant="ghost" size="icon-sm" href={`/departments/${department.slug}`} icon={ExternalLink}>
                  {t("action.readMore")}
                </Button>
                <Button variant="outline" size="xs" icon={PenLine}>
                  {t("action.edit")}
                </Button>
              </div>
            </Td>
          </tr>
        );
      })}
    </TableShell>
  );
}



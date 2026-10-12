import type { Metadata } from "next";
import { BadgeCheck, Building2, GraduationCap, UserPlus, Users } from "@/components/icons";
import { SCHOLAR_APPLICATIONS } from "@/lib/data/admin";
import { DEPARTMENTS } from "@/lib/data/departments";
import { SCHOLARS } from "@/lib/data/scholars";
import { Digits, Pick, T } from "@/components/i18n-text";
import {
  Button,
  Callout,
  Card,
  CardHeader,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { ApplicationBoard } from "./application-board";
import { ScholarDirectory } from "./scholar-directory";

export const metadata: Metadata = { title: "আলেম ব্যবস্থাপনা" };

export default function AdminScholarsPage() {
  const verified = SCHOLARS.filter((s) => s.verified).length;
  const pending = SCHOLAR_APPLICATIONS.filter((a) => a.status === "pending").length;
  const covered = DEPARTMENTS.filter((d) => d.scholarIds.length > 0).length;
  const totalAnswers = SCHOLARS.reduce((sum, s) => sum + s.stats.answers, 0);
  const unverified = SCHOLARS.length - verified;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.scholarsTable" />}
        description={<T k="admin.scholars.intro" />}
        icon={Users}
        tone="admin"
        actions={
          <>
            <Button href="/admin/scholars/new" icon={UserPlus}>
              <T k="admin.addScholar" />
            </Button>
            <Button href="/admin/departments" variant="outline" icon={Building2}>
              <T k="admin.departmentManagement" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="admin.totalScholars" />}
          value={<Digits value={SCHOLARS.length} />}
          icon={GraduationCap}
          tone="scholar"
          hint={<T k="admin.scholars.totalAnswersHint" vars={{ count: totalAnswers }} />}
        />
        <StatTile
          label={<T k="label.verifiedScholar" />}
          value={<Digits value={verified} />}
          icon={BadgeCheck}
          tone="success"
          hint={
            unverified > 0 ? (
              <T k="admin.scholars.unverifiedHint" vars={{ count: unverified }} />
            ) : (
              <T k="admin.scholars.allVerified" />
            )
          }
        />
        <StatTile
          label={<T k="admin.pendingApplications" />}
          value={<Digits value={pending} />}
          icon={UserPlus}
          tone={pending > 0 ? "warning" : "success"}
          hint={<T k="admin.scholars.awaitingVerification" />}
        />
        <StatTile
          label={<T k="admin.scholars.deptCoverage" />}
          value={
            <>
              <Digits value={covered} />/<Digits value={DEPARTMENTS.length} />
            </>
          }
          icon={Building2}
          tone={covered === DEPARTMENTS.length ? "success" : "warning"}
          hint={
            <T
              k={
                covered === DEPARTMENTS.length
                  ? "admin.scholars.allDeptsCovered"
                  : "admin.scholars.someDeptsUncovered"
              }
            />
          }
        />
      </div>

      {unverified > 0 ? (
        <Callout
          tone="warning"
          icon={BadgeCheck}
          title={<T k="admin.scholars.pendingProfiles" />}
        >
          <T k="admin.scholars.pendingProfilesBody" vars={{ count: unverified }} />
        </Callout>
      ) : null}

      <ApplicationBoard applications={SCHOLAR_APPLICATIONS} />

      <ScholarDirectory scholars={SCHOLARS} />

      <Card>
        <CardHeader
          icon={Building2}
          tone="info"
          title={<T k="admin.scholars.byDepartment" />}
          subtitle={<T k="admin.scholars.byDepartmentHelp" />}
        />
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {DEPARTMENTS.map((department) => {
            const names = department.scholarIds
              .map((id) => SCHOLARS.find((s) => s.id === id)?.name.bn)
              .filter((n): n is string => Boolean(n));
            return (
              <li
                key={department.slug}
                className="rounded-card border border-border bg-surface-2 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[0.8125rem] font-semibold leading-snug text-foreground">
                    <Pick value={department.name} />
                  </p>
                  <span className="shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular text-muted-foreground">
                    <T k="admin.scholars.deptScholarCount" vars={{ count: department.scholarIds.length }} />
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-[0.6875rem] leading-relaxed text-subtle-foreground">
                  {names.length > 0 ? names.join("، ") : <T k="admin.scholars.noScholars" />}
                </p>
                <p className="mt-2 text-[0.6875rem] tabular text-muted-foreground">
                  <T
                    k="admin.scholars.deptStats"
                    vars={{ questions: department.stats.questions, answers: department.stats.answered }}
                  />
                </p>
              </li>
            );
          })}
        </ul>
      </Card>

      <SectionHeader
        size="sm"
        icon={Users}
        title={<T k="admin.scholars.policyTitle" />}
        description={<T k="admin.scholars.policyIntro" />}
      />
      <Card>
        <ul className="space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.scholars.policy1" />
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.scholars.policy2" />
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.scholars.policy3" />
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <T k="admin.scholars.policy4" />
          </li>
        </ul>
      </Card>
    </div>
  );
}

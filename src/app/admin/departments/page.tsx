import type { Metadata } from "next";
import { AlertTriangle, Building2, Layers, MessageCircleQuestion, Users } from "@/components/icons";
import { DEPARTMENTS } from "@/lib/data/departments";
// Direct module import: the layout barrel re-exports client components, so a
// server page should reach for the plain-data module instead.
import { SIDEBAR_GROUPS } from "@/components/layout/nav-config";
import { Digits, Pick, T } from "@/components/i18n-text";
import {
  Callout,
  Card,
  CardHeader,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { DepartmentManager } from "./department-manager";

export const metadata: Metadata = { title: "বিভাগ ব্যবস্থাপনা" };

export default function AdminDepartmentsPage() {
  const assignedScholars = new Set(DEPARTMENTS.flatMap((d) => d.scholarIds)).size;
  const totalQuestions = DEPARTMENTS.reduce((sum, d) => sum + d.stats.questions, 0);
  const totalAnswered = DEPARTMENTS.reduce((sum, d) => sum + d.stats.answered, 0);
  const unanswered = Math.max(0, totalQuestions - totalAnswered);
  const emptyDepartments = DEPARTMENTS.filter((d) => d.scholarIds.length === 0).length;
  const answerRate = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  /* Routing is only as good as the department taxonomy underneath it. */
  const topByDemand = [...DEPARTMENTS]
    .sort((a, b) => b.stats.questions - a.stats.questions)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.departmentManagement" />}
        description={<T k="admin.departments.description" />}
        icon={Building2}
        tone="admin"
        patterned
        breadcrumbs={[
          { label: <T k="admin.home.breadcrumbRoot" />, href: "/admin" },
          { label: <T k="nav.departments" /> },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={<T k="admin.departments.total" />}
          value={<Digits value={DEPARTMENTS.length} />}
          icon={Layers}
          tone="primary"
          hint={
            <T
              k="admin.departments.trendingHint"
              vars={{ count: DEPARTMENTS.filter((d) => d.trending).length }}
            />
          }
        />
        <StatTile
          label={<T k="admin.departments.assignedScholars" />}
          value={<Digits value={assignedScholars} />}
          icon={Users}
          tone="scholar"
          hint={<T k="admin.departments.assignedScholarsHint" />}
        />
        <StatTile
          label={<T k="admin.departments.totalQuestions" />}
          value={<Digits value={totalQuestions} />}
          icon={MessageCircleQuestion}
          tone="info"
          hint={<T k="admin.departments.answerRate" vars={{ percent: answerRate }} />}
        />
        <StatTile
          label={<T k="admin.departments.unanswered" />}
          value={<Digits value={unanswered} />}
          icon={AlertTriangle}
          tone={unanswered > 0 ? "warning" : "success"}
          hint={<T k="admin.departments.emptyHint" vars={{ count: emptyDepartments }} />}
        />
      </div>

      {emptyDepartments > 0 ? (
        <Callout
          tone="warning"
          icon={AlertTriangle}
          title={<T k="admin.departments.emptyTitle" />}
        >
          <T k="admin.departments.emptyCallout" vars={{ count: emptyDepartments }} />
        </Callout>
      ) : null}

      <DepartmentManager departments={DEPARTMENTS} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            size="sm"
            icon={MessageCircleQuestion}
            title={<T k="admin.departments.topByDemand" />}
            description={<T k="admin.departments.topByDemandHelp" />}
          />
          <ul className="space-y-2.5">
            {topByDemand.map((department, index) => (
              <li key={department.slug} className="flex items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-[0.75rem] font-semibold tabular text-muted-foreground">
                  <Digits value={index + 1} />
                </span>
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-foreground">
                  <Pick value={department.name} />
                </span>
                <span className="shrink-0 text-[0.75rem] tabular text-muted-foreground">
                  <Digits value={department.stats.questions} />
                </span>
                <span className="w-16 shrink-0 text-right text-[0.6875rem] tabular text-subtle-foreground">
                  <T k="admin.departments.scholarCount" vars={{ count: department.scholarIds.length }} />
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            icon={Layers}
            tone="info"
            title={<T k="admin.departments.howRoutingUses" />}
            subtitle={<T k="admin.departments.stepsHelp" />}
          />
          <ol className="mt-4 space-y-3">
            {[
              "admin.departments.stepOne",
              "admin.departments.stepTwo",
              "admin.departments.stepThree",
              "admin.departments.stepFour",
              "admin.departments.stepFive",
            ].map((stepKey, index) => (
              <li key={stepKey} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[0.6875rem] font-semibold text-primary">
                  <Digits value={index + 1} />
                </span>
                <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                  <T k={stepKey} />
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <SectionHeader
        size="sm"
        icon={Building2}
        title={<T k="admin.departments.bothConsoles" />}
        description={<T k="admin.departments.bothConsolesHelp" />}
      />
      <Card>
        <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
          <T k="admin.departments.usedEverywhere" />
        </p>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {SIDEBAR_GROUPS.flatMap((group) => group.links)
            .slice(0, 6)
            .map((link) => (
              <span
                key={`${link.href}-${link.label.en}`}
                className="rounded-full bg-surface-3 px-2.5 py-1 text-[0.6875rem] text-muted-foreground"
              >
                <Pick value={link.label} />
              </span>
            ))}
        </div>
      </Card>
    </div>
  );
}

import type { Metadata } from "next";
import { Flag, ShieldAlert } from "@/components/icons";
import { REPORTS } from "@/lib/data/admin";
import { Digits, T } from "@/components/i18n-text";
import { Callout, Card, CardHeader, PageHeader, SectionHeader } from "@/components/ui";
import { ReportBoard } from "./report-board";

export const metadata: Metadata = { title: "মডারেশন রিপোর্ট" };

/* Keys rather than wording: this array is module scope, and the page is a
 * server component, so the copy is resolved by the <T> bridge where it renders. */
const POLICY = [
  {
    id: "misinformation",
    titleKey: "admin.queue.reasonMisinformation",
    bodyKey: "admin.queue.policy1Body",
  },
  {
    id: "sectarian",
    titleKey: "admin.queue.reasonSectarian",
    bodyKey: "admin.queue.policy2Body",
  },
  { id: "abuse", titleKey: "admin.queue.policy3Title", bodyKey: "admin.queue.policy3Body" },
  { id: "adab", titleKey: "admin.queue.policy4Title", bodyKey: "admin.queue.policy4Body" },
];

export default function AdminReportsPage() {
  const pending = REPORTS.filter((r) => r.status === "pending").length;
  const high = REPORTS.filter((r) => r.severity === "high").length;
  const unassigned = REPORTS.filter((r) => r.status === "pending" && !r.assignedToBn).length;
  const byReason = REPORTS.reduce<Record<string, number>>((acc, report) => {
    acc[report.reason] = (acc[report.reason] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="admin.title" />}
        title={<T k="admin.reportsQueue" />}
        description={<T k="admin.queue.reportsIntro" />}
        icon={Flag}
        tone="admin"
        patterned
        breadcrumbs={[
          { label: <T k="admin.queue.crumbAdmin" />, href: "/admin" },
          { label: <T k="admin.queue.crumbReports" /> },
        ]}
      />

      {unassigned > 0 ? (
        <Callout
          tone="warning"
          icon={ShieldAlert}
          title={<T k="admin.queue.unassignedTitle" />}
        >
          <T k="admin.queue.unassignedBody" vars={{ count: unassigned }} />
        </Callout>
      ) : null}

      <ReportBoard reports={REPORTS} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={Flag}
            tone="info"
            title={<T k="admin.queue.byReason" />}
            subtitle={<T k="admin.queue.byReasonHelp" />}
          />
          <ul className="mt-4 space-y-2.5">
            {Object.entries(byReason).map(([reason, count]) => (
              <li key={reason} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-foreground">
                  {
                    {
                      misinformation: <T k="admin.queue.reasonMisinformation" />,
                      sectarian: <T k="admin.queue.reasonSectarian" />,
                      abuse: <T k="admin.queue.reasonAbuse" />,
                      spam: <T k="admin.queue.reasonSpam" />,
                      "off-topic": <T k="admin.queue.reasonOffTopic" />,
                      copyright: <T k="admin.queue.reasonCopyright" />,
                    }[reason] ?? reason
                  }
                </span>
                <span className="shrink-0 text-[0.75rem] font-semibold tabular text-muted-foreground">
                  <Digits value={count} />
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-[0.6875rem] text-subtle-foreground">
            <T
              k="admin.queue.reportTotals"
              vars={{ total: REPORTS.length, pending, high }}
            />
          </p>
        </Card>

        <Card>
          <CardHeader
            icon={ShieldAlert}
            tone="warning"
            title={<T k="admin.queue.policy" />}
            subtitle={<T k="admin.queue.policyHelp" />}
          />
          <ul className="mt-4 space-y-3">
            {POLICY.map((item) => (
              <li key={item.id}>
                <p className="text-[0.8125rem] font-semibold text-foreground">
                  <T k={item.titleKey} />
                </p>
                <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                  <T k={item.bodyKey} />
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <SectionHeader
        size="sm"
        icon={ShieldAlert}
        title={<T k="admin.queue.moderatorTools" />}
        description={<T k="admin.queue.moderatorToolsHelp" />}
      />
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              id: "hide",
              titleKey: "admin.queue.toolHideTitle",
              bodyKey: "admin.queue.toolHideBody",
            },
            {
              id: "lock",
              titleKey: "admin.queue.toolLockTitle",
              bodyKey: "admin.queue.toolLockBody",
            },
            {
              id: "changes",
              titleKey: "admin.queue.toolChangesTitle",
              bodyKey: "admin.queue.toolChangesBody",
            },
            {
              id: "suspend",
              titleKey: "admin.queue.toolSuspendTitle",
              bodyKey: "admin.queue.toolSuspendBody",
            },
          ].map((item) => (
            <div key={item.id} className="rounded-card border border-border bg-surface-2 p-4">
              <p className="text-[0.875rem] font-semibold text-foreground">
                <T k={item.titleKey} />
              </p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-muted-foreground">
                <T k={item.bodyKey} />
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

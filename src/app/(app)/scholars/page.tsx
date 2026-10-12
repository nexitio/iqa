import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  GraduationCap,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  Users,
  Zap,
} from "@/components/icons";
import { fetchDepartments, fetchDistricts, fetchScholars, MAX_LIMIT } from "@/lib/content-api";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  EmptyState,
  ErrorState,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { ScholarRow, departmentIcon } from "@/components/people";
import { Digits, Num, T, Pick } from "@/components/i18n-text";
import { ScholarDirectory } from "./scholar-directory";

export const metadata: Metadata = {
  title: "আলেম ও মুফতি",
  description:
    "যোগ্যতা, বিভাগ ও অবদান যাচাই করে তৈরি আলেমদের প্রোফাইল। বিশেষজ্ঞতা অনুযায়ী আলেম খুঁজুন এবং সরাসরি প্রশ্ন করুন।",
};

/**
 * The scholar directory.
 *
 * The profiles, the two contribution rails, the department chips and the totals
 * under the header all come from the API now — the directory that used to be
 * rendered from the bundled dataset could only ever show the fixture, so a
 * scholar who joined last week could not be found at all. The page shell renders
 * before its reads finish (the route has a `loading.tsx`), a read that fails shows
 * an error state with a way back, and a directory that comes back empty says so
 * rather than showing a filter bar over nothing.
 *
 * One deliberate departure from what this page did over the fixtures: the
 * "আপনার জন্য আলেম" rail was built from `CURRENT_USER.interests`, and these reads
 * are anonymous — public content cached for everyone, with no reader identity to
 * personalise with. Rather than guess at a stranger's interests, the rail is gone;
 * the same reasoning removed the article archive's draft rail.
 */
export default async function ScholarsPage() {
  const [scholarsResult, verifiedResult, departmentsResult, districtsResult] = await Promise.all([
    fetchScholars({ limit: MAX_LIMIT }),
    // Asked for as a count, not tallied from the list: the directory may be longer
    // than one page, and a tile that counted only what happened to fit would be a
    // number no reader could check.
    fetchScholars({ verified: true, limit: 1 }),
    fetchDepartments(),
    fetchDistricts(),
  ]);

  if (!scholarsResult.ok) {
    return (
      <div className="space-y-6">
        <Header />
        <ErrorState
          title="আলেমদের তালিকা আনা যায়নি"
          description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি, তাই প্রোফাইলগুলো এখন দেখানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন — সমস্যা থেকে গেলে প্রশাসনকে জানান।"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button href="/scholars" size="sm">
                আবার চেষ্টা করুন
              </Button>
              <Button href="/" variant="outline" size="sm">
                হোমে ফিরে যান
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  // A failed side read costs one rail, not the page.
  const scholars = scholarsResult.data.items;
  const departments = departmentsResult.ok ? departmentsResult.data : [];
  const districts = districtsResult.ok ? districtsResult.data : [];

  const verified = verifiedResult.ok
    ? verifiedResult.data.total
    : scholars.filter((scholar) => scholar.verified).length;
  const totalAnswers = scholars.reduce((sum, scholar) => sum + scholar.stats.answers, 0);
  const totalFatwas = scholars.reduce((sum, scholar) => sum + scholar.stats.fatwas, 0);

  // Sorted here, not taken from the top of the directory: the API orders scholars
  // verified-first and then by response time, and a section headed "দ্রুত
  // উত্তরদাতা" cannot let a verified slow responder precede a fast one.
  const quickResponders = [...scholars]
    .sort((a, b) => a.responseTimeHours - b.responseTimeHours)
    .slice(0, 5);
  const topContributors = [...scholars]
    .sort((a, b) => b.stats.answers - a.stats.answers)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <Header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={<T k="label.total" />}
            value={<Num value={scholarsResult.data.total} />}
            hint="সক্রিয় আলেম ও মুফতি"
            icon={Users}
            tone="primary"
          />
          <StatTile
            label={<T k="label.verifiedScholar" />}
            value={<Num value={verified} />}
            hint="যোগ্যতা যাচাই করা হয়েছে"
            icon={BadgeCheck}
            tone="success"
          />
          <StatTile
            label={<T k="label.answers" />}
            value={<Num value={totalAnswers} />}
            hint="মোট প্রদত্ত উত্তর"
            icon={MessageCircleQuestion}
            tone="info"
          />
          <StatTile
            label={<T k="label.fatwas" />}
            value={<Num value={totalFatwas} />}
            hint="প্রকাশিত ফতোয়া"
            icon={Scale}
            tone="accent"
          />
        </div>
      </Header>

      {scholars.length === 0 ? (
        <EmptyState
          icon={Users}
          title="এখনো কোনো আলেমের প্রোফাইল যুক্ত হয়নি"
          description="যোগ্যতা যাচাই শেষ হলে আলেমদের প্রোফাইল এখানে দেখা যাবে। ততক্ষণ প্রশ্ন করলে সংশ্লিষ্ট বিভাগের আলেমদের কাছে পৌঁছে যাবে।"
          action={
            <Button href="/questions/ask" icon={MessageCircleQuestion}>
              <T k="action.askScholar" />
            </Button>
          }
        />
      ) : (
        <ScholarDirectory scholars={scholars} departments={departments} districts={districts} />
      )}

      {/* Both columns take `min-w-0`. A grid item defaults to `min-width: auto`,
          which is its min-content width — and the rail's longest unbreakable line
          (a scholar row's availability badge) is wider than a phone column, so the
          track sized itself to 370px inside a 347px page and the whole page
          scrolled sideways. The columns are what must give way, not the page. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Fastest responders */}
        <section className="min-w-0">
          <SectionHeader
            title="দ্রুত উত্তরদাতা আলেম"
            description="যাঁদের কাছে প্রশ্ন এলে সবচেয়ে দ্রুত উত্তর পাওয়ার সম্ভাবনা"
            icon={Zap}
            tone="accent"
          />
          <Card padding="none" className="divide-y divide-border">
            {quickResponders.map((scholar) => (
              <div key={scholar.id} className="px-4">
                <ScholarRow scholar={scholar} />
              </div>
            ))}
          </Card>
          <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
            জরুরি প্রশ্নে সংশ্লিষ্ট বিভাগের আলেমদের অগ্রাধিকার দেওয়া হয়, তাই সবচেয়ে
            যোগ্য আলেমই প্রথমে দেখতে পান।
          </p>
        </section>

        {/* Rail */}
        <aside className="min-w-0 space-y-4">
          <Card>
            <CardHeader
              title={<T k="scholars.knowledgeContributions" />}
              subtitle="সর্বোচ্চ উত্তরদাতা"
              icon={Sparkles}
            />
            <div className="mt-3 divide-y divide-border">
              {topContributors.map((scholar, index) => (
                <ScholarRow key={scholar.id} scholar={scholar} rank={index + 1} />
              ))}
            </div>
          </Card>

          <Card variant="parchment">
            <CardHeader
              title={<T k="label.departments" />}
              subtitle="বিভাগ অনুযায়ী আলেম খুঁজুন"
              icon={GraduationCap}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {departments.map((department) => (
                <Chip
                  key={department.id}
                  href={`/departments/${department.slug}`}
                  tone={department.tone}
                  icon={departmentIcon(department.icon)}
                  count={<Digits value={department.scholarIds.length} />}
                >
                  <Pick value={department.shortName} />
                </Chip>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/**
 * The page's own head, so the failure branch can still show it.
 *
 * The tiles that belong to the header are passed as children: they need the totals
 * the page has not read yet, and the error branch has none of them.
 */
function Header({ children }: { children?: ReactNode }) {
  return (
    <PageHeader
      eyebrow={<T k="nav.scholars" />}
      title={<T k="scholars.title" />}
      description={<T k="scholars.subtitle" />}
      icon={Users}
      patterned
      actions={
        <>
          <Button href="/questions/ask" icon={MessageCircleQuestion}>
            <T k="action.askScholar" />
          </Button>
          <Button href="/topics" variant="outline">
            <T k="nav.topics" />
          </Button>
        </>
      }
    >
      {children}
    </PageHeader>
  );
}

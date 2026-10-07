import type { Metadata } from "next";
import {
  BadgeCheck,
  GraduationCap,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  Users,
  Zap,
} from "@/components/icons";
import { SCHOLARS, getScholarsByDepartment } from "@/lib/data/scholars";
import { CURRENT_USER } from "@/lib/data/personal";
import { DEPARTMENTS } from "@/lib/data/departments";
import { formatNumber } from "@/lib/bn";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { ScholarRow, departmentIcon } from "@/components/people";
import { T, Pick } from "@/components/i18n-text";
import { ScholarDirectory } from "./scholar-directory";

export const metadata: Metadata = {
  title: "আলেম ও মুফতি",
  description:
    "যোগ্যতা, বিভাগ ও অবদান যাচাই করে তৈরি আলেমদের প্রোফাইল। বিশেষজ্ঞতা অনুযায়ী আলেম খুঁজুন এবং সরাসরি প্রশ্ন করুন।",
};

export default function ScholarsPage() {
  const verified = SCHOLARS.filter((s) => s.verified).length;
  const totalAnswers = SCHOLARS.reduce((sum, s) => sum + s.stats.answers, 0);
  const totalFatwas = SCHOLARS.reduce((sum, s) => sum + s.stats.fatwas, 0);

  // Fastest first-response times — the single most useful signal when someone
  // needs an answer today.
  const quickResponders = [...SCHOLARS]
    .sort((a, b) => a.responseTimeHours - b.responseTimeHours)
    .slice(0, 5);

  const topContributors = [...SCHOLARS]
    .sort((a, b) => b.stats.answers - a.stats.answers)
    .slice(0, 5);

  /**
   * Scholars from the departments this reader said they care about, minus the
   * ones they already follow.
   *
   * This block used to sit at the bottom of the home feed, where it competed
   * with the feed for attention and duplicated a page that already lists every
   * scholar. Following someone is a decision made *here*, so the personalised
   * shortlist belongs beside the directory that makes it actionable.
   */
  const suggestions = (() => {
    const followed = new Set(CURRENT_USER.followingScholarIds);
    const seen = new Set<string>();
    const out: typeof SCHOLARS = [];
    for (const slug of CURRENT_USER.interests) {
      for (const scholar of getScholarsByDepartment(slug)) {
        if (followed.has(scholar.id) || seen.has(scholar.id)) continue;
        seen.add(scholar.id);
        out.push(scholar);
      }
    }
    return out.slice(0, 4);
  })();

  return (
    <div className="space-y-6">
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label={<T k="label.total" />}
            value={formatNumber(SCHOLARS.length, "bn")}
            hint="সক্রিয় আলেম ও মুফতি"
            icon={Users}
            tone="primary"
          />
          <StatTile
            label={<T k="label.verifiedScholar" />}
            value={formatNumber(verified, "bn")}
            hint="যোগ্যতা যাচাই করা হয়েছে"
            icon={BadgeCheck}
            tone="success"
          />
          <StatTile
            label={<T k="label.answers" />}
            value={formatNumber(totalAnswers, "bn")}
            hint="মোট প্রদত্ত উত্তর"
            icon={MessageCircleQuestion}
            tone="info"
          />
          <StatTile
            label={<T k="label.fatwas" />}
            value={formatNumber(totalFatwas, "bn")}
            hint="প্রকাশিত ফতোয়া"
            icon={Scale}
            tone="accent"
          />
        </div>
      </PageHeader>

      <ScholarDirectory />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Fastest responders */}
        <section>
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
        <aside className="space-y-4">
          {suggestions.length > 0 ? (
            <Card>
              <CardHeader
                title="আপনার জন্য আলেম"
                subtitle="আপনার আগ্রহের বিষয়ে যারা লেখেন ও উত্তর দেন"
                icon={Users}
              />
              <div className="mt-3 divide-y divide-border">
                {suggestions.map((scholar) => (
                  <ScholarRow key={scholar.id} scholar={scholar} />
                ))}
              </div>
            </Card>
          ) : null}

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
              {DEPARTMENTS.map((department) => (
                <Chip
                  key={department.id}
                  href={`/departments/${department.slug}`}
                  tone={department.tone}
                  icon={departmentIcon(department.icon)}
                  count={department.scholarIds.length}
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

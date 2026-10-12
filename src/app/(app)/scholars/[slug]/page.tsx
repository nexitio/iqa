import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  GraduationCap,
  ScrollText,
  Languages,
  MapPin,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  Star,
  Users,
} from "@/components/icons";
import type { Department } from "@/lib/types";
import {
  fetchDepartments,
  fetchDistricts,
  fetchScholar,
  fetchScholars,
} from "@/lib/content-api";

import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
  ErrorState,
  FactList,
  PageHeader,
  SectionHeader,
  TabLinks,
  VerifiedMark,
} from "@/components/ui";
import {
  AvailabilityBadge,
  CredentialList,
  ScholarCard,
  ScholarStatBar,
  departmentIcon,
} from "@/components/people";
import { Digits, GregDate, Num, T, Pick } from "@/components/i18n-text";
import { FollowButton } from "../follow-button";
import { BioProse, ProfileSections, ScholarBiographySection } from "./profile-sections";

const FIQH_LABELS: Record<string, string> = {
  hanafi: "হানাফী মাযহাব",
  general: "সাধারণ ফিকহ",
  usul: "উসুলুল ফিকহ",
  comparative: "তুলনামূলক ফিকহ",
};

const TABS = ["articles", "fatwas", "answers"] as const;
type Tab = (typeof TABS)[number];

/**
 * One scholar, read from the API.
 *
 * The profile, the long-form biography, the credentials, the authored work behind
 * the tabs and every rail beside them come from the API now — the page used to
 * draw all of it from the bundled dataset, so a scholar who joined last week had
 * no page at all. A slug the API does not know is a 404 and gets `notFound()`,
 * because it will never exist; anything else — the service down, a query that
 * timed out — gets an error state with a way to try again, because the profile
 * does exist and saying otherwise would be a lie.
 *
 * `generateStaticParams` is gone with it: the API's rows are not enumerable at
 * build time, and a profile page that pre-rendered a fixture list would have had
 * to be rebuilt to publish a scholar.
 */

/**
 * One read per request, shared by the metadata and the page.
 *
 * Both need the same profile, and Next renders them as separate passes, so a bare
 * fetch in each is two requests to the API for one page. On the missing-slug path
 * that is worse than wasteful: two 404s arriving together leave the metadata pass
 * in flight when the page throws `notFound()`, and a boundary that has already
 * flushed cannot be replaced — the reader gets the 404 UI and a stream that never
 * closes. `cache` collapses the two reads into one.
 */
const readScholar = cache(async (slug: string) => {
  const result = await fetchScholar(slug);
  // A slug the API does not know will never exist, so the answer is the not-found
  // boundary rather than an error state. Deciding it here, in the one read both
  // passes await, is what keeps the metadata pass and the page from disagreeing
  // about a profile that is simply not there.
  if (!result.ok && result.status === 404) notFound();
  return result;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await readScholar(slug);
  if (!result.ok) return { title: "আলেম" };

  const { scholar } = result.data;
  return {
    title: `${scholar.honorific.bn} ${scholar.name.bn}`,
    description: scholar.shortBio.bn,
  };
}

export default async function ScholarProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;

  const result = await readScholar(slug);
  if (!result.ok) {
    return (
      <ErrorState
        title="প্রোফাইলটি আনা যায়নি"
        description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি, তাই এই আলেমের প্রোফাইল এখন দেখানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।"
        action={
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button href={`/scholars/${encodeURIComponent(slug)}`} size="sm">
              আবার চেষ্টা করুন
            </Button>
            <Button href="/scholars" variant="outline" size="sm">
              সব আলেম দেখুন
            </Button>
          </div>
        }
      />
    );
  }

  const { scholar, biography, articles, fatwas, answers } = result.data;
  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "articles";

  const [departmentsResult, districtsResult, colleaguesResult, othersResult] =
    await Promise.all([
      fetchDepartments(),
      fetchDistricts(),
      // The scholar's own department, for a rail that is actually related: the
      // scholars a reader would ask instead.
      fetchScholars({ department: scholar.primaryDepartmentId, limit: 4 }),
      // The fallback, so a scholar whose department read comes back empty still
      // has a rail rather than a hole in the column.
      fetchScholars({ limit: 5 }),
    ]);

  const departments = departmentsResult.ok ? departmentsResult.data : [];
  const district = (districtsResult.ok ? districtsResult.data : []).find(
    (item) => item.id === scholar.district,
  );

  const scholarDepartments = scholar.departmentIds
    .map((id) => departmentOf(departments, id))
    .filter((d): d is Department => Boolean(d));
  const primary = departmentOf(departments, scholar.primaryDepartmentId);

  const colleaguePool =
    colleaguesResult.ok && colleaguesResult.data.items.length > 0
      ? colleaguesResult.data.items
      : othersResult.ok
        ? othersResult.data.items
        : [];
  const colleagues = colleaguePool.filter((other) => other.id !== scholar.id).slice(0, 2);

  const tabItems = [
    {
      id: "articles",
      label: "প্রবন্ধ",
      href: `/scholars/${scholar.slug}?tab=articles`,
      icon: FileText,
      count: <Digits value={articles.length} />,
    },
    {
      id: "fatwas",
      label: "ফতোয়া",
      href: `/scholars/${scholar.slug}?tab=fatwas`,
      icon: Scale,
      count: <Digits value={fatwas.length} />,
    },
    {
      id: "answers",
      label: "উত্তর",
      href: `/scholars/${scholar.slug}?tab=answers`,
      icon: MessageCircleQuestion,
      count: <Digits value={answers.length} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---------------- profile header ---------------- */}
      <PageHeader
        breadcrumbs={[
          { label: <T k="nav.home" />, href: "/" },
          { label: <T k="nav.scholars" />, href: "/scholars" },
          { label: `${scholar.honorific.bn} ${scholar.name.bn}` },
        ]}
        eyebrow={
          primary ? `${primary.shortName.bn} বিভাগ` : <T k="label.verifiedScholar" />
        }
        title={
          <span className="flex flex-wrap items-center gap-2.5">
            {scholar.honorific.bn} {scholar.name.bn}
            {scholar.verified ? <VerifiedMark label="যাচাইকৃত" /> : null}
          </span>
        }
        description={scholar.shortBio.bn}
        icon={GraduationCap}
        tone="scholar"
        patterned
        actions={
          <>
            <FollowButton scholarId={scholar.id} />
            <Button href="/questions/ask" variant="outline" icon={MessageCircleQuestion}>
              <T k="action.askScholar" />
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <AvailabilityBadge
            available={scholar.availableForQuestions}
            responseTimeHours={scholar.responseTimeHours}
          />
          <Badge tone="accent" size="sm">
            <Star className="size-3.5" aria-hidden />
            {scholar.rating.toFixed(1)}
          </Badge>
          <Badge tone="info" size="sm" icon={Building2}>
            <Pick value={scholar.madrasah} />
          </Badge>
          <Badge tone="neutral" size="sm" icon={MapPin}>
            <Pick value={district?.name} fallback={scholar.district} />
          </Badge>
          <Badge tone="neutral" size="sm" icon={CalendarDays}>
            <GregDate day={new Date(scholar.joinedAt)} />
          </Badge>
        </div>

        <ScholarStatBar scholar={scholar} className="mt-4 max-w-2xl" />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ---------------- main column ---------------- */}
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader
              title="পরিচিতি"
              subtitle="শিক্ষা, অভিজ্ঞতা ও অবদান"
              icon={Sparkles}
            />
            <div className="mt-4">
              <BioProse bio={scholar.bio} />
            </div>

            {/* Specialisation */}
            <div className="mt-6">
              <p className="mb-2.5 text-[0.75rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                <T k="label.expertise" />
              </p>
              <div className="flex flex-wrap gap-1.5">
                {scholar.specialization.map((item) => (
                  <Chip key={item.en} tone="primary" size="sm">
                    <Pick value={item} />
                  </Chip>
                ))}
              </div>
            </div>

            {/* Departments */}
            <div className="mt-6">
              <p className="mb-2.5 text-[0.75rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                <T k="label.departments" />
              </p>
              <div className="flex flex-wrap gap-1.5">
                {scholarDepartments.map((department) => (
                  <Chip
                    key={department.id}
                    href={`/departments/${department.slug}`}
                    tone={department.tone}
                    icon={departmentIcon(department.icon)}
                    size="md"
                  >
                    <Pick value={department.shortName} />
                  </Chip>
                ))}
              </div>
            </div>
          </Card>

          {/* The full biography, when the archive holds one. It follows the short
              bio rather than replacing it: the card above is the summary a reader
              skims, this is the record they come back to. */}
          {biography ? <ScholarBiographySection biography={biography} /> : null}

          {/* Credentials */}
          <Card>
            <CredentialList credentials={scholar.credentials} />
            {scholar.credentials.length === 0 ? (
              <p className="text-[0.8125rem] text-muted-foreground">
                যোগ্যতার তথ্য এখনো যুক্ত হয়নি।
              </p>
            ) : null}
          </Card>

          {/* Authored work, driven by ?tab= */}
          <section>
            <SectionHeader
              title="জ্ঞানের অবদান"
              description="প্রবন্ধ, ফতোয়া ও উত্তর — সব এক জায়গায়"
              icon={BookOpen}
              tone="primary"
            />
            <TabLinks items={tabItems} active={tab} variant="pill" />
            <div className="mt-5">
              <ProfileSections
                tab={tab}
                articles={articles}
                fatwas={fatwas}
                answers={answers}
              />
            </div>
          </section>
        </div>

        {/* ---------------- rail ---------------- */}
        {/* `min-w-0` on purpose: a grid item is `min-width: auto` by default, so
            the rail's longest unbreakable line (the availability badge inside a
            compact scholar card) sized the track itself — 410px on a 390px
            screen, which pushed the whole page sideways rather than ever
            wrapping. */}
        <aside className="min-w-0 space-y-4">
          <Card variant="parchment">
            <CardHeader
              title={<T k="label.responseTime" />}
              subtitle="প্রশ্ন পাঠানোর আগে জেনে নিন"
              icon={Clock}
            />
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tabular text-foreground">
                <Num value={scholar.responseTimeHours} />
              </span>
              <span className="text-[0.8125rem] text-muted-foreground">
                <T k="console.hours" /> — সাধারণত
              </span>
            </div>
            <Button href="/questions/ask" icon={MessageCircleQuestion} full className="mt-4">
              <T k="action.askScholar" />
            </Button>
          </Card>

          <Card>
            <CardHeader
              title="বিস্তারিত তথ্য"
              icon={Users}
            />
            <div className="mt-4">
              <FactList
                columns={1}
                items={[
                  ...(biography
                    ? [
                        {
                          label: <T k="label.biography" />,
                          value: (
                            <Link
                              href="#biography"
                              className="text-primary transition-colors hover:text-primary-hover"
                            >
                              পূর্ণ জীবনী পড়ুন
                            </Link>
                          ),
                          icon: ScrollText,
                        },
                      ]
                    : []),
                  {
                    label: <T k="label.madrasah" />,
                    value: <Pick value={scholar.madrasah} />,
                    icon: Building2,
                  },
                  {
                    label: <T k="label.district" />,
                    value: <Pick value={district?.name} fallback={scholar.district} />,
                    icon: MapPin,
                  },
                  {
                    label: <T k="label.languages" />,
                    value: scholar.languages.join(", "),
                    icon: Languages,
                  },
                  {
                    label: <T k="label.fiqh" />,
                    value: scholar.fiqhFocus
                      .map((f) => FIQH_LABELS[f] ?? f)
                      .join(", "),
                    icon: Scale,
                  },
                ]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="সহায়কতার হার"
              subtitle="জিজ্ঞাসাকারীর মূল্যায়ন"
              icon={Star}
            />
            <div className="mt-4 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.8125rem] text-muted-foreground">
                  <T k="label.helpful" />
                </span>
                <span className="font-display text-lg font-bold tabular text-foreground">
                  <Num value={scholar.stats.helpfulVotes} />
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.8125rem] text-muted-foreground">
                  <T k="label.followers" />
                </span>
                <span className="font-display text-lg font-bold tabular text-foreground">
                  <Num value={scholar.stats.followers} />
                </span>
              </div>
            </div>
          </Card>

          {scholar.verified ? (
            <Callout tone="success" title="যোগ্যতা যাচাই করা হয়েছে">
              এই আলেমের সনদ, প্রতিষ্ঠান ও বিভাগ ইলমের সম্পাদনা পর্ষদ যাচাই করেছে।
              কোনো তথ্য ভুল মনে হলে জানান।
            </Callout>
          ) : (
            <Callout tone="warning" title="যাচাই প্রক্রিয়াধীন">
              এই প্রোফাইলের যোগ্যতা এখনো সম্পূর্ণ যাচাই করা হয়নি। উত্তরগুলো পড়ার সময়
              বিষয়টি মনে রাখুন।
            </Callout>
          )}

          {colleagues.length > 0 ? (
            <div>
              <SectionHeader
                title={<T k="home.recommendedScholars" />}
                size="sm"
                icon={GraduationCap}
                href="/scholars"
              />
              <div className="space-y-3">
                {colleagues.map((other) => (
                  <ScholarCard key={other.id} scholar={other} layout="compact" />
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href="/topics"
            className="block text-center text-[0.8125rem] text-muted-foreground transition-colors hover:text-primary"
          >
            <T k="nav.topics" /> →
          </Link>
        </aside>
      </div>
    </div>
  );
}

/** A department by id or slug — the two keys a scholar may be tagged with. */
function departmentOf(departments: Department[], key: string): Department | undefined {
  return departments.find(
    (department) => department.id === key || department.slug === key,
  );
}

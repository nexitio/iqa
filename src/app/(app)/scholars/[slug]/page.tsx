import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  GraduationCap,
  Languages,
  MapPin,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  Star,
  Users,
} from "@/components/icons";
import { SCHOLARS, getScholarBySlug } from "@/lib/data/scholars";
import { getDepartment } from "@/lib/data/departments";
import { findDistrict, formatNumber, gregorianDateBn } from "@/lib/bn";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  Chip,
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
import { T, Pick } from "@/components/i18n-text";
import { FollowButton } from "../follow-button";
import { BioProse, ProfileSections } from "./profile-sections";

const FIQH_LABELS: Record<string, string> = {
  hanafi: "হানাফী মাযহাব",
  general: "সাধারণ ফিকহ",
  usul: "উসুলুল ফিকহ",
  comparative: "তুলনামূলক ফিকহ",
};

const TABS = ["articles", "fatwas", "answers"] as const;
type Tab = (typeof TABS)[number];

export function generateStaticParams() {
  return SCHOLARS.map((scholar) => ({ slug: scholar.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scholar = getScholarBySlug(slug);
  if (!scholar) return { title: "আলেম" };
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
  const scholar = getScholarBySlug(slug);
  if (!scholar) notFound();

  const tab: Tab = TABS.includes(tabParam as Tab) ? (tabParam as Tab) : "articles";
  const district = findDistrict(scholar.district);
  const departments = scholar.departmentIds
    .map((id) => getDepartment(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const primary = getDepartment(scholar.primaryDepartmentId);

  const tabItems = [
    {
      id: "articles",
      label: "প্রবন্ধ",
      href: `/scholars/${scholar.slug}?tab=articles`,
      icon: FileText,
      count: scholar.stats.articles,
    },
    {
      id: "fatwas",
      label: "ফতোয়া",
      href: `/scholars/${scholar.slug}?tab=fatwas`,
      icon: Scale,
      count: scholar.stats.fatwas,
    },
    {
      id: "answers",
      label: "উত্তর",
      href: `/scholars/${scholar.slug}?tab=answers`,
      icon: MessageCircleQuestion,
      count: scholar.stats.answers,
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
            <Pick value={district.name} />
          </Badge>
          <Badge tone="neutral" size="sm" icon={CalendarDays}>
            {gregorianDateBn(new Date(scholar.joinedAt), "bn")}
          </Badge>
        </div>

        <ScholarStatBar scholar={scholar} className="mt-4 max-w-2xl" />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ---------------- main column ---------------- */}
        <div className="space-y-6">
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
                {departments.map((department) => (
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
              <ProfileSections scholar={scholar} tab={tab} />
            </div>
          </section>
        </div>

        {/* ---------------- rail ---------------- */}
        <aside className="space-y-4">
          <Card variant="parchment">
            <CardHeader
              title={<T k="label.responseTime" />}
              subtitle="প্রশ্ন পাঠানোর আগে জেনে নিন"
              icon={Clock}
            />
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tabular text-foreground">
                {formatNumber(scholar.responseTimeHours, "bn")}
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
                  {
                    label: <T k="label.madrasah" />,
                    value: <Pick value={scholar.madrasah} />,
                    icon: Building2,
                  },
                  {
                    label: <T k="label.district" />,
                    value: <Pick value={district.name} />,
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
                  {formatNumber(scholar.stats.helpfulVotes, "bn")}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.8125rem] text-muted-foreground">
                  <T k="label.followers" />
                </span>
                <span className="font-display text-lg font-bold tabular text-foreground">
                  {formatNumber(scholar.stats.followers, "bn")}
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

          <div>
            <SectionHeader
              title={<T k="home.recommendedScholars" />}
              size="sm"
              icon={GraduationCap}
              href="/scholars"
            />
            <div className="space-y-3">
              {SCHOLARS.filter((s) => s.id !== scholar.id)
                .slice(0, 2)
                .map((other) => (
                  <ScholarCard key={other.id} scholar={other} layout="compact" />
                ))}
            </div>
          </div>

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

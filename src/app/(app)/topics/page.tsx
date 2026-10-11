import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Compass, Flame, LayoutGrid, Layers } from "@/components/icons";
import { fetchDepartments, fetchTopics } from "@/lib/content-api";
import { formatNumber } from "@/lib/bn";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  EmptyState,
  ErrorState,
  PageHeader,
  StatTile,
} from "@/components/ui";
import { departmentIcon } from "@/components/people";
import { T, Pick } from "@/components/i18n-text";
import { TopicExplorer } from "./topic-explorer";

export const metadata: Metadata = {
  title: "বিষয়সমূহ",
  description:
    "ইসলামিক জ্ঞানের বিষয়ভিত্তিক সূচি — আকীদা, ফিকহ, পরিবার, অর্থনীতি, তরুণ ও আরও অনেক কিছু। আপনার আগ্রহের বিষয় খুঁজে পড়া শুরু করুন।",
};

/**
 * The topic index.
 *
 * The vocabulary itself is the page, so the vocabulary is what the API answers
 * with: every topic, its department, and the count the topic carries. The
 * departments beside it come from the same place, which is why the rail and the
 * explorer cannot name a department the archive does not have.
 *
 * The topics read is the page's spine — without it there is nothing to browse —
 * so a failure shows the error state with a way back rather than an empty grid.
 * The departments read is a rail, so it fails quietly to nothing. Finding no
 * topics at all is a third thing again, and says so.
 */
export default async function TopicsPage() {
  const [topicsResult, departmentsResult] = await Promise.all([
    fetchTopics(),
    fetchDepartments(),
  ]);

  if (!topicsResult.ok) {
    return (
      <div className="space-y-6">
        <Head />
        <ErrorState
          title="বিষয়গুলো আনা যায়নি"
          description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি। একটু পরে আবার চেষ্টা করুন — সমস্যা থেকে গেলে প্রশাসনকে জানান।"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button href="/topics" size="sm">
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

  const topics = topicsResult.data;
  const departments = departmentsResult.ok ? departmentsResult.data : [];
  const trending = topics.filter((topic) => topic.trending);
  // The archive's own count, summed — not the number of topics on this page.
  const totalContent = topics.reduce((sum, topic) => sum + topic.contentCount, 0);

  return (
    <div className="space-y-6">
      <Head>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label={<T k="label.topics" />}
            value={formatNumber(topics.length, "bn")}
            hint="মোট বিষয়"
            icon={LayoutGrid}
            tone="primary"
          />
          <StatTile
            label={<T k="label.departments" />}
            value={formatNumber(departments.length, "bn")}
            hint="জ্ঞানের শাখা"
            icon={Layers}
            tone="info"
          />
          <StatTile
            label={<T k="label.total" />}
            value={formatNumber(totalContent, "bn")}
            hint="বিষয়ভিত্তিক কনটেন্ট"
            icon={Flame}
            tone="accent"
          />
        </div>
      </Head>

      {topics.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="বিষয়সমূহ এখনো যুক্ত হয়নি"
          description="বিষয়ভিত্তিক সূচি তৈরি হতে চলেছে। এর মধ্যে আপনি সরাসরি প্রশ্ন করতে পারেন বা প্রবন্ধ পড়তে পারেন।"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button href="/articles" variant="outline" size="sm">
                প্রবন্ধ পড়ুন
              </Button>
              <Button href="/questions/ask" size="sm">
                <T k="action.askScholar" />
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <TopicExplorer topics={topics} departments={departments} />
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader
                title={<T k="label.departments" />}
                subtitle="আলেমদের বিভাগসমূহ"
                icon={Layers}
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {departments.length === 0 ? (
                  <p className="text-[0.8125rem] text-muted-foreground">
                    বিভাগের তালিকা এখন আনা যাচ্ছে না।
                  </p>
                ) : (
                  departments.map((department) => (
                    <Chip
                      key={department.id}
                      href={`/departments/${department.slug}`}
                      tone={department.tone}
                      icon={departmentIcon(department.icon)}
                      count={department.scholarIds.length}
                    >
                      <Pick value={department.shortName} />
                    </Chip>
                  ))
                )}
              </div>
            </Card>

            {trending.length > 0 ? (
              <Card variant="parchment">
                <CardHeader
                  title={
                    <span className="text-danger">
                      <T k="home.trendingNow" />
                    </span>
                  }
                  subtitle="সবচেয়ে বেশি পড়া হচ্ছে"
                  icon={Flame}
                />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {trending.map((topic) => (
                    <Chip key={topic.slug} href={`/topics/${topic.slug}`} tone="danger">
                      <Pick value={topic.name} />
                    </Chip>
                  ))}
                </div>
              </Card>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}

/**
 * The page's own head, so the failure branch can still show it.
 *
 * The tiles are children rather than props because they are the only part of the
 * header that needs numbers — and the failure branch has none to draw.
 */
function Head({ children }: { children?: ReactNode }) {
  return (
    <PageHeader
      eyebrow={<T k="nav.topics" />}
      title={<T k="label.topics" />}
      description="যে বিষয় নিয়ে আপনার প্রশ্ন, সেই বিষয়েই সাজানো কুরআন, হাদীস, প্রবন্ধ, ফতোয়া ও আলোচনা — সব এক জায়গায়।"
      icon={Compass}
      patterned
      actions={
        <Button href="/questions/ask" variant="outline">
          <T k="action.askScholar" />
        </Button>
      }
    >
      {children}
    </PageHeader>
  );
}

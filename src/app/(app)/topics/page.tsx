import type { Metadata } from "next";
import { Compass, Flame, LayoutGrid, Layers } from "@/components/icons";
import { DEPARTMENTS, TOPICS, TRENDING_TOPICS } from "@/lib/data/departments";
import { formatNumber } from "@/lib/bn";
import {
  Button,
  Card,
  CardHeader,
  Chip,
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

export default function TopicsPage() {
  const totalContent = TOPICS.reduce((sum, topic) => sum + topic.contentCount, 0);

  return (
    <div className="space-y-6">
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
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label={<T k="label.topics" />}
            value={formatNumber(TOPICS.length, "bn")}
            hint="মোট বিষয়"
            icon={LayoutGrid}
            tone="primary"
          />
          <StatTile
            label={<T k="label.departments" />}
            value={formatNumber(DEPARTMENTS.length, "bn")}
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
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <TopicExplorer />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader
              title={<T k="label.departments" />}
              subtitle="আলেমদের বিভাগসমূহ"
              icon={Layers}
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

          {TRENDING_TOPICS.length > 0 ? (
            <Card variant="parchment">
              <CardHeader
                title={<span className="text-danger"><T k="home.trendingNow" /></span>}
                subtitle="সবচেয়ে বেশি পড়া হচ্ছে"
                icon={Flame}
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {TRENDING_TOPICS.map((topic) => (
                  <Chip key={topic.slug} href={`/topics/${topic.slug}`} tone="danger">
                    <Pick value={topic.name} />
                  </Chip>
                ))}
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

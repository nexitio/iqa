import type { Metadata } from "next";
import { BookOpen, CalendarDays, Clock, Route, Sparkles, TrendingUp } from "@/components/icons";
import { Num, T } from "@/components/i18n-text";
import {
  Callout,
  Card,
  CardHeader,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { JourneyCard, JourneyRow } from "@/components/personal";
import { JOURNEYS, USER_STREAK_DAYS } from "@/lib/data/personal";

export const metadata: Metadata = {
  title: "শিক্ষা যাত্রা",
  description:
    "ছোট ছোট ধাপে কাঠামোবদ্ধ ইসলামিক শিক্ষা — প্রতিদিন মাত্র কয়েক মিনিটে, ধারাবাহিকতায় পূর্ণ একটি বিষয় শেখা।",
};

const TOTAL_DAYS = JOURNEYS.reduce((sum, journey) => sum + journey.totalDays, 0);

const TOTAL_MINUTES = JOURNEYS.reduce(
  (sum, journey) => sum + journey.days.reduce((inner, day) => inner + day.minutes, 0),
  0,
);

const MINUTES_INVESTED = JOURNEYS.reduce(
  (sum, journey) =>
    sum + journey.days.filter((day) => day.completed).reduce((inner, day) => inner + day.minutes, 0),
  0,
);

const ACTIVE = JOURNEYS.filter((journey) => journey.completedDays > 0);
const COMPLETED = JOURNEYS.filter(
  (journey) => journey.totalDays > 0 && journey.completedDays >= journey.totalDays,
);

export default function JourneyIndexPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="nav.journey" />}
        title={<T k="journey.title" />}
        description={<T k="journey.subtitle" />}
        icon={Route}
        tone="accent"
        patterned
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="মোট যাত্রা"
          value={<Num value={JOURNEYS.length} />}
          hint="বিভিন্ন বিষয়ে কাঠামোবদ্ধ কোর্স"
          icon={Route}
          tone="accent"
        />
        <StatTile
          label="মোট দিন"
          value={<Num value={TOTAL_DAYS} />}
          hint="সব যাত্রা মিলিয়ে"
          icon={CalendarDays}
          tone="primary"
        />
        <StatTile
          label="আপনার বিনিয়োগ"
          value={<Num value={MINUTES_INVESTED} />}
          hint="মিনিট সম্পন্ন করেছেন"
          icon={Clock}
          tone="success"
        />
        <StatTile
          label={<T k="label.streak" />}
          value={<Num value={USER_STREAK_DAYS} />}
          hint="টানা দিন ইলম চর্চা"
          icon={TrendingUp}
          tone="warning"
        />
      </section>

      {COMPLETED.length > 0 ? (
        <Callout tone="success" icon={Sparkles}>
          মাশাআল্লাহ — আপনি {COMPLETED.length}টি যাত্রা সম্পন্ন করেছেন। এখন কোনো একটি
          নতুন যাত্রায় যুক্ত হয়ে পরবর্তী বিষয়টি ধাপে ধাপে শিখতে পারেন।
        </Callout>
      ) : null}

      {ACTIVE.length > 0 ? (
        <section>
          <SectionHeader
            title={<T k="journey.yourJourneys" />}
            description="আপনি যেসব যাত্রা শুরু করেছেন — একটানা চালিয়ে যাওয়াই মূল লক্ষ্য।"
            icon={BookOpen}
          />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ACTIVE.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader
          title={<T k="journey.discover" />}
          description="নতুন যাত্রা খুঁজুন এবং নিজের গতিতে এগিয়ে যান।"
          icon={Route}
          href="/topics"
          actionLabel="বিষয় অনুযায়ী"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {JOURNEYS.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="min-w-0">
          <SectionHeader title="সব যাত্রা একসাথে" description="সংক্ষিপ্ত তালিকা" icon={CalendarDays} />
          <div className="space-y-3">
            {JOURNEYS.map((journey) => (
              <JourneyRow key={journey.id} journey={journey} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <Card variant="parchment">
            <CardHeader
              title="যাত্রা কী?"
              subtitle="কেন ধাপে ধাপে শেখা কার্যকর"
              icon={Sparkles}
              tone="accent"
            />
            <div className="mt-4 space-y-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <p>
                একটি যাত্রা হলো একটি বিষয়ের সাজানো পরিকল্পনা — প্রতিদিন অল্প সময়,
                কিন্তু ধারাবাহিকভাবে এগিয়ে চলা। একদিনে অনেক বেশি পড়ার চেয়ে
                প্রতিদিন একটু পড়াই জ্ঞানকে স্থায়ী করে।
              </p>
              <p>
                প্রতি দিনের জন্য থাকে একটি ছোট পাঠ, একটি হাদীস বা আয়াত, কখনো
                প্রতিফলনের প্রশ্ন, আর শেষে সংক্ষিপ্ত মূল্যায়ন। আপনার অগ্রগতি
                স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে।
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="এই সপ্তাহের পরামর্শ" icon={Clock} tone="primary" />
            <ul className="mt-4 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
              <li>• দিনে ১০–১৫ মিনিট নির্দিষ্ট একটি সময় ধরে রাখুন।</li>
              <li>• মিস হলে সাথে সাথে পরের দিনেই ফিরে আসুন, লজ্জা নয়।</li>
              <li>• শেখা বিষয়টি দিনে অন্তত একজনের সাথে শেয়ার করুন।</li>
            </ul>
          </Card>

          <Card>
            <CardHeader title="মোট কনটেন্ট" icon={Route} />
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[0.8125rem] text-muted-foreground">যাত্রা</dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  <Num value={JOURNEYS.length} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[0.8125rem] text-muted-foreground">মোট পাঠের দিন</dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  <Num value={TOTAL_DAYS} />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[0.8125rem] text-muted-foreground">মোট সময়</dt>
                <dd className="font-display text-base font-bold tabular text-foreground">
                  <Num value={TOTAL_MINUTES} /> মিনিট
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}

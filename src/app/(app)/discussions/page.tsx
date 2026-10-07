import type { Metadata } from "next";
import {
  MessagesSquare,
  PenLine,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "@/components/icons";
import { T } from "@/components/i18n-text";
import { DiscussionRow } from "@/components/knowledge";
import { ScholarMiniCard } from "@/components/people";
import {
  Badge,
  Callout,
  Card,
  CardHeader,
  PageHeader,
  SectionHeader,
  StatTile,
} from "@/components/ui";
import { DISCUSSIONS, DISCUSSION_REPLIES, getTrendingDiscussions } from "@/lib/data/community";
import { SCHOLARS } from "@/lib/data/scholars";
import { toBnDigits } from "@/lib/bn";
import { DiscussionBrowser } from "./discussion-browser";
import { GuidelinesPanel } from "./guidelines-panel";

export const metadata: Metadata = {
  title: "জ্ঞানভিত্তিক আলোচনা",
  description:
    "শালীন, মডারেটেড ও জ্ঞানকেন্দ্রিক আলোচনা — প্রশ্ন, অভিজ্ঞতা ও দলিল বিনিময়ের জন্য। এটি কোনো সাধারণ সোশ্যাল নেটওয়ার্ক নয়, বরং ইলম অর্জনের একটি সংযত পরিসর।",
};

/**
 * Discussions index.
 *
 * The guidelines are shown before the threads on purpose: stating the norms up
 * front is what keeps a knowledge forum from drifting into a general social
 * feed, which is the promise this section has to keep.
 */
export default function DiscussionsPage() {
  const trending = getTrendingDiscussions(5);
  const scholarReplies = DISCUSSION_REPLIES.filter((reply) => reply.isScholarReply).length;
  const underReview = DISCUSSIONS.filter((d) => d.moderationState !== "clean").length;
  const answeringScholars = SCHOLARS.filter((s) => s.availableForQuestions).slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        patterned
        icon={MessagesSquare}
        eyebrow="ইলম · সম্প্রদায়"
        title={<T k="discussions.title" />}
        description={<T k="discussions.subtitle" />}
      >
        <Callout tone="primary" icon={ShieldCheck} title="এটি কোনো সাধারণ সোশ্যাল নেটওয়ার্ক নয়">
          এখানে ব্যক্তিগত জীবনচর্যা বা রাজনৈতিক বিতর্কের জায়গা নয়। প্রশ্ন, অভিজ্ঞতা ও দলিল —
          এই তিনটি ঘিরেই আলোচনা সীমাবদ্ধ থাকবে। মডারেটররা প্রয়োজন হলে আলোচনা পর্যালোচনায় নিতে পারেন।
        </Callout>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="মোট আলোচনা" value={toBnDigits(DISCUSSIONS.length)} icon={MessagesSquare} />
        <StatTile
          label="মোট উত্তর"
          value={toBnDigits(DISCUSSION_REPLIES.length)}
          icon={Users}
          tone="info"
        />
        <StatTile
          label="আলেমের উত্তর"
          value={toBnDigits(scholarReplies)}
          icon={Sparkles}
          tone="success"
          hint="আলেমদের অংশগ্রহণই আলোচনার মান রক্ষা করে"
        />
        <StatTile
          label="মডারেশনে"
          value={toBnDigits(underReview)}
          icon={ShieldCheck}
          tone="warning"
          hint="পর্যালোচনাধীন আলোচনা স্পষ্টভাবে চিহ্নিত"
        />
      </div>

      <section>
        <GuidelinesPanel />
      </section>

      <section>
        <SectionHeader
          icon={MessagesSquare}
          title="সকল আলোচনা"
          description="বিভাগ অনুযায়ী ছেঁকে দেখুন · পিন করা আলোচনা সবার উপরে"
          action={
            <Badge tone="primary" size="sm" icon={PenLine}>
              নতুন আলোচনা শুরু করুন
            </Badge>
          }
        />
        <DiscussionBrowser discussions={DISCUSSIONS} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <SectionHeader
            icon={TrendingUp}
            tone="accent"
            title="আলোচিত আলোচনা"
            description="সবচেয়ে বেশি অংশগ্রহণ ও পাঠ"
          />
          <div className="space-y-1">
            {trending.map((discussion) => (
              <DiscussionRow key={discussion.id} discussion={discussion} />
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <section>
            <SectionHeader size="sm" icon={Sparkles} title="আলোচনায় অংশ নিচ্ছেন" />
            <div className="space-y-2.5">
              {answeringScholars.map((scholar) => (
                <ScholarMiniCard key={scholar.id} scholar={scholar} />
              ))}
            </div>
          </section>

          <Card>
            <CardHeader icon={ShieldCheck} title="মডারেশন কীভাবে কাজ করে" />
            <ul className="mt-4 space-y-3">
              {[
                "অপ্রাসঙ্গিক বা আক্রমণাত্মক লেখা সরানো হয়, ব্যবহারকারীকে জানানো হয়।",
                "বিতর্কিত আলোচনা পর্যালোচনায় এলে তা স্পষ্টভাবে চিহ্নিত করা হয়।",
                "নীতিভঙ্গের পুনরাবৃত্তি হলে অ্যাকাউন্ট সীমিত করা হয়।",
                "আলেমের মতকে জ্ঞানের প্রশ্নে প্রাধান্য দেওয়া হয়, তবে প্রশ্ন করা নিষিদ্ধ নয়।",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  <span className="text-[0.8125rem] leading-relaxed text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border pt-3.5 text-[0.6875rem] leading-relaxed text-subtle-foreground">
              নীতিমালা লঙ্ঘন দেখলে রিপোর্ট করুন — মডারেটররা পর্যালোচনা করবেন।
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

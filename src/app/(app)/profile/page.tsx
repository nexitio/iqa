import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageCircleQuestion,
  NotebookPen,
  Route,
  Settings,
  ShieldCheck,
  Users,
} from "@/components/icons";
import {
  BOOKMARKS,
  CURRENT_USER,
  JOURNEYS,
  NOTIFICATIONS,
  READING_PROGRESS,
  USER_STREAK_DAYS,
  WEEKLY_LEARNING_MINUTES,
  LEARNING_GOAL_MINUTES_PER_DAY,
} from "@/lib/data/personal";
import { ANSWERS, QUESTIONS, getQuestion } from "@/lib/data/questions";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { getDepartment } from "@/lib/data/departments";
import { findDistrict } from "@/lib/bn";
import { BookmarkCard, StreakCard } from "@/components/personal";
import { QuestionRow } from "@/components/knowledge";
import { ScholarCard } from "@/components/people";
import { Num, Pick, T, TimeAgo } from "@/components/i18n-text";
import {
  Avatar,
  Badge,
  Callout,
  Card,
  Chip,
  EmptyState,
  PageHeader,
  Progress,
  SectionHeader,
  StatTile,
  VerifiedMark,
  WeekStrip,
  statusTone,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "আমার প্রোফাইল",
  description: "আপনার প্রশ্ন, উত্তর, সংরক্ষিত জ্ঞান ও শেখার যাত্রা — সব এক জায়গায়।",
};

const TABS = [
  { id: "activity", label: "কার্যক্রম", icon: Activity },
  { id: "questions", label: "আমার প্রশ্ন", icon: MessageCircleQuestion },
  { id: "answers", label: "আমার উত্তর", icon: CheckCircle2 },
  { id: "saved", label: "সংরক্ষিত", icon: Bookmark },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active: TabId = (TABS.find((t) => t.id === tab)?.id ?? "activity") as TabId;

  const myQuestions = QUESTIONS.filter((q) => q.askerId === CURRENT_USER.id);
  const myQuestionIds = new Set(myQuestions.map((q) => q.id));
  const myAnswers = ANSWERS.filter((a) => myQuestionIds.has(a.questionId));
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  const followedScholars = CURRENT_USER.followingScholarIds
    .map((id) => SCHOLAR_BY_ID[id])
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const followedDepartments = CURRENT_USER.followingDepartmentSlugs
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const activeJourneys = JOURNEYS.filter((j) => j.completedDays > 0 && j.completedDays < j.totalDays);
  const inProgress = READING_PROGRESS.filter((p) => p.progress > 0 && p.progress < 100);

  const district = findDistrict(CURRENT_USER.district);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<T k="profile.title" />}
        title={
          <span className="flex items-center gap-2.5">
            {CURRENT_USER.name}
            {CURRENT_USER.isVerified ? <VerifiedMark label="যাচাইকৃত" /> : null}
          </span>
        }
        description={CURRENT_USER.email}
        icon={Users}
        patterned
        actions={
          <>
            <Link
              href="/settings"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 text-[0.875rem] font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary"
            >
              <Settings className="size-4" aria-hidden />
              <T k="nav.settings" />
            </Link>
            <Link
              href="/questions/ask"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[0.875rem] font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-hover"
            >
              <MessageCircleQuestion className="size-4" aria-hidden />
              <T k="action.ask" />
            </Link>
          </>
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              name={CURRENT_USER.name}
              color={CURRENT_USER.avatarColor}
              size="xl"
              verified={CURRENT_USER.isVerified}
            />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.8125rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  <Pick value={district.name} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  <T k="label.joinedOn" /> <TimeAgo iso={CURRENT_USER.joinedAt} />
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" aria-hidden />
                  সাধারণ ব্যবহারকারী
                </span>
              </p>
              {unread > 0 ? (
                <Link href="/notifications" className="mt-2 inline-block">
                  <Badge tone="danger" size="sm">
                    <Num value={unread} />টি নতুন বিজ্ঞপ্তি
                  </Badge>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label="আমার প্রশ্ন"
            value={<Num value={myQuestions.length} />}
            hint="যেগুলো আপনি জিজ্ঞেস করেছেন"
            icon={MessageCircleQuestion}
            tone="info"
          />
          <StatTile
            label="পাওয়া উত্তর"
            value={<Num value={myAnswers.length} />}
            hint="আলেমদের দেওয়া উত্তর"
            icon={CheckCircle2}
            tone="success"
          />
          <StatTile
            label="সংরক্ষিত"
            value={<Num value={BOOKMARKS.length} />}
            hint="আপনার নিজের লাইব্রেরি"
            icon={Bookmark}
            tone="primary"
            href="/library"
          />
          <StatTile
            label="চলমান যাত্রা"
            value={<Num value={activeJourneys.length} />}
            hint="শিক্ষা যাত্রা যেগুলো চলছে"
            icon={Route}
            tone="accent"
            href="/journey"
          />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-5">
          {/* URL-driven tabs so a section is shareable and JS-independent */}
          <nav
            aria-label="প্রোফাইল বিভাগসমূহ"
            className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-border"
          >
            {TABS.map((item) => {
              const isActive = item.id === active;
              return (
                <Link
                  key={item.id}
                  href={item.id === "activity" ? "/profile" : `/profile?tab=${item.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "-mb-px inline-flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 text-[0.8125rem] font-medium transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  <item.icon className="size-3.5" aria-hidden />
                  {item.label}
                  {item.id === "questions" && myQuestions.length > 0 ? (
                    <span className="ml-0.5 text-[0.6875rem] font-semibold tabular opacity-70">
                      <Num value={myQuestions.length} />
                    </span>
                  ) : null}
                  {item.id === "saved" && BOOKMARKS.length > 0 ? (
                    <span className="ml-0.5 text-[0.6875rem] font-semibold tabular opacity-70">
                      <Num value={BOOKMARKS.length} />
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {active === "activity" ? (
            <section className="space-y-4">
              <SectionHeader
                title="সাম্প্রতিক কার্যক্রম"
                description="আপনার বিজ্ঞপ্তি ও শেখার গতিবিধি"
                icon={Activity}
              />
              <Card>
                <ul className="space-y-0.5">
                  {NOTIFICATIONS.slice(0, 7).map((notification) => (
                    <li key={notification.id}>
                      <Link
                        href={notification.href}
                        className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-surface-3"
                      >
                        <span
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            notification.read ? "bg-border-strong" : "bg-primary",
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[0.8125rem] font-semibold leading-snug text-foreground">
                            {notification.titleBn}
                          </span>
                          <span className="mt-0.5 block line-clamp-2 text-[0.75rem] leading-relaxed text-muted-foreground">
                            {notification.bodyBn}
                          </span>
                        </span>
                        <span className="shrink-0 text-[0.6875rem] text-subtle-foreground">
                          <TimeAgo iso={notification.createdAt} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/notifications"
                  className="mt-3 block border-t border-border pt-3 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
                >
                  সব বিজ্ঞপ্তি দেখুন
                </Link>
              </Card>

              <SectionHeader
                title="এই সপ্তাহের শেখা"
                description="প্রতিদিন কত মিনিট ইলম অর্জনে কাটিয়েছেন"
                icon={Route}
                tone="accent"
              />
              <Card>
                <WeekStrip
                  values={WEEKLY_LEARNING_MINUTES}
                  goal={LEARNING_GOAL_MINUTES_PER_DAY}
                  labels={["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"]}
                />
                <p className="mt-4 border-t border-border pt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
                  আপনি টানা <Num value={USER_STREAK_DAYS} /> দিন ইলম অর্জন করছেন। দৈনিক লক্ষ্য{" "}
                  <Num value={LEARNING_GOAL_MINUTES_PER_DAY} /> মিনিট — উচ্চ বারের ব্যস্ততার দিনেও অল্প করে এগিয়ে
                  চলাই এই প্ল্যাটফর্মের উদ্দেশ্য।
                </p>
              </Card>
            </section>
          ) : null}

          {active === "questions" ? (
            <section className="space-y-4">
              <SectionHeader
                title={<T k="profile.myQuestions" />}
                description="আপনি যেসব প্রশ্ন করেছেন এবং সেগুলোর অবস্থা"
                icon={MessageCircleQuestion}
              />
              {myQuestions.length === 0 ? (
                <Card flush>
                  <EmptyState
                    icon={MessageCircleQuestion}
                    title="এখনো কোনো প্রশ্ন করেননি"
                    description="যেকোনো দ্বীনি বিষয়ে আলেমদের কাছে প্রশ্ন করতে পারেন — নাম গোপন রেখেও।"
                    action={
                      <Link
                        href="/questions/ask"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[0.875rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                      >
                        প্রথম প্রশ্ন লিখুন
                      </Link>
                    }
                  />
                </Card>
              ) : (
                <div className="space-y-3">
                  {myQuestions.map((question) => (
                    <Card key={question.id} padding="sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          tone={statusTone(question.status)}
                          size="xs"
                          dot
                        >
                          {question.status === "answered"
                            ? "উত্তর দেওয়া হয়েছে"
                            : question.status === "routed"
                              ? "আলেমের কাছে পাঠানো হয়েছে"
                              : question.status === "closed"
                                ? "সম্পন্ন"
                                : "অপেক্ষমাণ"}
                        </Badge>
                        {question.fatwaRequested ? (
                          <Badge tone="accent" size="xs">
                            ফতোয়া চাওয়া হয়েছে
                          </Badge>
                        ) : null}
                        {question.urgency === "urgent" ? (
                          <Badge tone="danger" size="xs">
                            জরুরি
                          </Badge>
                        ) : null}
                        <span className="ml-auto text-[0.6875rem] text-subtle-foreground">
                          <TimeAgo iso={question.createdAt} />
                        </span>
                      </div>
                      <div className="mt-2">
                        <QuestionRow question={question} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {active === "answers" ? (
            <section className="space-y-4">
              <SectionHeader
                title={<T k="profile.myAnswers" />}
                description="আপনার প্রশ্নের বিপরীতে আলেমদের দেওয়া উত্তর"
                icon={CheckCircle2}
                tone="success"
              />
              {myAnswers.length === 0 ? (
                <Card flush>
                  <EmptyState
                    icon={CheckCircle2}
                    title="এখনো কোনো উত্তর পাননি"
                    description="প্রশ্ন করলে সংশ্লিষ্ট বিভাগের আলেম উত্তর দিলে সেটি এখানে দেখা যাবে এবং বিজ্ঞপ্তিও পাবেন।"
                    action={
                      <Link
                        href="/questions/ask"
                        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-[0.875rem] font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
                      >
                        প্রশ্ন লিখুন
                      </Link>
                    }
                  />
                </Card>
              ) : (
                <div className="space-y-3">
                  {myAnswers.map((answer) => {
                    const question = getQuestion(answer.questionId);
                    const scholar = SCHOLAR_BY_ID[answer.scholarId];
                    return (
                      <Card key={answer.id} padding="sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={answer.accepted ? "success" : "neutral"} size="xs" dot>
                            {answer.accepted ? "গৃহীত উত্তর" : "উত্তর"}
                          </Badge>
                          {answer.becameFatwaSlug ? (
                            <Badge tone="accent" size="xs">
                              ফতোয়া হিসেবে প্রকাশিত
                            </Badge>
                          ) : null}
                          <span className="ml-auto text-[0.6875rem] text-subtle-foreground">
                            <TimeAgo iso={answer.createdAt} />
                          </span>
                        </div>
                        {question ? (
                          <p className="mt-2 text-[0.8125rem] font-semibold leading-snug text-foreground">
                            {question.titleBn}
                          </p>
                        ) : null}
                        <p className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                          {answer.bodyBn}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                          {scholar ? (
                            <span className="text-[0.75rem] text-muted-foreground">
                              উত্তর দিয়েছেন{" "}
                              <Link
                                href={`/scholars/${scholar.slug}`}
                                className="font-medium text-primary hover:underline"
                              >
                                <Pick value={scholar.honorific} /> <Pick value={scholar.name} />
                              </Link>
                            </span>
                          ) : null}
                          {question ? (
                            <Link
                              href={`/questions/${question.slug}`}
                              className="text-[0.75rem] font-medium text-primary hover:underline"
                            >
                              পুরো উত্তর পড়ুন
                            </Link>
                          ) : null}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {active === "saved" ? (
            <section className="space-y-4">
              <SectionHeader
                title={<T k="profile.savedItems" />}
                description="সংরক্ষিত জ্ঞানের সংক্ষিপ্ত ঝলক"
                icon={Bookmark}
                href="/library"
                actionLabel="পুরো লাইব্রেরি"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {BOOKMARKS.slice(0, 6).map((bookmark) => (
                  <BookmarkCard key={bookmark.id} bookmark={bookmark} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="min-w-0 space-y-4">
          <StreakCard streakDays={USER_STREAK_DAYS} />

          <Card>
            <SectionHeader
              title="যাদের ফলো করছেন"
              description="তাঁদের নতুন লেখা আপনার ফিডে আসে"
              icon={Users}
              size="sm"
            />
            {followedScholars.length > 0 ? (
              <div className="space-y-3">
                {followedScholars.slice(0, 5).map((scholar) => (
                  <ScholarCard key={scholar.id} scholar={scholar} layout="compact" showFollow={false} />
                ))}
              </div>
            ) : (
              <p className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                এখনো কোনো আলেমকে ফলো করছেন না। আলেমদের তালিকা থেকে ফলো করলে তাঁদের উত্তর ও প্রবন্ধ আপনার ফিডে
                অগ্রাধিকার পাবে।
              </p>
            )}
            <Link
              href="/scholars"
              className="mt-3 block border-t border-border pt-3 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
            >
              আরও আলেম খুঁজুন
            </Link>
          </Card>

          <Card>
            <SectionHeader title="ফলো করা বিভাগ" icon={NotebookPen} size="sm" />
            <div className="flex flex-wrap gap-2">
              {followedDepartments.map((department) => (
                <Chip key={department.id} href={`/departments/${department.slug}`} size="sm" tone="primary">
                  <Pick value={department.name} />
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              আপনার আগ্রহ অনুসারে ফিড সাজানো হয় এই বিভাগগুলোর ভিত্তিতে। পরিবর্তন করতে সেটিংসে যান।
            </p>
          </Card>

          {inProgress.length > 0 ? (
            <Card>
              <SectionHeader
                title={<T k="label.continueLearning" />}
                icon={Route}
                size="sm"
                href="/library"
                actionLabel="লাইব্রেরি"
              />
              <ul className="space-y-3.5">
                {inProgress.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="group block">
                      <p className="text-[0.8125rem] font-medium leading-snug text-foreground group-hover:text-primary">
                        {item.titleBn}
                      </p>
                      <div className="mt-2">
                        <Progress value={item.progress} size="xs" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Callout tone="primary" title="আপনার অগ্রগতি গোপন থাকে">
            আপনার প্রশ্ন ও পড়ার অভ্যাস কেবল আপনার কাছেই দৃশ্যমান। নাম প্রকাশে অনিচ্ছুক প্রশ্ন কখনো আপনার পরিচয়ের সাথে
            প্রকাশ্যে দেখানো হয় না।
          </Callout>
        </aside>
      </div>
    </div>
  );
}

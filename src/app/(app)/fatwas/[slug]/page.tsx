import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  Eye,
  FileSearch,
  FolderTree,
  MapPin,
  Quote,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
} from "@/components/icons";
import type { Department, Scholar } from "@/lib/types";
import {
  fetchDepartments,
  fetchDistricts,
  fetchFatwa,
  fetchFatwas,
  fetchScholars,
  indexBy,
} from "@/lib/content-api";
import { toBnDigits } from "@/lib/bn";
import { T, Pick } from "@/components/i18n-text";
import {
  Avatar,
  AvatarStack,
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Chip,
  ContentPending,
  ErrorState,
  FactList,
  PageHeader,
  Prose,
  SectionHeader,
  VerifiedMark,
} from "@/components/ui";
import { AskCtaCard, FatwaCard, ReferenceList } from "@/components/knowledge";
import { extractHeadings } from "../../_content/outline";
import { SaveShareBar, TableOfContents } from "../../_content/reader-tools";

/**
 * One ruling.
 *
 * The fatwa, its evidence, the mufti who signed it, the muftis who co-signed it,
 * the department it belongs to and the related rulings all come from the API. The
 * page no longer reaches into the bundled dataset for any of it — including the
 * districts, which used to be resolved from a local list through `findDistrict`.
 *
 * Two failure modes are different and are treated differently: a slug the API does
 * not have is a genuine 404 and becomes `notFound()`, while an API that cannot be
 * reached shows an error state with a way back, so a transient outage does not
 * look like a missing ruling.
 */

/**
 * One read per request, shared by the metadata and the page.
 *
 * The metadata pass and the page pass each need the same ruling, and one read is all
 * either should cost — a bare fetch in each is two requests to the API for one page,
 * and two 404s in flight at once leave the metadata pass rendering while the page
 * calls `notFound()`, which a boundary that has already flushed cannot survive.
 *
 * The missing ruling is decided here, in that one read, so both passes agree: a slug
 * the API does not know will never exist, and the answer is the not-found boundary
 * rather than an error state.
 */
const readFatwa = cache(async (slug: string) => {
  const result = await fetchFatwa(slug);
  if (!result.ok && result.status === 404) notFound();
  return result;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await readFatwa(slug);
  if (!result.ok) return { title: "ফতোয়া পাওয়া যায়নি" };

  const { fatwa } = result.data;
  return {
    title: fatwa.rulingBn.slice(0, 70),
    description: fatwa.questionBn.slice(0, 160),
  };
}

export default async function FatwaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await readFatwa(slug);

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "হোম", href: "/" },
            { label: "ফতোয়া", href: "/fatwas" },
          ]}
          eyebrow="ফতোয়া"
          title={<T k="fatwa.title" />}
          icon={Scale}
        />
        <ErrorState
          title="ফতোয়াটি আনা যায়নি"
          description="কনটেন্ট সার্ভিসে পৌঁছানো যায়নি, তাই এই রায়টি এখন দেখানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button href={`/fatwas/${slug}`} size="sm">
                আবার চেষ্টা করুন
              </Button>
              <Button href="/fatwas" variant="outline" size="sm">
                সব ফতোয়া দেখুন
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const { fatwa, references } = result.data;
  const firstDepartment = fatwa.departmentIds[0];

  const [departmentRead, scholarRead, districtRead, relatedRead] = await Promise.all([
    fetchDepartments(),
    fetchScholars(),
    fetchDistricts(),
    // Same department when there is one; the newest rulings otherwise, which are
    // dropped below rather than shown under a heading that would not be true.
    fetchFatwas(firstDepartment ? { department: firstDepartment, limit: 4 } : { limit: 4 }),
  ]);

  const departmentRows = departmentRead.ok ? departmentRead.data : [];
  const departmentBySlug = indexBy(departmentRows, "slug");
  const scholarById = indexBy(scholarRead.ok ? scholarRead.data.items : [], "id");
  const districtById = indexBy(districtRead.ok ? districtRead.data : [], "id");

  const mufti = scholarById.get(fatwa.muftiId);
  const coSigners = fatwa.coSignerIds
    .map((id) => scholarById.get(id))
    .filter((scholar): scholar is Scholar => Boolean(scholar));

  const departments = fatwa.departmentIds
    .map((id) => departmentBySlug.get(id))
    .filter((department): department is Department => Boolean(department));

  // The district the question came from, and the mufti's own — both looked up in
  // the fetched set. An id the API does not describe is shown as it arrived.
  const questionerDistrict = districtById.get(fatwa.questionerDistrict);
  const muftiDistrict = mufti ? districtById.get(mufti.district) : undefined;

  const headings = extractHeadings(fatwa.bodyBn);
  const related = firstDepartment && relatedRead.ok
    ? relatedRead.data.items.filter((other) => other.id !== fatwa.id).slice(0, 3)
    : [];
  const isPublished = fatwa.status === "published";

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "হোম", href: "/" },
          { label: "ফতোয়া", href: "/fatwas" },
          { label: departments[0] ? departments[0].shortName.bn : "ফতোয়া" },
        ]}
        eyebrow={departments[0]?.shortName.bn ?? "ফতোয়া"}
        title={<T k="fatwa.title" />}
        description={<Pick value={departments[0]?.description} />}
        icon={Scale}
        actions={<SaveShareBar id={fatwa.slug} title={fatwa.rulingBn} />}
      />

      {!isPublished ? (
        <Callout tone="warning" icon={FileSearch} title="এই রায়টি এখনো প্রকাশিত হয়নি">
          ফতোয়াটি বর্তমানে পর্যালোচনার পর্যায়ে আছে। প্রকাশের আগে সহ-স্বাক্ষরকারী মুফতির
          যাচাই সম্পন্ন হতে হবে, তাই এখানকার বক্তব্য চূড়ান্ত নয়।
        </Callout>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          {/* The ruling is the answer: it comes before everything else. */}
          <section
            aria-label="ফতোয়ার জবাব"
            className="relative overflow-hidden rounded-panel border border-primary/30 bg-primary-soft/60 p-5 sm:p-6"
          >
            <span className="absolute inset-y-0 left-0 w-1.5 bg-primary" aria-hidden />
            <div className="pl-2.5">
              <p className="flex flex-wrap items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-primary">
                <Scale className="size-4" aria-hidden />
                ফতোয়ার জবাব
                <Badge tone={fatwa.fiqh === "hanafi" ? "primary" : "info"} size="xs">
                  {fatwa.fiqh === "hanafi" ? <T k="fatwa.hanafi" /> : <T k="fatwa.comparative" />}
                </Badge>
                {fatwa.pinned ? (
                  <Badge tone="accent" size="xs">
                    গুরুত্বপূর্ণ
                  </Badge>
                ) : null}
              </p>
              <p className="mt-3 font-display text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
                {fatwa.rulingBn}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-primary/20 pt-4 text-[0.6875rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {new Date(fatwa.publishedAt).toLocaleDateString("bn-BD", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-3.5" aria-hidden />
                  {toBnDigits(fatwa.viewCount.toLocaleString("en-IN"))} বার পঠিত
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookMarked className="size-3.5" aria-hidden />
                  {toBnDigits(fatwa.bookmarkCount)} বার সংরক্ষিত
                </span>
              </div>
            </div>
          </section>

          {/* The question that produced the ruling, kept adjacent for context. */}
          <Card variant="flat">
            <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
              <Quote className="size-3.5" aria-hidden />
              <T k="label.questioner" />
            </p>
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-foreground">
              {fatwa.questionBn}
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <Chip size="sm" icon={MapPin} tone="neutral">
                {questionerDistrict ? <Pick value={questionerDistrict.name} /> : fatwa.questionerDistrict} জেলা
              </Chip>
              {departments.map((department) => (
                <Chip
                  key={department.slug}
                  href={`/departments/${department.slug}`}
                  size="sm"
                  icon={FolderTree}
                >
                  <Pick value={department.name} />
                </Chip>
              ))}
            </div>
          </Card>

          <article className="rounded-panel border border-border bg-surface p-5 shadow-card sm:p-8">
            <SectionHeader
              title="দলিল ও বিশ্লেষণ"
              description="মুফতির বিস্তারিত ব্যাখ্যা"
              icon={BookOpen}
              size="sm"
            />
            <div data-reading-body>
              <Prose paragraphs={fatwa.bodyBn} />
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <p className="text-[0.75rem] text-subtle-foreground">
                <T k="label.updatedOn" />{" "}
                {new Date(fatwa.publishedAt).toLocaleDateString("bn-BD", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <SaveShareBar id={fatwa.slug} title={fatwa.rulingBn} compact />
            </div>
          </article>

          {references.length > 0 ? (
            <ReferenceList references={references} title="এই রায়ের দলিল ও রেফারেন্স" />
          ) : fatwa.referenceCount > 0 ? (
            <ContentPending message="এই রায়ের আয়াত ও হাদীসগুলো মূল লেখার ভেতরেই উদ্ধৃত করা হয়েছে। আলাদা রেফারেন্স তালিকা শীঘ্রই যুক্ত করা হবে।" />
          ) : null}

          {/* Who is answerable for this ruling. */}
          <section aria-label="মুফতি পরিচিতি">
            <SectionHeader title={<T k="label.mufti" />} icon={ShieldCheck} tone="scholar" />
            {mufti ? (
              <Card>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Link href={`/scholars/${mufti.slug}`} className="flex items-start gap-3.5">
                    <Avatar
                      name={mufti.name.bn}
                      color={mufti.avatarColor}
                      size="xl"
                      verified={mufti.verified}
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5 text-[1rem] font-semibold leading-tight text-foreground">
                        <Pick value={mufti.honorific} /> <Pick value={mufti.name} />
                        {mufti.verified ? <VerifiedMark label="যাচাইকৃত" /> : null}
                      </span>
                      <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-muted-foreground">
                        <Pick value={mufti.shortBio} />
                      </span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge tone="primary" size="xs">
                          <Pick
                            value={departmentBySlug.get(mufti.primaryDepartmentId)?.shortName}
                          />
                        </Badge>
                        <Badge tone="neutral" size="xs">
                          <Pick value={mufti.madrasah} />
                        </Badge>
                      </span>
                    </span>
                  </Link>
                </div>

                <div className="mt-5 grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                      <Sparkles className="size-3.5" aria-hidden />
                      শিক্ষাগত যোগ্যতা
                    </p>
                    <ul className="space-y-2.5">
                      {mufti.credentials.map((credential) => (
                        <li key={credential.id}>
                          <p className="text-[0.8125rem] font-medium leading-snug text-foreground">
                            <Pick value={credential.title} />
                          </p>
                          <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted-foreground">
                            <Pick value={credential.institution} /> · {toBnDigits(credential.year)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <FactList
                    columns={1}
                    items={[
                      {
                        label: "মোট ফতোয়া",
                        value: `${toBnDigits(mufti.stats.fatwas)} টি`,
                        icon: Scale,
                      },
                      {
                        label: "মোট উত্তর",
                        value: `${toBnDigits(mufti.stats.answers)} টি`,
                        icon: Users,
                      },
                      {
                        label: "সাধারণত উত্তর দেন",
                        value: `${toBnDigits(mufti.responseTimeHours)} ঘণ্টায়`,
                        icon: BookMarked,
                      },
                      {
                        label: "অবস্থান",
                        value: muftiDistrict ? (
                          <Pick value={muftiDistrict.name} />
                        ) : (
                          mufti.district
                        ),
                        icon: MapPin,
                      },
                    ]}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                  {coSigners.length > 0 ? (
                    <span className="flex items-center gap-2.5">
                      <AvatarStack
                        people={coSigners.map((scholar) => ({
                          name: scholar.name.bn,
                          color: scholar.avatarColor,
                        }))}
                        size="sm"
                        max={4}
                      />
                      <span className="text-[0.75rem] text-muted-foreground">
                        <T k="label.coSigned" />
                      </span>
                    </span>
                  ) : (
                    <span className="text-[0.75rem] text-subtle-foreground">
                      এই রায়ে সহ-স্বাক্ষরকারী নেই
                    </span>
                  )}
                  <Button href={`/scholars/${mufti.slug}`} variant="outline" size="sm">
                    প্রোফাইল দেখুন
                  </Button>
                </div>
              </Card>
            ) : null}
          </section>

          {/* A fatwa is not a substitute for personal counsel on complex matters. */}
          <Callout tone="warning" icon={ShieldCheck} title="গুরুত্বপূর্ণ বিষয়ে সতর্কতা">
            এই রায়টি সাধারণ বিবরণের ভিত্তিতে দেওয়া। আপনার প্রকৃত পরিস্থিতি ভিন্ন হলে
            (সম্পত্তি, তালাক, উত্তরাধিকার, চিকিৎসা ইত্যাদি) স্থানীয় আলেম বা মুফতির সাথে
            সরাসরি পরামর্শ করুন। ব্যক্তিগত সিদ্ধান্তের দায়িত্ব পাঠকের।
          </Callout>

          {related.length > 0 ? (
            <section aria-label="সম্পর্কিত ফতোয়া">
              <SectionHeader
                title="সম্পর্কিত ফতোয়া"
                description="একই বিভাগের অন্যান্য রায়"
                icon={Scale}
                tone="accent"
                href="/fatwas"
              />
              <div className="grid gap-4 lg:grid-cols-2">
                {related.map((other) => (
                  <FatwaCard
                    key={other.id}
                    fatwa={other}
                    mufti={scholarById.get(other.muftiId)}
                    coSigners={other.coSignerIds
                      .map((id) => scholarById.get(id))
                      .filter((scholar): scholar is Scholar => Boolean(scholar))}
                    department={other.departmentIds
                      .map((id) => departmentBySlug.get(id))
                      .find((department): department is Department => Boolean(department))}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <AskCtaCard />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {headings.length >= 2 ? (
            <Card>
              <CardHeader title="এই রায়ে যা আছে" icon={BookOpen} />
              <CardBody className="mt-3">
                <TableOfContents items={headings} />
              </CardBody>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="রায়ের সারসংক্ষেপ" icon={Scale} titleClassName="text-[0.9375rem]" />
            <CardBody className="mt-3">
              <FactList
                columns={1}
                items={[
                  {
                    label: "ফিকহ",
                    value:
                      fatwa.fiqh === "hanafi" ? <T k="fatwa.hanafi" /> : <T k="fatwa.comparative" />,
                    icon: Scale,
                  },
                  {
                    label: "প্রশ্নকারীর জেলা",
                    value: questionerDistrict ? (
                      <Pick value={questionerDistrict.name} />
                    ) : (
                      fatwa.questionerDistrict
                    ),
                    icon: MapPin,
                  },
                  {
                    label: "দলিলের সংখ্যা",
                    value: `${toBnDigits(fatwa.referenceCount)} টি`,
                    icon: BookMarked,
                  },
                  {
                    label: "অবস্থা",
                    value: isPublished ? <T k="status.published" /> : <T k="status.inReview" />,
                    icon: Eye,
                  },
                ]}
              />
            </CardBody>
          </Card>

          <Card variant="parchment">
            <p className="text-[0.75rem] leading-relaxed text-muted-foreground">
              <T k="misc.footerDisclaimer" />
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

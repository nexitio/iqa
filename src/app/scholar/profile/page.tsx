import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, GraduationCap, MapPin, ShieldCheck } from "@/components/icons";
import { CredentialList, ScholarStatBar } from "@/components/people";
import { GregDate, T } from "@/components/i18n-text";
import {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  CardHeader,
  FactList,
  PageHeader,
  SectionHeader,
} from "@/components/ui";
import { getDepartment } from "@/lib/data/departments";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { findDistrict } from "@/lib/bn";
import { AvailableInline } from "../availability";
import { SCHOLAR_CONSOLE_ID } from "../scholar-queue";
import { BioProse, ProfileEditor } from "./profile-editor";

export const metadata: Metadata = {
  title: "আমার প্রোফাইল",
};

/**
 * A preview of the scholar's public profile alongside the editing controls, so
 * they can see exactly what a reader encounters on /scholars/<slug>.
 */
export default function ScholarProfilePage() {
  const scholar = SCHOLAR_BY_ID[SCHOLAR_CONSOLE_ID];

  if (!scholar) {
    return (
      <Card>
        <p className="text-[0.875rem] text-muted-foreground">আলেমের তথ্য পাওয়া যায়নি।</p>
      </Card>
    );
  }

  const district = findDistrict(scholar.district);
  const departments = scholar.departmentIds
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={GraduationCap}
        eyebrow={<T k="console.title" />}
        title={<T k="console.publicProfile" />}
        description="পাঠকরা আপনার প্রোফাইলে ঠিক যা দেখেন, তা এখানে হুবহু দেখানো হচ্ছে। নিচের সম্পাদনা প্যানেল থেকে পরিচয়, বিশেষজ্ঞতা ও ভাষা হালনাগাদ করতে পারেন।"
        actions={
          <Button href={`/scholars/${scholar.slug}`} variant="outline" icon={ExternalLink}>
            লাইভ প্রোফাইল দেখুন
          </Button>
        }
      />

      {!scholar.verified ? (
        <Callout tone="warning">
          <p className="text-[0.8125rem] leading-relaxed">
            <span className="font-semibold text-foreground">আপনার প্রোফাইল এখনো যাচাই হয়নি।</span>{" "}
            যাচাই ছাড়া প্রোফাইলে যাচাইকৃত চিহ্ন দেখানো হয় না এবং প্রশ্ন রাউটিংয়ে
            অগ্রাধিকার কম থাকে। অ্যাডমিন আপনার যোগ্যতা যাচাই করলে এটি স্বয়ংক্রিয়ভাবে
            হালনাগাদ হবে।
          </p>
        </Callout>
      ) : null}

      {/* Public header, exactly as readers see it */}
      <Card variant="parchment">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar
            name={scholar.name.bn}
            color={scholar.avatarColor}
            size="2xl"
            verified={scholar.verified}
            ring
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="scholar" size="sm" icon={ShieldCheck}>
                <T k="label.verifiedScholar" />
              </Badge>
              <AvailableInline
                available={scholar.availableForQuestions}
                responseTimeHours={scholar.responseTimeHours}
              />
            </div>
            <h1 className="mt-2.5 font-display text-2xl font-bold leading-tight text-foreground">
              {scholar.honorific.bn} {scholar.name.bn}
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="size-3.5" aria-hidden />
                {scholar.madrasah.bn}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                {district.name.bn}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {departments.map((department) => (
                <Badge key={department.slug} tone={department.tone} size="xs">
                  {department.shortName.bn}
                </Badge>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href={`/scholars/${scholar.slug}`}
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                পাঠকরা যেভাবে দেখেন
                <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <ScholarStatBar scholar={scholar} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <SectionHeader size="sm" icon={GraduationCap} title="পরিচিতি" className="mb-4" />
            <BioProse bio={scholar.bio} />
          </Card>

          <Card>
            <SectionHeader
              size="sm"
              icon={GraduationCap}
              title="শিক্ষাগত যোগ্যতা"
              description="এই তথ্য যাচাইকৃত — পরিবর্তনের জন্য অ্যাডমিনের অনুমোদন প্রয়োজন"
              className="mb-4"
            />
            <CredentialList credentials={scholar.credentials} />
          </Card>

          <ProfileEditor scholar={scholar} />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader icon={GraduationCap} title="প্রোফাইলের তথ্য" />
            <div className="mt-4">
              <FactList
                columns={1}
                items={[
                  { label: "যোগদান", value: <GregDate day={new Date(scholar.joinedAt)} /> },
                  {
                    label: "সাড়া দেওয়ার সময়",
                    value: `${scholar.responseTimeHours} ঘণ্টা`,
                  },
                  { label: "রেটিং", value: `${scholar.rating} / ৫` },
                  {
                    label: "যাচাই",
                    value: scholar.verified ? "যাচাইকৃত" : "যাচাই বাকি",
                  },
                ]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader icon={GraduationCap} title="বিশেষজ্ঞতা" />
            <ul className="mt-3 space-y-2">
              {scholar.specialization.map((item) => (
                <li key={item.bn} className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                  {item.bn}
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                ভাষা
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {scholar.languages.map((language) => (
                  <Badge key={language} tone="neutral" size="xs">
                    {language}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={GraduationCap}
              tone="accent"
              title="আপনার বিভাগসমূহ"
              subtitle="রাউটিং এই বিভাগগুলোর ওপর নির্ভর করে"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {departments.map((department) => (
                <Badge key={department.slug} tone={department.tone} size="xs">
                  {department.name.bn}
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              প্রধান বিভাগ:{" "}
              <span className="font-medium text-foreground">
                {getDepartment(scholar.primaryDepartmentId)?.name.bn ?? "—"}
              </span>
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

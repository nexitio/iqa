import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, GraduationCap, MapPin, ShieldCheck } from "@/components/icons";
import { CredentialList, ScholarStatBar } from "@/components/people";
import { Digits, GregDate, Pick, T } from "@/components/i18n-text";
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
        <p className="text-[0.875rem] text-muted-foreground">
          <T k="scholar.tools.profile.notFound" />
        </p>
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
        description={<T k="scholar.tools.profile.description" />}
        actions={
          <Button href={`/scholars/${scholar.slug}`} variant="outline" icon={ExternalLink}>
            <T k="scholar.tools.profile.viewLive" />
          </Button>
        }
      />

      {!scholar.verified ? (
        <Callout tone="warning">
          <p className="text-[0.8125rem] leading-relaxed">
            <span className="font-semibold text-foreground">
              <T k="scholar.tools.profile.unverifiedLead" />
            </span>{" "}
            <T k="scholar.tools.profile.unverifiedBody" />
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
              <Pick value={scholar.honorific} /> <Pick value={scholar.name} />
            </h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="size-3.5" aria-hidden />
                <Pick value={scholar.madrasah} />
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden />
                <Pick value={district.name} />
              </span>
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {departments.map((department) => (
                <Badge key={department.slug} tone={department.tone} size="xs">
                  <Pick value={department.shortName} />
                </Badge>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href={`/scholars/${scholar.slug}`}
                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-primary transition-colors hover:text-primary-hover"
              >
                <T k="scholar.tools.profile.asReadersSee" />
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
            <SectionHeader
              size="sm"
              icon={GraduationCap}
              title={<T k="scholar.tools.profile.bioTitle" />}
              className="mb-4"
            />
            <BioProse bio={scholar.bio} />
          </Card>

          <Card>
            <SectionHeader
              size="sm"
              icon={GraduationCap}
              title={<T k="scholar.tools.profile.credentialsTitle" />}
              description={<T k="scholar.tools.profile.credentialsDescription" />}
              className="mb-4"
            />
            <CredentialList credentials={scholar.credentials} />
          </Card>

          <ProfileEditor scholar={scholar} />
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader icon={GraduationCap} title={<T k="scholar.tools.profile.factsTitle" />} />
            <div className="mt-4">
              <FactList
                columns={1}
                items={[
                  { label: <T k="scholar.tools.profile.joined" />, value: <GregDate day={new Date(scholar.joinedAt)} /> },
                  {
                    label: <T k="scholar.tools.profile.responseTime" />,
                    value: (
                      <>
                        <Digits value={scholar.responseTimeHours} /> <T k="console.hours" />
                      </>
                    ),
                  },
                  {
                    label: <T k="scholar.tools.profile.rating" />,
                    value: (
                      <T k="scholar.tools.profile.ratingValue" vars={{ rating: scholar.rating }} />
                    ),
                  },
                  {
                    label: <T k="scholar.tools.profile.verification" />,
                    value: (
                      <T
                        k={scholar.verified ? "label.verified" : "scholar.tools.profile.unverified"}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </Card>

          <Card>
            <CardHeader icon={GraduationCap} title={<T k="scholar.tools.profile.specializationTitle" />} />
            <ul className="mt-3 space-y-2">
              {scholar.specialization.map((item) => (
                <li key={item.bn} className="text-[0.8125rem] leading-relaxed text-muted-foreground">
                  <Pick value={item} />
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-subtle-foreground">
                <T k="label.languages" />
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
              title={<T k="console.yourDepartments" />}
              subtitle={<T k="scholar.tools.profile.departmentsSubtitle" />}
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {departments.map((department) => (
                <Badge key={department.slug} tone={department.tone} size="xs">
                  <Pick value={department.name} />
                </Badge>
              ))}
            </div>
            <p className="mt-3 text-[0.75rem] leading-relaxed text-muted-foreground">
              <T k="scholar.tools.profile.primaryDepartment" />{" "}
              <span className="font-medium text-foreground">
                <Pick value={getDepartment(scholar.primaryDepartmentId)?.name} fallback="—" />
              </span>
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

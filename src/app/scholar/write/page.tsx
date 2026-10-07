import type { Metadata } from "next";
import { PenLine } from "@/components/icons";
import { PageHeader } from "@/components/ui";
import { T } from "@/components/i18n-text";
import { getDepartment } from "@/lib/data/departments";
import { SCHOLAR_BY_ID } from "@/lib/data/scholars";
import { Composer } from "./composer";
import { SCHOLAR_CONSOLE_ID } from "../scholar-queue";

export const metadata: Metadata = {
  title: "নতুন লেখা",
};

/**
 * The writing surface. All the interactive state lives in `Composer`; this page
 * only supplies the scholar's identity and departments.
 */
export default function ScholarWritePage() {
  const scholar = SCHOLAR_BY_ID[SCHOLAR_CONSOLE_ID];

  const departmentNames = (scholar?.departmentIds ?? [])
    .map((slug) => getDepartment(slug))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .map((d) => d.name.bn);

  const scholarName = scholar ? `${scholar.honorific.bn} ${scholar.name.bn}` : "আলেম";

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PenLine}
        eyebrow={<T k="console.title" />}
        title={<T k="console.writeTitle" />}
        description={<T k="console.writeSubtitle" />}
        patterned
      />

      <Composer scholarName={scholarName} departmentNames={departmentNames} />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/layout";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: {
    default: "অ্যাডমিন প্যানেল · ইলম",
    template: "%s · অ্যাডমিন প্যানেল · ইলম",
  },
  description:
    "আলেম ব্যবস্থাপনা, বিভাগ নির্ধারণ, কনটেন্ট পর্যালোচনা ও মডারেশন — ইলম প্ল্যাটফর্মের অ্যাডমিন প্যানেল।",
  robots: { index: false, follow: false },
};

/**
 * Admin workspace. ConsoleShell supplies the header, sidebar and mobile tab bar.
 *
 * The role check is here rather than on each page so no route under `/admin` can
 * be added without it, and it is the app's own check on the API's answer — the
 * API checks again for anything it serves, so a forged cookie buys nothing.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/");

  return <ConsoleShell role="admin">{children}</ConsoleShell>;
}

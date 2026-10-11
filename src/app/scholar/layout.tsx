import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/layout";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "আলেম প্যানেল",
  description:
    "আলেম প্যানেল — আপনার কাছে রাউট করা প্রশ্নের উত্তর দিন, প্রবন্ধ ও ফতোয়া লিখুন, এবং কুরআন-হাদীসের রেফারেন্সসহ প্রকাশ করুন।",
};

/**
 * Scholar console layout.
 *
 * ConsoleShell already supplies the console header, sidebar navigation, mobile
 * tab bar and page padding, so this file only has to declare the role — and check
 * it. A console is somebody's workspace, and which workspace it is comes from the
 * session rather than from the URL: an admin is let in because inspecting a
 * scholar's queue is part of administering one, a reader is not.
 */
export default async function ScholarLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/scholar");
  if (user.role !== "scholar" && user.role !== "admin") redirect("/");

  return <ConsoleShell role="scholar">{children}</ConsoleShell>;
}

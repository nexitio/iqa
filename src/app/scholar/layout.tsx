import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/layout";

export const metadata: Metadata = {
  title: "আলেম প্যানেল",
  description:
    "আলেম প্যানেল — আপনার কাছে রাউট করা প্রশ্নের উত্তর দিন, প্রবন্ধ ও ফতোয়া লিখুন, এবং কুরআন-হাদীসের রেফারেন্সসহ প্রকাশ করুন।",
};

/**
 * Scholar console layout.
 *
 * ConsoleShell already supplies the console header, sidebar navigation, mobile
 * tab bar and page padding, so this file only has to declare the role.
 */
export default function ScholarLayout({ children }: { children: ReactNode }) {
  return <ConsoleShell role="scholar">{children}</ConsoleShell>;
}

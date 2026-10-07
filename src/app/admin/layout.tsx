import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/layout";

export const metadata: Metadata = {
  title: {
    default: "অ্যাডমিন প্যানেল · ইলম",
    template: "%s · অ্যাডমিন প্যানেল · ইলম",
  },
  description:
    "আলেম ব্যবস্থাপনা, বিভাগ নির্ধারণ, কনটেন্ট পর্যালোচনা ও মডারেশন — ইলম প্ল্যাটফর্মের অ্যাডমিন প্যানেল।",
  robots: { index: false, follow: false },
};

/** Admin workspace. ConsoleShell supplies the header, sidebar and mobile tab bar. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ConsoleShell role="admin">{children}</ConsoleShell>;
}

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout";

/**
 * Public application layout.
 *
 * All public knowledge routes live inside this group so they share the nav
 * frame. The sidebar is deliberately navigation only — the prayer schedule used
 * to sit at the bottom of it, and it now opens the right-hand rail on the home
 * page instead, where the reader's own widgets belong. The full schedule is on
 * /daily for every screen size.
 */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

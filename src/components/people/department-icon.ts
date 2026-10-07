import type { LucideIcon } from "@/components/icons";
import {
  Baby,
  BookMarked,
  BookOpen,
  Brain,
  Building2,
  Compass,
  Cpu,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  HeartPulse,
  Landmark,
  Library,
  MessageCircle,
  Moon,
  Scale,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  UtensilsCrossed,
  Wallet,
} from "@/components/icons";

/**
 * Icon registry for department records.
 *
 * `Department.icon` stores a lucide *name* because the data layer is plain
 * data, so this is the single place that turns those names back into
 * components. Only icons present in the taxonomy are registered.
 *
 * This module deliberately carries NO "use client" directive. A plain function
 * exported from a client module becomes a client reference, and server
 * components cannot *call* one — only render it. Pages are server components
 * and need to resolve a department's icon during render, so the registry lives
 * here and client components import it too.
 */

const DEPARTMENT_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Scale,
  BookMarked,
  Library,
  ScrollText,
  Users,
  Wallet,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  Moon,
  Compass,
  HeartPulse,
  UtensilsCrossed,
  Cpu,
  Landmark,
  Baby,
  ShieldCheck,
  HandCoins,
  Building2,
  Brain,
  Sprout,
  MessageCircle,
};

export function departmentIcon(name: string | undefined): LucideIcon {
  return (name && DEPARTMENT_ICONS[name]) || BookOpen;
}

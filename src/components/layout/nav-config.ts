import type { LucideIcon } from "@/components/icons";
import {
  BookOpen,
  Bookmark,
  Building2,
  ClipboardCheck,
  Compass,
  FileText,
  Flag,
  HandHeart,
  Home,
  LayoutDashboard,
  Library,
  MessageCircleQuestion,
  MessagesSquare,
  PenLine,
  Route,
  Scale,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  GraduationCap,
} from "@/components/icons";
import type { Localized } from "@/lib/types";

export interface NavLink {
  href: string;
  label: Localized;
  icon: LucideIcon;
  /** Optional count badge. */
  badge?: number;
  /** Rendered in the compact "more" list rather than the primary rail. */
  secondary?: boolean;
}

/**
 * The links that sit above the groups, with no heading of their own.
 *
 * The home feed is where the app starts and where a reader returns to between
 * everything else, so it belongs to none of the groups below it — filing it under
 * "Learn" or "My Practice" would say it is one topic among many.
 */
export const SIDEBAR_TOP: NavLink[] = [
  { href: "/", label: { bn: "হোম", en: "Home" }, icon: Home },
];

/**
 * Full sidebar navigation, grouped by intent.
 *
 * This is the *only* navigation list for desktop: the header deliberately does
 * not repeat these links (it shows the current section instead), and small
 * screens use the bottom bar plus the drawer, which renders these same groups.
 */
export const SIDEBAR_GROUPS: { title: Localized; links: NavLink[] }[] = [
  {
    title: { bn: "জ্ঞান অর্জন", en: "Learn" },
    links: [
      { href: "/quran", label: { bn: "কুরআন", en: "Quran" }, icon: BookOpen },
      { href: "/hadith", label: { bn: "হাদীস সংকলন", en: "Hadith" }, icon: ScrollText },
      { href: "/articles", label: { bn: "প্রবন্ধ", en: "Articles" }, icon: FileText },
      { href: "/fatwas", label: { bn: "ফতোয়া সংকলন", en: "Fatwas" }, icon: Scale },
    ],
  },
  {
    title: { bn: "প্রশ্ন ও আলোচনা", en: "Ask & Discuss" },
    links: [
      { href: "/questions", label: { bn: "প্রশ্নোত্তর", en: "Q&A" }, icon: MessageCircleQuestion },
      { href: "/discussions", label: { bn: "আলোচনা", en: "Discussions" }, icon: MessagesSquare },
      { href: "/scholars", label: { bn: "আলেম ও মুফতি", en: "Scholars" }, icon: Users },
    ],
  },
  {
    title: { bn: "আমার চর্চা", en: "My Practice" },
    links: [
      { href: "/daily", label: { bn: "দৈনিক আয়াত", en: "Daily Ayah" }, icon: Sparkles },
      { href: "/duas", label: { bn: "দুআ ও জিকির", en: "Duas & Dhikr" }, icon: HandHeart },
      { href: "/journey", label: { bn: "শিক্ষা যাত্রা", en: "Learning Journey" }, icon: Route },
      { href: "/library", label: { bn: "আমার লাইব্রেরি", en: "My Library" }, icon: Bookmark },
      { href: "/topics", label: { bn: "বিষয়সমূহ", en: "Topics" }, icon: Compass },
      { href: "/library", label: { bn: "সংরক্ষিত", en: "Saved" }, icon: Library, secondary: true },
    ],
  },
];

/** Five-slot mobile bar with a raised centre action. */
export const BOTTOM_NAV: NavLink[] = [
  { href: "/", label: { bn: "হোম", en: "Home" }, icon: Home },
  { href: "/quran", label: { bn: "কুরআন", en: "Quran" }, icon: BookOpen },
  { href: "/hadith", label: { bn: "হাদীস", en: "Hadith" }, icon: ScrollText },
  { href: "/library", label: { bn: "লাইব্রেরি", en: "Library" }, icon: Bookmark },
];

/** Scholar console sidebar. */
export const SCHOLAR_NAV: NavLink[] = [
  { href: "/scholar", label: { bn: "সারসংক্ষেপ", en: "Overview" }, icon: LayoutDashboard },
  { href: "/scholar/questions", label: { bn: "প্রশ্ন বাক্স", en: "Question Inbox" }, icon: MessageCircleQuestion, badge: 18 },
  { href: "/scholar/write", label: { bn: "নতুন লেখা", en: "Compose" }, icon: PenLine },
  { href: "/scholar/articles", label: { bn: "আমার প্রবন্ধ", en: "My Articles" }, icon: FileText },
  { href: "/scholar/fatwas", label: { bn: "আমার ফতোয়া", en: "My Fatwas" }, icon: Scale },
  { href: "/scholar/profile", label: { bn: "প্রোফাইল", en: "Profile" }, icon: GraduationCap },
];

/** Admin console sidebar. */
export const ADMIN_NAV: NavLink[] = [
  { href: "/admin", label: { bn: "সারসংক্ষেপ", en: "Overview" }, icon: LayoutDashboard },
  { href: "/admin/scholars", label: { bn: "আলেম ব্যবস্থাপনা", en: "Scholars" }, icon: Users, badge: 9 },
  { href: "/admin/departments", label: { bn: "বিভাগসমূহ", en: "Departments" }, icon: Building2 },
  { href: "/admin/review", label: { bn: "পর্যালোচনা", en: "Review Queue" }, icon: ClipboardCheck, badge: 23 },
  { href: "/admin/questions", label: { bn: "প্রশ্ন মনিটরিং", en: "Question Monitor" }, icon: MessageCircleQuestion, badge: 27 },
  { href: "/admin/reports", label: { bn: "রিপোর্ট", en: "Reports" }, icon: Flag, badge: 6 },
  { href: "/admin/users", label: { bn: "ব্যবহারকারী", en: "Users" }, icon: ShieldCheck },
];

/** Utility links shown in the account menu and footer. */
export const ACCOUNT_NAV: NavLink[] = [
  { href: "/profile", label: { bn: "প্রোফাইল", en: "Profile" }, icon: Users },
  { href: "/settings", label: { bn: "সেটিংস", en: "Settings" }, icon: Settings },
  { href: "/notifications", label: { bn: "বিজ্ঞপ্তি", en: "Notifications" }, icon: Sparkles },
];

export const FOOTER_LINKS: { title: Localized; links: { href: string; label: Localized }[] }[] = [
  {
    title: { bn: "জ্ঞান", en: "Knowledge" },
    links: [
      { href: "/quran", label: { bn: "কুরআন", en: "Quran" } },
      { href: "/hadith", label: { bn: "হাদীস", en: "Hadith" } },
      { href: "/articles", label: { bn: "প্রবন্ধ", en: "Articles" } },
      { href: "/fatwas", label: { bn: "ফতোয়া", en: "Fatwas" } },
    ],
  },
  {
    title: { bn: "সম্প্রদায়", en: "Community" },
    links: [
      { href: "/questions", label: { bn: "প্রশ্নোত্তর", en: "Q&A" } },
      { href: "/discussions", label: { bn: "আলোচনা", en: "Discussions" } },
      { href: "/scholars", label: { bn: "আলেমগণ", en: "Scholars" } },
      { href: "/topics", label: { bn: "বিষয়সমূহ", en: "Topics" } },
    ],
  },
  {
    title: { bn: "আমার জন্য", en: "For me" },
    links: [
      { href: "/daily", label: { bn: "দৈনিক আয়াত", en: "Daily Ayah" } },
      { href: "/duas", label: { bn: "দুআ ও জিকির", en: "Duas & Dhikr" } },
      { href: "/journey", label: { bn: "শিক্ষা যাত্রা", en: "Journeys" } },
      { href: "/library", label: { bn: "লাইব্রেরি", en: "Library" } },
      { href: "/settings", label: { bn: "সেটিংস", en: "Settings" } },
    ],
  },
  {
    title: { bn: "প্ল্যাটফর্ম", en: "Platform" },
    links: [
      { href: "/scholar", label: { bn: "আলেম প্যানেল", en: "Scholar Console" } },
      { href: "/admin", label: { bn: "অ্যাডমিন প্যানেল", en: "Admin Console" } },
      { href: "/register", label: { bn: "অ্যাকাউন্ট", en: "Account" } },
      { href: "/login", label: { bn: "প্রবেশ", en: "Sign in" } },
    ],
  },
];

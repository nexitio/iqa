import type { LucideIcon } from "lucide-react-native";
import {
  BookOpen,
  Bookmark,
  Compass,
  FileText,
  HandHeart,
  Home,
  Library,
  MessageCircleQuestion,
  MessagesSquare,
  Route,
  Scale,
  ScrollText,
  Settings,
  Sparkles,
  Users,
} from "../icons";
import type { Localized } from "../../lib/types";

export interface NavLink {
  href: string;
  label: Localized;
  icon: LucideIcon;
  badge?: number;
  secondary?: boolean;
}

/** The links that sit above the groups, with no heading of their own. */
export const SIDEBAR_TOP: NavLink[] = [
  { href: "/", label: { bn: "হোম", en: "Home" }, icon: Home },
];

/** Full drawer navigation, grouped by intent. */
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
    ],
  },
];

/** Four-slot mobile bar with a raised centre action. */
export const BOTTOM_NAV: NavLink[] = [
  { href: "/", label: { bn: "হোম", en: "Home" }, icon: Home },
  { href: "/quran", label: { bn: "কুরআন", en: "Quran" }, icon: BookOpen },
  { href: "/hadith", label: { bn: "হাদীস", en: "Hadith" }, icon: ScrollText },
  { href: "/library", label: { bn: "লাইব্রেরি", en: "Library" }, icon: Library },
];

/** Utility links shown in the account area. */
export const ACCOUNT_NAV: NavLink[] = [
  { href: "/profile", label: { bn: "প্রোফাইল", en: "Profile" }, icon: Users },
  { href: "/settings", label: { bn: "সেটিংস", en: "Settings" }, icon: Settings },
  { href: "/notifications", label: { bn: "বিজ্ঞপ্তি", en: "Notifications" }, icon: Sparkles },
];

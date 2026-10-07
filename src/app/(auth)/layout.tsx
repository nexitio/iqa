import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, MessageCircleQuestion, ScrollText } from "@/components/icons";
import { LocaleToggle, ThemeToggle } from "@/components/layout/toggles";
import { T } from "@/components/i18n-text";

/**
 * Auth layout: a focused, distraction-free split screen. The left panel carries
 * the product's purpose rather than a generic marketing blurb.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="pattern-girih absolute inset-0 opacity-25" aria-hidden />
        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/15 backdrop-blur" aria-hidden>
              <span className="font-display text-xl font-bold leading-none">ع</span>
            </span>
            <span>
              <span className="block font-display text-xl font-bold leading-none">ইলম</span>
              <span className="mt-1 block text-[0.6875rem] opacity-80">Ilm</span>
            </span>
          </Link>
        </div>

        <div className="relative max-w-md">
          <p className="font-arabic text-2xl leading-loose opacity-90">
            رَبِّ زِدْنِي عِلْمًا
          </p>
          <p className="mt-3 text-lg font-medium leading-relaxed">
            &ldquo;হে আমার প্রতিপালক, আমার জ্ঞান বাড়িয়ে দাও।&rdquo;
          </p>
          <p className="mt-1 text-[0.8125rem] opacity-75">সূরা ত্বা-হা · আয়াত ১১৪</p>

          <ul className="mt-8 space-y-3 text-[0.875rem]">
            {[
              { icon: MessageCircleQuestion, label: "বিশ্বস্ত আলেমদের কাছে প্রশ্ন করুন" },
              { icon: BookOpen, label: "কুরআন ও হাদীস পড়ুন উচ্চারণসহ" },
              { icon: ScrollText, label: "ফতোয়া ও প্রবন্ধ থেকে শিখুন প্রতিদিন" },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/15">
                  <item.icon className="size-4" aria-hidden />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[0.75rem] opacity-75">
          বাংলাদেশের মুসলিমদের জন্য ভালোবাসা ও আদবের সাথে তৈরি
        </p>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 lg:invisible">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden>
              <span className="font-display text-lg font-bold leading-none">ع</span>
            </span>
            <span className="font-display text-lg font-bold text-foreground">ইলম</span>
          </Link>
          <div className="flex items-center gap-2">
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="border-t border-border p-4 text-center sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground transition-colors hover:text-primary"
          >
            <T k="nav.home" />
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

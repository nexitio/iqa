import Link from "next/link";
import { Compass, Home, Search } from "@/components/icons";
import { Button } from "@/components/ui";

/** 404 page inside the app shell's visual language. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Compass className="size-7" />
      </span>
      <p className="mt-6 font-arabic text-3xl text-muted-foreground">إِنَّا لِلَّهِ</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
        পাতাটি খুঁজে পাওয়া যায়নি
      </h1>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
        আপনি যে পাতাটি খুঁজছেন সেটি সরানো হয়েছে বা কখনো ছিল না। নিচের লিংক থেকে জ্ঞান অন্বেষণ চালিয়ে যান।
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button href="/" icon={Home}>
          হোমে ফিরে যান
        </Button>
        <Button href="/quran" variant="outline" icon={Search}>
          কুরআন পড়ুন
        </Button>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[0.8125rem] text-muted-foreground">
        {[
          { href: "/hadith", label: "হাদীস" },
          { href: "/questions", label: "প্রশ্নোত্তর" },
          { href: "/fatwas", label: "ফতোয়া" },
          { href: "/scholars", label: "আলেমগণ" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

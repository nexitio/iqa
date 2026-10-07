import type { Metadata, Viewport } from "next";
import {
  Amiri,
  Geist,
  Geist_Mono,
  Hind_Siliguri,
  Noto_Naskh_Arabic,
  Noto_Serif_Bengali,
} from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "./globals.css";

/* Latin UI face */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* Bangla body face — the workhorse for interface copy */
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* Bangla display face for headings and long-form reading */
const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-noto-serif-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Naskh for Qur'anic/Hadith Arabic so every ayah renders cleanly */
const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Classical face used for the Qur'an reader */
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ইলম — ইসলামিক জ্ঞান, কুরআন ও হাদীসের সঙ্গী",
    template: "%s · ইলম",
  },
  description:
    "ইলম — বাংলাদেশের মুসলিমদের জন্য একটি জীবন্ত ইসলামিক জ্ঞান প্ল্যাটফর্ম। আলেমদের কাছে প্রশ্ন করুন, কুরআন ও হাদীস পড়ুন, ফতোয়া ও প্রবন্ধ থেকে শিখুন, প্রতিদিনের ইলম গড়ে তুলুন।",
  keywords: [
    "ইসলামিক প্রশ্নোত্তর",
    "ফতোয়া",
    "কুরআন বাংলা অনুবাদ",
    "হাদীস বাংলা",
    "ইসলামিক জ্ঞান",
    "আলেম",
    "Ilm",
    "Islamic Q&A Bangladesh",
  ],
  applicationName: "Ilm",
  authors: [{ name: "Ilm" }],
  openGraph: {
    title: "ইলম — ইসলামিক জ্ঞানের সঙ্গী",
    description:
      "প্রশ্ন করুন, কুরআন-হাদীস পড়ুন, আলেমদের লেখা পড়ুন — প্রতিদিনের জ্ঞান চর্চা।",
    locale: "bn_BD",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#08120f" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="bn"
      // Tells Next to suppress smooth scrolling only during route transitions,
      // which it otherwise warns about because globals.css sets
      // `scroll-behavior: smooth` on <html>.
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={[
        geistSans.variable,
        geistMono.variable,
        hindSiliguri.variable,
        notoSerifBengali.variable,
        notoNaskh.variable,
        amiri.variable,
        "h-full",
      ].join(" ")}
    >
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

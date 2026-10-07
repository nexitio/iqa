import type { Metadata } from "next";
import { MessageCircleQuestion, Sparkles } from "@/components/icons";
import { Breadcrumbs, Button, Callout, PageHeader } from "@/components/ui";
import { AskForm } from "./ask-form";

export const metadata: Metadata = {
  title: "প্রশ্ন করুন",
  description:
    "আপনার ইসলামিক প্রশ্ন লিখুন এবং সংশ্লিষ্ট বিভাগ বেছে নিন — সেই বিভাগের আলেমরা প্রথমে আপনার প্রশ্ন দেখবেন। প্রশ্ন জমা দেওয়ার আগেই দেখে নিন কোন আলেমের কাছে এটি যাবে।",
};

/**
 * Ask page.
 *
 * The header carries the promise the form has to keep: whoever you are and
 * whatever you ask, the question reaches the right scholar and you can see why.
 */
export default function AskPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        patterned
        icon={MessageCircleQuestion}
        eyebrow="ইলম · আলেমকে প্রশ্ন"
        breadcrumbs={[
          { label: "হোম", href: "/" },
          { label: "প্রশ্নোত্তর", href: "/questions" },
          { label: "প্রশ্ন করুন" },
        ]}
        title="আলেমকে আপনার প্রশ্ন পাঠান"
        description="প্রশ্ন যত স্পষ্ট হবে, উত্তর তত নির্ভুল হবে। বিভাগ বেছে নিন — সংশ্লিষ্ট বিভাগের আলেমরা অগ্রাধিকার পাবেন, আর আপনি জমা দেওয়ার আগেই দেখে নিতে পারবেন কারা উত্তর দেবেন।"
        actions={
          <>
            <Button href="/questions" variant="outline">
              প্রশ্নোত্তর দেখুন
            </Button>
            <Button href="/scholars" variant="ghost" icon={Sparkles}>
              আলেমদের প্রোফাইল
            </Button>
          </>
        }
      >
        <Callout tone="info" icon={MessageCircleQuestion} title="একটি ভালো প্রশ্ন তিনটি কাজ করে">
          আপনার সমস্যা স্পষ্ট করে, সংশ্লিষ্ট আলেমকে খুঁজে আনে, এবং এমন উত্তর তৈরি করে
          যা পরে অন্য অনেকের উপকারে আসে। তাই প্রশ্নটি লিখতে সময় নিন।
        </Callout>
      </PageHeader>

      <AskForm />

      <Breadcrumbs
        items={[
          { label: "হোম", href: "/" },
          { label: "প্রশ্নোত্তর", href: "/questions" },
          { label: "প্রশ্ন করুন" },
        ]}
        className="sr-only"
      />

      <p className="pb-2 text-center text-[0.75rem] text-subtle-foreground">
        একাধিক প্রশ্ন থাকলে আলাদা করে পাঠান — তাহলে প্রতিটি প্রশ্ন সঠিক আলেমের কাছে যাবে।
      </p>
    </div>
  );
}

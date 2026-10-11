import { MessageCircleQuestion } from "@/components/icons";
import { Button, EmptyState } from "@/components/ui";

/**
 * A slug the API does not know.
 *
 * This boundary belongs to the question route, and it is here for two reasons. A
 * reader who followed a dead link gets the answer inside the section they were in,
 * with the way back to the archive, instead of the whole layout disappearing for a
 * generic site-wide 404. And it is what makes the missing-question answer possible
 * at all: the reading skeleton has already been sent by the time the API says the
 * question does not exist, so `notFound()` can only replace content *inside* the
 * boundary that is on screen — a boundary further up the tree has nothing left to
 * replace.
 */
export default function QuestionNotFound() {
  return (
    <EmptyState
      title="প্রশ্নটি খুঁজে পাওয়া যায়নি"
      description="এই ঠিকানায় কোনো প্রশ্ন নেই — হয়তো প্রশ্নটি সরানো হয়েছে, নয়তো লিংকটি ভুল। অন্য প্রশ্ন দেখে নিতে পারেন, অথবা নিজেই একটি প্রশ্ন করতে পারেন।"
      icon={MessageCircleQuestion}
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button href="/questions" size="sm">
            সব প্রশ্ন দেখুন
          </Button>
          <Button href="/questions/ask" variant="outline" size="sm">
            প্রশ্ন করুন
          </Button>
        </div>
      }
    />
  );
}

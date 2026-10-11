import { FileText } from "@/components/icons";
import { Button, EmptyState } from "@/components/ui";

/**
 * A slug the API does not know.
 *
 * This boundary belongs to the article route, and it is here for two reasons. A
 * reader who followed a dead link gets the answer inside the section they were in,
 * with the way back to the archive, instead of the whole layout disappearing for a
 * generic site-wide 404. And it is what makes the missing-page answer possible at
 * all: the reading skeleton has already been sent by the time the API says the
 * article does not exist, so `notFound()` can only replace content *inside* the
 * boundary that is on screen — a boundary further up the tree has nothing left to
 * replace.
 */
export default function ArticleNotFound() {
  return (
    <EmptyState
      title="প্রবন্ধটি খুঁজে পাওয়া যায়নি"
      description="এই ঠিকানায় কোনো প্রবন্ধ নেই — হয়তো লেখাটি সরানো হয়েছে, নয়তো লিংকটি ভুল। নিচের তালিকা থেকে অন্য লেখা বেছে নিতে পারেন।"
      icon={FileText}
      action={
        <Button href="/articles" size="sm">
          সব প্রবন্ধ দেখুন
        </Button>
      }
    />
  );
}

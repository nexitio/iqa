import { GraduationCap } from "@/components/icons";
import { Button, EmptyState } from "@/components/ui";

/**
 * A slug the API does not know.
 *
 * This boundary belongs to the scholar route, and it is here for two reasons. A
 * reader who followed a dead link gets the answer inside the section they were in,
 * with the way back to the directory, instead of the whole layout disappearing for
 * a generic site-wide 404. And it is what makes the missing-page answer possible at
 * all: the reading skeleton has already been sent by the time the API says the
 * profile does not exist, so `notFound()` can only replace content *inside* the
 * boundary that is on screen — a boundary further up the tree has nothing left to
 * replace.
 */
export default function ScholarNotFound() {
  return (
    <EmptyState
      title="আলেমের প্রোফাইল খুঁজে পাওয়া যায়নি"
      description="এই ঠিকানায় কোনো প্রোফাইল নেই — হয়তো তথ্যটি সরানো হয়েছে, নয়তো লিংকটি ভুল। নিচের তালিকা থেকে অন্য আলেম বেছে নিতে পারেন।"
      icon={GraduationCap}
      action={
        <Button href="/scholars" size="sm">
          সব আলেম দেখুন
        </Button>
      }
    />
  );
}

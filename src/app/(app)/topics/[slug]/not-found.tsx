import { Compass } from "@/components/icons";
import { Button, EmptyState } from "@/components/ui";

/**
 * A topic slug the API does not know.
 *
 * This boundary belongs to the topic route, and it is here for two reasons. A
 * reader who followed a dead link gets the answer inside the section they were in,
 * with the way back to the topic index, instead of the whole layout disappearing
 * for a generic site-wide 404. And it is what makes the missing-page answer
 * possible at all: the loading skeleton has already been sent by the time the API
 * says the topic does not exist, so `notFound()` can only replace content *inside*
 * the boundary that is on screen — a boundary further up the tree has nothing left
 * to replace.
 */
export default function TopicNotFound() {
  return (
    <EmptyState
      title="বিষয়টি খুঁজে পাওয়া যায়নি"
      description="এই ঠিকানায় কোনো বিষয় নেই — হয়তো নামটি বদলে গেছে, নয়তো লিংকটি ভুল। বিষয়ের তালিকা থেকে অন্যটি বেছে নিতে পারেন।"
      icon={Compass}
      action={
        <Button href="/topics" size="sm">
          সব বিষয় দেখুন
        </Button>
      }
    />
  );
}

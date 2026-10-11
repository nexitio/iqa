import { Scale } from "@/components/icons";
import { Button, EmptyState } from "@/components/ui";

/**
 * A ruling the API does not know.
 *
 * The fatwa route's own boundary, so a dead link is answered inside the archive the
 * reader came from. It also has to exist for `notFound()` to work at all here: the
 * ruling skeleton is flushed before the API answers, which leaves the boundary
 * already on screen as the only one that can still be replaced.
 */
export default function FatwaNotFound() {
  return (
    <EmptyState
      title="ফতোয়াটি খুঁজে পাওয়া যায়নি"
      description="এই ঠিকানায় কোনো ফতোয়া নেই — হয়তো রায়টি সরানো হয়েছে, নয়তো লিংকটি ভুল। সংকলন থেকে অন্য রায় দেখতে পারেন।"
      icon={Scale}
      action={
        <Button href="/fatwas" size="sm">
          সব ফতোয়া দেখুন
        </Button>
      }
    />
  );
}

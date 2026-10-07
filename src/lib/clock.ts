/**
 * The current time, for routes whose output genuinely depends on it.
 *
 * Reading the clock directly inside a component body is flagged as impure by the
 * React compiler lint, and rightly so: a component may re-render for reasons
 * unrelated to the passing of time, so "now" must never be a hidden input.
 *
 * A server route is the one place where it is a real input — this dashboard's
 * whole purpose is to show what is waiting *right now*. Routes that call this
 * must also declare themselves dynamic (`export const dynamic = "force-dynamic"`)
 * rather than being frozen into a static render at build time.
 */
export function nowMs(): number {
  return Date.now();
}

import type { Question, RoutingCandidate } from "@/lib/types";
import { QUESTIONS, getRoutingCandidates } from "@/lib/data/questions";

/**
 * The signed-in scholar's own routing queue.
 *
 * A question is routed to several scholars, each with their own score and
 * priority. This module resolves, for one scholar, which questions reached them
 * and at what priority — which is what both the overview and the inbox need.
 *
 * Once the backend lands this becomes a single indexed query
 * (`WHERE scholar_id = ?ORDER BY priority`); for now it is computed from the
 * routing maps in the dataset.
 */

/**
 * The scholar this console is signed in as. Fixed for the UI phase; it becomes
 * the authenticated session's scholar id once the backend lands.
 */
export const SCHOLAR_CONSOLE_ID = "scholar-1";

export interface ScholarQueueItem {
  question: Question;
  /** Every candidate for this question, in priority order. */
  candidates: RoutingCandidate[];
  /** This scholar's own entry — the reason the question is in their queue. */
  me: RoutingCandidate;
}

/**
 * Questions routed to `scholarId`, best priority first and, within the same
 * priority, highest match score first.
 */
export function getScholarQueue(
  scholarId: string = SCHOLAR_CONSOLE_ID,
  questions: Question[] = QUESTIONS,
): ScholarQueueItem[] {
  return questions
    .map((question) => {
      const candidates = getRoutingCandidates(question.id);
      const me = candidates.find((candidate) => candidate.scholarId === scholarId);
      return me ? { question, candidates, me } : null;
    })
    .filter((item): item is ScholarQueueItem => item !== null)
    .sort((a, b) => a.me.priority - b.me.priority || b.me.score - a.me.score);
}

/** Questions still awaiting an answer, regardless of who they went to. */
export function isUnanswered(question: Question) {
  return question.answerCount === 0;
}

/** True when a question arrived today (Dhaka calendar day). */
export function isNewToday(question: Question) {
  const then = new Date(question.createdAt);
  const now = new Date();
  return (
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate()
  );
}

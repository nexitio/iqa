"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@/lib/types";

/**
 * Who is signed in, for the client half of the app.
 *
 * The value is resolved on the server — the layout reads the session and passes
 * the account down — so there is no "loading" state to render and no request made
 * from the browser to find out. What the client gets is a fact about the page it
 * is already rendering, and the same fact for every component in the tree.
 *
 * `user: null` means signed out, and components should treat it as exactly that.
 * There is deliberately no fallback to a sample account: a page that renders
 * somebody else's name because nobody is signed in is worse than a page that says
 * nobody is.
 */
interface SessionValue {
  user: User | null;
}

const SessionContext = createContext<SessionValue>({ user: null });

export function SessionProvider({ user, children }: { user: User | null; children: ReactNode }) {
  return <SessionContext.Provider value={{ user }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}

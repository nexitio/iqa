/**
 * Social layer.
 *
 * `resolve` is deliberately directive-free so server pages can flatten the
 * polymorphic feed — the cards themselves are client components. Do not add
 * `"use client"` to this file or the resolver leaves the server.
 */
export * from "./resolve";
export * from "./post-card";
export * from "./stories";

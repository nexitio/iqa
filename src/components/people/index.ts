/**
 * Server-safe helpers first, then the client components.
 *
 * `departmentIcon` comes from a module without "use client" so server pages can
 * call it; everything from `./scholar-card` is a client component.
 */
export * from "./department-icon";
export * from "./scholar-card";

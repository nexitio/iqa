"use client";

/**
 * Client-safe icon re-exports.
 *
 * Lucide's icon modules are NOT marked `"use client"`, so an icon imported into
 * a *server* module is a plain server function. React refuses to pass a function
 * across the server/client boundary, so a server page that hands an icon to a
 * client component (for example `TabLinks`, whose items carry `icon`) throws:
 *
 *   "Functions cannot be passed directly to Client Components unless you
 *    explicitly expose it by marking it with 'use client'."
 *
 * Importing from this module instead gives a genuine client reference, which is
 * allowed. Rule of thumb:
 *
 *   • Passing an icon as a prop to a CLIENT component  → import from here.
 *   • Rendering it directly, or passing it to one of our own server-side
 *     components (Button, Badge, CardHeader, Chip, PageHeader, StatTile …)
 *     → either source works.
 */

export * from "lucide-react";

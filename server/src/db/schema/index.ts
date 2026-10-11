/**
 * The schema, in one import.
 *
 * `drizzle-kit` reads this directory to generate migrations, and the route
 * handlers import tables from here so a table is never defined twice.
 */

export * from "./enums.ts";
export * from "./columns.ts";
export * from "./taxonomy.ts";
export * from "./people.ts";
export * from "./quran.ts";
export * from "./hadith.ts";
export * from "./duas.ts";
export * from "./content.ts";
export * from "./qa.ts";
export * from "./community.ts";
export * from "./personal.ts";
export * from "./auth.ts";
export * from "./social.ts";
export * from "./admin.ts";

/**
 * Ilm — design tokens (React Native port).
 *
 * A direct translation of `src/app/globals.css` from the web app so the mobile
 * surfaces use the *same* palette, radii and elevation vocabulary. Emerald
 * carries the brand, gold is reserved for emphasis, and the dark theme is a deep
 * emerald-black rather than a dimmed light theme.
 *
 * Token names mirror the CSS custom properties (`--bg`, `--surface`, `--primary`,
 * …) so a value can be traced between the two codebases without a lookup table.
 */

export interface ThemeColors {
  bg: string;
  bgSubtle: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderStrong: string;
  overlay: string;

  fg: string;
  fgMuted: string;
  fgSubtle: string;
  fgInverted: string;

  primary: string;
  primaryHover: string;
  primarySoft: string;
  primarySoftFg: string;
  primaryFg: string;

  accent: string;
  accentHover: string;
  accentSoft: string;
  accentSoftFg: string;
  accentFg: string;

  success: string;
  successSoft: string;
  successSoftFg: string;
  warning: string;
  warningSoft: string;
  warningSoftFg: string;
  danger: string;
  dangerSoft: string;
  dangerSoftFg: string;
  info: string;
  infoSoft: string;
  infoSoftFg: string;

  roleAdmin: string;
  roleAdminSoft: string;
  roleScholar: string;
  roleScholarSoft: string;
  roleUser: string;
  roleUserSoft: string;

  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;

  /** Foreground used on top of a solid danger fill. */
  onDanger: string;
}

export const lightColors: ThemeColors = {
  bg: "#f5f4f0",
  bgSubtle: "#eeede8",
  surface: "#ffffff",
  surface2: "#fafaf8",
  surface3: "#f1f0eb",
  border: "#e7e5dc",
  borderStrong: "#d6d3c6",
  overlay: "rgba(11, 21, 17, 0.44)",

  fg: "#0e1a15",
  fgMuted: "#55655d",
  fgSubtle: "#8a968f",
  fgInverted: "#fbfaf7",

  primary: "#0a6b4c",
  primaryHover: "#08583e",
  primarySoft: "#e6f2ec",
  primarySoftFg: "#08553c",
  primaryFg: "#ffffff",

  accent: "#a67c22",
  accentHover: "#8d6918",
  accentSoft: "#f8eed6",
  accentSoftFg: "#7a5a12",
  accentFg: "#ffffff",

  success: "#0d7a4a",
  successSoft: "#e2f3ea",
  successSoftFg: "#0a5c37",
  warning: "#a9690a",
  warningSoft: "#fdefd7",
  warningSoftFg: "#7d4d08",
  danger: "#b13a35",
  dangerSoft: "#fbe8e6",
  dangerSoftFg: "#8b2b27",
  info: "#1c6a97",
  infoSoft: "#e3eff7",
  infoSoftFg: "#155477",

  roleAdmin: "#9c3d5c",
  roleAdminSoft: "#fae7ee",
  roleScholar: "#0a6b4c",
  roleScholarSoft: "#e6f2ec",
  roleUser: "#216a89",
  roleUserSoft: "#e4eff5",

  chart1: "#0a6b4c",
  chart2: "#a67c22",
  chart3: "#216a89",
  chart4: "#9c3d5c",
  chart5: "#5f7a34",

  onDanger: "#ffffff",
};

export const darkColors: ThemeColors = {
  bg: "#060e0b",
  bgSubtle: "#0a1611",
  surface: "#0e1c17",
  surface2: "#12241d",
  surface3: "#172d25",
  border: "#1e362d",
  borderStrong: "#2b4d40",
  overlay: "rgba(0, 0, 0, 0.66)",

  fg: "#eaf4ee",
  fgMuted: "#9cb0a6",
  fgSubtle: "#71877c",
  fgInverted: "#08130f",

  primary: "#3cb98a",
  primaryHover: "#52cd9d",
  primarySoft: "#10352a",
  primarySoftFg: "#86e3bb",
  primaryFg: "#04150f",

  accent: "#dfb65f",
  accentHover: "#eec97c",
  accentSoft: "#322817",
  accentSoftFg: "#f0d69b",
  accentFg: "#1d1507",

  success: "#43c684",
  successSoft: "#10352a",
  successSoftFg: "#8ce7b8",
  warning: "#e0a340",
  warningSoft: "#352a15",
  warningSoftFg: "#f3d091",
  danger: "#e0706a",
  dangerSoft: "#3a1d1b",
  dangerSoftFg: "#f2aca6",
  info: "#5daedd",
  infoSoft: "#112b39",
  infoSoftFg: "#a1d6f2",

  roleAdmin: "#e582a3",
  roleAdminSoft: "#3a1b26",
  roleScholar: "#3cb98a",
  roleScholarSoft: "#10352a",
  roleUser: "#71bcdd",
  roleUserSoft: "#112a35",

  chart1: "#3cb98a",
  chart2: "#dfb65f",
  chart3: "#71bcdd",
  chart4: "#e582a3",
  chart5: "#a6c06d",

  onDanger: "#ffffff",
};

/** Corner radii — a step squarer than soft blobs, matching the web theme. */
export const radius = {
  card: 10,
  panel: 12,
  pill: 999,
} as const;

/** Spacing scale used by the RN primitives. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;

/**
 * Elevation presets. React Native cannot express an inset highlight, so the
 * dominant drop shadow is translated and the highlight is dropped — the two-stop
 * soft shadow is what actually reads as depth.
 */
export type Elevation = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

export const lightElevation: Record<"card" | "raised" | "overlay" | "hero", Elevation> = {
  card: {
    shadowColor: "#0e1a15",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  raised: {
    shadowColor: "#0e1a15",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  overlay: {
    shadowColor: "#0e1a15",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  hero: {
    shadowColor: "#0e1a15",
    shadowOpacity: 0.34,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
};

export const darkElevation: Record<"card" | "raised" | "overlay" | "hero", Elevation> = {
  card: {
    shadowColor: "#000000",
    shadowOpacity: 0.4,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  raised: {
    shadowColor: "#000000",
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  overlay: {
    shadowColor: "#000000",
    shadowOpacity: 0.7,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  hero: {
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 20 },
    elevation: 18,
  },
};

/**
 * Type scale. Font families are resolved at runtime from the loaded Google
 * fonts (see `theme/fonts.ts`); these names are the family keys passed to
 * `fontFamily`.
 */
export const fontFamily = {
  /** Bangla body + Latin fallback — the app's default. */
  sans: "HindSiliguri_400Regular",
  sansMedium: "HindSiliguri_500Medium",
  sansSemibold: "HindSiliguri_600SemiBold",
  sansBold: "HindSiliguri_700Bold",
  /** Bangla display serif — headings. */
  display: "NotoSerifBengali_700Bold",
  displaySemibold: "NotoSerifBengali_600SemiBold",
  /** Quranic Arabic. */
  arabic: "Amiri_400Regular",
  arabicBold: "Amiri_700Bold",
} as const;

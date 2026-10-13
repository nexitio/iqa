import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

export type TextVariant =
  | "display" // Bangla display serif headings
  | "title" // card / section titles
  | "body" // default reading size
  | "small" // meta rows
  | "label" // uppercase eyebrow
  | "arabic" // Arabic UI text (RTL)
  | "quran"; // Qur'anic Arabic, generous leading

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Overrides the variant's default colour. */
  color?: string;
  /** Font weight override, mapped to the loaded family weights. */
  weight?: "regular" | "medium" | "semibold" | "bold";
  align?: "auto" | "left" | "center" | "right";
  /** Removes letter-spacing from a display face (Arabic must never be spaced). */
  tight?: boolean;
}

/**
 * One text primitive for the whole app.
 *
 * The web leans on CSS classes; in React Native the family must be named per
 * weight, so this component resolves both the family and the size/leading from
 * the design tokens in one place.
 */
export function Text({
  variant = "body",
  color,
  weight,
  align,
  tight,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const { colors, font } = theme;

  const base: Record<TextVariant, { fontFamily: string; fontSize: number; lineHeight: number; color: string }> = {
    display: { fontFamily: font.display, fontSize: 22, lineHeight: 30, color: colors.fg },
    title: { fontFamily: font.displaySemibold, fontSize: 16, lineHeight: 23, color: colors.fg },
    body: { fontFamily: font.sans, fontSize: 15, lineHeight: 24, color: colors.fg },
    small: { fontFamily: font.sans, fontSize: 12.5, lineHeight: 18, color: colors.fgMuted },
    label: { fontFamily: font.sansSemibold, fontSize: 11, lineHeight: 15, color: colors.fgSubtle },
    arabic: { fontFamily: font.arabic, fontSize: 22, lineHeight: 40, color: colors.fg },
    quran: { fontFamily: font.arabic, fontSize: 26, lineHeight: 56, color: colors.fg },
  };

  const weightFamily: Record<string, string> = {
    regular: font.sans,
    medium: font.sansMedium,
    semibold: font.sansSemibold,
    bold: font.sansBold,
  };

  const chosen = base[variant];

  return (
    <RNText
      style={[
        {
          fontFamily: weight ? weightFamily[weight] : chosen.fontFamily,
          fontSize: chosen.fontSize,
          lineHeight: chosen.lineHeight,
          color: color ?? chosen.color,
          textAlign: align,
          letterSpacing: variant === "label" ? 0.8 : tight ? -0.2 : 0,
          writingDirection: variant === "arabic" || variant === "quran" ? "rtl" : undefined,
          textTransform: variant === "label" ? "uppercase" : "none",
        },
        style,
      ]}
      {...rest}
    />
  );
}

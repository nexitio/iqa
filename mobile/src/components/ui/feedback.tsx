import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { softTone, solidTone, type Tone } from "../../theme/tone";
import { Text } from "./text";

export function Divider({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: theme.colors.border }, style]} />;
}

export function Spinner({ size = "small" }: { size?: "small" | "large" }) {
  const theme = useTheme();
  return <ActivityIndicator size={size} color={theme.colors.primary} />;
}

/** Dashed placeholder surface for empty slots. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "primary",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: Tone;
}) {
  const theme = useTheme();
  const palette = softTone(theme.colors)[tone];
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderRadius: theme.radius.panel,
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderStyle: "dashed",
        borderColor: theme.colors.borderStrong,
        backgroundColor: theme.colors.surface2,
      }}
    >
      {Icon ? (
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: palette.background,
          }}
        >
          <Icon size={20} color={palette.foreground} strokeWidth={1.9} />
        </View>
      ) : null}
      <Text variant="title">{title}</Text>
      {description ? (
        <Text variant="small" align="center" style={{ maxWidth: 320 }}>
          {description}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: 6 }}>{action}</View> : null}
    </View>
  );
}

/** Shimmering placeholder block matching the web's `shimmer-bg` utility. */
export function Skeleton({ width, height = 12, radius = 6, style }: { width?: number | `${number}%`; height?: number; radius?: number; style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View
      style={[
        { width: width ?? "100%", height, borderRadius: radius, backgroundColor: theme.colors.surface3 },
        style,
      ]}
    />
  );
}

export function ProgressBar({ value, tone = "primary", height = 6 }: { value: number; tone?: Tone; height?: number }) {
  const theme = useTheme();
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: theme.colors.surface3,
        overflow: "hidden",
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <View style={{ width: `${clamped}%`, height, borderRadius: height / 2, backgroundColor: solidTone(theme.colors)[tone] }} />
    </View>
  );
}

/**
 * Long-form scholar writing. Mirrors the web's `.prose-ilm` rhythm: generous
 * leading and a calm measure.
 */
export function Prose({ paragraphs }: { paragraphs: string[] }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 16 }}>
      {paragraphs.map((paragraph, index) => (
        <Text
          key={index}
          style={{ fontSize: 16, lineHeight: 30 }}
          color={theme.colors.fg}
        >
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

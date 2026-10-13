import { View, type ViewStyle } from "react-native";
import { BadgeCheck } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { initials } from "../../lib/utils";
import { Text } from "./text";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZES: Record<AvatarSize, { size: number; font: number; badge: number }> = {
  xs: { size: 24, font: 10, badge: 11 },
  sm: { size: 32, font: 11, badge: 13 },
  md: { size: 40, font: 13, badge: 15 },
  lg: { size: 48, font: 16, badge: 18 },
  xl: { size: 64, font: 22, badge: 22 },
  "2xl": { size: 96, font: 32, badge: 28 },
};

/**
 * Avatars are generated from the record's own colour plus initials, so no
 * portrait assets are needed and Bengali conjuncts render correctly.
 */
export function Avatar({
  name,
  color = "#0d6b4f",
  size = "md",
  verified = false,
  ring = false,
  style,
}: {
  name: string;
  color?: string;
  size?: AvatarSize;
  verified?: boolean;
  ring?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const dims = SIZES[size];
  return (
    <View style={[{ width: dims.size, height: dims.size }, style]}>
      <View
        style={{
          width: dims.size,
          height: dims.size,
          borderRadius: dims.size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: color,
          borderWidth: ring ? 2 : 0,
          borderColor: theme.colors.surface,
        }}
        accessibilityLabel={name}
      >
        <Text weight="semibold" style={{ fontSize: dims.font, lineHeight: dims.font + 4, color: "#ffffff" }}>
          {initials(name)}
        </Text>
      </View>
      {verified ? (
        <View style={{ position: "absolute", right: 0, bottom: 0 }}>
          <BadgeCheck size={dims.badge} color={theme.colors.primary} strokeWidth={2.6} fill={theme.colors.surface} />
        </View>
      ) : null}
    </View>
  );
}

/** Overlapping cluster, e.g. co-signing muftis on a fatwa. */
export function AvatarStack({
  people,
  max = 4,
  size = "sm",
}: {
  people: { name: string; color?: string }[];
  max?: number;
  size?: AvatarSize;
}) {
  const theme = useTheme();
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  const dims = SIZES[size];
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {shown.map((p, i) => (
        <Avatar
          key={`${p.name}-${i}`}
          name={p.name}
          color={p.color}
          size={size}
          ring
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }}
        />
      ))}
      {extra > 0 ? (
        <View
          style={{
            width: dims.size,
            height: dims.size,
            borderRadius: dims.size / 2,
            marginLeft: -8,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.surface3,
            borderWidth: 2,
            borderColor: theme.colors.surface,
          }}
        >
          <Text weight="semibold" style={{ fontSize: dims.font, color: theme.colors.fgMuted }}>
            +{extra}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

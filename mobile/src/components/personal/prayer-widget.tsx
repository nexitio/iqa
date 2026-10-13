import { StyleSheet, View } from "react-native";
import { Clock, Compass } from "lucide-react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { useNow } from "../../hooks/use-now";
import {
  computePrayerTimes,
  countdownBn,
  digits,
  distanceToMakkah,
  findDistrict,
  formatNumber,
  hijriDate,
  qiblaDirection,
} from "../../lib/bn";
import { CURRENT_USER } from "../../data/personal";
import { Text } from "../ui";

/**
 * The next salah is the most time-sensitive thing a reader checks on a page
 * they open several times a day, so it leads this card; the day's full schedule
 * sits underneath it.
 */
export function PrayerWidget() {
  const theme = useTheme();
  const { locale, pick } = useI18n();
  const now = useNow(20_000);

  const district = findDistrict(CURRENT_USER.district);
  const schedule = computePrayerTimes(district, now);
  const next = schedule.nextPrayer;
  const qibla = qiblaDirection(district);
  const distance = distanceToMakkah(district);

  return (
    <View
      style={[
        {
          borderRadius: theme.radius.panel,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
          overflow: "hidden",
        },
        theme.elevation.card,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Clock size={13} color={theme.colors.primary} />
            <Text variant="label" color={theme.colors.primary}>
              পরবর্তী নামাজ
            </Text>
          </View>
          <Text variant="display" style={{ fontSize: 20, marginTop: 2 }}>
            {pick(next.label)}
          </Text>
          <Text variant="small" style={{ marginTop: 1 }}>
            {countdownBn(next.minutesAway, locale)} · {digits(next.time, locale)}
          </Text>
        </View>
        <View
          style={{
            borderRadius: 12,
            backgroundColor: theme.colors.primarySoft,
            paddingHorizontal: 10,
            paddingVertical: 8,
            alignItems: "center",
          }}
        >
          <Text weight="bold" style={{ fontSize: 18, color: theme.colors.primarySoftFg }}>
            {digits(next.time, locale)}
          </Text>
          <Text style={{ fontSize: 10, color: theme.colors.primarySoftFg }}>{pick(schedule.district.name)}</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: theme.colors.border,
          paddingVertical: 12,
          paddingHorizontal: 8,
        }}
      >
        {schedule.times.map((time) => (
          <View key={time.name} style={{ flex: 1, alignItems: "center", gap: 3 }}>
            <Text
              weight={time.isCurrent ? "bold" : "medium"}
              style={{
                fontSize: 10.5,
                color: time.isCurrent ? theme.colors.primary : theme.colors.fgSubtle,
              }}
            >
              {pick(time.label)}
            </Text>
            <Text
              style={{
                fontSize: 12.5,
                color: time.isCurrent ? theme.colors.primary : time.passed ? theme.colors.fgSubtle : theme.colors.fg,
              }}
            >
              {digits(time.time, locale)}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          borderTopColor: theme.colors.border,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Compass size={14} color={theme.colors.accent} />
        <Text variant="small" style={{ flex: 1 }}>
          কিবলা {digits(qibla.toFixed(1), locale)}° · মক্কা {formatNumber(distance, locale)} কিমি ·{" "}
          {hijriDate(now, locale)}
        </Text>
      </View>
    </View>
  );
}

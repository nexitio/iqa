import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { HandHeart, Search } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { DUA_CATEGORIES, DUAS, duaSearchText, getDuasForCategory } from "../data/duas";
import { resolveIcon } from "../components/icons";
import { Chip, ChipList, EmptyState, PageHeader, Text } from "../components/ui";
import { DuaCard } from "../components/knowledge/cards";

export default function DuasScreen() {
  const theme = useTheme();
  const { t, pick } = useI18n();
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = category === "all" ? DUAS : getDuasForCategory(category);
    if (q) list = list.filter((dua) => duaSearchText(dua).includes(q));
    return list;
  }, [category, query]);

  return (
    <AppFrame back>
      <Screen>
        <PageHeader icon={HandHeart} eyebrow="দুআ" title={t("duas.title")} description={t("duas.subtitle")} patterned />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            height: 44,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Search size={17} color={theme.colors.fgSubtle} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="দুআ খুঁজুন (বাংলা বা ইংরেজি)…"
            placeholderTextColor={theme.colors.fgSubtle}
            style={{ flex: 1, color: theme.colors.fg, fontFamily: theme.font.sans, fontSize: 14 }}
          />
        </View>

        <ChipList contentStyle={{ paddingHorizontal: 2 }}>
          <Chip active={category === "all"} onPress={() => setCategory("all")}>
            সব
          </Chip>
          {DUA_CATEGORIES.map((cat) => {
            const Icon = resolveIcon(cat.icon);
            return (
              <Chip
                key={cat.slug}
                tone={cat.tone}
                icon={Icon}
                active={category === cat.slug}
                onPress={() => setCategory(cat.slug)}
              >
                {pick(cat.name)}
              </Chip>
            );
          })}
        </ChipList>

        {results.length === 0 ? (
          <EmptyState icon={HandHeart} title={t("frame.noResults")} />
        ) : (
          <View style={{ gap: 12 }}>
            {results.map((dua) => (
              <DuaCard key={dua.id} dua={dua} />
            ))}
          </View>
        )}
      </Screen>
    </AppFrame>
  );
}

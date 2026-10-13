import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Bookmark, BookOpen, FileText, Library, Scale, Sparkles } from "lucide-react-native";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import type { BookmarkKind } from "../../lib/types";
import { BOOKMARKS, BOOKMARK_COLLECTIONS, READING_PROGRESS } from "../../data/personal";
import { Badge, Chip, ChipList, PageHeader, ProgressBar, SectionHeader, Text } from "../../components/ui";
import type { Tone } from "../../theme/tone";

const KIND_META: Record<BookmarkKind, { label: string; icon: typeof Bookmark; tone: Tone }> = {
  ayah: { label: "আয়াত", icon: BookOpen, tone: "primary" },
  hadith: { label: "হাদীস", icon: Library, tone: "accent" },
  dua: { label: "দুআ", icon: Sparkles, tone: "warning" },
  article: { label: "প্রবন্ধ", icon: FileText, tone: "info" },
  fatwa: { label: "ফতোয়া", icon: Scale, tone: "danger" },
  answer: { label: "উত্তর", icon: Bookmark, tone: "success" },
  question: { label: "প্রশ্ন", icon: Bookmark, tone: "user" },
  discussion: { label: "আলোচনা", icon: Bookmark, tone: "neutral" },
};

export default function LibraryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, pick } = useI18n();

  return (
    <Screen>
      <PageHeader
        icon={Bookmark}
        eyebrow="সংরক্ষিত"
        title={t("library.title")}
        description={t("library.subtitle")}
        patterned
      />

      {/* collections */}
      <View style={{ gap: 8 }}>
        <SectionHeader icon={Library} title={t("library.collections")} size="sm" />
        <ChipList contentStyle={{ paddingHorizontal: 2 }}>
          {BOOKMARK_COLLECTIONS.map((collection) => (
            <Chip key={collection.id} tone={collection.tone as Tone} count={collection.count}>
              {collection.nameBn}
            </Chip>
          ))}
        </ChipList>
      </View>

      {/* continue reading */}
      <View style={{ gap: 12 }}>
        <SectionHeader icon={BookOpen} title={t("library.continueReading")} size="sm" />
        <View
          style={{
            borderRadius: theme.radius.panel,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            overflow: "hidden",
          }}
        >
          {READING_PROGRESS.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => router.push("/quran/2" as never)}
              style={{
                padding: 14,
                gap: 8,
                borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth * 2,
                borderTopColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <Text weight="semibold" style={{ flex: 1, fontSize: 14 }} numberOfLines={1}>
                  {item.titleBn}
                </Text>
                <Text variant="small" style={{ fontSize: 11.5 }}>
                  {item.progress}%
                </Text>
              </View>
              <Text variant="small" numberOfLines={1} style={{ fontSize: 12 }}>
                {item.resumeLabelBn}
              </Text>
              <ProgressBar value={item.progress} tone={item.kind === "journey" ? "accent" : "primary"} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* saved items */}
      <View style={{ gap: 12 }}>
        <SectionHeader icon={Bookmark} title="সংরক্ষিত" size="sm" />
        <View
          style={{
            borderRadius: theme.radius.panel,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            overflow: "hidden",
          }}
        >
          {BOOKMARKS.map((item, index) => {
            const meta = KIND_META[item.kind];
            const Icon = meta.icon;
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(item.href as never)}
                style={{
                  padding: 14,
                  gap: 6,
                  borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth * 2,
                  borderTopColor: theme.colors.border,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Badge tone={meta.tone} size="xs" icon={Icon}>
                    {meta.label}
                  </Badge>
                  <Text weight="semibold" style={{ flex: 1, fontSize: 14 }} numberOfLines={1}>
                    {item.titleBn}
                  </Text>
                </View>
                <Text variant="small" numberOfLines={2} style={{ lineHeight: 19 }}>
                  {item.previewBn}
                </Text>
                <Text weight="medium" style={{ fontSize: 11, color: meta.tone === "primary" ? theme.colors.primary : theme.colors.fgSubtle }}>
                  {item.refBn}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

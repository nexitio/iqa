import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, FileText, HelpCircle, MessageSquare, Scale, Scroll, Search as SearchIcon, Sparkles, X } from "lucide-react-native";
import { AppFrame } from "../components/layout/app-frame";
import { Screen } from "../components/layout/screen";
import { useTheme } from "../theme/ThemeProvider";
import { useI18n } from "../i18n";
import { toBnDigits } from "../lib/bn";
import { clampLines } from "../lib/utils";
import { ARTICLES, DISCUSSIONS, DUAS, FATWAS, HADITHS, QUESTIONS, QURAN_AYAHS, QURAN_SURAHS, SCHOLARS } from "../data";
import { Chip, ChipList, EmptyState, IconButton, SectionHeader, Text } from "../components/ui";

interface Hit {
  id: string;
  kind: "quran" | "hadith" | "article" | "fatwa" | "question" | "discussion" | "dua" | "scholar";
  title: string;
  subtitle: string;
  href: string;
}

const KIND_META: Record<Hit["kind"], { label: string; icon: typeof BookOpen }> = {
  quran: { label: "কুরআন", icon: BookOpen },
  hadith: { label: "হাদীস", icon: Scroll },
  article: { label: "প্রবন্ধ", icon: FileText },
  fatwa: { label: "ফতোয়া", icon: Scale },
  question: { label: "প্রশ্ন", icon: HelpCircle },
  discussion: { label: "আলোচনা", icon: MessageSquare },
  dua: { label: "দুআ", icon: Sparkles },
  scholar: { label: "আলেম", icon: Sparkles },
};

function buildIndex(): Hit[] {
  const hits: Hit[] = [];

  for (const surah of QURAN_SURAHS) {
    hits.push({
      id: `quran-${surah.number}`,
      kind: "quran",
      title: `সূরা ${surah.name.bn}`,
      subtitle: `${surah.meaning.bn} · ${toBnDigits(surah.ayahCount)} আয়াত`,
      href: `/quran/${surah.number}`,
    });
  }

  for (const ayah of QURAN_AYAHS) {
    hits.push({
      id: `ayah-${ayah.ref}`,
      kind: "quran",
      title: ayah.translationBn,
      subtitle: `${ayah.arabic.slice(0, 40)} · ${ayah.ref}`,
      href: `/quran/${ayah.surah}`,
    });
  }

  for (const hadith of HADITHS) {
    hits.push({
      id: `hadith-${hadith.id}`,
      kind: "hadith",
      title: hadith.translationBn,
      subtitle: `${hadith.collectionName.bn} · ${hadith.refBn}`,
      href: `/hadith/${hadith.collectionSlug}/${hadith.id}`,
    });
  }

  for (const article of ARTICLES) {
    hits.push({
      id: `article-${article.id}`,
      kind: "article",
      title: article.title.bn,
      subtitle: clampLines(article.excerpt.bn, 2),
      href: `/articles/${article.slug}`,
    });
  }

  for (const fatwa of FATWAS) {
    hits.push({
      id: `fatwa-${fatwa.id}`,
      kind: "fatwa",
      title: fatwa.questionBn,
      subtitle: clampLines(fatwa.rulingBn, 2),
      href: `/fatwas/${fatwa.slug}`,
    });
  }

  for (const question of QUESTIONS) {
    hits.push({
      id: `question-${question.id}`,
      kind: "question",
      title: question.titleBn,
      subtitle: clampLines(question.bodyBn, 2),
      href: `/questions/${question.slug}`,
    });
  }

  for (const discussion of DISCUSSIONS) {
    hits.push({
      id: `discussion-${discussion.id}`,
      kind: "discussion",
      title: discussion.titleBn,
      href: `/discussions/${discussion.slug}`,
      subtitle: clampLines(discussion.bodyBn, 2),
    });
  }

  for (const dua of DUAS) {
    hits.push({
      id: `dua-${dua.id}`,
      kind: "dua",
      title: dua.title.bn,
      subtitle: clampLines(dua.meaning.bn, 2),
      href: "/duas",
    });
  }

  for (const scholar of SCHOLARS) {
    hits.push({
      id: `scholar-${scholar.id}`,
      kind: "scholar",
      title: scholar.name.bn,
      subtitle: scholar.honorific.bn,
      href: `/scholars/${scholar.slug}`,
    });
  }

  return hits;
}

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Hit["kind"] | "all">("all");

  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [];
    return index
      .filter((hit) => (kind === "all" ? true : hit.kind === kind))
      .filter((hit) => `${hit.title} ${hit.subtitle}`.toLowerCase().includes(needle))
      .slice(0, 40);
  }, [index, query, kind]);

  const kinds: (Hit["kind"] | "all")[] = ["all", "quran", "hadith", "article", "fatwa", "question", "discussion", "dua", "scholar"];

  return (
    <AppFrame back>
      <Screen>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderRadius: theme.radius.pill,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 14,
            height: 46,
          }}
        >
          <SearchIcon size={18} color={theme.colors.fgSubtle} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("frame.searchPlaceholder")}
            placeholderTextColor={theme.colors.fgSubtle}
            autoFocus
            returnKeyType="search"
            style={{
              flex: 1,
              fontFamily: theme.font.sans,
              fontSize: 15,
              color: theme.colors.fg,
              paddingVertical: 10,
            }}
          />
          {query ? <IconButton icon={X} size={16} onPress={() => setQuery("")} accessibilityLabel="clear" /> : null}
        </View>

        <ChipList>
          {kinds.map((value) => (
            <Chip
              key={value}
              tone={value === "all" ? "primary" : "neutral"}
              active={kind === value}
              onPress={() => setKind(value)}
            >
              {value === "all" ? t("frame.all") : KIND_META[value].label}
            </Chip>
          ))}
        </ChipList>

        {query.trim().length < 2 ? (
          <EmptyState
            icon={SearchIcon}
            title={t("frame.searchPlaceholder")}
            description="অন্তত দুটি অক্ষর লিখুন — কুরআন, হাদীস, প্রবন্ধ, ফতোয়া ও আলেমদের মধ্যে খোঁজা হবে।"
          />
        ) : results.length === 0 ? (
          <EmptyState icon={SearchIcon} title={t("frame.noResults")} tone="warning" />
        ) : (
          <>
            <SectionHeader
              title={`${locale === "bn" ? toBnDigits(results.length) : results.length} ${t("frame.results")}`}
              size="sm"
            />
            <View
              style={{
                borderRadius: theme.radius.panel,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                overflow: "hidden",
              }}
            >
              {results.map((hit, index) => {
                const meta = KIND_META[hit.kind];
                const Icon = meta.icon;
                return (
                  <Pressable
                    key={hit.id}
                    onPress={() => router.push(hit.href as never)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      gap: 12,
                      padding: 14,
                      borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth * 2,
                      borderTopColor: theme.colors.border,
                      backgroundColor: pressed ? theme.colors.surface2 : "transparent",
                    })}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 11,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.primarySoft,
                      }}
                    >
                      <Icon size={16} color={theme.colors.primarySoftFg} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text weight="semibold" style={{ fontSize: 14 }} numberOfLines={2}>
                        {hit.title}
                      </Text>
                      <Text variant="small" numberOfLines={2}>
                        {hit.subtitle}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </Screen>
    </AppFrame>
  );
}

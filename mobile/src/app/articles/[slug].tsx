import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FileText } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { relativeTime } from "../../lib/utils";
import { ARTICLES } from "../../data/content";
import { getScholar, scholarDisplayName } from "../../data/scholars";
import { Avatar, Badge, EmptyState, PageHeader, Prose, SectionHeader, Text } from "../../components/ui";

export default function ArticleScreen() {
  const theme = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { pick, locale } = useI18n();
  const article = ARTICLES.find((a) => a.slug === slug);
  const author = article ? getScholar(article.authorId) : undefined;

  if (!article) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={FileText} title="প্রবন্ধটি পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={FileText}
          eyebrow={`${article.readingMinutes} মিনিটের পড়া · ${relativeTime(article.publishedAt, locale)}`}
          title={pick(article.title)}
          description={pick(article.excerpt)}
          patterned
        />

        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 18,
            },
            theme.elevation.card,
          ]}
        >
          <Prose paragraphs={article.bodyBn} />
        </View>

        {author ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: theme.radius.panel,
              borderWidth: StyleSheet.hairlineWidth * 2,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 14,
            }}
          >
            <Avatar name={author.name.bn} color={author.avatarColor} size="md" verified={author.verified} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text weight="semibold" style={{ fontSize: 14.5 }} numberOfLines={1}>
                {scholarDisplayName(author, locale)}
              </Text>
              <Text variant="small" numberOfLines={2} style={{ lineHeight: 18 }}>
                {pick(author.shortBio)}
              </Text>
            </View>
          </View>
        ) : null}

        <SectionHeader icon={FileText} title="তথ্য" size="sm" />
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="info" size="sm">
            {article.referenceCount} রেফারেন্স
          </Badge>
          <Badge tone="neutral" size="sm">
            {article.commentCount} মন্তব্য
          </Badge>
          <Badge tone="success" size="sm">
            {article.likeCount} সহায়ক
          </Badge>
        </View>
      </Screen>
    </AppFrame>
  );
}

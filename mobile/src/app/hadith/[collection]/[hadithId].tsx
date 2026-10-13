import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollText } from "lucide-react-native";
import { AppFrame } from "../../../components/layout/app-frame";
import { Screen } from "../../../components/layout/screen";
import { useTheme } from "../../../theme/ThemeProvider";
import { useI18n } from "../../../i18n";
import { getHadith, getHadithsByTopic } from "../../../data/hadith";
import { digits } from "../../../lib/bn";
import { Button, EmptyState, FactList, PageHeader, SectionHeader, Text } from "../../../components/ui";
import { HadithCard } from "../../../components/hadith/hadith-card";

const GRADE_LABEL: Record<string, string> = {
  sahih: "সহীহ",
  hasan: "হাসান",
  daif: "যঈফ",
  "muttafaqun-alaih": "মুত্তাফাকুন আলাইহি",
};

export default function HadithDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { hadithId } = useLocalSearchParams<{ hadithId: string }>();
  const { pick, locale } = useI18n();
  const hadith = getHadith(hadithId ?? "");

  if (!hadith) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={ScrollText} title="হাদীসটি পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  const related = getHadithsByTopic(hadith.topicIds[0] ?? "").filter((h) => h.id !== hadith.id).slice(0, 2);

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={ScrollText}
          eyebrow={pick(hadith.collectionName)}
          title={locale === "bn" ? hadith.refBn : hadith.refEn}
          patterned
        >
          <HadithCard hadith={hadith} compact />
        </PageHeader>

        <View
          style={[
            {
              borderRadius: theme.radius.panel,
              borderWidth: 1,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              padding: 16,
            },
            theme.elevation.card,
          ]}
        >
          <FactList
            columns={2}
            items={[
              { label: "সংকলন", value: pick(hadith.collectionName) },
              { label: "অধ্যায়", value: pick(hadith.bookName) },
              { label: "হাদীস নম্বর", value: digits(hadith.number, locale) },
              { label: "মান", value: GRADE_LABEL[hadith.grade] ?? hadith.grade },
              { label: "বর্ণনাকারী", value: pick(hadith.narrator) },
              { label: "সংকলনের হাদীস", value: digits(hadith.number, locale) },
            ]}
          />
        </View>

        <Button
          variant="outline"
          onPress={() => router.push(`/hadith/${hadith.collectionSlug}` as never)}
        >
          সম্পূর্ণ সংকলন দেখুন
        </Button>

        {related.length ? (
          <>
            <SectionHeader icon={ScrollText} title="সম্পর্কিত হাদীস" size="sm" />
            <View style={{ gap: 12 }}>
              {related.map((item) => (
                <HadithCard key={item.id} hadith={item} />
              ))}
            </View>
          </>
        ) : null}

        <Text variant="small" align="center">
          হাদীসটির আরবি টেক্সট প্রকাশিত সংকলন থেকে হুবহু নকল করা হয়েছে।
        </Text>
      </Screen>
    </AppFrame>
  );
}

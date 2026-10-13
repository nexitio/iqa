import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScrollText } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useTheme } from "../../theme/ThemeProvider";
import { useI18n } from "../../i18n";
import { formatNumber } from "../../lib/bn";
import { getBooksForCollection, getCollection, getHadithsForCollection } from "../../data/hadith";
import { Badge, Chip, ChipList, EmptyState, PageHeader, SectionHeader, Text } from "../../components/ui";
import { HadithCard } from "../../components/hadith/hadith-card";

export default function CollectionScreen() {
  const theme = useTheme();
  const { collection: slug } = useLocalSearchParams<{ collection: string }>();
  const { pick, locale } = useI18n();

  const collection = getCollection(slug ?? "");
  const hadiths = getHadithsForCollection(slug ?? "");
  const books = getBooksForCollection(slug ?? "");

  if (!collection) {
    return (
      <AppFrame back>
        <Screen>
          <EmptyState icon={ScrollText} title="সংকলন পাওয়া যায়নি" />
        </Screen>
      </AppFrame>
    );
  }

  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={ScrollText}
          eyebrow={pick(collection.author)}
          title={pick(collection.name)}
          description={pick(collection.description)}
          patterned
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: theme.font.display, fontSize: 20 }}>{collection.nameArabic}</Text>
            <Badge tone="success" size="xs" dot>
              {formatNumber(collection.hadithCount, locale)} হাদীস
            </Badge>
          </View>
        </PageHeader>

        {books.length ? (
          <View style={{ gap: 8 }}>
            <SectionHeader icon={ScrollText} title="অধ্যায়" size="sm" />
            <ChipList contentStyle={{ paddingHorizontal: 2 }}>
              {books.map((book) => (
                <Chip key={book.id} tone="neutral" count={book.hadithCount}>
                  {pick(book.name)}
                </Chip>
              ))}
            </ChipList>
          </View>
        ) : null}

        <SectionHeader icon={ScrollText} title="হাদীস" size="sm" description={`${hadiths.length} টি এই অ্যাপে`} />

        <View style={{ gap: 12 }}>
          {hadiths.map((hadith) => (
            <HadithCard key={hadith.id} hadith={hadith} />
          ))}

          {hadiths.length < collection.hadithCount ? (
            <View
              style={{
                borderRadius: theme.radius.panel,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderStyle: "dashed",
                borderColor: theme.colors.borderStrong,
                padding: 16,
              }}
            >
              <Text variant="small" align="center">
                সম্পূর্ণ সংকলনের পাঠ শীঘ্রই যোগ করা হবে। এই মুহূর্তে বাছাই করা হাদীসগুলো দেখানো হচ্ছে।
              </Text>
            </View>
          ) : null}
        </View>
      </Screen>
    </AppFrame>
  );
}

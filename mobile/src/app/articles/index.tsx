import { View } from "react-native";
import { FileText } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { useI18n } from "../../i18n";
import { ARTICLES } from "../../data/content";
import { PageHeader } from "../../components/ui";
import { ArticleCard } from "../../components/knowledge/cards";

export default function ArticlesScreen() {
  const { t } = useI18n();
  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={FileText}
          eyebrow="প্রবন্ধ"
          title="আলেমদের লেখা"
          description="গভীর ও দলিলভিত্তিক প্রবন্ধ — যাচাইকৃত আলেমদের কলম থেকে।"
          patterned
        />
        <View style={{ gap: 12 }}>
          {ARTICLES.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </View>
      </Screen>
    </AppFrame>
  );
}

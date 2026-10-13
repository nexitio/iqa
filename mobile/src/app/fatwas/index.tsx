import { View } from "react-native";
import { Scale } from "lucide-react-native";
import { AppFrame } from "../../components/layout/app-frame";
import { Screen } from "../../components/layout/screen";
import { FATWAS } from "../../data/content";
import { PageHeader } from "../../components/ui";
import { FatwaCard } from "../../components/knowledge/cards";

export default function FatwasScreen() {
  return (
    <AppFrame back>
      <Screen>
        <PageHeader
          icon={Scale}
          eyebrow="ফতোয়া"
          title="ফতোয়া সংকলন"
          description="মুফতিদের যাচাইকৃত রায় — প্রশ্ন, সংক্ষিপ্ত অভিমত ও দলিলসহ বিস্তারিত।"
          patterned
        />
        <View style={{ gap: 12 }}>
          {FATWAS.map((fatwa) => (
            <FatwaCard key={fatwa.id} fatwa={fatwa} />
          ))}
        </View>
      </Screen>
    </AppFrame>
  );
}

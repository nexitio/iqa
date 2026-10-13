import { View } from "react-native";
import { Link, Stack } from "expo-router";
import { Compass } from "lucide-react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Button, Text } from "../components/ui";

/** Expo Router's fallback: a calm dead end that always offers the way home. */
export default function NotFoundScreen() {
  const theme = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: "পাওয়া যায়নি" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 32,
          backgroundColor: theme.colors.bg,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.primarySoft,
          }}
        >
          <Compass size={26} color={theme.colors.primarySoftFg} strokeWidth={1.9} />
        </View>
        <Text variant="display" style={{ fontSize: 20, textAlign: "center" }}>
          পৃষ্ঠাটি পাওয়া যায়নি
        </Text>
        <Text variant="small" style={{ textAlign: "center", maxWidth: 300, lineHeight: 20 }}>
          আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরিয়ে ফেলা হয়েছে অথবা ঠিকানাটি ভুল।
        </Text>
        <View style={{ height: 6 }} />
        <Link href="/" asChild>
          <Button variant="primary">হোমে ফিরুন</Button>
        </Link>
      </View>
    </>
  );
}

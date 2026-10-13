import { useFonts } from "expo-font";
import {
  Amiri_400Regular,
  Amiri_700Bold,
} from "@expo-google-fonts/amiri";
import {
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from "@expo-google-fonts/hind-siliguri";
import {
  NotoSerifBengali_600SemiBold,
  NotoSerifBengali_700Bold,
} from "@expo-google-fonts/noto-serif-bengali";

/**
 * Font loading, mirroring the web's next/font choices:
 * Hind Siliguri for Bangla body copy, Noto Serif Bengali for the display face
 * and Amiri for Qur'anic Arabic.
 */
export function useAppFonts() {
  return useFonts({
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
    NotoSerifBengali_600SemiBold,
    NotoSerifBengali_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
  });
}

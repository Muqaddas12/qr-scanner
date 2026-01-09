import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TermsScreen() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  // Load saved theme
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("APP_THEME");
      if (saved === "light") setIsDark(false);
    })();
  }, []);

  const bg = isDark ? "#0B0B0B" : "#F9FAFB";
  const headerBg = isDark ? "#111" : "#FFFFFF";
  const textColor = isDark ? "#E5E7EB" : "#111827";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            height: 60,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: headerBg,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color={textColor} />
          </Pressable>

          <Text
            style={{
              color: textColor,
              fontSize: 18,
              fontWeight: "600",
              marginLeft: 16,
            }}
          >
            Terms & Conditions
          </Text>
        </View>

        {/* CONTENT */}
        <ScrollView style={{ padding: 16 }}>
          <Text style={{ ...textStyle, color: textColor }}>
            By using this application, you agree to use it only for lawful
            purposes.
          </Text>

          <Text style={{ ...textStyle, color: textColor }}>
            The app does not collect or transmit your personal data. All scan
            history is stored locally on your device.
          </Text>

          <Text style={{ ...textStyle, color: textColor }}>
            We are not responsible for external links or third-party content
            scanned through QR codes.
          </Text>

          <Text style={{ ...textStyle, color: textColor }}>
            These terms may change in future versions of the app.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const textStyle = {
  fontSize: 15,
  marginBottom: 12,
  lineHeight: 22,
};

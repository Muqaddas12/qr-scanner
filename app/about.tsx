import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AboutScreen() {
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
  const muted = isDark ? "#6B7280" : "#6B7280";

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
            About Us
          </Text>
        </View>

        {/* CONTENT */}
        <ScrollView style={{ padding: 16 }}>
          <Text style={{ ...textStyle, color: textColor }}>
            This QR Scanner app is designed to provide fast, secure, and
            offline-first scanning of QR codes and barcodes.
          </Text>

          <Text style={{ ...textStyle, color: textColor }}>
            You can scan QR codes, save history, mark favorites, share results,
            and manage everything locally on your device.
          </Text>

          <Text style={{ ...textStyle, color: textColor }}>
            Built with ❤️ using React Native and Expo.
          </Text>

          <Text style={{ ...versionStyle, color: muted }}>
            Version: 1.0.0
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

const versionStyle = {
  fontSize: 13,
  marginTop: 20,
};

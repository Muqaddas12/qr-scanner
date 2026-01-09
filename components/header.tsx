import React, { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  Linking,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Dimensions } from "react-native";
import {
  ScanLine,
  Heart,
  History,
  QrCode,
  PlusSquare,
  Settings,
  Share2,
  Image as ImageIcon,
  Store,
} from "lucide-react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { PanGestureHandler } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("screen");

type HeaderProps = {
  setMenuOpen: (value: boolean) => void;
};

export default function Header({ setMenuOpen }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isDark, setIsDark] = useState(true);

  /* ---------------- THEME ---------------- */

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("APP_THEME");
      if (saved === "light") setIsDark(false);
    })();
  }, []);

  const bg = isDark ? "#111" : "#FFFFFF";
  const text = isDark ? "#fff" : "#111827";
  const subText = isDark ? "#6B7280" : "#9CA3AF";
  const activeBg = isDark
    ? "rgba(0,255,204,0.15)"
    : "rgba(37,99,235,0.12)";

  /* ---------------- ANIMATION ---------------- */

  const translateX = useSharedValue(-width);

  useEffect(() => {
    translateX.value = withTiming(0, { duration: 250 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const closeDrawer = () => {
    translateX.value = withTiming(-width, { duration: 200 });
    setTimeout(() => setMenuOpen(false), 200);
  };

  /* ---------------- MENU ---------------- */

  const menuItems = [
    { label: "Scan", route: "/(tabs)", icon: ScanLine },
    { label: "Scan Images", route: null, icon: ImageIcon },
    { label: "Favorites", route: "/favorites", icon: Heart },
    { label: "History", route: "/history", icon: History },
    { label: "My QR", route: "/MyQRScreen", icon: QrCode },
    { label: "Create QR", route: "/(tabs)/GenerateQr", icon: PlusSquare },
    { label: "Settings", route: "/settings", icon: Settings },
    { label: "Share Our Apps", route: "share", icon: Store },
    { label: "Our Apps", route: "Ourapps", icon: Share2 },
  ];

  return (
    <>
      {/* OVERLAY */}
      <Pressable style={styles.overlay} onPress={closeDrawer} />

      {/* DRAWER */}
      <PanGestureHandler
        onGestureEvent={(e) => {
          if (e.nativeEvent.translationX < -80) {
            closeDrawer();
          }
        }}
      >
        <Animated.View
          style={[
            styles.drawer,
            animatedStyle,
            { backgroundColor: bg },
          ]}
        >
          {/* HEADER */}
          <View style={styles.drawerHeader}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={[styles.drawerTitle, { color: text }]}>
              QR & Barcode Scanner
            </Text>
          </View>

          {/* MENU ITEMS */}
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              (item.label === "Scan" &&
                (pathname === "/" ||
                  pathname === "/(tabs)" ||
                  pathname.includes("index"))) ||
              (item.label === "Create QR" &&
                pathname.includes("GenerateQr")) ||
              (item.route &&
                !item.route.includes("(tabs)") &&
                pathname.startsWith(item.route));

            return (
              <Pressable
                key={item.label}
                style={[
                  styles.drawerItem,
                  isActive && { backgroundColor: activeBg },
                ]}
                onPress={() => {
                  closeDrawer();

                  if (item.route === "Ourapps") {
                    Linking.openURL(
                      "https://play.google.com/store/apps/developer?id=MTBYOWN"
                    );
                    return;
                  }

                  if (item.route === "share") {
                    Alert.alert(item.label, "Coming Soon");
                    return;
                  }

                  if (!item.route) {
                    Alert.alert(item.label, "Coming soon");
                    return;
                  }

                  router.push(item.route as any);
                }}
              >
                <Icon
                  size={22}
                  color={isActive ? "#00ffcc" : text}
                  style={{ marginRight: 12 }}
                />

                <Text
                  style={[
                    styles.drawerText,
                    { color: text },
                    isActive && styles.activeText,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}

          {/* VERSION */}
          <View style={styles.versionBox}>
            <Text style={[styles.versionText, { color: subText }]}>
              Version 1.0.0
            </Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 50,
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "75%",
    height: height,
    paddingTop: 50,
    zIndex: 100,
  },

  drawerHeader: {
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginBottom: 10,
  },

  drawerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  activeText: {
    color: "#00ffcc",
    fontWeight: "600",
  },

  drawerText: {
    fontSize: 16,
  },

  versionBox: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },

  versionText: {
    fontSize: 13,
  },
});

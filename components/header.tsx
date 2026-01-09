import React, { useEffect } from "react";
import {
  Pressable,
  View,
  Text,
  Share,
  Alert,
  StyleSheet,
  Image,
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
} from "lucide-react-native";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { PanGestureHandler } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("screen");

type HeaderProps = {
  setMenuOpen: (value: boolean) => void;
};

export default function Header({ setMenuOpen }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

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

  const menuItems = [
    { label: "Scan", route: "/(tabs)", icon: ScanLine },
    { label: "Scan Images", route: null, icon: ImageIcon },
    { label: "Favorites", route: "/favorites", icon: Heart },
    { label: "History", route: "/history", icon: History },
    { label: "My QR", route: "/MyQRScreen", icon: QrCode },
    { label: "Create QR", route: "/(tabs)/GenerateQr", icon: PlusSquare },
    { label: "Settings", route: "/settings", icon: Settings },
    { label: "Share our app", route: "share", icon: Share2 },
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
        <Animated.View style={[styles.drawer, animatedStyle]}>

          {/* APP LOGO */}
          <View style={styles.drawerHeader}>
            <Image
              source={require("@/assets/images/logo.png")} 
              style={styles.logo}
            />
            <Text style={styles.drawerTitle}>
              QR & Barcode Scanner
            </Text>
          </View>

          {/* MENU ITEMS */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
  (item.label === "Scan" &&
    (pathname === "/" || pathname === "/(tabs)" || pathname.includes("index"))) ||
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
                  isActive && styles.activeItem,
                ]}
                onPress={() => {
                  closeDrawer();

                  if (item.route === "share") {
                    Share.share({
                      message: "Check out this QR Scanner app!",
                    });
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
                  color={isActive ? "#00ffcc" : "#fff"}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.drawerText,
                    isActive && styles.activeText,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}

          {/* VERSION INFO */}
          <View style={styles.versionBox}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>

        </Animated.View>
      </PanGestureHandler>
    </>
  );
}
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
    backgroundColor: "#111",
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
    color: "#fff",
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

  activeItem: {
    backgroundColor: "rgba(0,255,204,0.15)",
  },

  drawerText: {
    color: "#fff",
    fontSize: 16,
  },

  activeText: {
    color: "#00ffcc",
    fontWeight: "600",
  },

  versionBox: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    alignItems: "center",
  },

  versionText: {
    color: "#6B7280",
    fontSize: 13,
  },
});

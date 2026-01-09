import React from "react";
import {
  Pressable,
  View,
  Text,
  Share,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, usePathname } from "expo-router";

import {
  ScanLine,
  Heart,
  History,
  QrCode,
  PlusSquare,
  Settings,
  Share2,
  Image,
} from "lucide-react-native";

type HeaderProps = {
  setMenuOpen: (value: boolean) => void;
};

export default function Header({ setMenuOpen }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname(); // 👈 get current route

  const menuItems = [
    { label: "Scan", route: "/(tabs)", icon: ScanLine },
    { label: "Scan Images", route: null, icon: Image },
    { label: "Favorites", route: "/favorites", icon: Heart },
    { label: "History", route: "/history", icon: History },
    { label: "My QR", route: "/MyQRScreen", icon: QrCode },
    { label: "Create QR", route: "/(tabs)/GenerateQr", icon: PlusSquare },
    { label: "Settings", route: "/settings", icon: Settings },
    { label: "Share our app", route: "share", icon: Share2 },
  ];

  return (
    <>
      <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)} />

      <View style={styles.drawer}>
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.route && pathname.startsWith(item.route);

          return (
            <Pressable
              key={item.label}
              style={[
                styles.drawerItem,
                isActive && styles.activeItem,
              ]}
              onPress={() => {
                setMenuOpen(false);

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
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex:50,
  },

  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "75%",
    height: "100%",
    backgroundColor: "#111",
    paddingTop: 80,
    paddingHorizontal: 20,
    zIndex:100,
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex:100,
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
});

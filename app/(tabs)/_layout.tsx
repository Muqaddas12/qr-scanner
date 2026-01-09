import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ScanLine, QrCode } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => (
            <ScanLine color={color} size={size ?? 28} />
          ),
        }}
      />

      <Tabs.Screen
        name="GenerateQr"
        options={{
          title: 'Generate QR',
          tabBarIcon: ({ color, size }) => (
            <QrCode color={color} size={size ?? 28} />
          ),
        }}
      />
    </Tabs>
  );
}

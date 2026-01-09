import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { ScanLine, QrCode } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const systemScheme = useColorScheme(); // 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  // Load saved theme
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('APP_THEME');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
      } else {
        setTheme(systemScheme ?? 'light');
      }
    })();
  }, [systemScheme]);

  // Fallback while loading
  const activeTheme = theme ?? (systemScheme ?? 'light');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarActiveTintColor: Colors[activeTheme].tint,
        tabBarInactiveTintColor:
          activeTheme === 'dark' ? '#9CA3AF' : '#6B7280',

        tabBarStyle: {
          backgroundColor:
            activeTheme === 'dark' ? '#0B0B0B' : '#FFFFFF',
          borderTopColor:
            activeTheme === 'dark' ? '#111' : '#E5E7EB',
        },
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

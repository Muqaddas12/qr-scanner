import { View, Text, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/header';
import { Menu, Sun, Moon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Load saved theme
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('APP_THEME');
      if (saved === 'light') setIsDark(false);
    })();
  }, []);

  // Toggle theme
  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem(
      'APP_THEME',
      newTheme ? 'dark' : 'light'
    );
  };

  const bg = isDark ? '#0B0B0B' : '#F9FAFB';
  const card = isDark ? '#161616' : '#FFFFFF';
  const text = isDark ? '#E5E7EB' : '#111827';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* HEADER */}
      <View
        style={{
          height: 60,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#111' : '#FFFFFF',
        }}
      >
        <Pressable onPress={() => setMenuOpen(true)}>
          <Menu size={26} color={text} />
        </Pressable>

        <Text
          style={{
            color: text,
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 16,
          }}
        >
          Settings
        </Text>
      </View>

      {/* SIDEBAR */}
      {menuOpen && <Header setMenuOpen={setMenuOpen} />}

      {/* CONTENT */}
      <View style={{ padding: 16 }}>

        {/* THEME TOGGLE */}
        <View
          style={{
            backgroundColor: card,
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {isDark ? (
              <Moon size={20} color={text} />
            ) : (
              <Sun size={20} color={text} />
            )}
            <Text style={{ color: text, fontSize: 16 }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? '#22C55E' : '#E5E7EB'}
          />
        </View>

        {/* ABOUT */}
        <Pressable
          style={{
            backgroundColor: card,
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
          onPress={() => router.push('/about')}
        >
          <Text style={{ color: text, fontSize: 16 }}>About Us</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>

        {/* TERMS */}
        <Pressable
          style={{
            backgroundColor: card,
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => router.push('/terms')}
        >
          <Text style={{ color: text, fontSize: 16 }}>
            Terms & Conditions
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

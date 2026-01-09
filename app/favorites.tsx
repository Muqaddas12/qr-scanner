import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
  Share,
  Platform,
  ToastAndroid,
  TextInput,
} from 'react-native';
import { Menu } from 'lucide-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/header';

type FavoriteItem = {
  id: string;
  data: string;
  type: string;
  time: string;
  favorite?: boolean;
};

type SortType = 'date-desc' | 'date-asc' | 'type';

export default function FavoritesScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortType>('date-desc');

  const [selected, setSelected] = useState<string[]>([]);

  const [isDark, setIsDark] = useState(true);

  /* ---------------- THEME ---------------- */

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('APP_THEME');
      if (saved === 'light') setIsDark(false);
    })();
  }, []);

  const bg = isDark ? '#0B0B0B' : '#F9FAFB';
  const headerBg = isDark ? '#111' : '#FFFFFF';
  const card = isDark ? '#161616' : '#FFFFFF';
  const text = isDark ? '#E5E7EB' : '#111827';
  const muted = '#6B7280';

  /* ---------------- TOAST ---------------- */

  const toast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      alert(msg);
    }
  };

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const [scanStored, createdStored] = await Promise.all([
      AsyncStorage.getItem('SCAN_HISTORY'),
      AsyncStorage.getItem('CREATED_QR'),
    ]);

    const scanHistory: FavoriteItem[] = scanStored
      ? JSON.parse(scanStored)
      : [];

    const createdHistory: FavoriteItem[] = createdStored
      ? JSON.parse(createdStored)
      : [];

    const favorites = [...scanHistory, ...createdHistory]
      .map((i) => ({
        ...i,
        favorite: i.favorite ?? false,
      }))
      .filter((i) => i.favorite);

    setFavorites(favorites);
    setSelected([]);
  };

  /* ---------------- SORT + SEARCH ---------------- */

  const processed = favorites
    .filter((i) =>
      i.data.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'date-desc') return +new Date(b.time) - +new Date(a.time);
      if (sort === 'date-asc') return +new Date(a.time) - +new Date(b.time);
      if (sort === 'type') return a.type.localeCompare(b.type);
      return 0;
    });

  /* ---------------- SELECTION ---------------- */

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  /* ---------------- ACTIONS ---------------- */

  const removeFavorites = async (ids: string[]) => {
    const stored = await AsyncStorage.getItem('SCAN_HISTORY');
    if (!stored) return;

    const history = JSON.parse(stored);
    const updated = history.map((i: FavoriteItem) =>
      ids.includes(i.id) ? { ...i, favorite: false } : i
    );

    await AsyncStorage.setItem('SCAN_HISTORY', JSON.stringify(updated));
    toast('Removed from favorites');
    loadFavorites();
  };

  const exportFavorites = async () => {
    const list =
      selected.length > 0
        ? favorites.filter((i) => selected.includes(i.id))
        : favorites;

    if (!list.length) return;

    const text = list
      .map(
        (i) =>
          `${i.type}\n${i.data}\n${new Date(i.time).toLocaleString()}`
      )
      .join('\n----------------\n');

    await Share.share({ message: text });
  };

  /* ---------------- UI ---------------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* HEADER */}
      <View
        style={{
          height: 60,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: headerBg,
        }}
      >
        <Pressable onPress={() => setMenuOpen(true)}>
          <Menu size={26} color={text} />
        </Pressable>

        <Text style={{ color: text, fontSize: 18, fontWeight: '600' }}>
          {selected.length ? `${selected.length} selected` : 'Favorites'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Pressable onPress={exportFavorites}>
            <Ionicons name="share-outline" size={22} color={text} />
          </Pressable>

          {selected.length > 0 && (
            <Pressable onPress={() => removeFavorites(selected)}>
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
            </Pressable>
          )}
        </View>
      </View>

      {/* DRAWER */}
      {menuOpen && <Header setMenuOpen={setMenuOpen} />}

      {/* SEARCH */}
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder="Search favorites..."
          placeholderTextColor={muted}
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: card,
            color: text,
            padding: 12,
            borderRadius: 10,
          }}
        />
      </View>

      {/* SORT */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingBottom: 10,
        }}
      >
        {[
          { label: 'Newest', value: 'date-desc' },
          { label: 'Oldest', value: 'date-asc' },
          { label: 'Type', value: 'type' },
        ].map((s) => (
          <Pressable
            key={s.value}
            onPress={() => setSort(s.value as SortType)}
          >
            <Text
              style={{
                color: sort === s.value ? '#22C55E' : muted,
              }}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={processed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadFavorites();
              setRefreshing(false);
            }}
            tintColor="#EF4444"
          />
        }
        ListEmptyComponent={
          <Text
            style={{
              color: muted,
              textAlign: 'center',
              marginTop: 40,
            }}
          >
            No favorites
          </Text>
        }
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);

          return (
            <Pressable
              onLongPress={() => toggleSelect(item.id)}
              onPress={() =>
                selected.length
                  ? toggleSelect(item.id)
                  : router.push({
                      pathname: '/scan-result',
                      params: {
                        result: item.data,
                        type: item.type,
                      },
                    })
              }
              style={{
                backgroundColor: isSelected ? '#1F2937' : card,
                padding: 14,
                borderRadius: 12,
                marginBottom: 12,
                borderWidth: isSelected ? 1 : 0,
                borderColor: '#22C55E',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ color: '#22C55E', fontSize: 13 }}>
                  {item.type}
                </Text>

                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#22C55E"
                  />
                )}
              </View>

              <Text
                style={{ color: text, fontSize: 15 }}
                numberOfLines={2}
              >
                {item.data}
              </Text>

              <Text
                style={{
                  color: muted,
                  fontSize: 12,
                  marginTop: 6,
                }}
              >
                {new Date(item.time).toLocaleString()}
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

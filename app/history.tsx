import { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  TextInput,
  Share,
  RefreshControl,
  Platform,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

type HistoryItem = {
  id: string;
  data: string;
  type: string;
  time: string;
  favorite?: boolean;
};

type Section = {
  title: string;
  data: HistoryItem[];
};

export default function HistoryScreen() {
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const openSwipeRef = useRef<Swipeable | null>(null);

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
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem('SCAN_HISTORY');
    setHistory(stored ? JSON.parse(stored) : []);
    setSelected([]);
  };

  const saveHistory = async (items: HistoryItem[]) => {
    setHistory(items);
    await AsyncStorage.setItem('SCAN_HISTORY', JSON.stringify(items));
  };

  /* ---------------- HELPERS ---------------- */

  const isToday = (date: Date) => {
    const d = new Date();
    return date.toDateString() === d.toDateString();
  };

  const isYesterday = (date: Date) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return date.toDateString() === d.toDateString();
  };

  /* ---------------- FILTER + GROUP ---------------- */

  const groupedData: Section[] = useMemo(() => {
    const filtered = history.filter((i) =>
      i.data.toLowerCase().includes(search.toLowerCase())
    );

    const today: HistoryItem[] = [];
    const yesterday: HistoryItem[] = [];
    const older: HistoryItem[] = [];

    filtered.forEach((item) => {
      const date = new Date(item.time);
      if (isToday(date)) today.push(item);
      else if (isYesterday(date)) yesterday.push(item);
      else older.push(item);
    });

    return [
      today.length && { title: 'Today', data: today },
      yesterday.length && { title: 'Yesterday', data: yesterday },
      older.length && { title: 'Older', data: older },
    ].filter(Boolean) as Section[];
  }, [history, search]);

  /* ---------------- ACTIONS ---------------- */

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  const deleteItem = (id: string) => {
    const updated = history.filter((i) => i.id !== id);
    saveHistory(updated);
    toast('Deleted');
    openSwipeRef.current?.close();
  };

  const toggleFavorite = (id: string) => {
    const updated = history.map((i) =>
      i.id === id ? { ...i, favorite: !i.favorite } : i
    );
    saveHistory(updated);
    toast(
      updated.find((i) => i.id === id)?.favorite
        ? 'Added to Favorites'
        : 'Removed from Favorites'
    );
  };

  const exportHistory = async () => {
    const list =
      selected.length > 0
        ? history.filter((i) => selected.includes(i.id))
        : history;

    if (!list.length) return;

    const text = list
      .map(
        (i) =>
          `${i.type}\n${i.data}\n${new Date(i.time).toLocaleString()}`
      )
      .join('\n----------------\n');

    await Share.share({ message: text });
  };

  const clearHistory = () => {
    Alert.alert('Clear History', 'Delete all scan history?', [
      { text: 'Cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('SCAN_HISTORY');
          setHistory([]);
          setSelected([]);
          toast('History cleared');
        },
      },
    ]);
  };

  /* ---------------- RENDER ITEM ---------------- */

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const isSelected = selected.includes(item.id);

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            if (openSwipeRef.current && openSwipeRef.current !== ref) {
              openSwipeRef.current.close();
            }
            openSwipeRef.current = ref;
          }
        }}
        renderRightActions={() => (
          <Pressable
            onPress={() => deleteItem(item.id)}
            style={{
              backgroundColor: '#DC2626',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
              marginBottom: 12,
              borderRadius: 12,
            }}
          >
            <Ionicons name="trash" size={22} color="#fff" />
          </Pressable>
        )}
      >
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
            backgroundColor: isSelected ? '#1F2937' : '#161616',
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
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#22C55E', fontSize: 13 }}>
              {item.type}
            </Text>

            <View style={{ flexDirection: 'row', gap: 14 }}>
              <Pressable onPress={() => toggleFavorite(item.id)}>
                <Ionicons
                  name={item.favorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={item.favorite ? '#EF4444' : '#fff'}
                />
              </Pressable>

              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#22C55E"
                />
              )}
            </View>
          </View>

          <Text
            style={{ color: '#E5E7EB', fontSize: 15 }}
            numberOfLines={2}
          >
            {item.data}
          </Text>

          <Text
            style={{
              color: '#6B7280',
              fontSize: 12,
              marginTop: 6,
            }}
          >
            {new Date(item.time).toLocaleString()}
          </Text>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0B' }}>
      {/* HEADER */}
      <View
        style={{
          height: 60,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#111',
        }}
      >
        <Pressable
          onPress={() =>
            selected.length ? clearSelection() : router.back()
          }
        >
          <Ionicons
            name={selected.length ? 'close' : 'arrow-back'}
            size={26}
            color="#fff"
          />
        </Pressable>

        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
          {selected.length
            ? `${selected.length} selected`
            : 'History'}
        </Text>

        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Pressable onPress={exportHistory}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </Pressable>

          {!selected.length && (
            <Pressable onPress={clearHistory}>
              <Ionicons name="trash-outline" size={22} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

      {/* SEARCH */}
      <View style={{ padding: 16 }}>
        <TextInput
          placeholder="Search history..."
          placeholderTextColor="#6B7280"
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: '#161616',
            color: '#fff',
            padding: 12,
            borderRadius: 10,
          }}
        />
      </View>

      {/* LIST */}
      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.title}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadHistory();
              setRefreshing(false);
            }}
            tintColor="#22C55E"
          />
        }
        renderItem={({ item }) => (
          <View>
            <Text
              style={{
                color: '#9CA3AF',
                marginLeft: 16,
                marginBottom: 8,
              }}
            >
              {item.title}
            </Text>

            {item.data.map((row) => (
              <View key={row.id}>{renderItem({ item: row })}</View>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

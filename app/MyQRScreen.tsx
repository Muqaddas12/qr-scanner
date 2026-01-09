import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Alert,
  TextInput,
  Share,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import Header from '@/components/header';
import { Menu } from 'lucide-react-native';
type QRItem = {
  id: string;
  data: string;
  type: string;
  time: string;
  favorite?: boolean;
};

export default function MyQRScreen() {
  const router = useRouter();
  const qrRef = useRef<any>(null);
const [menuOpen,setMenuOpen]=useState(false)
  const [list, setList] = useState<QRItem[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortNewest, setSortNewest] = useState(true);

  const loadQR = async () => {
    const stored = await AsyncStorage.getItem('CREATED_QR');
    setList(stored ? JSON.parse(stored) : []);
  };

  useEffect(() => {
    loadQR();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQR();
    setRefreshing(false);
  }, []);

  const persist = async (data: QRItem[]) => {
    setList(data);
    await AsyncStorage.setItem('CREATED_QR', JSON.stringify(data));
  };

  const deleteQR = (id: string) => {
    Alert.alert('Delete', 'Remove this QR?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => persist(list.filter(i => i.id !== id)),
      },
    ]);
  };

  const toggleFavorite = (id: string) => {
    const updated = list.map(i =>
      i.id === id ? { ...i, favorite: !i.favorite } : i
    );
    persist(updated);
  };

  const shareQR = async (text: string) => {
    await Share.share({ message: text });
  };

  const downloadQR = async (id: string) => {
    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) return;

    qrRef.current?.toDataURL(async (data: string) => {
      const path = FileSystem.cacheDirectory + `${id}.png`;
      await FileSystem.writeAsStringAsync(path, data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await MediaLibrary.saveToLibraryAsync(path);
      Alert.alert('Saved', 'QR image saved to gallery');
    });
  };

  const editQR = (item: QRItem) => {
    router.push({
  pathname: '/edit-qr',
  params: { editId: item.id },
});

  };

  const filtered = list
    .filter(i =>
      i.data.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortNewest
        ? new Date(b.time).getTime() - new Date(a.time).getTime()
        : new Date(a.time).getTime() - new Date(b.time).getTime()
    );

  const renderItem = ({ item }: { item: QRItem }) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
      }}
    >
      {/* TOP ROW */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <View
          style={{
            backgroundColor: '#E5E7EB',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 12 }}>{item.type}</Text>
        </View>

        <Pressable onPress={() => toggleFavorite(item.id)}>
          <Ionicons
            name={item.favorite ? 'heart' : 'heart-outline'}
            size={20}
            color="#EF4444"
          />
        </Pressable>
      </View>

      <View style={{ alignItems: 'center' }}>
        <QRCode
          value={item.data}
          size={140}
          getRef={c => (qrRef.current = c)}
        />
      </View>

      <Text
        numberOfLines={2}
        style={{ marginTop: 8, fontSize: 13 }}
      >
        {item.data}
      </Text>

      {/* ACTIONS */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <Pressable onPress={() => editQR(item)}>
          <Ionicons name="create-outline" size={22} color="#2563EB" />
        </Pressable>

        <Pressable onPress={() => shareQR(item.data)}>
          <Ionicons
            name="share-social-outline"
            size={22}
            color="#16A34A"
          />
        </Pressable>

        <Pressable onPress={() => downloadQR(item.id)}>
          <Ionicons name="download-outline" size={22} color="#7C3AED" />
        </Pressable>

        <Pressable onPress={() => deleteQR(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#DC2626" />
        </Pressable>
      </View>
    </View>
  );

  return (
 <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0B' }}>

  {/* HEADER BAR */}
  <View
    style={{
      height: 60,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#111',
    }}
  >
    <Pressable onPress={() => setMenuOpen(true)}>
      <Menu size={26} color="#fff" />
    </Pressable>

    <Text
      style={{
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 16,
        flex: 1,
      }}
    >
      My QR Codes
    </Text>

    <Pressable onPress={() => setSortNewest(!sortNewest)}>
      <Ionicons
        name={sortNewest ? 'time-outline' : 'swap-vertical-outline'}
        size={22}
        color="#fff"
      />
    </Pressable>
  </View>

  {/* SIDEBAR / DRAWER */}
  {menuOpen && <Header setMenuOpen={setMenuOpen} />}

  {/* SEARCH */}
  <View style={{ padding: 16 }}>
    <TextInput
      placeholder="Search QR..."
      placeholderTextColor="#9CA3AF"
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
    data={filtered}
    keyExtractor={(i) => i.id}
    renderItem={renderItem}
    contentContainerStyle={{ padding: 16 }}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
    ListEmptyComponent={
      <Text
        style={{
          color: '#9CA3AF',
          textAlign: 'center',
          marginTop: 40,
        }}
      >
        No saved QR codes
      </Text>
    }
  />

</SafeAreaView>

  );
}

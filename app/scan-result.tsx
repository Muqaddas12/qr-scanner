import {
  View,
  Text,
  Pressable,
  ScrollView,
  Share,
  Platform,
  ToastAndroid,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState, useMemo } from 'react';

export default function ScanResult() {
  const { result, type = 'QR Code' } = useLocalSearchParams();
  const router = useRouter();

  const [favorite, setFavorite] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  const data = String(result || '');

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
  const resultBg = isDark ? '#111' : '#F3F4F6';
  const text = isDark ? '#E5E7EB' : '#111827';
  const muted = '#9CA3AF';

  /* ---------------- HELPERS ---------------- */

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      alert(msg);
    }
  };

  /* ---------------- AUTO DETECT ---------------- */

  const detected = useMemo(() => {
    const urlRegex = /^https?:\/\/.+/i;
    const upiRegex = /^upi:\/\/pay/i;

    if (upiRegex.test(data)) return 'UPI';
    if (urlRegex.test(data)) return 'URL';
    return 'TEXT';
  }, [data]);

  /* ---------------- FAVORITE CHECK ---------------- */

  useEffect(() => {
    checkFavorite();
  }, []);

  const checkFavorite = async () => {
    const stored = await AsyncStorage.getItem('SCAN_HISTORY');
    if (!stored) return;

    const history = JSON.parse(stored);
    const found = history.find((i: any) => i.data === data);
    if (found?.favorite) setFavorite(true);
  };

  /* ---------------- TOGGLE FAVORITE ---------------- */

  const toggleFavorite = async () => {
    const [scanStored, createdStored] = await Promise.all([
      AsyncStorage.getItem('SCAN_HISTORY'),
      AsyncStorage.getItem('CREATED_QR'),
    ]);

    const scanHistory = scanStored ? JSON.parse(scanStored) : [];
    const createdHistory = createdStored ? JSON.parse(createdStored) : [];

    const alreadyFavInScan = scanHistory.find(
      (i: any) => i.data === data && i.favorite
    );

    const alreadyFavInCreated = createdHistory.find(
      (i: any) => i.data === data && i.favorite
    );

    if (alreadyFavInScan || alreadyFavInCreated) {
      showToast('Already in Favorites');
      setFavorite(true);
      return;
    }

    const index = scanHistory.findIndex((i: any) => i.data === data);

    if (index !== -1) {
      scanHistory[index].favorite = true;
    } else {
      scanHistory.unshift({
        id: Date.now().toString(),
        type,
        data,
        time: new Date().toISOString(),
        favorite: true,
      });
    }

    await AsyncStorage.setItem(
      'SCAN_HISTORY',
      JSON.stringify(scanHistory)
    );

    setFavorite(true);
    showToast('Added to Favorites');
  };

  /* ---------------- ACTIONS ---------------- */

  const copyResult = async () => {
    await Clipboard.setStringAsync(data);
    showToast('Copied to clipboard');
  };

  const shareResult = async () => {
    await Share.share({ message: data });
  };

  const openDetected = async () => {
    if (detected === 'URL' || detected === 'UPI') {
      const supported = await Linking.canOpenURL(data);
      if (supported) {
        Linking.openURL(data);
      } else {
        showToast('Cannot open this link');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1 }}>
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
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color={text} />
          </Pressable>

          <Text style={{ color: text, fontSize: 18, fontWeight: '600' }}>
            Scan Result
          </Text>

          <Pressable onPress={() => router.push('/history')}>
            <Feather name="clock" size={22} color={text} />
          </Pressable>
        </View>

        {/* INFO */}
        <View
          style={{
            margin: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: card,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: muted }}>Type</Text>
            <Text style={{ color: '#22C55E', fontWeight: '600' }}>
              {type} • {detected}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 6,
            }}
          >
            <Text style={{ color: muted }}>
              {date} • {time}
            </Text>

            <Pressable onPress={toggleFavorite}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? '#EF4444' : text}
              />
            </Pressable>
          </View>
        </View>

        {/* RESULT */}
        <ScrollView
          style={{
            flex: 1,
            marginHorizontal: 16,
            padding: 14,
            backgroundColor: resultBg,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: text, fontSize: 16 }}>{data}</Text>
        </ScrollView>

        {/* ACTIONS */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            padding: 16,
          }}
        >
          {detected !== 'TEXT' && (
            <Pressable
              style={{
                flex: 1,
                minWidth: '48%',
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 14,
                borderRadius: 10,
                backgroundColor: '#16A34A',
              }}
              onPress={openDetected}
            >
              <Ionicons
                name={detected === 'UPI' ? 'wallet-outline' : 'open-outline'}
                size={20}
                color="#fff"
              />
              <Text style={{ color: '#fff' }}>
                {detected === 'UPI' ? 'Pay' : 'Open'}
              </Text>
            </Pressable>
          )}

          <Pressable
            style={{
              flex: 1,
              minWidth: '48%',
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#1F2937',
            }}
            onPress={copyResult}
          >
            <Ionicons name="copy-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff' }}>Copy</Text>
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              minWidth: '48%',
              flexDirection: 'row',
              gap: 8,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#2563EB',
            }}
            onPress={shareResult}
          >
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff' }}>Share</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

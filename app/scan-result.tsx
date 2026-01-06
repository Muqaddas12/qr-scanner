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

  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();

  const data = String(result || '');

  /* ---------------- HELPERS ---------------- */

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      alert(msg); // simple iOS fallback
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
    const stored = await AsyncStorage.getItem('SCAN_HISTORY');
    let history = stored ? JSON.parse(stored) : [];

    const index = history.findIndex((i: any) => i.data === data);

    if (index !== -1) {
      history[index].favorite = !history[index].favorite;
      setFavorite(history[index].favorite);
      showToast(
        history[index].favorite
          ? 'Added to Favorites'
          : 'Removed from Favorites'
      );
    } else {
      history.unshift({
        id: Date.now().toString(),
        type,
        data,
        time: new Date().toISOString(),
        favorite: true,
      });
      setFavorite(true);
      showToast('Added to Favorites');
    }

    await AsyncStorage.setItem('SCAN_HISTORY', JSON.stringify(history));
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0B' }}>
      <View style={{ flex: 1 }}>
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
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </Pressable>

          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
            Scan Result
          </Text>

          <Pressable onPress={() => router.push('/history')}>
            <Feather name="clock" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* INFO */}
        <View
          style={{
            margin: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: '#161616',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#9CA3AF' }}>Type</Text>
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
            <Text style={{ color: '#9CA3AF' }}>
              {date} • {time}
            </Text>

            <Pressable onPress={toggleFavorite}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? '#EF4444' : '#fff'}
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
            backgroundColor: '#111',
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#E5E7EB', fontSize: 16 }}>{data}</Text>
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

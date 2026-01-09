import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

type QRItem = {
  id: string;
  data: string;
  type: string;
  time: string;
  favorite?: boolean;
};

export default function EditQRScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId: string }>();

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
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

  const showToast = (msg: string) => {
    Platform.OS === 'android'
      ? ToastAndroid.show(msg, ToastAndroid.SHORT)
      : alert(msg);
  };

  /* ---------------- LOAD QR ---------------- */

  useEffect(() => {
    const loadQR = async () => {
      const stored = await AsyncStorage.getItem('CREATED_QR');
      const list: QRItem[] = stored ? JSON.parse(stored) : [];

      const found = list.find(i => i.id === editId);
      if (!found) {
        showToast('QR not found');
        router.back();
        return;
      }

      setValue(found.data);
      setLoading(false);
    };

    loadQR();
  }, [editId]);

  /* ---------------- SAVE ---------------- */

  const saveEdit = async () => {
    if (!value.trim()) return;

    const stored = await AsyncStorage.getItem('CREATED_QR');
    const list: QRItem[] = stored ? JSON.parse(stored) : [];

    const updated = list.map(i =>
      i.id === editId
        ? { ...i, data: value, time: new Date().toISOString() }
        : i
    );

    await AsyncStorage.setItem('CREATED_QR', JSON.stringify(updated));
    showToast('QR updated');
    router.back();
  };

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

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
          backgroundColor: headerBg,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color={text} />
        </Pressable>

        <Text
          style={{
            color: text,
            fontSize: 18,
            fontWeight: '600',
            marginLeft: 16,
          }}
        >
          Edit QR
        </Text>
      </View>

      <View style={{ padding: 16 }}>
        {/* INPUT */}
        <TextInput
          value={value}
          onChangeText={setValue}
          multiline
          placeholder="Edit QR text"
          placeholderTextColor="#6B7280"
          style={{
            backgroundColor: card,
            color: text,
            padding: 14,
            borderRadius: 12,
            minHeight: 80,
          }}
        />

        {/* PREVIEW */}
        <View
          style={{
            marginTop: 30,
            alignItems: 'center',
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 16,
          }}
        >
          <QRCode value={value || ' '} size={200} />
        </View>

        {/* SAVE */}
        <Pressable
          onPress={saveEdit}
          style={{
            marginTop: 24,
            padding: 14,
            borderRadius: 10,
            backgroundColor: '#16A34A',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16 }}>
            Save Changes
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

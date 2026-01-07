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

  const showToast = (msg: string) => {
    Platform.OS === 'android'
      ? ToastAndroid.show(msg, ToastAndroid.SHORT)
      : alert(msg);
  };

  // Load QR to edit
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

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#0B0B0B',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B0B0B' }}>
      {/* HEADER */}
      <View
        style={{
          height: 60,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#111',
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </Pressable>

        <Text
          style={{
            color: '#fff',
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
            backgroundColor: '#161616',
            color: '#fff',
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

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

export default function CreateQRScreen() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [generated, setGenerated] = useState(false);

  const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      alert(msg);
    }
  };

  const saveQR = async () => {
    if (!value.trim()) return;

    const stored = await AsyncStorage.getItem('CREATED_QR');
    const existing = stored ? JSON.parse(stored) : [];

    const newQR = {
      id: Date.now().toString(),
      data: value,
      type: 'Created QR',
      time: new Date().toISOString(),
    };

    const updated = [newQR, ...existing];
    await AsyncStorage.setItem('CREATED_QR', JSON.stringify(updated));

    showToast('QR saved successfully');
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
            Create QR
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* INPUT */}
          <TextInput
            placeholder="Enter text / URL / UPI"
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={setValue}
            multiline
            style={{
              backgroundColor: '#161616',
              color: '#fff',
              padding: 14,
              borderRadius: 12,
              minHeight: 80,
            }}
          />

          {/* GENERATE */}
          <Pressable
            onPress={() => setGenerated(true)}
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 10,
              backgroundColor: '#2563EB',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>
              Generate QR
            </Text>
          </Pressable>

          {/* QR RESULT */}
          {generated && value.trim() !== '' && (
            <View
              style={{
                marginTop: 30,
                alignItems: 'center',
                backgroundColor: '#fff',
                padding: 20,
                borderRadius: 16,
              }}
            >
              <QRCode value={value} size={200} />

              <Pressable
                onPress={saveQR}
                style={{
                  marginTop: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 10,
                  backgroundColor: '#16A34A',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15 }}>
                  Save QR
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

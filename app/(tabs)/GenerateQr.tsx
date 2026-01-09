import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ToastAndroid,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu } from 'lucide-react-native';
import Header from '@/components/header';
import QRCode from 'react-native-qrcode-svg';

export default function GenerateQr() {
  const router = useRouter();
const [menuOpen,setMenuOpen]=useState(false)
  const [value, setValue] = useState('');
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    Platform.OS === 'android'
      ? ToastAndroid.show(msg, ToastAndroid.SHORT)
      : alert(msg);
  };

  const generate = () => {
    if (!value.trim()) return;

    setGenerated(false);
    setLoading(true);

    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
    }, 400);
  };

  const saveCode = async () => {
    if (!value.trim()) return;

    const stored = await AsyncStorage.getItem('CREATED_QR');
    const existing = stored ? JSON.parse(stored) : [];

    const newItem = {
      id: Date.now().toString(),
      data: value,
      type: 'qr',
      time: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      'CREATED_QR',
      JSON.stringify([newItem, ...existing])
    );

    showToast('QR saved successfully');
  };

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
      }}
    >
      Create QR
    </Text>
  </View>

  {/* SIDEBAR / DRAWER */}
  {menuOpen && <Header setMenuOpen={setMenuOpen} />}

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
      onPress={generate}
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

    {/* LOADING */}
    {loading && (
      <ActivityIndicator
        size="large"
        color="#2563EB"
        style={{ marginTop: 24 }}
      />
    )}

    {/* RESULT */}
    {generated && !loading && (
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
          onPress={saveCode}
          style={{
            marginTop: 20,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 10,
            backgroundColor: '#16A34A',
          }}
        >
          <Text style={{ color: '#fff' }}>Save</Text>
        </Pressable>
      </View>
    )}
  </ScrollView>

</SafeAreaView>

  );
}

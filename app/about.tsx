import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
  const router = useRouter();

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
            About Us
          </Text>
        </View>

        {/* CONTENT */}
        <ScrollView style={{ padding: 16 }}>
          <Text style={text}>
            This QR Scanner app is designed to provide fast, secure, and
            offline-first scanning of QR codes and barcodes.
          </Text>

          <Text style={text}>
            You can scan QR codes, save history, mark favorites, share results,
            and manage everything locally on your device.
          </Text>

          <Text style={text}>
            Built with ❤️ using React Native and Expo.
          </Text>

          <Text style={version}>Version: 1.0.0</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const text = {
  color: '#E5E7EB',
  fontSize: 15,
  marginBottom: 12,
  lineHeight: 22,
};

const version = {
  color: '#6B7280',
  fontSize: 13,
  marginTop: 20,
};

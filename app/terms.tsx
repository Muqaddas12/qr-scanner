import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
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
            Terms & Conditions
          </Text>
        </View>

        {/* CONTENT */}
        <ScrollView style={{ padding: 16 }}>
          <Text style={text}>
            By using this application, you agree to use it only for lawful
            purposes.
          </Text>

          <Text style={text}>
            The app does not collect or transmit your personal data. All scan
            history is stored locally on your device.
          </Text>

          <Text style={text}>
            We are not responsible for external links or third-party content
            scanned through QR codes.
          </Text>

          <Text style={text}>
            These terms may change in future versions of the app.
          </Text>
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

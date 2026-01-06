import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
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
            Settings
          </Text>
        </View>

        {/* OPTIONS */}
        <View style={{ padding: 16 }}>
          <Pressable
            style={itemStyle}
            onPress={() => router.push('/about')}
          >
            <Text style={itemText}>About Us</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={itemStyle}
            onPress={() => router.push('/terms')}
          >
            <Text style={itemText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const itemStyle = {
  backgroundColor: '#161616',
  padding: 16,
  borderRadius: 12,
  flexDirection: 'row' as const,
  justifyContent: 'space-between' as const,
  alignItems: 'center' as const,
  marginBottom: 12,
};

const itemText = {
  color: '#E5E7EB',
  fontSize: 16,
};

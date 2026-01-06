import { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  // 🔁 Reset scanner when screen focused again
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  // 🔊 Beep
  const playBeep = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/audio/beep.mp3')
    );
    await sound.playAsync();
  };

  // 💾 Save scan history
  const saveToHistory = async (data: string, type: string) => {
    const entry = {
      id: Date.now().toString(),
      data,
      type,
      time: new Date().toISOString(),
    };

    const existing = await AsyncStorage.getItem('SCAN_HISTORY');
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(entry);

    await AsyncStorage.setItem('SCAN_HISTORY', JSON.stringify(history));
  };

  // 📷 Scan handler
  const onScan = async ({ data, type }: { data: string; type: string }) => {
    if (scanned) return;

    setScanned(true);
    Vibration.vibrate(80);
    await playBeep();
    await saveToHistory(data, type);

    router.push({
      pathname: '/scan-result',
      params: { result: data, type },
    });
  };

  // 🖼 Scan from gallery (UI ready)
  const scanFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (res.canceled) return;

    Alert.alert(
      'Gallery Scan',
      'Gallery QR scanning needs native ML.\nCamera scanning works perfectly.'
    );
  };

  if (!permission?.granted) return <View />;

  return (
    <View style={styles.container}>
      {/* CAMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={flash === 'on'}
        onBarcodeScanned={scanned ? undefined : onScan}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'code128',
            'code39',
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'pdf417',
          ],
        }}
      />

      {/* SCANNER FRAME */}
      <View style={styles.frame}>
        <View style={styles.frameLabel}>
          <Text style={styles.frameText}>AUTO SCAN</Text>
        </View>
      </View>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>

        <View style={styles.centerIcons}>
          <Pressable onPress={scanFromGallery}>
            <Ionicons name="images-outline" size={26} color="#fff" />
          </Pressable>

          <Pressable onPress={() => setFlash(flash === 'on' ? 'off' : 'on')}>
            <Ionicons
              name={flash === 'on' ? 'flash' : 'flash-off'}
              size={26}
              color="#fff"
            />
          </Pressable>

          <Pressable
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <MaterialIcons name="flip-camera-ios" size={26} color="#fff" />
          </Pressable>
        </View>

        <Pressable>
          <Feather name="clock" size={26} color="#fff" />
        </Pressable>
      </View>

      {/* SIDEBAR */}
    {menuOpen && (
  <>
    <Pressable
      style={styles.overlay}
      onPress={() => setMenuOpen(false)}
    />

    <View style={styles.drawer}>
      {[
        { label: 'Scan', route: '/(tabs)' },          // scanner home
        { label: 'Scan Images', route: null },        // handle separately
        { label: 'Favorites', route: '/favorites' },
        { label: 'History', route: '/history' },
        { label: 'My QR', route: '/my-qr' },          // create later
        { label: 'Create QR', route: '/create-qr' }, // create later
        { label: 'Settings', route: '/settings' },   // create later
        { label: 'Share our app', route: 'share' },  // special action
      ].map((item) => (
        <Pressable
          key={item.label}
          style={styles.drawerItem}
          onPress={() => {
            setMenuOpen(false);

            if (item.route === 'share') {
              // 🔗 share app
              Share.share({
                message: 'Check out this QR Scanner app!',
              });
              return;
            }

            if (!item.route) {
              // placeholder / future feature
              Alert.alert(item.label, 'Coming soon');
              return;
            }

            router.push(item.route as any);
          }}
        >
          <Text style={styles.drawerText}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  </>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  centerIcons: {
    flexDirection: 'row',
    gap: 18,
  },

  frame: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#00FF88',
  },

  frameLabel: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  frameText: {
    color: '#00FF88',
    fontSize: 13,
    fontWeight: '600',
  },

  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '75%',
    height: '100%',
    backgroundColor: '#111',
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  drawerItem: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },

  drawerText: {
    color: '#fff',
    fontSize: 16,
  },
});

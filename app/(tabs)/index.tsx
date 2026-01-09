import { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Alert,
  Vibration,
 
} from 'react-native';

import { Image, Zap, ZapOff ,Clock ,SwitchCameraIcon} from "lucide-react-native";


import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons,} from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '@/components/header';
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
      'Coming Soon'
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
     <View  style={{justifyContent:'center',alignItems:'center',height:'100%'}}>
       <View
  style={{
    width: 260,
    height: 260,
    alignSelf: "center",
    position: "relative",
    
  }}
>
  {/* TOP LEFT */}
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: 30,
      height: 30,
      borderLeftWidth: 4,
      borderTopWidth: 4,
      borderColor: "#22C55E",
      borderTopLeftRadius: 6,
    }}
  />

  {/* TOP RIGHT */}
  <View
    style={{
      position: "absolute",
      top: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRightWidth: 4,
      borderTopWidth: 4,
      borderColor: "#22C55E",
      borderTopRightRadius: 6,
    }}
  />

  {/* BOTTOM LEFT */}
  <View
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 30,
      height: 30,
      borderLeftWidth: 4,
      borderBottomWidth: 4,
      borderColor: "#22C55E",
      borderBottomLeftRadius: 6,
    }}
  />

  {/* BOTTOM RIGHT */}
  <View
    style={{
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 30,
      height: 30,
      borderRightWidth: 4,
      borderBottomWidth: 4,
      borderColor: "#22C55E",
      borderBottomRightRadius: 6,
    }}
  />

  {/* LABEL */}
  <View
    style={{
      position: "absolute",
      top: -12,
      alignSelf: "center",
      backgroundColor: "#0B0B0B",
      paddingHorizontal: 10,
    }}
  >
    <Text
      style={{
        color: "#22C55E",
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 1,
      }}
    >
      AUTO SCAN
    </Text>
  </View>
</View>

     </View>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>
<View style={styles.centerIcons}>
  <Pressable onPress={scanFromGallery}>
    <Image size={26} color="#fff" />
  </Pressable>

  <Pressable onPress={() => setFlash(flash === "on" ? "off" : "on")}>
    {flash === "on" ? (
      <Zap size={26} color="#fff" />
    ) : (
      <ZapOff size={26} color="#fff" />
    )}
  </Pressable>

  <Pressable
  onPress={() => setFacing(facing === "back" ? "front" : "back")}
>
  <SwitchCameraIcon size={26} color="#fff" />
</Pressable>

</View>
<Pressable>
  <Clock size={26} color="#fff" />
</Pressable>

      </View>

      {/* SIDEBAR */}
{/* SIDEBAR */}
{menuOpen && (
  <Header setMenuOpen={setMenuOpen}/>
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
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 16,
},

  drawerText: {
    color: '#fff',
    fontSize: 16,
  },
});

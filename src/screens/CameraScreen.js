import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScanOverlay from '../components/ScanOverlay';
import { colors } from '../theme';

export default function CameraScreen({ onCaptured, onClose, onGallery }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);
  const insets = useSafeAreaInsets();

  if (!permission) return <View style={styles.root} />;

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.msg}>Allow the camera to scan cars live, or pick a photo instead.</Text>
        <Pressable style={styles.primary} onPress={requestPermission}>
          <Text style={styles.primaryTxt}>Allow camera</Text>
        </Pressable>
        <Pressable onPress={onGallery}><Text style={styles.link}>Choose from library</Text></Pressable>
        <Pressable onPress={onClose}><Text style={styles.link}>Back</Text></Pressable>
      </View>
    );
  }

  const shoot = async () => {
    if (busy || !ref.current) return;
    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const photo = await ref.current.takePictureAsync({ quality: 0.5, skipProcessing: true, shutterSound: false });
      onCaptured(photo.uri);
    } catch (e) {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <CameraView ref={ref} style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} />
      <View style={styles.dim} pointerEvents="none" />
      <View style={styles.overlayWrap} pointerEvents="none">
        <ScanOverlay />
        <Animated.Text entering={FadeIn.delay(400)} style={styles.tip}>
          Fit the whole car inside the frame
        </Animated.Text>
      </View>

      <View style={[styles.top, { top: insets.top + 10 }]}>
        <Pressable style={styles.round} onPress={onClose}><Text style={styles.roundTxt}>✕</Text></Pressable>
        <Pressable style={[styles.round, torch && { backgroundColor: colors.accent }]} onPress={() => setTorch((t) => !t)}>
          <Text style={[styles.roundTxt, torch && { color: '#000' }]}>⚡</Text>
        </Pressable>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <Pressable style={styles.side} onPress={onGallery}><Text style={styles.sideTxt}>▣{'\n'}Library</Text></Pressable>
        <Pressable onPress={shoot} style={styles.shutterOuter}>
          {busy ? <ActivityIndicator color={colors.accent} /> : <View style={styles.shutterInner} />}
        </Pressable>
        <View style={styles.side} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  msg: { color: colors.muted, textAlign: 'center' },
  primary: { backgroundColor: colors.accent, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30, marginTop: 8 },
  primaryTxt: { color: '#001018', fontWeight: '800' },
  link: { color: colors.accent, marginTop: 6 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,7,13,0.25)' },
  overlayWrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'center' },
  tip: { color: '#fff', textAlign: 'center', marginTop: 24, opacity: 0.85 },
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  roundTxt: { color: '#fff', fontSize: 18 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  side: { width: 70, alignItems: 'center' },
  sideTxt: { color: '#fff', textAlign: 'center', fontSize: 12 },
  shutterOuter: { width: 82, height: 82, borderRadius: 41, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: colors.accent },
});

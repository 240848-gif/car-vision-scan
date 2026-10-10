import React from 'react';
import { View, Image, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import ScanOverlay from '../components/ScanOverlay';
import { colors } from '../theme';

export default function AnalyzingScreen({ imageUri }) {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(500)} style={{ width: width * 0.82, height: width * 0.82 * 0.62 }}>
        <Image source={{ uri: imageUri }} style={styles.img} resizeMode="cover" />
        <View style={StyleSheet.absoluteFill}><ScanOverlay showSteps /></View>
      </Animated.View>
      <Text style={styles.title}>ANALYZING</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', borderRadius: 18, opacity: 0.85 },
  title: { color: colors.muted, letterSpacing: 6, marginTop: 90, fontSize: 12 },
});

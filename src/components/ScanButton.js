import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, glow } from '../theme';

// Big pulsing primary button with expanding rings.
export default function ScanButton({ label = 'SCAN CAR', onPress }) {
  const ring = useSharedValue(0);
  const press = useSharedValue(1);

  useEffect(() => {
    ring.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1, false);
  }, []);

  const ringStyle = (delay) =>
    useAnimatedStyle(() => {
      const p = (ring.value + delay) % 1;
      return { opacity: 0.5 * (1 - p), transform: [{ scale: 1 + p * 0.8 }] };
    });
  const r1 = ringStyle(0);
  const r2 = ringStyle(0.5);
  const btn = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, r1]} />
      <Animated.View style={[styles.ring, r2]} />
      <Pressable
        onPressIn={() => (press.value = withSpring(0.94))}
        onPressOut={() => (press.value = withSpring(1))}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress && onPress();
        }}
      >
        <Animated.View style={[styles.btn, glow(colors.accent, 24), btn]}>
          <LinearGradient
            colors={[colors.accent, colors.accent2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.icon}>◎</Text>
          <Text style={styles.label}>{label}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const SIZE = 150;
const styles = StyleSheet.create({
  wrap: { width: SIZE * 1.9, height: SIZE * 1.9, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2,
    borderWidth: 2, borderColor: colors.accent,
  },
  btn: {
    width: SIZE, height: SIZE, borderRadius: SIZE / 2, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 38, color: '#fff', marginBottom: 2 },
  label: { color: '#fff', fontWeight: '800', letterSpacing: 2, fontSize: 13 },
});

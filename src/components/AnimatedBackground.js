import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const ORBS = [
  { x: 0.05, y: 0.08, s: 170, d: 0, c: colors.accent },
  { x: 0.65, y: 0.22, s: 130, d: 600, c: colors.accent2 },
  { x: 0.2, y: 0.55, s: 150, d: 1200, c: colors.accent2 },
  { x: 0.7, y: 0.7, s: 190, d: 300, c: colors.accent },
  { x: 0.4, y: 0.9, s: 120, d: 900, c: colors.accent },
];

function Orb({ x, y, s, d, c, W, H }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(d, withRepeat(withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, []);
  const st = useAnimatedStyle(() => ({
    opacity: 0.07 + t.value * 0.1,
    transform: [{ translateY: (t.value - 0.5) * 60 }, { translateX: (t.value - 0.5) * 30 }, { scale: 0.9 + t.value * 0.2 }],
  }));
  return (
    <Animated.View
      style={[{ position: 'absolute', left: x * W, top: y * H, width: s, height: s, borderRadius: s / 2, backgroundColor: c }, st]}
    />
  );
}

// Slowly drifting glowing orbs over a dark gradient. Sits behind screen content.
export default function AnimatedBackground() {
  const { width: W, height: H } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#0A1530', colors.bg, '#080B16']} style={StyleSheet.absoluteFill} />
      {ORBS.map((o, i) => (
        <Orb key={i} {...o} W={W} H={H} />
      ))}
    </View>
  );
}

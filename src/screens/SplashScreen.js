import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import { colors, glow } from '../theme';

export default function SplashScreen({ onDone }) {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1);
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, []);

  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const letters = 'CARVISION'.split('');

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <Animated.View entering={FadeIn.duration(700)} style={[styles.logo, glow(colors.accent, 28)]}>
        <Animated.View style={[styles.ring, ring]} />
        <Text style={styles.logoIcon}>◎</Text>
      </Animated.View>
      <View style={styles.row}>
        {letters.map((l, i) => (
          <Animated.Text
            key={i}
            entering={FadeInDown.delay(500 + i * 70).springify()}
            style={[styles.letter, i >= 3 && { color: colors.accent }]}
          >
            {l}
          </Animated.Text>
        ))}
      </View>
      <Animated.Text entering={FadeIn.delay(1500).duration(600)} style={styles.tag}>
        AI VEHICLE RECOGNITION
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  ring: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    borderWidth: 3, borderColor: colors.accent, borderTopColor: 'transparent', borderLeftColor: colors.accent2,
  },
  logoIcon: { color: colors.accent, fontSize: 56 },
  row: { flexDirection: 'row' },
  letter: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: 5 },
  tag: { color: colors.muted, letterSpacing: 4, fontSize: 11, marginTop: 14 },
});

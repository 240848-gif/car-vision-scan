import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import CountUp from './CountUp';
import { colors } from '../theme';

// Labeled bar that fills up, with a counting number.
export default function SpecBar({ label, value = 0, max = 1, unit = '', decimals = 0, invert = false, delay = 0 }) {
  const fill = useSharedValue(0);
  const known = value > 0;
  let ratio = Math.max(0, Math.min(1, value / max));
  if (invert) ratio = 1 - Math.max(0, Math.min(1, (value - 2) / (max - 2)));

  useEffect(() => {
    fill.value = withDelay(delay, withTiming(known ? ratio : 0, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [ratio]);

  const bar = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <Text style={styles.label}>{label}</Text>
        {known ? (
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <CountUp to={value} decimals={decimals} delay={delay} style={styles.value} />
            <Text style={styles.unit}> {unit}</Text>
          </View>
        ) : (
          <Text style={styles.unit}>—</Text>
        )}
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, bar]}>
          <LinearGradient
            colors={[colors.accent2, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  label: { color: colors.muted, fontSize: 11, letterSpacing: 2 },
  value: { color: colors.text, fontSize: 20, fontWeight: '800' },
  unit: { color: colors.muted, fontSize: 12 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, overflow: 'hidden' },
});

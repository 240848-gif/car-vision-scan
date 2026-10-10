import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ConfidenceRing({ value = 0, size = 110, stroke = 10 }) {
  const progress = useSharedValue(0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tint = value >= 80 ? colors.good : value >= 50 ? colors.warn : colors.bad;

  useEffect(() => {
    progress.value = withTiming(value / 100, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [value]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - progress.value) }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={r} stroke={tint} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} animatedProps={props}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[styles.num, { color: tint }]}>{value}%</Text>
          <Text style={styles.lbl}>CONFIDENCE</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 26, fontWeight: '800' },
  lbl: { fontSize: 8, letterSpacing: 1.5, color: colors.muted, marginTop: 2 },
});

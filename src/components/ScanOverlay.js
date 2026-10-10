import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, glow } from '../theme';

const STEPS = ['Detecting vehicle…', 'Reading body lines…', 'Matching make & model…', 'Analyzing paint color…'];

// Corner brackets + sweeping laser line. Used on the camera and while analyzing.
export default function ScanOverlay({ active = true, showSteps = false }) {
  const { width } = useWindowDimensions();
  const box = width * 0.82;
  const sweep = useSharedValue(0);
  const pulse = useSharedValue(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    sweep.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })), -1);
  }, []);

  useEffect(() => {
    if (!showSteps) return;
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1300);
    return () => clearInterval(t);
  }, [showSteps]);

  const line = useAnimatedStyle(() => ({
    transform: [{ translateY: sweep.value * (box * 0.62 - 4) }],
    opacity: active ? 1 : 0,
  }));
  const bracket = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.45 }));

  const corner = (pos) => <Animated.View style={[styles.corner, pos, bracket]} />;

  return (
    <View pointerEvents="none" style={[styles.box, { width: box, height: box * 0.62 }]}>
      {corner({ top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 })}
      {corner({ top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 })}
      {corner({ bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 })}
      {corner({ bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 })}

      <Animated.View style={[styles.line, glow(colors.accent, 14), line]}>
        <LinearGradient
          colors={['transparent', colors.accent, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {showSteps && (
        <View style={styles.stepWrap}>
          <Text style={styles.step}>{STEPS[step]}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignSelf: 'center' },
  corner: { position: 'absolute', width: 44, height: 44, borderColor: colors.accent },
  line: { position: 'absolute', left: 8, right: 8, height: 3, borderRadius: 2 },
  stepWrap: { position: 'absolute', bottom: -44, left: 0, right: 0, alignItems: 'center' },
  step: { color: colors.accent, fontWeight: '700', letterSpacing: 1, fontSize: 13 },
});

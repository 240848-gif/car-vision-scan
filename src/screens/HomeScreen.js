import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../components/AnimatedBackground';
import ScanButton from '../components/ScanButton';
import CountUp from '../components/CountUp';
import { colors, radius } from '../theme';

const Stat = ({ children, label, delay }) => (
  <Animated.View entering={ZoomIn.delay(delay).duration(450)} style={styles.stat}>
    {children}
    <Text style={styles.statLbl}>{label}</Text>
  </Animated.View>
);

export default function HomeScreen({ history, onCamera, onGallery, onOpenScan, onHistory }) {
  const insets = useSafeAreaInsets();
  const cars = history.filter((h) => h.carDetected);
  const recent = history.slice(0, 6);
  const favs = history.filter((h) => h.favorite).length;

  const counts = {};
  cars.forEach((c) => { counts[c.make] = (counts[c.make] || 0) + 1; });
  const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];

  return (
    <View style={styles.root}>
      <AnimatedBackground />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.brand}>CAR<Text style={{ color: colors.accent }}>VISION</Text></Text>
          <Text style={styles.sub}>AI vehicle recognition</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(250).duration(800)} style={styles.hero}>
          <ScanButton onPress={onCamera} />
          <Text style={styles.hint}>Point at any car to identify make, model, color and specs</Text>
        </Animated.View>

        <View style={styles.stats}>
          <Stat label="CARS SCANNED" delay={400}>
            <CountUp to={cars.length} delay={500} style={styles.statNum} />
          </Stat>
          <Stat label="FAVORITES" delay={500}>
            <CountUp to={favs} delay={600} style={styles.statNum} />
          </Stat>
          <Stat label="TOP BRAND" delay={600}>
            <Text style={styles.statNum} numberOfLines={1}>{top || '—'}</Text>
          </Stat>
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(600)} style={styles.row}>
          <Pressable style={styles.card} onPress={onGallery}>
            <Text style={styles.cardIcon}>▣</Text>
            <Text style={styles.cardTitle}>Upload photo</Text>
            <Text style={styles.cardSub}>From your library</Text>
          </Pressable>
          <Pressable style={styles.card} onPress={onHistory}>
            <Text style={styles.cardIcon}>◷</Text>
            <Text style={styles.cardTitle}>History</Text>
            <Text style={styles.cardSub}>{history.length} saved scans</Text>
          </Pressable>
        </Animated.View>

        {recent.length > 0 && (
          <Animated.View entering={FadeInDown.delay(650).duration(600)} style={{ marginTop: 28 }}>
            <Text style={styles.section}>RECENT SCANS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {recent.map((s) => (
                <Pressable key={s.id} style={styles.recent} onPress={() => onOpenScan(s)}>
                  <Image source={{ uri: s.imageUri }} style={styles.recentImg} />
                  <Text numberOfLines={1} style={styles.recentName}>
                    {s.carDetected ? `${s.make} ${s.model}` : 'No car found'}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { alignItems: 'center' },
  brand: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 5 },
  sub: { color: colors.muted, marginTop: 4, letterSpacing: 2, fontSize: 12 },
  hero: { alignItems: 'center', marginTop: 20 },
  hint: { color: colors.muted, marginTop: -20, fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
  stats: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 26 },
  stat: { flex: 1, backgroundColor: 'rgba(13,18,32,0.85)', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: 'center' },
  statNum: { color: colors.accent, fontSize: 20, fontWeight: '800' },
  statLbl: { color: colors.muted, fontSize: 9, letterSpacing: 1.5, marginTop: 4 },
  row: { flexDirection: 'row', gap: 14, paddingHorizontal: 20, marginTop: 16 },
  card: { flex: 1, backgroundColor: 'rgba(13,18,32,0.85)', borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: colors.border },
  cardIcon: { fontSize: 26, color: colors.accent, marginBottom: 10 },
  cardTitle: { color: colors.text, fontWeight: '700', fontSize: 16 },
  cardSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  section: { color: colors.muted, letterSpacing: 2, fontSize: 11, marginLeft: 20, marginBottom: 12 },
  recent: { width: 150 },
  recentImg: { width: 150, height: 100, borderRadius: radius.md, backgroundColor: colors.surface2 },
  recentName: { color: colors.text, marginTop: 8, fontWeight: '600', fontSize: 13 },
});

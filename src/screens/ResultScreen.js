import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfidenceRing from '../components/ConfidenceRing';
import SpecBar from '../components/SpecBar';
import { colors, radius, glow, swatch } from '../theme';

const Row = ({ label, value, delay, children }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(450)} style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    {children || <Text style={styles.rowValue}>{value || '—'}</Text>}
  </Animated.View>
);

const Card = ({ title, delay = 0, children }) => (
  <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={styles.card}>
    {!!title && <Text style={styles.cardTitle}>{title}</Text>}
    {children}
  </Animated.View>
);

const Chip = ({ text, accent }) => (
  <View style={[styles.chip, accent && { borderColor: colors.accent }]}>
    <Text style={[styles.chipTxt, accent && { color: colors.accent }]}>{text}</Text>
  </View>
);

const Spec = ({ icon, label, value, delay }) => (
  <Animated.View entering={ZoomIn.delay(delay).duration(400)} style={styles.spec}>
    <Text style={styles.specIcon}>{icon}</Text>
    <Text style={styles.specVal} numberOfLines={2}>{value || '—'}</Text>
    <Text style={styles.specLbl}>{label}</Text>
  </Animated.View>
);

export default function ResultScreen({ scan, onBack, onScanAgain, onDelete, onToggleFav, isSaved }) {
  const insets = useSafeAreaInsets();

  const share = () =>
    Share.share({
      message:
        `${scan.make} ${scan.model} (${scan.color})\n` +
        `${scan.horsepower ? scan.horsepower + ' hp · ' : ''}${scan.topSpeedKmh ? scan.topSpeedKmh + ' km/h · ' : ''}${scan.confidence}% confidence\n` +
        'Scanned with Car Vision',
    });

  if (!scan.carDetected) {
    return (
      <View style={[styles.root, styles.center]}>
        <Image source={{ uri: scan.imageUri }} style={styles.noCarImg} />
        <Animated.Text entering={FadeIn.delay(200)} style={styles.noCarTitle}>No car detected</Animated.Text>
        <Text style={styles.noCarMsg}>Try a clearer photo with the whole car visible and good lighting.</Text>
        <Pressable style={styles.primary} onPress={onScanAgain}><Text style={styles.primaryTxt}>Scan again</Text></Pressable>
        <Pressable onPress={onBack}><Text style={styles.link}>Home</Text></Pressable>
      </View>
    );
  }

  const hasPerf = scan.horsepower > 0 || scan.topSpeedKmh > 0 || scan.zeroTo100 > 0;
  const similar = scan.similarCars || [];
  const features = scan.features || [];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: scan.imageUri }} style={styles.hero} />
          <LinearGradient colors={['rgba(5,7,13,0.5)', 'transparent', colors.bg]} style={StyleSheet.absoluteFill} />
          <Pressable style={[styles.round, { top: insets.top + 10, left: 16 }]} onPress={onBack}>
            <Text style={styles.roundTxt}>←</Text>
          </Pressable>
          {isSaved && (
            <Pressable
              style={[styles.round, { top: insets.top + 10, right: 16 }]}
              onPress={() => { Haptics.selectionAsync(); onToggleFav(scan.id); }}
            >
              <Text style={[styles.roundTxt, scan.favorite && { color: colors.warn }]}>{scan.favorite ? '★' : '☆'}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.body}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.make}>{scan.make.toUpperCase()}</Text>
            <Text style={styles.model}>{scan.model}</Text>
            {!!scan.generation && <Text style={styles.gen}>{scan.generation}</Text>}
          </Animated.View>

          <Animated.View entering={ZoomIn.delay(200).duration(600)} style={[styles.confCard, glow(colors.accent, 12)]}>
            <ConfidenceRing value={scan.confidence} />
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={styles.confTitle}>
                {scan.confidence >= 80 ? 'High match' : scan.confidence >= 50 ? 'Likely match' : 'Low certainty'}
              </Text>
              <Text style={styles.confSub}>
                {scan.confidence >= 80 ? 'The AI is very sure about this car.' : 'Try another angle for a better result.'}
              </Text>
            </View>
          </Animated.View>

          <Card title="OVERVIEW" delay={300}>
            <Row label="MAKE" value={scan.make} delay={350} />
            <Row label="MODEL" value={scan.model} delay={400} />
            <Row label="COLOR" delay={450}>
              <View style={styles.colorVal}>
                <View style={[styles.dot, { backgroundColor: swatch(scan.color) }]} />
                <Text style={styles.rowValue}>{scan.color || '—'}</Text>
              </View>
            </Row>
            <Row label="YEARS" value={scan.yearRange} delay={500} />
            <Row label="BODY" value={scan.bodyType} delay={550} />
            <Row label="ORIGIN" value={scan.originCountry} delay={600} />
          </Card>

          {hasPerf && (
            <Card title="PERFORMANCE (TYPICAL)" delay={450}>
              <SpecBar label="POWER" value={scan.horsepower} max={800} unit="hp" delay={500} />
              <SpecBar label="TOP SPEED" value={scan.topSpeedKmh} max={350} unit="km/h" delay={650} />
              <SpecBar label="0-100 KM/H" value={scan.zeroTo100} max={14} unit="sec" decimals={1} invert delay={800} />
            </Card>
          )}

          <Card title="SPECIFICATIONS" delay={600}>
            <View style={styles.specGrid}>
              <Spec icon="⛽" label="FUEL" value={scan.fuelType} delay={650} />
              <Spec icon="⚙" label="ENGINE" value={scan.engine} delay={700} />
              <Spec icon="◈" label="GEARBOX" value={scan.transmission} delay={750} />
              <Spec icon="⇄" label="DRIVE" value={scan.drivetrain} delay={800} />
              <Spec icon="◐" label="SEATS" value={scan.seats ? String(scan.seats) : ''} delay={850} />
              <Spec icon="₹" label="PRICE" value={scan.priceRangeINR} delay={900} />
            </View>
          </Card>

          {features.length > 0 && (
            <Card title="KEY FEATURES" delay={700}>
              <View style={styles.chips}>{features.map((f) => <Chip key={f} text={f} accent />)}</View>
            </Card>
          )}

          {!!scan.funFact && (
            <Card title="DID YOU KNOW" delay={800}>
              <Text style={styles.fact}>{scan.funFact}</Text>
            </Card>
          )}

          {similar.length > 0 && (
            <Card title="SIMILAR CARS" delay={900}>
              <View style={styles.chips}>{similar.map((s) => <Chip key={s} text={s} />)}</View>
            </Card>
          )}

          {!!scan.notes && (
            <Card title="SCAN NOTES" delay={950}>
              <Text style={styles.fact}>{scan.notes}</Text>
            </Card>
          )}
          <Text style={styles.date}>
            {new Date(scan.createdAt).toLocaleString()} · specs are typical values, not exact for this car
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        {isSaved && (
          <Pressable style={styles.ghost} onPress={() => onDelete(scan.id)}><Text style={styles.ghostTxt}>Delete</Text></Pressable>
        )}
        <Pressable style={styles.ghost} onPress={share}><Text style={styles.ghostTxt}>Share</Text></Pressable>
        <Pressable style={styles.primary} onPress={onScanAgain}><Text style={styles.primaryTxt}>Scan again</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14 },
  noCarImg: { width: 240, height: 160, borderRadius: 20, opacity: 0.6 },
  noCarTitle: { color: colors.text, fontSize: 24, fontWeight: '800' },
  noCarMsg: { color: colors.muted, textAlign: 'center' },
  hero: { width: '100%', height: 300 },
  round: { position: 'absolute', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  roundTxt: { color: '#fff', fontSize: 22 },
  body: { paddingHorizontal: 20, marginTop: -40 },
  make: { color: colors.accent, letterSpacing: 4, fontWeight: '800', fontSize: 13 },
  model: { color: colors.text, fontSize: 36, fontWeight: '900', marginTop: 2 },
  gen: { color: colors.muted, marginTop: 2, fontSize: 14 },
  confCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.xl,
    padding: 18, marginTop: 20, borderWidth: 1, borderColor: colors.border,
  },
  confTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  confSub: { color: colors.muted, marginTop: 4, fontSize: 13 },
  card: { marginTop: 16, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16 },
  cardTitle: { color: colors.muted, fontSize: 11, letterSpacing: 2, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowLabel: { color: colors.muted, fontSize: 11, letterSpacing: 2 },
  rowValue: { color: colors.text, fontWeight: '700', fontSize: 15, maxWidth: '65%', textAlign: 'right' },
  colorVal: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#fff4' },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  spec: { width: '31%', flexGrow: 1, backgroundColor: colors.surface2, borderRadius: radius.md, padding: 12, alignItems: 'center' },
  specIcon: { color: colors.accent, fontSize: 20, marginBottom: 6 },
  specVal: { color: colors.text, fontWeight: '700', fontSize: 13, textAlign: 'center' },
  specLbl: { color: colors.muted, fontSize: 9, letterSpacing: 1.5, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface2 },
  chipTxt: { color: colors.text, fontSize: 13, fontWeight: '600' },
  fact: { color: colors.text, lineHeight: 21 },
  date: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 20, paddingHorizontal: 10 },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12, backgroundColor: 'rgba(5,7,13,0.95)', borderTopWidth: 1, borderTopColor: colors.border },
  primary: { flex: 1, backgroundColor: colors.accent, paddingVertical: 14, borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  primaryTxt: { color: '#001018', fontWeight: '800' },
  ghost: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  ghostTxt: { color: colors.text, fontWeight: '700' },
  link: { color: colors.accent, marginTop: 6 },
});

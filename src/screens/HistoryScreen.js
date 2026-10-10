import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, swatch } from '../theme';

export default function HistoryScreen({ history, onBack, onOpen, onClear, onToggleFav }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all'); // all | fav

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((h) => {
      if (tab === 'fav' && !h.favorite) return false;
      if (!q) return true;
      return `${h.make} ${h.model} ${h.color} ${h.bodyType}`.toLowerCase().includes(q);
    });
  }, [history, query, tab]);

  const confirmClear = () =>
    Alert.alert('Clear history?', 'All saved scans will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: onClear },
    ]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.round}><Text style={styles.roundTxt}>←</Text></Pressable>
        <Text style={styles.title}>Scan History</Text>
        {history.length > 0 ? (
          <Pressable onPress={confirmClear}><Text style={styles.clear}>Clear</Text></Pressable>
        ) : <View style={{ width: 44 }} />}
      </View>

      {history.length > 0 && (
        <View style={styles.tools}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search make, model, color…"
            placeholderTextColor={colors.muted}
            style={styles.search}
          />
          <View style={styles.tabs}>
            {[['all', `All (${history.length})`], ['fav', '★ Favorites']].map(([k, label]) => (
              <Pressable key={k} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]}>
                <Text style={[styles.tabTxt, tab === k && { color: '#001018' }]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {data.length === 0 ? (
        <Animated.View entering={FadeIn.duration(600)} style={styles.empty}>
          <Text style={styles.emptyIcon}>{history.length ? '⌕' : '◷'}</Text>
          <Text style={styles.emptyTitle}>{history.length ? 'Nothing found' : 'No scans yet'}</Text>
          <Text style={styles.emptySub}>
            {history.length ? 'Try a different search or filter.' : 'Your identified cars will show up here.'}
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 30, gap: 12 }}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInRight.delay(Math.min(index, 8) * 60).duration(450)}>
              <Pressable style={styles.item} onPress={() => onOpen(item)}>
                <Image source={{ uri: item.imageUri }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.name}>
                    {item.carDetected ? `${item.make} ${item.model}` : 'No car detected'}
                  </Text>
                  <View style={styles.meta}>
                    {item.carDetected && <View style={[styles.dot, { backgroundColor: swatch(item.color) }]} />}
                    <Text style={styles.metaTxt}>{item.carDetected ? item.color : ''}</Text>
                  </View>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  {item.carDetected && (
                    <View style={styles.badge}><Text style={styles.badgeTxt}>{item.confidence}%</Text></View>
                  )}
                  {item.carDetected && (
                    <Pressable hitSlop={10} onPress={() => onToggleFav(item.id)}>
                      <Text style={[styles.star, item.favorite && { color: colors.warn }]}>{item.favorite ? '★' : '☆'}</Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  roundTxt: { color: colors.text, fontSize: 20 },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  clear: { color: colors.bad, fontWeight: '700', width: 44, textAlign: 'right' },
  tools: { paddingHorizontal: 20, marginTop: 14, gap: 12 },
  search: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 16, paddingVertical: 12 },
  tabs: { flexDirection: 'row', gap: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tabOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabTxt: { color: colors.text, fontWeight: '700', fontSize: 13 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 54, color: colors.accent },
  emptyTitle: { color: colors.text, fontWeight: '800', fontSize: 20, marginTop: 10 },
  emptySub: { color: colors.muted, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, padding: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  thumb: { width: 84, height: 64, borderRadius: radius.sm, backgroundColor: colors.surface2 },
  name: { color: colors.text, fontWeight: '700', fontSize: 16 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  metaTxt: { color: colors.muted, fontSize: 13 },
  date: { color: colors.muted, fontSize: 11, marginTop: 3 },
  badge: { backgroundColor: colors.surface2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  badgeTxt: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  star: { color: colors.muted, fontSize: 22 },
});

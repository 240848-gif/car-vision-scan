import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'cvs_history_v1';
const MAX = 100;

export async function loadHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function write(list) {
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export async function saveScan(scan) {
  const list = await loadHistory();
  return write([scan, ...list.filter((s) => s.id !== scan.id)].slice(0, MAX));
}

export async function deleteScan(id) {
  const list = await loadHistory();
  return write(list.filter((s) => s.id !== id));
}

export async function toggleFavorite(id) {
  const list = await loadHistory();
  return write(list.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s)));
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEY);
  return [];
}

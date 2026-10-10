import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Alert, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import AnalyzingScreen from './src/screens/AnalyzingScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { recognizeCar } from './src/services/recognize';
import { loadHistory, saveScan, deleteScan, clearHistory, toggleFavorite } from './src/services/history';
import { colors } from './src/theme';

export default function App() {
  const [screen, setScreen] = useState('splash'); // splash | home | camera | analyzing | result | history
  const [history, setHistory] = useState([]);
  const [pendingUri, setPendingUri] = useState(null);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  const analyze = useCallback(async (uri) => {
    setPendingUri(uri);
    setScreen('analyzing');
    try {
      const scan = await recognizeCar(uri);
      if (scan.carDetected) {
        const next = await saveScan(scan);
        setHistory(next);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      setCurrent(scan);
      setScreen('result');
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Scan failed', e.message || 'Something went wrong.', [
        { text: 'Cancel', style: 'cancel', onPress: () => setScreen('home') },
        { text: 'Try again', onPress: () => analyze(uri) },
      ]);
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to pick a car image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!res.canceled && res.assets?.[0]?.uri) analyze(res.assets[0].uri);
  }, [analyze]);

  const remove = async (id) => {
    setHistory(await deleteScan(id));
    setScreen('history');
  };

  const toggleFav = async (id) => setHistory(await toggleFavorite(id));

  // always show the freshest copy (favorite state) of the open scan
  const saved = current ? history.find((h) => h.id === current.id) : null;
  const shown = saved || current;

  let content;
  switch (screen) {
    case 'splash':
      content = <SplashScreen onDone={() => setScreen('home')} />;
      break;
    case 'camera':
      content = <CameraScreen onCaptured={analyze} onClose={() => setScreen('home')} onGallery={pickFromLibrary} />;
      break;
    case 'analyzing':
      content = <AnalyzingScreen imageUri={pendingUri} />;
      break;
    case 'result':
      content = (
        <ResultScreen
          scan={shown}
          isSaved={!!saved}
          onBack={() => setScreen('home')}
          onScanAgain={() => setScreen('camera')}
          onDelete={remove}
          onToggleFav={toggleFav}
        />
      );
      break;
    case 'history':
      content = (
        <HistoryScreen
          history={history}
          onBack={() => setScreen('home')}
          onOpen={(s) => { setCurrent(s); setScreen('result'); }}
          onClear={async () => setHistory(await clearHistory())}
          onToggleFav={toggleFav}
        />
      );
      break;
    default:
      content = (
        <HomeScreen
          history={history}
          onCamera={() => setScreen('camera')}
          onGallery={pickFromLibrary}
          onHistory={() => setScreen('history')}
          onOpenScan={(s) => { setCurrent(s); setScreen('result'); }}
        />
      );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <StatusBar style="light" />
        <Animated.View key={screen} style={{ flex: 1 }} entering={FadeIn.duration(280)} exiting={FadeOut.duration(150)}>
          {content}
        </Animated.View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg } });

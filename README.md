# Car Vision Scan

Mobile app (Expo / React Native) that identifies a car's make, model and color from a live camera scan or a library photo, with confidence score and saved history.

## Run it

1. `npm install`
2. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_AI_API_KEY`
3. `npx expo start`, then scan the QR code with Expo Go (SDK 57)

## Structure

- `App.js` – navigation state and scan flow
- `src/services/recognize.js` – AI vision call (swap provider here)
- `src/services/history.js` – saved scans (AsyncStorage)
- `src/screens/` – Home, Camera, Analyzing, Result, History
- `src/components/` – ScanButton, ScanOverlay (laser sweep), ConfidenceRing
- `src/theme.js` – colors and glow styles

## Notes

- The API key is bundled into the app via `EXPO_PUBLIC_*`. Fine for testing; for release, send images through your own backend.
- Exact model identification from one photo is best-effort; the confidence score shows how sure the AI is.

## Get the APK (no computer needed, only a free GitHub account)

1. Create a new GitHub repository and upload all files from this folder (keep the `.github` folder).
2. In the repo go to Settings > Secrets and variables > Actions > New repository secret.
   Name: `EXPO_PUBLIC_AI_API_KEY`, Value: your AI key.
3. Go to the Actions tab > "Build Android APK" > Run workflow. Wait about 10-15 minutes.
4. Open the finished run, download the `car-vision-scan-apk` artifact (a zip), unzip it, and install the `.apk` on your phone.

Alternative with a computer: `eas build -p android --profile preview` (see eas.json).

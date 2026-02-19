# Atoa SDK Demo App

A demo e-commerce app showcasing the [Atoa React Native SDK](https://github.com/user/atoa-react-native-sdk) integration with bank payment flows.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) completed
- Android SDK installed (via Android Studio)
- A physical Android device or Android emulator

## Setup

### 1. Install dependencies

```sh
cd demo_app
npm install
```

### 2. Connect a device or start an emulator

**Physical device:** Connect via USB and enable USB debugging in Developer Options. Verify with:

```sh
adb devices
```

You should see your device listed as `device` (not `offline` or `unauthorized`).

If the device shows as `offline`, restart the adb server:

```sh
adb kill-server && adb start-server
```

Then re-authorize USB debugging on your device when prompted.

**Emulator:** List available emulators and start one:

```sh
emulator -list-avds
emulator -avd <avd_name>
```

### 3. Start Metro

In a terminal, start the Metro dev server:

```sh
npm start
```

### 4. Build and run on Android

In a separate terminal:

```sh
npm run android
```

Or build directly with Gradle:

```sh
cd android && ./gradlew app:installDebug -PreactNativeDevServerPort=8081
```

### 5. Build and run on iOS

Install CocoaPods dependencies (first time only):

```sh
bundle install
cd ios && bundle exec pod install && cd ..
```

Then run:

```sh
npm run ios
```

## Release Builds

### Android

**Build AAB (Android App Bundle):**

```sh
npx react-native build-android --mode=release
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

**Build APK:**

```sh
cd android && ./gradlew app:assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### iOS (IPA)

Make sure CocoaPods dependencies are installed first:

```sh
cd ios && bundle exec pod install && cd ..
```

**Build release:**

```sh
npx react-native build-ios --mode=Release
```

**Or archive and export manually:**

```sh
xcodebuild -workspace ios/demo_app.xcworkspace -scheme demo_app -configuration Release -sdk iphoneos -archivePath build/demo_app.xcarchive archive
```

```sh
xcodebuild -exportArchive -archivePath build/demo_app.xcarchive -exportOptionsPlist ios/ExportOptions.plist -exportPath build/
```

The IPA will be at: `build/demo_app.ipa`

> **Note:** The manual export requires a valid `ios/ExportOptions.plist` with your signing and provisioning profile configuration. Alternatively, open `ios/demo_app.xcworkspace` in Xcode and use **Product > Archive** to build and export via the Xcode Organizer.

## Modifying the App

Edit `App.tsx` and save - changes are reflected instantly via [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

To force a full reload:

- **Android**: Press <kbd>R</kbd> twice or open Dev Menu with <kbd>Ctrl</kbd> + <kbd>M</kbd>
- **iOS**: Press <kbd>R</kbd> in the iOS Simulator

## Troubleshooting

### `No online devices found`

Your device is not connected or is in an offline state. Run:

```sh
adb kill-server && adb start-server
adb devices
```

Ensure your device shows as `device`. If it shows `offline`, unplug and replug the USB cable, then re-authorize USB debugging on the device.

### `EADDRINUSE: address already in use :::8081`

Another Metro server or process is using port 8081. Find and kill it:

```sh
# Find the process
netstat -ano | grep 8081

# Kill by PID (replace <PID> with the actual number)
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                  # macOS/Linux
```

Then restart Metro with `npm start`.

### `newArchEnabled` warning

If you see a warning about `newArchEnabled=false`, remove that line from `android/gradle.properties`. New Architecture is enabled by default since React Native 0.82.

## Learn More

- [React Native docs](https://reactnative.dev/docs/getting-started)
- [Atoa React Native SDK](../README.md)

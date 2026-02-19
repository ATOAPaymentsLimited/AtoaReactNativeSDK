# Atoa SDK Example App

An example app for developing and testing the [Atoa React Native SDK](../README.md).

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) completed
- Android SDK installed (via Android Studio)
- A physical Android device or Android emulator

## Setup

### 1. Install dependencies

From the repo root, install SDK dependencies first, then example app dependencies:

```sh
npm install
cd example && npm install
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
cd example
npx react-native start --reset-cache
```

### 4. Build and run on Android

In a separate terminal:

```sh
cd example
npx react-native run-android
```

Or build directly with Gradle:

```sh
cd example/android && ./gradlew app:installDebug -PreactNativeDevServerPort=8081
```

### 5. Build and run on iOS

Install CocoaPods dependencies (first time only):

```sh
bundle install
cd example/ios && bundle exec pod install && cd ..
```

Then run:

```sh
cd example
npx react-native run-ios
```

## Clean Build

If you run into build issues, clean and rebuild:

```sh
# Clean Android build
cd example/android && ./gradlew clean
rm -rf example/android/.cxx

# Clean Metro cache
cd example && npx react-native start --reset-cache
```

## Release Builds

### Android

**Build AAB (Android App Bundle):**

```sh
cd example
npx react-native build-android --mode=release
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

**Build APK:**

```sh
cd example/android && ./gradlew app:assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### iOS (IPA)

Make sure CocoaPods dependencies are installed first:

```sh
cd example/ios && bundle exec pod install && cd ..
```

**Build release:**

```sh
cd example
npx react-native build-ios --mode=Release
```

**Or archive and export manually:**

```sh
xcodebuild -workspace ios/AtoaTestApp.xcworkspace -scheme AtoaTestApp -configuration Release -sdk iphoneos -archivePath build/AtoaTestApp.xcarchive archive
```

```sh
xcodebuild -exportArchive -archivePath build/AtoaTestApp.xcarchive -exportOptionsPlist ios/ExportOptions.plist -exportPath build/
```

The IPA will be at: `build/AtoaTestApp.ipa`

> **Note:** The manual export requires a valid `ios/ExportOptions.plist` with your signing and provisioning profile configuration. Alternatively, open `ios/AtoaTestApp.xcworkspace` in Xcode and use **Product > Archive** to build and export via the Xcode Organizer.

## Debugging

### Test Metro bundle

To verify the JS bundle compiles without errors:

```sh
curl -s "http://localhost:8081/index.bundle?platform=android&dev=true&lazy=false&minify=false" > /dev/null && echo "Bundle OK" || echo "Bundle FAILED"
```

> **Tip:** Use `lazy=false` when debugging — `lazy=true` hides bundling errors (modules show as null in the dependency map).

### Port conflict (EADDRINUSE)

If Metro fails with `EADDRINUSE: address already in use :::8081`:

```sh
# Find the process using port 8081
netstat -ano | grep 8081

# Kill by PID (replace <PID> with the actual number)
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                  # macOS/Linux
```

Then restart Metro.

## Modifying the App

Edit `App.tsx` and save — changes are reflected instantly via [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

To force a full reload:

- **Android**: Press <kbd>R</kbd> twice or open Dev Menu with <kbd>Ctrl</kbd> + <kbd>M</kbd>
- **iOS**: Press <kbd>R</kbd> in the iOS Simulator

## Learn More

- [React Native docs](https://reactnative.dev/docs/getting-started)
- [Atoa React Native SDK](../README.md)

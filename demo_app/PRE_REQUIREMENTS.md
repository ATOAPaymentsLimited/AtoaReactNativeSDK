# Atoa React Native SDK - Demo App Pre-Requirements

This document covers everything needed to integrate `@atoapayments/atoa-react-native-sdk` into a React Native app and run the demo app.

---

## 1. Environment Prerequisites

| Tool            | Minimum Version | Notes                          |
| --------------- | --------------- | ------------------------------ |
| Node.js         | >= 20           | Required by `engines` field    |
| npm / yarn      | Latest stable   |                                |
| JDK             | 17              | Required for Android builds    |
| Android Studio  | Latest stable   | SDK 36, Build Tools 36.0.0     |
| NDK             | 27.1.12297006   |                                |
| Xcode           | 15+             | For iOS builds                 |
| CocoaPods       | Latest stable   | For iOS native dependencies    |
| React Native CLI | 0.83.x         | `@react-native-community/cli`  |

---

## 2. Peer Dependencies (Must Be Installed by Host App)

The SDK declares the following **peer dependencies**. Your app must install all of them:

```bash
npm install react-native-reanimated react-native-gesture-handler \
  react-native-svg react-native-root-siblings react-native-safe-area-context \
  @gorhom/bottom-sheet @react-native-community/netinfo lottie-react-native \
  react-native-worklets
```

| Package                            | Required Version | Purpose                        |
| ---------------------------------- | ---------------- | ------------------------------ |
| `react`                            | >= 18.0.0        | Core React                     |
| `react-native`                     | >= 0.70.0        | Core React Native              |
| `react-native-reanimated`          | >= 3.0.0         | Animations (bottom sheet, transitions) |
| `react-native-gesture-handler`     | >= 2.0.0         | Gesture handling (bottom sheet swipe) |
| `react-native-svg`                 | >= 13.0.0        | Bank logos and icons            |
| `react-native-root-siblings`       | ^5.0.1           | Modal rendering for payment sheet |
| `@gorhom/bottom-sheet`             | >= 4.0.0         | Payment bottom sheet UI        |
| `@react-native-community/netinfo`  | >= 9.0.0         | Network connectivity detection |
| `lottie-react-native`              | >= 6.0.0         | Loading animations             |
| `react-native-worklets`            | >= 0.5.0         | Required by reanimated v4      |

> **Note:** If using `react-native-reanimated` v4+, you also need `react-native-worklets`.

---

## 3. Babel Configuration

The SDK uses `@gorhom/bottom-sheet` for the payment UI, which depends on `react-native-reanimated`. Reanimated requires a custom Babel plugin to transform **worklet** functions that run on the UI thread. Without this plugin, bottom sheet gestures and animations will crash at runtime with errors like `"undefined is not a function (near '...worklet...')"`.

Add the Reanimated Babel plugin to your `babel.config.js`. It **must** be the last plugin (it needs to process code after all other transforms):

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'], // must be LAST
};
```

---

## 4. App Entry Point Setup (Critical)

The SDK uses `react-native-root-siblings` v5 to render the payment modal as a sibling overlay. You **must** wrap your app root with either:

**Option A** - Using SDK's `AtoaProvider` (recommended):

```tsx
import { AppRegistry } from 'react-native';
import { AtoaProvider } from '@atoapayments/atoa-react-native-sdk';
import App from './App';
import { name as appName } from './app.json';

const Root = () => (
  <AtoaProvider>
    <App />
  </AtoaProvider>
);

AppRegistry.registerComponent(appName, () => Root);
```

**Option B** - Using `RootSiblingParent` directly:

```tsx
import { AppRegistry } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import App from './App';
import { name as appName } from './app.json';

const Root = () => (
  <RootSiblingParent>
    <App />
  </RootSiblingParent>
);

AppRegistry.registerComponent(appName, () => Root);
```

> **Without this wrapper, `AtoaSdk.pay()` will silently fail** - the modal queues in `pendingActions` but never renders.

Also import `react-native-gesture-handler` at the **top** of your entry file:

```tsx
import 'react-native-gesture-handler';
```

---

## 5. Android Configuration

### 5.1 AndroidManifest.xml

Add the following to `android/app/src/main/AndroidManifest.xml`:

**Internet permission:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**Bank app queries (Android 11+):**
The SDK checks for installed bank apps. Add `<queries>` inside `<manifest>`:

```xml
<queries>
  <package android:name="com.barclays.android.barclaysmobilebanking" />
  <package android:name="com.starlingbank.android" />
  <package android:name="com.grppl.android.shell.CMBlloydsTSB73" />
  <package android:name="uk.co.hsbc.hsbcukmobilebanking" />
  <package android:name="com.rbs.mobile.android.natwest" />
  <package android:name="co.uk.Nationwide.Mobile" />
  <package android:name="com.grppl.android.shell.halifax" />
  <package android:name="com.rbs.mobile.android.rbs" />
  <package android:name="uk.co.santander.santanderUK" />
  <package android:name="com.revolut.revolut" />
  <package android:name="co.uk.getmondo" />
  <package android:name="com.grppl.android.shell.BOS" />
  <package android:name="ftb.ibank.android" />
  <package android:name="uk.co.tsb.newmobilebank" />
  <package android:name="com.firstdirect.bankingonthego" />
  <package android:name="com.virginmoney.uk.mobile.android" />
  <package android:name="uk.co.ybs.savings.external" />
  <package android:name="com.transferwise.android" />
  <package android:name="com.nearform.ptsb" />
  <package android:name="com.bankofireland.mobilebanking" />
  <package android:name="aib.ibank.android" />
  <package android:name="uk.co.bankofscotland.businessbank" />
  <package android:name="com.chase.intl" />
  <package android:name="com.rbs.mobile.android.ubn" />
  <package android:name="com.rbs.banklinemobile.rbs" />
  <package android:name="uk.co.hsbc.hsbcukbusinessbanking" />
  <package android:name="com.lloydsbank.businessmobil" />
  <package android:name="com.rbs.banklinemobile.natwest" />
  <package android:name="com.lloydsbank.businessmobile" />
</queries>
```

**Deep link intent filters** (for bank redirect back to app):
Add inside the main `<activity>`:

```xml
<!-- Custom scheme deep link -->
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="atoa" android:host="YOUR_HOST" android:pathPrefix="/sdk-redirect" />
</intent-filter>

<!-- HTTPS deep link (App Links) -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="YOUR_HOST" android:path="/sdk-redirect" />
</intent-filter>
```

Set `android:launchMode="singleTask"` on your main `<activity>` to prevent duplicate activities on deep link.

### 5.2 build.gradle (app level)

Ensure Hermes is enabled in `android/gradle.properties`:

```properties
hermesEnabled=true
```

Minimum SDK settings in `android/build.gradle`:

```groovy
ext {
    minSdkVersion = 24
    compileSdkVersion = 36
    targetSdkVersion = 36
}
```

---

## 6. iOS Configuration

### 6.1 Podfile

Ensure `use_frameworks! :linkage => :static` is present:

```ruby
platform :ios, min_ios_version_supported
prepare_react_native_project!

use_frameworks! :linkage => :static

target 'YourApp' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/..",
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
    )
  end
end
```

### 6.2 Install Pods

```bash
cd ios && pod install
```

### 6.3 Info.plist

Add URL scheme for deep linking:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>atoa</string>
    </array>
  </dict>
</array>
```

---

## 7. Metro Configuration (Monorepo / Local Development)

If running the SDK from source (monorepo), configure `metro.config.js`:

```js
const { getDefaultConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const appNodeModules = path.resolve(__dirname, 'node_modules');
const sdkEntry = path.resolve(root, 'src', 'index.ts');

const norm = (p) => p.replace(/\\/g, '/');
const parentNm = norm(path.join(root, 'node_modules'));

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,

  // Watch parent root so Metro can see SDK source files.
  watchFolders: [...(defaultConfig.watchFolders || []), root],

  resolver: {
    ...defaultConfig.resolver,

    // Prefer app's node_modules for package resolution.
    nodeModulesPaths: [appNodeModules],

    resolveRequest: (context, moduleName, platform) => {
      // The SDK itself -> point at src/index.ts
      if (moduleName === '@atoapayments/atoa-react-native-sdk') {
        return { filePath: sdkEntry, type: 'sourceFile' };
      }

      // Default resolution
      const result = context.resolveRequest(context, moduleName, platform);

      // Redirect parent/node_modules to app/node_modules (prevent duplicates)
      if (result?.filePath) {
        const fp = norm(result.filePath);
        if (fp.startsWith(parentNm + '/')) {
          const relative = fp.slice(parentNm.length + 1);
          const redirected = path.resolve(appNodeModules, relative);
          if (fs.existsSync(redirected)) {
            return { type: 'sourceFile', filePath: redirected };
          }
        }
      }

      return result;
    },
  },
};
```

> **Windows note:** Metro normalizes paths to forward slashes. Always use the `norm()` helper for path comparisons.

---

## 8. SDK Usage

### 8.1 Create a Payment Request

Call your backend to create a payment request and get a `paymentRequestId`.

### 8.2 Launch the Payment Flow

```tsx
import { AtoaSdk, isCompleted, isFailed, isPending } from '@atoapayments/atoa-react-native-sdk';
import type { AtoaPayOptions } from '@atoapayments/atoa-react-native-sdk';

const options: AtoaPayOptions = {
  paymentId: 'YOUR_PAYMENT_REQUEST_ID',
  env: 'prod',                    // 'prod' or 'sandbox'
  showHowPaymentWorks: true,      // Show intro sheet on first payment
  customerDetails: {              // Optional - for bank pre-selection
    phoneCountryCode: '44',
    phoneNumber: '1234567890',
    email: 'user@example.com',
  },
  onUserClose: ({ paymentRequestId, redirectUrlParams, signature, signatureHash }) => {
    console.log('User closed payment');
  },
  onPaymentStatusChange: ({ status, redirectUrlParams, signature, signatureHash }) => {
    console.log('Status changed:', status);
  },
  onError: (error) => {
    console.error('SDK error:', error.message);
  },
};

const result = await AtoaSdk.pay(options);

if (result) {
  if (isCompleted(result)) console.log('Payment successful');
  if (isPending(result))   console.log('Payment pending');
  if (isFailed(result))    console.log('Payment failed');
}
```

---

## 9. Running the Demo App

```bash
# 1. Install root SDK dependencies
cd AtoaReactNativeSDK
npm install

# 2. Install demo app dependencies
cd demo_app
npm install

# 3. (iOS only) Install pods
cd ios && pod install && cd ..

# 4. Start Metro bundler
npx react-native start --reset-cache

# 5. Run on Android (in a separate terminal)
npx react-native run-android

# 6. Run on iOS (in a separate terminal)
npx react-native run-ios
```

### Android Build (Alternative via Gradle)

```bash
cd demo_app/android
./gradlew app:installDebug -PreactNativeDevServerPort=8081
```

### Clean Build

```bash
cd demo_app/android
./gradlew clean
rm -rf .cxx
```

---

## 10. Troubleshooting

| Issue | Solution |
| ----- | -------- |
| `AtoaSdk.pay()` does nothing | Ensure app root is wrapped with `<AtoaProvider>` or `<RootSiblingParent>` |
| Duplicate module errors | Check Metro config redirects parent `node_modules` to app's `node_modules` |
| Reanimated crash on launch | Ensure `react-native-reanimated/plugin` is last in `babel.config.js` plugins |
| Bank app not detected (Android) | Add bank package names to `<queries>` in `AndroidManifest.xml` |
| Deep link not returning to app | Verify intent filters and `launchMode="singleTask"` on main activity |
| Metro can't find SDK source | Ensure `watchFolders` includes the SDK root directory |
| `npx react-native run-android` warns about missing CLI | React Native 0.83+ no longer bundles the CLI. Add `"@react-native-community/cli": "latest"`, `"@react-native-community/cli-platform-android": "latest"`, and `"@react-native-community/cli-platform-ios": "latest"` to your `devDependencies`, then run `npm install` |
| `ENOENT: spawn ./gradlew ENOENT` when running `run-android` | You must run `npx react-native run-android` from inside the `demo_app/` directory (where `android/` folder exists), not from the repo root. Run `cd demo_app` first, then `npx react-native run-android` |

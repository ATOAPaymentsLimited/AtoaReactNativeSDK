# Atoa React Native SDK

The official React Native SDK for integrating Atoa Payments into mobile applications.

[![License: MIT][license_badge]][license_link]
![Atoa SDK Flow][atoa_banner]

## Overview

The Atoa React Native SDK allows merchants to easily integrate Atoa Payments into their React Native applications. The SDK provides a simple interface for showing a payment page that handles the entire payment flow securely and efficiently.

- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Card Payments](#card-payments)
- [API Reference](#api-reference)
- [Handle Response](#handle-response)
- [Handle Redirection](#handle-redirection-optional)
- [Bank App Detection](#bank-app-detection)
- [Complete Demo App](demo_app/App.tsx)

> Please refer to our official React Native documentation [here](https://docs.atoa.me/react-native-sdk).

## Installation

### 1. Install the SDK

```sh
npm install @atoapayments/atoa-react-native-sdk
```

or

```sh
yarn add @atoapayments/atoa-react-native-sdk
```

### 2. Install required dependencies

The SDK uses a few community libraries for its payment sheet UI. **Most React Native projects already have some of these** — only add the ones you're missing.

| Package                           | Used for                       | You likely have it if...                  |
| --------------------------------- | ------------------------------ | ----------------------------------------- |
| `react-native-gesture-handler`    | Touch & swipe gestures         | You use React Navigation or bottom sheets |
| `react-native-reanimated`         | Smooth animations              | You use any animation-heavy library       |
| `react-native-svg`                | Icons and graphics             | You render SVGs anywhere in your app      |
| `@gorhom/bottom-sheet`            | Payment sheet modal            | —                                         |
| `@react-native-community/netinfo` | Network connectivity detection | —                                         |
| `lottie-react-native`             | Payment status animations      | —                                         |

Install all at once (skip any you already have):

```sh
npm install @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated react-native-svg @react-native-community/netinfo lottie-react-native
```

Using Expo? Use `npx expo install` instead to ensure compatible versions:

```sh
npx expo install @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated react-native-svg @react-native-community/netinfo lottie-react-native
```

> **Note:** `react-native-reanimated` requires a Babel plugin. If you haven't already, add `'react-native-reanimated/plugin'` to your `babel.config.js`. See the [Reanimated installation guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/) for details.

### 3. Install native dependencies (iOS)

```sh
cd ios && pod install
```

## Setup

### Wrap your app with AtoaProvider

Wrap your app root with `<AtoaProvider>` to enable the Atoa payment modal. This is **required** for `AtoaSdk.pay()` to work.

```tsx
// index.js
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

Alternatively, if you already use `react-native-root-siblings` in your project, you can wrap with `<RootSiblingParent>` directly:

```tsx
import { RootSiblingParent } from 'react-native-root-siblings';

const Root = () => (
  <RootSiblingParent>
    <App />
  </RootSiblingParent>
);
```

## Usage

Sample code to integrate can be found in [demo_app/App.tsx](demo_app/App.tsx).

### Import package

```tsx
import {
  AtoaSdk,
  isCompleted,
  isFailed,
  isPending,
  TransactionType,
  type AtoaPayOptions,
} from '@atoapayments/atoa-react-native-sdk';
```

### Show Payment Sheet

A full-screen payment sheet presents available banks. The user selects a bank, confirms the details, and is redirected to their bank app or website to complete payment.

```tsx
const result = await AtoaSdk.pay({
  paymentId: 'your-payment-request-id',
  env: 'production',
  // or 'sandbox'
  showHowPaymentWorks: false,
  // pass customer details for pre-select bank
  customerDetails: {
    phoneCountryCode: '44',
    phoneNumber: '8788899999',
    email: 'aaa@gmail.com',
  },
  onUserClose: ({
    paymentRequestId,
    redirectUrlParams,
    signature,
    signatureHash,
  }) => {
    // handle payment when user closes the payment verification bottom sheet
    console.log(
      `User closed the payment for paymentRequestId: ${paymentRequestId}`
    );
  },
  onPaymentStatusChange: ({
    status,
    redirectUrlParams,
    signature,
    signatureHash,
  }) => {
    // handle payment status
    console.log(`Payment Status Changed to ${status}`);
  },
  onError: (error) => {
    // handle Atoa SDK error
    console.error(`Error in Atoa SDK: ${error.message}`);
  },
});
```

### Customer Details for Previously Used Banks

The SDK supports displaying banks the customer has previously paid with through the `customerDetails` parameter:

#### Important Notes About Customer Details

- **Uniqueness**: The `customerDetails` should be a unique identifier for each customer in your system.
- **Persistence**: When a customer completes a payment, the bank they used is remembered and associated with this customerDetails.
- **Returning Customers**: For returning customers, providing the same `customerDetails` allows the SDK to offer the option to pay with banks they've previously used.
- **Security**: The information about previously used banks is securely stored by Atoa, not in your application.
- **Optional**: This parameter is optional. If not provided, each payment will be treated as a new transaction without showing previously used banks.

#### Best Practices

- Use a consistent and unique identifier from your system (e.g., user ID, customer reference).
- Keep the same `customerDetails` across all payments for the same customer to ensure continuity of previously used banks.
- Consider user consent and data privacy regulations when implementing this functionality.

## Card Payments

The SDK supports card payments in addition to open banking.
Card payments must be enabled on your [Atoa dashboard](https://docs.atoa.me). The `transactionType` option controls the flow:

| `transactionType`              | Behavior                                            |
| ------------------------------ | --------------------------------------------------- |
| Not set (default)              | Bank selection + card option at the end of the list |
| `TransactionType.OPEN_BANKING` | Bank selection only                                 |
| `TransactionType.CARD`         | Card payment only (skips bank selection)            |

```tsx
import { AtoaSdk, TransactionType } from '@atoapayments/atoa-react-native-sdk';

// Card-only flow
const result = await AtoaSdk.pay({
  paymentId: 'your-payment-request-id',
  env: 'production',
  showHowPaymentWorks: false,
  transactionType: TransactionType.CARD,
});
```

> **Note:** The card payment option visibility is controlled by the merchant's Atoa dashboard settings. There is no SDK-level toggle — if card payments are enabled for the merchant account, the option is shown automatically.

## API Reference

#### Parameters

- `options`: Configuration object (required)
  - `env`: The Atoa environment to use (`'sandbox'` | `'production'`)
  - `paymentId`: The payment request ID (required)
  - `showHowPaymentWorks`: Shows a sheet which explains the steps for making a payment (required)
  - `transactionType`: Transaction type — `undefined` (default, bank + card), `TransactionType.OPEN_BANKING` (bank only), or `TransactionType.CARD` (card only) (optional)
  - `customerDetails`: Customer details for the payment (optional)
  - `onError`: Error callback function (optional)
  - `onPaymentStatusChange`: Callback for payment status updates (optional)
  - `onUserClose`: Callback when payment dialog is closed (optional)

#### Detailed SDK Options

##### Environment

- Type: `AtoaEnv` (`'sandbox'` | `'production'`)
- Required: Yes
- Description: Specifies which Atoa environment to use for the payment

##### Payment Request ID

- Type: `string`
- Required: Yes
- Description: Unique identifier for the payment request

##### Show How Payment Works

- Type: `boolean`
- Required: Yes
- Description: Shows a sheet which explains the steps for making a payment.

##### Transaction Type

- Type: `TransactionType` (`TransactionType.OPEN_BANKING` | `TransactionType.CARD`)
- Required: No
- Default: `undefined` (shows bank selection with card payment option if enabled for the merchant)
- Description: Controls the payment flow. When not specified, the SDK shows bank selection with an optional card payment button. `OPEN_BANKING` shows bank selection only. `CARD` goes directly to card payment confirmation.

##### Customer Details

- Type: `CustomerDetails`
- Required: No
- Description: Customer information for the payment. When provided, the SDK will use this information to fetch the last bank used by the customer for payment, improving the user experience by showing their preferred bank first.

```tsx
interface CustomerDetails {
  phoneCountryCode?: string;
  phoneNumber?: string;
  email?: string;
}
```

##### Event Handlers

###### onError

- Type: `(error: AtoaException) => void`
- Description: Called when an error occurs during the payment process
- Parameters:
  - `error`: Error object containing:
    - `message`: Error message

###### onPaymentStatusChange

- Type: `(params: { status: string; redirectUrlParams?: Record<string, string>; signature?: string; signatureHash?: string }) => void`
- Description: Called when the payment status changes
- Parameters:
  - `status`: Current payment status
  - `redirectUrlParams`: (optional) Additional callback parameters
  - `signature`: (optional) Atoa signature for verification
  - `signatureHash`: (optional) Atoa signature hash for verification

###### onUserClose

- Type: `(params: { paymentRequestId: string; redirectUrlParams?: Record<string, string>; signature?: string; signatureHash?: string }) => void`
- Description: Called when the user cancels the payment
- Parameters:
  - `paymentRequestId`: The payment request ID
  - `redirectUrlParams`: (optional) Additional callback parameters
  - `signature`: (optional) Atoa signature for verification
  - `signatureHash`: (optional) Atoa signature hash for verification

## Handle Response

You can handle the payment success, failure, pending and other statuses based on payment response

```tsx
if (result) {
  if (isCompleted(result)) {
    // handle success
  } else if (isPending(result)) {
    // handle pending
  } else if (isFailed(result)) {
    // handle failure
  }
} else {
  // Bottom sheet was dismissed or encountered an error
}
```

Sample response can be seen [here](https://docs.atoa.me/introduction#step-3-handle-payment-status).

## Handle Redirection (Optional)

When calling the [payment-process](https://docs.atoa.me/api-reference/Payment/process-payment) API, you can specify a `redirectUrl` in your request body. After payment, the user is redirected to this URL, which can deep link back into your app.

Use [App Links](https://developer.android.com/training/app-links) (Android) or [Universal Links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content) (iOS) as your redirect URL. These must use the `https` scheme.

**What happens after redirect:**

1. Deep link configured and working — user returns to your app automatically
2. Deep link not configured — user lands on the redirect URL in a browser
3. Deep link configured but fails — user lands on the browser; consider adding a "Return to app" button on your redirect page as a fallback

> **Tip:** If deep linking fails, the user can always manually switch back to your app after payment.

### Android Setup

Add an intent filter to `android/app/src/main/AndroidManifest.xml`. Replace `devapp.atoa.me` with your domain and `/sdk-redirect` with your path:

```xml
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" />
    <data android:host="devapp.atoa.me" />
    <data android:path="/sdk-redirect" />
  </intent-filter>
```

### iOS Setup

Add the following to your `Info.plist`. Replace `devapp.atoa.me` with your domain:

    <dict>
      <key>CFBundleTypeRole</key>
      <string>Editor</string>
      <key>CFBundleURLSchemes</key>
      <array>
        <string>https</string>
      </array>
      <key>CFBundleURLName</key>
      <string>devapp.atoa.me</string>
    </dict>

Then update your entitlements file — add `com.apple.developer.associated-domains` with your domain:

```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
  <plist version="1.0">
    <dict>
      <key>aps-environment</key>
      <string>development</string>
      <key>com.apple.developer.associated-domains</key>
      <array>
        <string>applinks:devapp.atoa.me</string>
      </array>
    </dict>
  </plist>
```

### Bank App Detection

The SDK checks whether the user's selected bank app is installed on their device. This requires declaring the bank app package names / URL schemes in your native configuration.

#### Android

Add a `<queries>` block to your `AndroidManifest.xml`:

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
    <package android:name="com.lloydsbank.businessmobile" />
    <package android:name="com.rbs.banklinemobile.natwest" />
  </queries>
```

#### iOS

Add `LSApplicationQueriesSchemes` to your `Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>pulsesecure</string>
    <string>launchbmb</string>
    <string>lloyds-retail</string>
    <string>hsbc-pwnwguti5z</string>
    <string>uk.co.santander.santanderUK</string>
    <string>fb894703657238109</string>
    <string>bos-retail</string>
    <string>halifax-retail</string>
    <string>monzo</string>
    <string>starlingbank</string>
    <string>tsbmobile</string>
    <string>comfirstdirectbankingonthego</string>
    <string>launchFT</string>
    <string>virginmoneyimport</string>
    <string>ybssavings</string>
    <string>transferwise</string>
    <string>tg</string>
    <string>BOIOneAPP</string>
    <string>ie.aib.mobilebanking</string>
    <string>bos-commercial</string>
    <string>chase-international</string>
    <string>revolut</string>
    <string>lloyds-commercial</string>
    <string>dbbukmobileapp</string>
    <string>nationwide</string>
    <string>ydl</string>
</array>
```

### Resources

- [React Native Linking](https://reactnative.dev/docs/linking)
- [Android App Links](https://developer.android.com/training/app-links)
- [iOS Universal Links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content)

## Support

For any issues or inquiries, please contact hello@paywithatoa.co.uk.

[license_badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license_link]: https://opensource.org/licenses/MIT
[atoa_banner]: src/assets/images/atoa_sdk.png

## License

MIT © [Atoa Payments Limited](https://github.com/ATOAPaymentsLimited)

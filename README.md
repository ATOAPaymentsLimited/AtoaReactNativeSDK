# Atoa React Native SDK

The official React Native SDK for integrating Atoa Payments into mobile applications.

[![License: MIT][license_badge]][license_link]
![Atoa SDK Flow][atoa_banner]

## Overview

The Atoa React Native SDK allows merchants to easily integrate Atoa Payments into their React Native applications. The SDK provides a simple interface for showing a payment page that handles the entire payment flow securely and efficiently.

- [Installation](#installation)
- [Setup](#setup)
- [Usage](#usage)
- [Complete Demo App](demo_app/App.tsx)
- [Handle Redirection](#handle-redirection-optional)

> Please refer to our official React Native documentation [here](https://docs.atoa.me/react-native-sdk).

## Installation

Run the following to add Atoa SDK to your React Native project

```sh
npm install @atoapayments/atoa-react-native-sdk
```

or

```sh
yarn add @atoapayments/atoa-react-native-sdk
```

### Peer Dependencies

The SDK requires the following peer dependencies. Install them if you haven't already:

```sh
npm install @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated react-native-svg @react-native-community/netinfo lottie-react-native react-native-worklets
```

## Setup

#### Wrap your app with AtoaProvider

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

#### Import package

```tsx
import {
  AtoaSdk,
  isCompleted,
  isFailed,
  isPending,
  type AtoaPayOptions,
} from '@atoapayments/atoa-react-native-sdk';
```

#### Show Payment Sheet

It's a full screen sheet which shows all the available bank list then once user selects the bank. They can confirm the bank details and redirected to their bank app or website.

```tsx
const result = await AtoaSdk.pay({
  paymentId: 'your-payment-request-id',
  env: 'prod',
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

## API Reference

#### Parameters

- `options`: Configuration object (required)
  - `env`: The Atoa environment to use (`'sandbox'` | `'prod'`)
  - `paymentId`: The payment request ID (required)
  - `showHowPaymentWorks`: Shows a sheet which explains the steps for making a payment (required)
  - `customerDetails`: Customer details for the payment (optional)
  - `onError`: Error callback function (optional)
  - `onPaymentStatusChange`: Callback for payment status updates (optional)
  - `onUserClose`: Callback when payment dialog is closed (optional)

#### Detailed SDK Options

##### Environment

- Type: `AtoaEnv` (`'sandbox'` | `'prod'`)
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

## Handle Redirection

While calling [payment-process](https://docs.atoa.me/api-reference/Payment/process-payment) API to generate a payment, you can specify a `redirectUrl` in your request body. The `redirectUrl`, which should be passed as body parameters, redirects to your website and then opens your app via deep linking. This enables users to open your application after payment.

For journeys including web and mobile, you can use App Links for Android and Universal Links for iOS.

Both are special types of deep links that you can set as your redirect URL, but these must use either the http or https URI schemes.

Note: When a deep link has a custom URI scheme (not http or https) it will link to content that can only be accessed if the application is installed on the device.

There are 3 cases, after redirection to a given redirect URL

1. If you handled the deep links and works, then user redirected to app,
2. If not handled deep links, user will redirect to web browser.
3. If deep links is handled and fails to redirect to app, user will redirect to web browser to given redirect url.

Note: If deep links is handled and fails to redirect to app, you can add a 'Return to app' UI in your redirect page, so that you can manually click and redirect to app. If not, user can manually switch to app after payment.

- In Android, add intent-filters tag to handle deeplinks in `android/app/src/main/AndroidManifest.xml`

Replace 'devapp.atoa.me' with your own web domain and '/sdk-redirect' with your path.

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

- In iOS, add dict tag to handle deeplinks in `Info.plist` and update your entitlements file

Info.plist: Replace 'devapp.atoa.me' with your own web domain.

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

Entitlements: Add key 'com.apple.developer.associated-domains' and replace 'devapp.atoa.me' with your own web domain in array tag

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

### Checking bank app is installed or not

Our mobile SDK checks if the bank(using for making payments) app is installed or not. For that, you need to add 'queries' tag for android and 'LSApplicationQueriesSchemes' key for iOS

- In Android, you need to add 'queries' tag in `AndroidManifest.xml`

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
  </queries>
```

- In iOS, you need to add 'LSApplicationQueriesSchemes' key in `Info.plist`

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
        </array>

#### Resources for deep-linking

- [React Native Linking](https://reactnative.dev/docs/linking)
- [Android App Links](https://developer.android.com/training/app-links)
- [iOS Universal Links](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content)

For any issues or inquiries, please contact hello@paywithatoa.co.uk.

[license_badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license_link]: https://opensource.org/licenses/MIT
[atoa_banner]: src/assets/images/atoa_sdk.png

## License

MIT © [Atoa Payments Limited](https://github.com/ATOAPaymentsLimited)

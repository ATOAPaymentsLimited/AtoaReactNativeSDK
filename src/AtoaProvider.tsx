import React from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';

interface AtoaProviderProps {
  children: React.ReactNode;
}

/**
 * Wrap your app root with `<AtoaProvider>` to enable the Atoa payment modal.
 *
 * This is required for `AtoaSdk.pay()` to render the payment UI.
 *
 * @example
 * ```tsx
 * import { AtoaProvider } from '@atoapayments/atoa-react-native-sdk';
 *
 * const Root = () => (
 *   <AtoaProvider>
 *     <App />
 *   </AtoaProvider>
 * );
 *
 * AppRegistry.registerComponent(appName, () => Root);
 * ```
 */
export function AtoaProvider({ children }: AtoaProviderProps) {
  return <RootSiblingParent>{children}</RootSiblingParent>;
}

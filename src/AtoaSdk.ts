import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import type { AtoaPayOptions } from './types/sdk';
import type { TransactionDetails } from './types/payment';
import { AtoaPaymentModal } from './components/AtoaPaymentModal';

/**
 * Atoa React Native SDK
 *
 * Provides a single imperative method `pay()` to initiate the Atoa payment flow.
 * Requires `<AtoaProvider>` to wrap your app root.
 *
 * @example
 * ```tsx
 * // In index.js — wrap your app once:
 * import { AtoaProvider } from '@atoapayments/atoa-react-native-sdk';
 *
 * const Root = () => (
 *   <AtoaProvider>
 *     <App />
 *   </AtoaProvider>
 * );
 * AppRegistry.registerComponent(appName, () => Root);
 *
 * // Then anywhere in your app:
 * import { AtoaSdk } from '@atoapayments/atoa-react-native-sdk';
 *
 * const result = await AtoaSdk.pay({
 *   paymentId: 'your-payment-request-id',
 *   env: 'prod',
 *   showHowPaymentWorks: false,
 *   onPaymentStatusChange: ({ status }) => console.log(status),
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export class AtoaSdk {
  private static _currentModal: RootSiblings | null = null;
  private static _currentResolve:
    | ((result: TransactionDetails | null) => void)
    | null = null;

  /**
   * Show the Atoa payment flow and return the transaction result.
   *
   * @param options - Payment configuration options
   * @returns TransactionDetails on successful payment, null if user closes
   */
  static pay(options: AtoaPayOptions): Promise<TransactionDetails | null> {
    // Clean up any previous payment flow (stale from crash or active)
    AtoaSdk.clearCurrentPaymentFlow(null);

    return new Promise<TransactionDetails | null>((resolve, reject) => {
      AtoaSdk._currentResolve = resolve;

      const handleComplete = (result: TransactionDetails | null) => {
        AtoaSdk.clearCurrentPaymentFlow(result);
      };

      try {
        // Inject the modal at the root level using RootSiblings
        AtoaSdk._currentModal = new RootSiblings(
          React.createElement(AtoaPaymentModal, {
            options,
            onComplete: handleComplete,
          })
        );
      } catch (error) {
        AtoaSdk._currentModal = null;
        AtoaSdk._currentResolve = null;
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Dismiss any currently active payment flow.
   */
  static dismiss(): void {
    AtoaSdk.clearCurrentPaymentFlow(null);
  }

  private static clearCurrentPaymentFlow(result: TransactionDetails | null): void {
    const resolveFn = AtoaSdk._currentResolve;
    const modal = AtoaSdk._currentModal;
    AtoaSdk._currentResolve = null;
    AtoaSdk._currentModal = null;
    if (modal) {
      modal.destroy();
    }
    if (resolveFn) {
      resolveFn(result);
    }
  }
}

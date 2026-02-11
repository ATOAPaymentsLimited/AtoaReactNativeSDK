import React from 'react';
import RootSiblings from 'react-native-root-siblings';
import type { AtoaPayOptions } from './types/sdk';
import type { TransactionDetails } from './types/payment';
import { AtoaPaymentModal } from './components/AtoaPaymentModal';

/**
 * Atoa React Native SDK
 *
 * Provides a single imperative method `pay()` to initiate the Atoa payment flow.
 * No provider wrapper or setup needed in the host app.
 *
 * @example
 * ```tsx
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

  /**
   * Show the Atoa payment flow and return the transaction result.
   *
   * @param options - Payment configuration options
   * @returns TransactionDetails on successful payment, null if user closes
   */
  static pay(options: AtoaPayOptions): Promise<TransactionDetails | null> {
    // Prevent multiple simultaneous payment flows
    if (AtoaSdk._currentModal) {
      return Promise.reject(
        new Error('A payment flow is already in progress')
      );
    }

    return new Promise<TransactionDetails | null>((resolve) => {
      const handleComplete = (result: TransactionDetails | null) => {
        // Destroy the root sibling
        if (AtoaSdk._currentModal) {
          AtoaSdk._currentModal.destroy();
          AtoaSdk._currentModal = null;
        }
        resolve(result);
      };

      // Inject the modal at the root level using RootSiblings
      AtoaSdk._currentModal = new RootSiblings(
        React.createElement(AtoaPaymentModal, {
          options,
          onComplete: handleComplete,
        })
      );
    });
  }

  /**
   * Dismiss any currently active payment flow.
   */
  static dismiss(): void {
    if (AtoaSdk._currentModal) {
      AtoaSdk._currentModal.destroy();
      AtoaSdk._currentModal = null;
    }
  }
}

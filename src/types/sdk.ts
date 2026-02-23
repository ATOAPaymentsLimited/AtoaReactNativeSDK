import type { AtoaEnv } from './environment';
import type { CustomerDetails } from './customer';
import type { AtoaException } from './error';
import type { TransactionDetails } from './payment';

export interface AtoaPayOptions {
  /** The payment request ID (required) */
  paymentId: string;
  /** The Atoa environment to use (required) - controls sandbox query params */
  env: AtoaEnv;
  /** Shows a sheet explaining the steps for making a payment (required) */
  showHowPaymentWorks: boolean;
  /** Customer details for pre-selecting bank (optional) */
  customerDetails?: CustomerDetails;
  /** Called when the user closes the payment flow */
  onUserClose?: (params: {
    paymentRequestId: string;
    redirectUrlParams?: Record<string, string>;
    signature?: string;
    signatureHash?: string;
  }) => void;
  /** Called when payment status changes */
  onPaymentStatusChange?: (params: {
    status: string;
    redirectUrlParams?: Record<string, string>;
    signature?: string;
    signatureHash?: string;
  }) => void;
  /** Called when an error occurs */
  onError?: (error: AtoaException) => void;
}

export interface AtoaPayResult {
  transactionDetails: TransactionDetails | null;
}

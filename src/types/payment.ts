import type { MerchantThemeDetails, SavedBankDetails, StoreDetails } from './merchant';
import { TransactionStatus, VALID_STATUSES } from '../constants/transaction-status';
import type { TransactionStatusValue } from '../constants/transaction-status';

export { TransactionStatus, type TransactionStatusValue };

export interface Amount {
  amount: number;
  currency: string;
}

export function parseTransactionStatus(
  value: string | null | undefined
): TransactionStatusValue | string {
  if (!value) {
    return TransactionStatus.PAYMENT_NOT_INITIATED;
  }
  const upper = value.toUpperCase();
  if (VALID_STATUSES.includes(upper as TransactionStatusValue)) {
    return upper as TransactionStatusValue;
  }
  return upper;
}

export interface PaymentRequestData {
  merchantBusinessName: string;
  merchantId: string;
  amount: Amount;
  taxPercentage: number;
  servicePercentage: number;
  employeeId?: string;
  customerId?: string;
  consumerId?: string;
  env?: string;
  encryptedNotesDetails?: string;
  encryptedQrDetails?: string;
  merchantNotes?: string;
  splitOutstandingAmount?: number;
  callbackParams?: string;
  notes?: string;
  storeImg?: string;
  contextType?: string;
  storeDetails?: StoreDetails;
  paymentType?: string;
  expiresIn?: number;
  requestCreatedAt?: string;
  strictExpiry?: boolean;
  allowSdkRetry?: boolean;
  splitBill?: boolean;
  options?: Record<string, unknown>;
  merchantThemeDetails?: MerchantThemeDetails;
  lastPaymentBankDetails?: SavedBankDetails;
  encryptedPaymentDetails?: string;
  encryptedRefundPaymentDetails?: string;
  paymentSourceType?: number;
  redirectOnCompleted?: boolean;
}

export function isCardPaymentEnabled(data: PaymentRequestData | null | undefined): boolean {
  return data?.options?.cardPaymentEnabled === true;
}

export interface PaymentAuthResponse {
  authorisationUrl: string;
  paymentIdempotencyId: string;
  userUuid?: string;
  status?: string;
  featureScope?: string[];
  tracingId?: string;
  deepLinkAuthorisationUrl?: string;
  deepLinkAndroidAuthorisationUrl?: string;
  deepLinkAuthorisationUrlIOS?: string;
  appStoreLink?: string;
  playStoreLink?: string;
  androidPackageName?: string;
  iOSPackageName?: string;
  cardCheckoutId?: string;
}

export interface PaymentAuthRequestBody {
  merchantId: string;
  consumerId: string;
  merchantName: string;
  amount: Amount;
  applicationUserId: string;
  institutionId: string;
  taxPercentage: number;
  servicePercentage: number;
  features: string[] | null;
  deviceOrigin: string;
  totalAmountDue: number;
  paymentDevice: DeviceInfo;
  consumerName?: string;
  paymentRequest?: { paymentType: string };
  transactionType?: string;
  employeeId?: string;
  encryptedNotesDetails?: string;
  storeDetails?: StoreDetails;
  callbackParams?: string;
  paymentLinkId?: string;
  paymentRequestSource?: PaymentRequestWithSource;
  paymentSourceType?: number;
  tipAmount?: number;
  notes?: string;
  contextType?: string;
  orderId?: string;
  merchantPaymentOptions?: Record<string, unknown>;
  /** Intentional typo: matches backend API field name */
  encryptedPaymentDetails?: string;
  encryptedRefundPaymentDetails?: string;
  encryptedQrDetails?: string;
  redirectOnCompleted?: boolean;
}

export interface DeviceInfo {
  platform: string;
  osVersion?: string;
  manufacturer?: string;
  model?: string;
  deviceMemory?: number;
}

export interface PaymentRequestWithSource {
  requestCreatedAt?: string;
  splitBill?: boolean;
  /** Stringified boolean — API expects string, converted via .toString() in buildPaymentAuthBody */
  allowSdkRetry?: string;
  /** Stringified boolean — API expects string, converted via .toString() in buildPaymentAuthBody */
  strictExpiry?: string;
  /** Stringified number — API expects string, converted via .toString() in buildPaymentAuthBody */
  expiresIn?: string;
  paymentRequestId?: string;
}

export interface TransactionDetails {
  applicationUserId: string;
  paidAmount: number;
  currency: string;
  status: TransactionStatusValue | string;
  createdAt: string;
  paymentIdempotencyId: string;
  paymentId?: string;
  updatedAt?: string;
  bankName?: string;
  bankAccountNo?: string;
  notes?: string;
  taxAmount?: number;
  serviceAmount?: number;
  tipAmount?: number;
  qrId?: string;
  storeId?: string;
  qrNickName?: string;
  errorDescription?: string;
  paymentSourceType?: number;
  paymentLinkId?: string;
  employeeId?: string;
  /** Intentional typo: matches backend API field name */
  pendingTrasactionError?: string;
  orderId?: string;
  merchantId?: string;
  merchantName?: string;
  avatar?: string;
  storeDetails?: StoreDetails;
  institutionId?: string;
  signatureHash?: string;
  signature?: string;
  redirectUrlParams?: Record<string, string>;
}

export function isCompleted(details: TransactionDetails): boolean {
  return details.status === TransactionStatus.COMPLETED;
}

export function isFailed(details: TransactionDetails): boolean {
  return details.status === TransactionStatus.FAILED;
}

export function isPending(details: TransactionDetails): boolean {
  return details.status === TransactionStatus.PENDING;
}

export function isAwaitingAuth(details: TransactionDetails): boolean {
  return details.status === TransactionStatus.AWAITING_AUTHORIZATION;
}

export function isNotInitiated(details: TransactionDetails): boolean {
  return details.status === TransactionStatus.PAYMENT_NOT_INITIATED;
}

function parseAmount(amount: unknown): number {
  if (amount == null) {
    return 0;
  }
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof amount === 'number') {
    return amount;
  }
  return 0;
}

export function parseTransactionDetails(
  json: Record<string, unknown>
): TransactionDetails {
  return {
    applicationUserId: json.applicationUserId as string,
    paidAmount: parseAmount(json.paidAmount),
    currency: json.currency as string,
    status: parseTransactionStatus(json.status as string | null),
    createdAt: json.createdAt as string,
    paymentIdempotencyId: json.paymentIdempotencyId as string,
    paymentId: json.paymentId as string | undefined,
    updatedAt: json.updatedAt as string | undefined,
    bankName: json.bankName as string | undefined,
    bankAccountNo: json.bankAccountNo as string | undefined,
    notes: json.notes as string | undefined,
    taxAmount: parseAmount(json.taxAmount),
    serviceAmount: parseAmount(json.serviceAmount),
    tipAmount: parseAmount(json.tipAmount),
    qrId: json.qrId as string | undefined,
    storeId: json.storeId as string | undefined,
    qrNickName: json.qrNickName as string | undefined,
    errorDescription: json.errorDescription as string | undefined,
    paymentSourceType: (json.paymentSourceType as number) ?? 3,
    paymentLinkId: json.paymentLinkId as string | undefined,
    employeeId: json.employeeId as string | undefined,
    pendingTrasactionError: json.pendingTrasactionError as string | undefined,
    orderId: json.orderId as string | undefined,
    merchantId: json.merchantId as string | undefined,
    merchantName: json.merchantName as string | undefined,
    avatar: json.avatar as string | undefined,
    storeDetails: json.storeDetails as StoreDetails | undefined,
    institutionId: json.institutionId as string | undefined,
    signatureHash: json.signatureHash as string | undefined,
    signature: json.signature as string | undefined,
    redirectUrlParams: json.redirectUrlParams as
      | Record<string, string>
      | undefined,
  };
}

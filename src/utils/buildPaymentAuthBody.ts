import type {
  PaymentRequestData,
  PaymentAuthRequestBody,
} from '../types/payment';
import { getDeviceInfo } from './deviceInfo';
import { generateUUID } from './uuid';

/**
 * Builds the PaymentAuthRequestBody from PaymentRequestData,
 * matching the Atoa API's expected request body format.
 */
export function buildPaymentAuthBody(params: {
  paymentDetails: PaymentRequestData;
  institutionId: string;
  paymentRequestId: string;
  features: string[];
  requestCreatedAt: string;
  transactionType?: string;
}): PaymentAuthRequestBody {
  const { paymentDetails, institutionId, paymentRequestId, features, requestCreatedAt, transactionType } = params;

  let consumerId = paymentDetails.consumerId;
  if (!consumerId || consumerId.length === 0) {
    consumerId = generateUUID();
  }

  const deviceInfo = getDeviceInfo();

  return {
    storeDetails: paymentDetails.storeDetails,
    merchantId: paymentDetails.merchantId,
    consumerId: consumerId,
    merchantName: paymentDetails.merchantBusinessName,
    amount: paymentDetails.amount,
    applicationUserId: consumerId,
    institutionId,
    taxPercentage: paymentDetails.taxPercentage,
    servicePercentage: paymentDetails.servicePercentage,
    features,
    deviceOrigin: 'SDK_MOBILE_APP',
    totalAmountDue: paymentDetails.amount.amount,
    employeeId: paymentDetails.employeeId,
    callbackParams: paymentDetails.callbackParams,
    contextType: paymentDetails.contextType,
    merchantPaymentOptions: paymentDetails.options,
    encryptedNotesDetails: paymentDetails.encryptedNotesDetails,
    paymentSourceType: 3,
    paymentDevice: deviceInfo,
    paymentRequest: { paymentType: 'TRANSACTION' },
    paymentRequestSource: {
      requestCreatedAt,
      splitBill: paymentDetails.splitBill,
      allowSdkRetry: paymentDetails.allowSdkRetry?.toString(),
      strictExpiry: paymentDetails.strictExpiry?.toString(),
      expiresIn: paymentDetails.expiresIn?.toString(),
      paymentRequestId,
    },
    redirectOnCompleted: paymentDetails.redirectOnCompleted,
    encryptedPaymentDetails: paymentDetails.encryptedPaymentDetails,
    encryptedRefundPaymentDetails: paymentDetails.encryptedRefundPaymentDetails,
    encryptedQrDetails: paymentDetails.encryptedQrDetails,
    transactionType: transactionType,
  };
}

import { v4 as uuidv4 } from 'uuid';
import type {
  PaymentRequestData,
  PaymentAuthRequestBody,
} from '../types/payment';
import { getDeviceInfo } from './deviceInfo';

/**
 * Builds the PaymentAuthRequestBody from PaymentRequestData,
 * matching the Flutter `PaymentRequestDataX.toBody()` extension.
 */
export function buildPaymentAuthBody(params: {
  paymentDetails: PaymentRequestData;
  institutionId: string;
  paymentRequestId: string;
  features: string[];
  requestCreatedAt: string;
}): PaymentAuthRequestBody {
  const { paymentDetails, institutionId, paymentRequestId, features, requestCreatedAt } = params;

  let consumerId = paymentDetails.consumerId;
  if (!consumerId || consumerId.length === 0) {
    consumerId = uuidv4();
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
    encrptedPaymentDetails: paymentDetails.encryptedPaymentDetails,
    encryptedRefundPaymentDetails: paymentDetails.encryptedRefundPaymentDetails,
    encryptedQrDetails: paymentDetails.encryptedQrDetails,
  };
}

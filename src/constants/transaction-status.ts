export const TransactionStatus = {
  COMPLETED: 'COMPLETED',
  PENDING: 'PENDING',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  AWAITING_AUTHORIZATION: 'AWAITING_AUTHORIZATION',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  PAYMENT_NOT_INITIATED: 'PAYMENT_NOT_INITIATED',
} as const;

export type TransactionStatusValue =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const VALID_STATUSES: TransactionStatusValue[] = Object.values(TransactionStatus);

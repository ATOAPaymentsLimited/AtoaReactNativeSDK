export type AtoaExceptionType =
  | 'custom'
  | 'notInitialized'
  | 'noDataFound'
  | 'environmentNotSet';

const EXCEPTION_MESSAGES: Record<AtoaExceptionType, string> = {
  custom: 'An error occurred',
  notInitialized: 'Client not initialized',
  noDataFound: 'No data found',
  environmentNotSet: 'AtoaEnv is not set',
};

/** API error message when a payment link has already been paid */
export const LINK_PAID_MESSAGE = "You've already paid this bill, so there's no need to pay it again!";
/** API error message when a payment request has expired */
export const REQUEST_EXPIRED_MESSAGE =
  'Please reach out to the business for a new link and attempt to pay again';

export class AtoaException extends Error {
  type: AtoaExceptionType;
  amount?: number;
  referenceId?: string;
  time?: string;

  constructor(
    type: AtoaExceptionType,
    message?: string,
    amount?: number,
    referenceId?: string,
    time?: string
  ) {
    super(message ?? EXCEPTION_MESSAGES[type]);
    this.type = type;
    this.amount = amount;
    this.referenceId = referenceId;
    this.time = time;
    this.name = 'AtoaException';
  }
}

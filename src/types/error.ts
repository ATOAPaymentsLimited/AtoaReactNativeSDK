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

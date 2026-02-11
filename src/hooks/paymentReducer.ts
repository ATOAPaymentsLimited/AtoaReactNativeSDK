import type { BankInstitution } from '../types/bank';
import type {
  PaymentRequestData,
  PaymentAuthResponse,
  TransactionDetails,
} from '../types/payment';

export interface PaymentState {
  // Bank selection
  bankList: BankInstitution[];
  isLoading: boolean;
  isLoadingDetails: boolean;
  isLoadingFilterBanks: boolean;
  selectedBank: BankInstitution | null;
  paymentDetails: PaymentRequestData | null;
  paymentAuth: PaymentAuthResponse | null;
  isAppInstalled: boolean;
  isLoadingAuth: boolean;
  showHowPaymentWorks: boolean | null;
  hasLastPaymentDetails: boolean;
  lastBankDetails: BankInstitution | null;
  showConfirmation: boolean;
  showLinkExpired: boolean;
  // Payment status
  transactionDetails: TransactionDetails | null;
  paymentStarted: boolean;
  // Errors
  error: Error | null;
  bankAuthError: Error | null;
  paymentDetailsError: Error | null;
  bankFetchingError: Error | null;
  paymentStatusError: Error | null;
  // Search
  searchTerm: string;
  // UI flow
  showVerifying: boolean;
}

export const initialPaymentState: PaymentState = {
  bankList: [],
  isLoading: false,
  isLoadingDetails: false,
  isLoadingFilterBanks: false,
  selectedBank: null,
  paymentDetails: null,
  paymentAuth: null,
  isAppInstalled: true,
  isLoadingAuth: false,
  showHowPaymentWorks: null,
  hasLastPaymentDetails: false,
  lastBankDetails: null,
  showConfirmation: false,
  showLinkExpired: false,
  transactionDetails: null,
  paymentStarted: false,
  error: null,
  bankAuthError: null,
  paymentDetailsError: null,
  bankFetchingError: null,
  paymentStatusError: null,
  searchTerm: '',
  showVerifying: false,
};

export type PaymentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_DETAILS'; payload: boolean }
  | { type: 'SET_LOADING_FILTER_BANKS'; payload: boolean }
  | { type: 'SET_LOADING_AUTH'; payload: boolean }
  | { type: 'SET_BANK_LIST'; payload: BankInstitution[] }
  | { type: 'SET_SELECTED_BANK'; payload: BankInstitution | null }
  | { type: 'SET_PAYMENT_DETAILS'; payload: PaymentRequestData | null }
  | { type: 'SET_PAYMENT_AUTH'; payload: PaymentAuthResponse | null }
  | { type: 'SET_IS_APP_INSTALLED'; payload: boolean }
  | { type: 'SET_SHOW_HOW_PAYMENT_WORKS'; payload: boolean | null }
  | { type: 'SET_HAS_LAST_PAYMENT_DETAILS'; payload: boolean }
  | { type: 'SET_LAST_BANK_DETAILS'; payload: BankInstitution | null }
  | { type: 'SET_SHOW_CONFIRMATION'; payload: boolean }
  | { type: 'SET_SHOW_LINK_EXPIRED'; payload: boolean }
  | { type: 'SET_TRANSACTION_DETAILS'; payload: TransactionDetails | null }
  | { type: 'SET_PAYMENT_STARTED'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_BANK_AUTH_ERROR'; payload: Error | null }
  | { type: 'SET_PAYMENT_DETAILS_ERROR'; payload: Error | null }
  | { type: 'SET_BANK_FETCHING_ERROR'; payload: Error | null }
  | { type: 'SET_PAYMENT_STATUS_ERROR'; payload: Error | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_SHOW_VERIFYING'; payload: boolean }
  | { type: 'RESET_SELECT_BANK' }
  | { type: 'RESET_APP_INSTALLED' };

export function paymentReducer(
  state: PaymentState,
  action: PaymentAction
): PaymentState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOADING_DETAILS':
      return { ...state, isLoadingDetails: action.payload };
    case 'SET_LOADING_FILTER_BANKS':
      return { ...state, isLoadingFilterBanks: action.payload };
    case 'SET_LOADING_AUTH':
      return { ...state, isLoadingAuth: action.payload };
    case 'SET_BANK_LIST':
      return { ...state, bankList: action.payload };
    case 'SET_SELECTED_BANK':
      return { ...state, selectedBank: action.payload };
    case 'SET_PAYMENT_DETAILS':
      return { ...state, paymentDetails: action.payload };
    case 'SET_PAYMENT_AUTH':
      return { ...state, paymentAuth: action.payload };
    case 'SET_IS_APP_INSTALLED':
      return { ...state, isAppInstalled: action.payload };
    case 'SET_SHOW_HOW_PAYMENT_WORKS':
      return { ...state, showHowPaymentWorks: action.payload };
    case 'SET_HAS_LAST_PAYMENT_DETAILS':
      return { ...state, hasLastPaymentDetails: action.payload };
    case 'SET_LAST_BANK_DETAILS':
      return { ...state, lastBankDetails: action.payload };
    case 'SET_SHOW_CONFIRMATION':
      return { ...state, showConfirmation: action.payload };
    case 'SET_SHOW_LINK_EXPIRED':
      return { ...state, showLinkExpired: action.payload };
    case 'SET_TRANSACTION_DETAILS':
      return { ...state, transactionDetails: action.payload };
    case 'SET_PAYMENT_STARTED':
      return { ...state, paymentStarted: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BANK_AUTH_ERROR':
      return { ...state, bankAuthError: action.payload };
    case 'SET_PAYMENT_DETAILS_ERROR':
      return { ...state, paymentDetailsError: action.payload };
    case 'SET_BANK_FETCHING_ERROR':
      return { ...state, bankFetchingError: action.payload };
    case 'SET_PAYMENT_STATUS_ERROR':
      return { ...state, paymentStatusError: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_SHOW_VERIFYING':
      return { ...state, showVerifying: action.payload };
    case 'RESET_SELECT_BANK':
      return {
        ...state,
        selectedBank: null,
        paymentAuth: null,
        showLinkExpired: false,
        isAppInstalled: true,
        lastBankDetails: null,
      };
    case 'RESET_APP_INSTALLED':
      return { ...state, isAppInstalled: true };
    default:
      return state;
  }
}

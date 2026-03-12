import { useCallback, useMemo, useRef, useEffect } from 'react';
import { Linking, Platform } from 'react-native';
import { usePaymentContext } from './PaymentContext';
import { useConnectivityContext } from './ConnectivityContext';
import type { BankInstitution } from '../types/bank';
import type { PaymentRequestData, PaymentAuthResponse } from '../types/payment';
import { AtoaException } from '../types/error';
import { buildPaymentAuthBody } from '../utils/buildPaymentAuthBody';
import { isAppInstalled } from '../utils/appInstalled';
import { getBrandingColors } from '../utils/brandingColors';
import { ERROR_BANK_APP_DOWN, ERROR_BANK_DOWN, ERROR_SERVER_NOT_REACHABLE } from '../constants/component-constants';

function toAtoaException(e: unknown): AtoaException {
  if (e instanceof AtoaException) { return e; }
  return new AtoaException('custom', e instanceof Error ? e.message : String(e));
}

const sortByFullName = (a: BankInstitution, b: BankInstitution) =>
  a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase());

const sortByOrderBy = (a: BankInstitution, b: BankInstitution) =>
  a.orderBy - b.orderBy;

export function useBankInstitutions() {
  const { state, dispatch, client, options } = usePaymentContext();
  const { checkConnection } = useConnectivityContext();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const linkExpiredTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const linkRefreshCountRef = useRef(0);
  const stopPollingRef = useRef<() => void>(() => {});
  const selectedBankRef = useRef(state.selectedBank);
  selectedBankRef.current = state.selectedBank;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      stopPollingRef.current();
    };
  }, []);

  const getPaymentDetails = useCallback(async (): Promise<PaymentRequestData | null> => {
    dispatch({ type: 'SET_LOADING_DETAILS', payload: true });
    try {
      const paymentRes = await client.getPaymentDetails(
        options.paymentId,
        options.customerDetails
      );
      dispatch({ type: 'SET_PAYMENT_DETAILS', payload: paymentRes });
      return paymentRes;
    } catch (e) {
      const err = toAtoaException(e);
      options.onError?.(err);
      if (err.message.includes(ERROR_SERVER_NOT_REACHABLE)) {
        checkConnection();
      }
      dispatch({ type: 'SET_PAYMENT_DETAILS_ERROR', payload: err });
      dispatch({ type: 'SET_PAYMENT_DETAILS', payload: null });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING_DETAILS', payload: false });
    }
  }, [client, dispatch, options, checkConnection]);

  const fetchBanks = useCallback(async (): Promise<BankInstitution[]> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await client.fetchInstitutions();
      dispatch({ type: 'SET_BANK_LIST', payload: res });
      return res;
    } catch (e) {
      const err = toAtoaException(e);
      options.onError?.(err);
      if (err.message.includes(ERROR_SERVER_NOT_REACHABLE)) {
        checkConnection();
      }
      dispatch({ type: 'SET_BANK_FETCHING_ERROR', payload: err });
      return [];
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [client, dispatch, options, checkConnection]);

  const matchLastBank = useCallback((
    banks: BankInstitution[],
    paymentDetails: PaymentRequestData | null,
  ) => {
    const lastPaymentBank = paymentDetails?.lastPaymentBankDetails;
    if (!lastPaymentBank?.institutionId) { return; }
    const lastBank = banks.find(
      (b: BankInstitution) => b.id === lastPaymentBank.institutionId
    );
    if (lastBank && paymentDetails?.amount?.amount != null) {
      dispatch({
        type: 'SET_HAS_LAST_PAYMENT_DETAILS',
        payload:
          lastBank.enabled &&
          lastBank.transactionAmountLimit >= paymentDetails.amount.amount,
      });
      dispatch({ type: 'SET_LAST_BANK_DETAILS', payload: lastBank });
    }
  }, [dispatch]);

  const fetchFilteredBanks = useCallback(
    async (searchTerm: string) => {
      dispatch({ type: 'SET_LOADING_FILTER_BANKS', payload: true });
      try {
        const res = await client.fetchInstitutions(searchTerm);
        dispatch({ type: 'SET_BANK_LIST', payload: res });
      } catch (e) {
        const err = toAtoaException(e);
        options.onError?.(err);
        dispatch({ type: 'SET_BANK_FETCHING_ERROR', payload: err });
      } finally {
        dispatch({ type: 'SET_LOADING_FILTER_BANKS', payload: false });
      }
    },
    [client, dispatch, options]
  );

  const search = useCallback(
    (value: string) => {
      dispatch({ type: 'SET_SEARCH_TERM', payload: value });
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchTimerRef.current = setTimeout(() => {
        fetchFilteredBanks(value);
      }, 600);
    },
    [dispatch, fetchFilteredBanks]
  );

  const checkBankAppAvailability = useCallback(
    async (authResponse?: PaymentAuthResponse) => {
      const auth = authResponse ?? state.paymentAuth;
      if (!auth) {
        return;
      }

      let urlSchemeEmptyFromApi = false;

      if (Platform.OS === 'ios') {
        const bundleId = auth.iOSPackageName;
        urlSchemeEmptyFromApi = !(bundleId && bundleId.length > 0);
      } else {
        const pkgName = auth.androidPackageName;
        urlSchemeEmptyFromApi = !(pkgName && pkgName.length > 0);
      }

      // Also suppress the warning if no store link is provided — showing
      // "download the app" with no actionable link is misleading.
      const hasStoreLink = Platform.OS === 'ios'
        ? !!(auth.appStoreLink && auth.appStoreLink.length > 0)
        : !!(auth.playStoreLink && auth.playStoreLink.length > 0);

      if (urlSchemeEmptyFromApi || !hasStoreLink) {
        dispatch({ type: 'SET_IS_APP_INSTALLED', payload: true });
        return;
      }

      const result = await isAppInstalled(
        auth.androidPackageName ?? undefined,
        auth.iOSPackageName ?? undefined,
      );
      dispatch({ type: 'SET_IS_APP_INSTALLED', payload: result });
    },
    [state.paymentAuth, dispatch]
  );

  const selectBank = useCallback(
    async (selectedBank: BankInstitution | null): Promise<'success' | 'bank_down' | 'error'> => {
      if (!selectedBank) {
        return 'error';
      }

      dispatch({ type: 'SET_SELECTED_BANK', payload: selectedBank });
      dispatch({ type: 'SET_LOADING_AUTH', payload: true });
      dispatch({ type: 'SET_PAYMENT_AUTH', payload: null });
      dispatch({ type: 'SET_BANK_AUTH_ERROR', payload: null });

      const paymentDetails = state.paymentDetails;
      if (!paymentDetails) {
        dispatch({ type: 'SET_LOADING_AUTH', payload: false });
        return 'error';
      }

      try {
        const body = buildPaymentAuthBody({
          paymentDetails,
          institutionId: selectedBank.id,
          paymentRequestId: options.paymentId,
          features: selectedBank.features,
          requestCreatedAt: paymentDetails.requestCreatedAt ?? '',
          transactionType: 'OPEN_BANKING',
        });

        const paymentAuth = await client.getPaymentAuth(body);
        dispatch({ type: 'SET_PAYMENT_AUTH', payload: paymentAuth });

        // Check bank app availability using the response directly
        // (state.paymentAuth would be stale here since dispatch is async)
        await checkBankAppAvailability(paymentAuth);
        return 'success';
      } catch (e) {
        const err = toAtoaException(e);
        options.onError?.(err);
        dispatch({ type: 'SET_PAYMENT_AUTH', payload: null });
        dispatch({ type: 'SET_BANK_AUTH_ERROR', payload: err });

        const msg = err.message?.toLowerCase() ?? '';
        if (msg.includes(ERROR_BANK_APP_DOWN) || msg.includes(ERROR_BANK_DOWN)) {
          return 'bank_down';
        }
        return 'error';
      } finally {
        dispatch({ type: 'SET_LOADING_AUTH', payload: false });
      }
    },
    [state.paymentDetails, dispatch, client, options, checkBankAppAvailability]
  );

  const selectCardPayment = useCallback(
    async (): Promise<'success' | 'error'> => {
      dispatch({ type: 'SET_LOADING_AUTH', payload: true });
      dispatch({ type: 'SET_PAYMENT_AUTH', payload: null });
      dispatch({ type: 'SET_BANK_AUTH_ERROR', payload: null });

      const paymentDetails = state.paymentDetails;
      if (!paymentDetails) {
        dispatch({ type: 'SET_LOADING_AUTH', payload: false });
        return 'error';
      }

      try {
        const body = buildPaymentAuthBody({
          paymentDetails,
          institutionId: 'rapyd',
          paymentRequestId: options.paymentId,
          features: ['CREATE_DOMESTIC_SINGLE_PAYMENT'],
          requestCreatedAt: paymentDetails.requestCreatedAt ?? '',
          transactionType: 'CARD',
        });

        const paymentAuth = await client.getPaymentAuth(body);
        dispatch({ type: 'SET_PAYMENT_AUTH', payload: paymentAuth });
        return 'success';
      } catch (e) {
        const err = toAtoaException(e);
        options.onError?.(err);
        dispatch({ type: 'SET_PAYMENT_AUTH', payload: null });
        dispatch({ type: 'SET_BANK_AUTH_ERROR', payload: err });
        return 'error';
      } finally {
        dispatch({ type: 'SET_LOADING_AUTH', payload: false });
      }
    },
    [state.paymentDetails, dispatch, client, options]
  );

  const authorizeBank = useCallback(async (): Promise<boolean> => {
    const paymentAuth = state.paymentAuth;
    if (!paymentAuth) {
      return false;
    }

    try {
      let url: string;
      if (Platform.OS === 'android') {
        url =
          paymentAuth.deepLinkAndroidAuthorisationUrl ??
          paymentAuth.authorisationUrl;
      } else {
        url =
          paymentAuth.deepLinkAuthorisationUrlIOS ??
          paymentAuth.authorisationUrl;
      }

      // Try deep link first — canOpenURL is unreliable on Android 11+
      // due to package visibility restrictions, so attempt openURL directly
      // and fall back to the web authorisation URL on failure.
      try {
        await Linking.openURL(url);
        return true;
      } catch {
        await Linking.openURL(paymentAuth.authorisationUrl);
        return true;
      }
    } catch (e) {
      const err = toAtoaException(e);
      options.onError?.(err);
      dispatch({ type: 'SET_ERROR', payload: err });
      return false;
    }
  }, [state.paymentAuth, dispatch, options]);

  const getPaymentDetailsAndBanks = useCallback(
    async () => {
      // Run both API calls in parallel — fetchInstitutions doesn't depend on payment details
      const [paymentDetails, banks] = await Promise.all([
        getPaymentDetails(),
        fetchBanks(),
      ]);
      // Now that both are done, check last-used bank against the fetched bank list
      matchLastBank(banks, paymentDetails);
    },
    [getPaymentDetails, fetchBanks, matchLastBank]
  );

  const resetSelectBank = useCallback(() => {
    dispatch({ type: 'RESET_SELECT_BANK' });
  }, [dispatch]);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (linkExpiredTimerRef.current) {
      clearTimeout(linkExpiredTimerRef.current);
      linkExpiredTimerRef.current = null;
    }
  }, []);

  // Keep ref in sync for cleanup effect
  stopPollingRef.current = stopPolling;

  const startPolling = useCallback(() => {
    stopPolling();
    linkRefreshCountRef.current = 0;

    pollingTimerRef.current = setInterval(() => {
      linkRefreshCountRef.current++;
      if (linkRefreshCountRef.current > 5) {
        // After 30 min (6 refreshes), set link expired after 5 more min
        stopPolling();
        linkExpiredTimerRef.current = setTimeout(() => {
          dispatch({ type: 'SET_SHOW_LINK_EXPIRED', payload: true });
        }, 5 * 60 * 1000);
      } else {
        selectBank(selectedBankRef.current);
      }
    }, 5 * 60 * 1000);
  }, [stopPolling, selectBank, dispatch]);

  const personalBanks = useMemo(
    () => state.bankList.filter((b) => !b.businessBank),
    [state.bankList]
  );
  const businessBanks = useMemo(
    () => state.bankList.filter((b) => b.businessBank),
    [state.bankList]
  );
  const brandingColors = getBrandingColors(
    state.paymentDetails?.merchantThemeDetails
  );

  const paymentAmount = state.paymentDetails?.amount?.amount ?? null;

  // Banks whose transactionAmountLimit >= payment amount (supported)
  const personalBanksEnabled = useMemo(() => {
    if (paymentAmount == null) { return personalBanks; }
    return personalBanks
      .filter((b) => b.transactionAmountLimit >= paymentAmount)
      .sort(sortByFullName);
  }, [personalBanks, paymentAmount]);

  const businessBanksEnabled = useMemo(() => {
    if (paymentAmount == null) { return businessBanks; }
    return businessBanks
      .filter((b) => b.transactionAmountLimit >= paymentAmount)
      .sort(sortByFullName);
  }, [businessBanks, paymentAmount]);

  // Banks whose transactionAmountLimit < payment amount (not supported)
  const personalBanksDisabledByAmount = useMemo(() => {
    if (paymentAmount == null) { return []; }
    return personalBanks
      .filter((b) => b.transactionAmountLimit < paymentAmount)
      .sort(sortByFullName);
  }, [personalBanks, paymentAmount]);

  const businessBanksDisabledByAmount = useMemo(() => {
    if (paymentAmount == null) { return []; }
    return businessBanks
      .filter((b) => b.transactionAmountLimit < paymentAmount)
      .sort(sortByFullName);
  }, [businessBanks, paymentAmount]);

  // Popular banks filtered by amount limit, sorted by orderBy
  const popularPersonalBanks = useMemo(() => {
    const source = paymentAmount != null
      ? personalBanks.filter(
          (b) =>
            b.popularBank &&
            b.transactionAmountLimit >= paymentAmount
        )
      : personalBanks.filter((b) => b.popularBank);
    return source.sort(sortByOrderBy);
  }, [personalBanks, paymentAmount]);

  const popularBusinessBanks = useMemo(() => {
    const source = paymentAmount != null
      ? businessBanks.filter(
          (b) =>
            b.popularBank &&
            b.transactionAmountLimit >= paymentAmount
        )
      : businessBanks.filter((b) => b.popularBank);
    return source.sort(sortByOrderBy);
  }, [businessBanks, paymentAmount]);

  // All banks (for search results) split by amount limit
  const allBanksEnabled = useMemo(() => {
    if (paymentAmount == null)  { return state.bankList; }
    return state.bankList
      .filter((b) => b.transactionAmountLimit >= paymentAmount)
      .sort(sortByFullName);
  }, [state.bankList, paymentAmount]);

  const allBanksDisabledByAmount = useMemo(() => {
    if (paymentAmount == null) { return []; }
    return state.bankList
      .filter((b) => b.transactionAmountLimit != null && b.transactionAmountLimit < paymentAmount)
      .sort(sortByFullName);
  }, [state.bankList, paymentAmount]);

  return {
    state,
    dispatch,
    getPaymentDetails,
    fetchBanks,
    fetchFilteredBanks,
    search,
    selectBank,
    selectCardPayment,
    authorizeBank,
    checkBankAppAvailability,
    getPaymentDetailsAndBanks,
    resetSelectBank,
    startPolling,
    stopPolling,
    personalBanks,
    businessBanks,
    personalBanksEnabled,
    businessBanksEnabled,
    personalBanksDisabledByAmount,
    businessBanksDisabledByAmount,
    popularPersonalBanks,
    popularBusinessBanks,
    allBanksEnabled,
    allBanksDisabledByAmount,
    paymentAmount,
    brandingColors,
  };
}

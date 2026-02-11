import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { usePaymentContext } from './PaymentContext';
import { AtoaException } from '../types/error';

const POLLING_INTERVAL_MS = 1000;

export function usePaymentStatus() {
  const { state, dispatch, client, options } = usePaymentContext();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (paymentId: string) => {
      if (isPausedRef.current) {
        return;
      }
      try {
        const details = await client.getPaymentStatus(paymentId);
        dispatch({ type: 'SET_TRANSACTION_DETAILS', payload: details });
        dispatch({ type: 'SET_PAYMENT_STATUS_ERROR', payload: null });

        options.onPaymentStatusChange?.({
          status: typeof details.status === 'string' ? details.status : '',
          redirectUrlParams: details.redirectUrlParams,
          signature: details.signature,
          signatureHash: details.signatureHash,
        });
      } catch (e) {
        if (e instanceof AtoaException) {
          options.onError?.(e);
        }
        dispatch({ type: 'SET_TRANSACTION_DETAILS', payload: null });
        dispatch({
          type: 'SET_PAYMENT_STATUS_ERROR',
          payload: e instanceof Error ? e : new Error(String(e)),
        });
      }
    },
    [client, dispatch, options]
  );

  const startListening = useCallback(
    (paymentId: string) => {
      stop();
      dispatch({ type: 'SET_PAYMENT_STARTED', payload: true });

      intervalRef.current = setInterval(() => {
        pollStatus(paymentId);
      }, POLLING_INTERVAL_MS);
    },
    [stop, dispatch, pollStatus]
  );

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  // Handle app state changes (pause/resume polling)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        resume();
      } else if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        pause();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => {
      subscription.remove();
      stop();
    };
  }, [pause, resume, stop]);

  return {
    startListening,
    stop,
    pause,
    resume,
    transactionDetails: state.transactionDetails,
    paymentStarted: state.paymentStarted,
    paymentStatusError: state.paymentStatusError,
  };
}

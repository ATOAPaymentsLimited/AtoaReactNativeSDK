import { useCallback } from 'react';
import { usePaymentContext } from './PaymentContext';
import { buildPaymentAuthBody } from '../utils/buildPaymentAuthBody';
import { atoaException } from '../utils/atoaException';

export function useCardPayment() {
  const { state, dispatch, client, options } = usePaymentContext();

  const selectCardPayment = useCallback(
    async (): Promise<'success' | 'error'> => {
      const paymentDetails = state.paymentDetails;
      if (!paymentDetails) {
        return 'error';
      }

      dispatch({ type: 'START_AUTH' });

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
        const err = atoaException(e);
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

  return { selectCardPayment };
}

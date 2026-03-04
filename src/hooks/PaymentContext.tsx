import React, { createContext, useContext, useMemo, useReducer, useRef } from 'react';
import type { AtoaPayOptions } from '../types/sdk';
import { AtoaClient } from '../api/AtoaClient';
import {
  paymentReducer,
  initialPaymentState,
  type PaymentState,
  type PaymentAction,
} from './paymentReducer';

interface PaymentContextValue {
  state: PaymentState;
  dispatch: React.Dispatch<PaymentAction>;
  client: AtoaClient;
  options: AtoaPayOptions;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

interface PaymentProviderProps {
  options: AtoaPayOptions;
  children: React.ReactNode;
}

export function PaymentProvider({ options, children }: PaymentProviderProps) {
  const clientRef = useRef(new AtoaClient(options.env, 'staging'));
  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      client: clientRef.current,
      options,
    }),
    [state, dispatch, options]
  );

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePaymentContext(): PaymentContextValue {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePaymentContext must be used within a PaymentProvider');
  }
  return context;
}

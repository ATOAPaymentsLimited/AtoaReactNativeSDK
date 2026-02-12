import React, { createContext, useContext } from 'react';
import {
  useConnectivity,
  type ConnectivityStatus,
  type ReconnectionCallback,
} from './useConnectivity';

interface ConnectivityContextValue {
  status: ConnectivityStatus;
  isConnected: boolean;
  isDisconnected: boolean;
  isOfflineOrWaiting: boolean;
  checkConnection: () => Promise<void>;
  hasInternet: () => Promise<boolean>;
  addReconnectionCallback: (cb: ReconnectionCallback) => void;
  removeReconnectionCallback: (cb: ReconnectionCallback) => void;
}

const ConnectivityCtx = createContext<ConnectivityContextValue | null>(null);

interface ConnectivityProviderProps {
  baseUrl?: string;
  children: React.ReactNode;
}

/**
 * Mirrors Flutter's StreamProvider<ConnectivityStatus> pattern.
 * Wraps useConnectivity so all descendants share a single connectivity instance.
 */
export function ConnectivityProvider({ baseUrl, children }: ConnectivityProviderProps) {
  const connectivity = useConnectivity(baseUrl);

  return (
    <ConnectivityCtx.Provider value={connectivity}>
      {children}
    </ConnectivityCtx.Provider>
  );
}

export function useConnectivityContext(): ConnectivityContextValue {
  const context = useContext(ConnectivityCtx);
  if (!context) {
    throw new Error(
      'useConnectivityContext must be used within a ConnectivityProvider'
    );
  }
  return context;
}

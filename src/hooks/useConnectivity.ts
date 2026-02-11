import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';

export type ConnectivityStatus = 'waiting' | 'connected' | 'disconnected';

export function useConnectivity() {
  const [status, setStatus] = useState<ConnectivityStatus>('waiting');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      if (netState.isConnected === null) {
        setStatus('waiting');
      } else if (netState.isConnected) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    const netState = await NetInfo.fetch();
    return netState.isConnected ?? false;
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    isDisconnected: status === 'disconnected',
    checkConnectivity,
  };
}

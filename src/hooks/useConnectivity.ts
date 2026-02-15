import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

export type ConnectivityStatus = 'wifi' | 'cellular' | 'offline' | 'waiting' | 'other';

export interface ReconnectionCallback {
  id: string;
  callback: () => void;
  persist: boolean;
}

/**
 * Mirrors Flutter's ConnectivityController.
 * - Tracks connectivity status (wifi / cellular / offline / waiting / other)
 * - Verifies actual internet via HTTP request (like Flutter's hasInternet with Dio)
 * - Manages reconnection callbacks that fire on offline→online transitions
 * - Removes non-persistent callbacks after first reconnection
 */
export function useConnectivity(baseUrl?: string) {
  const [status, setStatus] = useState<ConnectivityStatus>('waiting');
  const lastStatusRef = useRef<ConnectivityStatus | null>(null);
  const callbacksRef = useRef<ReconnectionCallback[]>([]);

  const hasInternet = useCallback(async (): Promise<boolean> => {
    const url = baseUrl ?? 'https://api.atoa.me/api/';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.status === 200;
    } catch {
      return false;
    }
  }, [baseUrl]);

  const onConnection = useCallback(
    (newStatus: ConnectivityStatus) => {
      if (newStatus === 'offline' || newStatus === 'waiting') {
        return;
      }

      const last = lastStatusRef.current;
      if (newStatus !== last) {
        const currentCallbacks = [...callbacksRef.current];
        for (const cb of currentCallbacks) {
          try {
            cb.callback();
          } catch {
            // continue on error, matching Flutter's catch-continue
          }
        }

        if (last != null) {
          callbacksRef.current = callbacksRef.current.filter((c) => c.persist);
        }
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (netState) => {
      let newStatus: ConnectivityStatus;

      if (netState.isConnected === null) {
        newStatus = 'waiting';
      } else if (!netState.isConnected) {
        newStatus = 'offline';
      } else {
        // Connected — determine type
        const type = netState.type;
        if (type === 'cellular') {
          newStatus = 'cellular';
        } else if (type === 'wifi') {
          // For wifi, verify actual internet (matching Flutter's hasInternet check)
          const internetFlag = await hasInternet();
          newStatus = internetFlag ? 'wifi' : 'offline';
        } else if (type === 'vpn' || type === 'other' || type === 'ethernet' || type === 'bluetooth') {
          newStatus = 'other';
        } else {
          newStatus = 'offline';
        }
      }

      onConnection(newStatus);
      setStatus(newStatus);
      lastStatusRef.current = newStatus;
    });

    return () => {
      unsubscribe();
    };
  }, [hasInternet, onConnection]);

  const checkConnection = useCallback(async () => {
    const netState = await NetInfo.fetch();
    let newStatus: ConnectivityStatus;

    if (netState.isConnected === null) {
      newStatus = 'waiting';
    } else if (!netState.isConnected) {
      newStatus = 'offline';
    } else {
      // Always verify actual internet when explicitly checking
      const internetFlag = await hasInternet();
      if (!internetFlag) {
        newStatus = 'offline';
      } else {
        const type = netState.type;
        if (type === 'cellular') {
          newStatus = 'cellular';
        } else if (type === 'wifi') {
          newStatus = 'wifi';
        } else if (type === 'vpn' || type === 'other' || type === 'ethernet' || type === 'bluetooth') {
          newStatus = 'other';
        } else {
          newStatus = 'offline';
        }
      }
    }

    onConnection(newStatus);
    setStatus(newStatus);
    lastStatusRef.current = newStatus;
  }, [hasInternet, onConnection]);

  const addReconnectionCallback = useCallback((cb: ReconnectionCallback) => {
    const exists = callbacksRef.current.findIndex((c) => c.id === cb.id);
    if (exists < 0) {
      callbacksRef.current.push(cb);
    }
  }, []);

  const removeReconnectionCallback = useCallback((cb: ReconnectionCallback) => {
    callbacksRef.current = callbacksRef.current.filter((c) => c.id !== cb.id);
  }, []);

  const isOffline = status === 'offline';
  const isOfflineOrWaiting = status === 'offline' || status === 'waiting';

  return {
    status,
    isConnected: !isOffline && status !== 'waiting',
    isDisconnected: isOffline,
    isOfflineOrWaiting,
    checkConnection,
    hasInternet,
    addReconnectionCallback,
    removeReconnectionCallback,
  };
}

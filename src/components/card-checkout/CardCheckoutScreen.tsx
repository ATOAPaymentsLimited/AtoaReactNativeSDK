import React, { useCallback, useEffect, useRef } from 'react';
import { BackHandler, Linking } from 'react-native';
import { usePaymentContext } from '../../hooks/PaymentContext';
import { getCardCheckoutUrl } from '../../api/config';
import { Strings } from '../../constants/strings';
import { CardVerifyingScreen } from './CardVerifyingScreen';

export type CardCheckoutResult =
  | { type: 'success'; paymentIdempotencyId?: string }
  | { type: 'failure'; error?: string; isLoadError?: boolean; isSystemError?: boolean }
  | { type: 'closed'; fromDeepLink?: boolean };

interface CardCheckoutScreenProps {
  checkoutId: string;
  merchantName: string;
  onResult: (result: CardCheckoutResult) => void;
}

const REDIRECT_PATH = '/card-checkout-redirect';

function parseQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) { return params; }
  const query = url.substring(queryIndex + 1);
  for (const part of query.split('&')) {
    const [key, ...rest] = part.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
    }
  }
  return params;
}

function parseRedirectUrl(url: string): CardCheckoutResult | null {
  if (!url.includes(REDIRECT_PATH)) { return null; }
  const params = parseQueryParams(url);
  switch (params.event) {
    case 'paymentSuccessful':
      return { type: 'success', paymentIdempotencyId: params.paymentIdempotencyId || undefined };
    case 'paymentFailed':
      return { type: 'failure', error: params.error && params.error !== 'null' ? params.error : undefined };
    case 'paymentSystemInitializationFailed':
      return { type: 'failure', error: params.error && params.error !== 'null' ? params.error : undefined, isSystemError: true };
    case 'cardCheckoutClosed':
      return { type: 'closed', fromDeepLink: true };
    default:
      return null;
  }
}

/**
 * Card checkout — opens the payment page in the system browser and listens
 * for the redirect back to the app via deep link or app link.
 *
 * The consumer web redirects to /card-checkout-redirect?event=...&paymentIdempotencyId=...
 * which the OS routes back to the app. The host app must register:
 *   - Android: intent-filter for https://{host}/card-checkout-redirect (with autoVerify)
 *   - iOS: Associated Domains / Universal Links for the same path
 */
export function CardCheckoutScreen({
  checkoutId,
  merchantName,
  onResult,
}: CardCheckoutScreenProps) {
  const hasCompletedRef = useRef(false);
  const hasOpenedBrowserRef = useRef(false);
  const unmountedRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const { client } = usePaymentContext();
  const checkoutUrl = getCardCheckoutUrl(client.environment, checkoutId, merchantName);

  // Reset guards when checkoutId changes (handles parent reuse without remount).
  useEffect(() => {
    hasCompletedRef.current = false;
    hasOpenedBrowserRef.current = false;
  }, [checkoutId]);

  // Stable callback — uses ref so effects never re-subscribe on parent re-renders.
  const complete = useCallback((result: CardCheckoutResult) => {
    if (hasCompletedRef.current || unmountedRef.current) { return; }
    hasCompletedRef.current = true;
    onResultRef.current(result);
  }, []);

  useEffect(() => {
    return () => { unmountedRef.current = true; };
  }, []);

  // Hardware back button
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      complete({ type: 'closed' });
      return true;
    });
    return () => handler.remove();
  }, [complete]);

  // Open browser once on mount
  useEffect(() => {
    if (hasOpenedBrowserRef.current) { return; }
    hasOpenedBrowserRef.current = true;
    Linking.openURL(checkoutUrl).catch(() => {
      complete({ type: 'failure', error: Strings.api.cardCheckoutUnavailable, isLoadError: true });
    });
  }, [checkoutUrl, complete]);

  // Listen for deep-link redirect
  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event: { url: string }) => {
      const result = parseRedirectUrl(event.url);
      if (result) { complete(result); }
    });
    return () => subscription.remove();
  }, [complete]);

  const handleCancel = useCallback(() => {
    complete({ type: 'closed' });
  }, [complete]);

  return <CardVerifyingScreen onClose={handleCancel} checkoutUrl={checkoutUrl} />;
}

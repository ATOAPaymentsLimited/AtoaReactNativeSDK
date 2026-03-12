import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler, Platform, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { usePaymentContext } from '../../hooks/PaymentContext';
import { getCardCheckoutUrl } from '../../api/config';
import { SvgIcon } from '../shared/SvgIcon';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export type CardCheckoutResult =
  | { type: 'success'; paymentIdempotencyId?: string }
  | { type: 'failure'; error?: string }
  | { type: 'closed' };

interface CardCheckoutScreenProps {
  checkoutId: string;
  merchantName: string;
  onResult: (result: CardCheckoutResult) => void;
  onBack: () => void;
}

const REDIRECT_PATH = '/card-checkout-redirect';

// Safari user-agent so the checkout page doesn't show a "switch browser" dialog on iOS.
const IOS_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

/**
 * Parse query parameters from a URL string.
 */
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

function handleRedirectUrl(
  url: string,
  hasCompletedRef: React.MutableRefObject<boolean>,
  onResult: (result: CardCheckoutResult) => void
): boolean {
  if (hasCompletedRef.current) { return false; }
  if (!url.includes(REDIRECT_PATH)) { return true; }

  const params = parseQueryParams(url);
  const event = params.event;

  hasCompletedRef.current = true;

  switch (event) {
    case 'paymentSuccessful':
      onResult({
        type: 'success',
        paymentIdempotencyId: params.paymentIdempotencyId || undefined,
      });
      return false;

    case 'paymentFailed':
    case 'paymentSystemInitializationFailed':
      onResult({
        type: 'failure',
        error: params.error && params.error !== 'null' ? params.error : undefined,
      });
      return false;

    case 'cardCheckoutClosed':
      onResult({ type: 'closed' });
      return false;

    default:
      hasCompletedRef.current = false;
      return true;
  }
}

/**
 * Renders the card checkout page inside a WebView.
 */
export function CardCheckoutScreen({
  checkoutId,
  merchantName,
  onResult,
  onBack,
}: CardCheckoutScreenProps) {
  const hasCompletedRef = useRef(false);
  const { client } = usePaymentContext();

  const checkoutUrl = getCardCheckoutUrl(client.environment, checkoutId, merchantName);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => handler.remove();
  }, [onBack]);

  const handleNavigationStateChange = useCallback(
    (event: WebViewNavigation) => {
      handleRedirectUrl(event.url, hasCompletedRef, onResult);
    },
    [onResult]
  );

  const handleShouldStartLoad = useCallback(
    (event: WebViewNavigation): boolean => {
      return handleRedirectUrl(event.url, hasCompletedRef, onResult);
    },
    [onResult]
  );

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        mixedContentMode="compatibility"
        // iOS: spoof Safari user-agent to prevent "switch browser" dialog
        {...(Platform.OS === 'ios' && { userAgent: IOS_USER_AGENT })}
        // iOS: share cookies with Safari so the checkout page works seamlessly
        sharedCookiesEnabled={Platform.OS === 'ios'}
        allowsInlineMediaPlayback
        style={styles.webview}
      />
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
        <SvgIcon name="back" size={24} color={Colors.black} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Spacing.medium,
    left: Spacing.large,
    width: Spacing.large * 2,
    height: Spacing.large * 2,
    borderRadius: Spacing.large,
    backgroundColor: Colors.grey50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  webview: {
    flex: 1,
  },
});

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Platform,
  Pressable,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { usePaymentContext } from '../../hooks/PaymentContext';
import { getCardCheckoutUrl, IOS_USER_AGENT } from '../../api/config';
import { SvgIcon } from '../shared/SvgIcon';
import { FetchingBankLoader } from '../shared/FetchingBankLoader';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { FIT_PAGE_JS, WINDOW_OPEN_OVERRIDE_JS } from '../../constants/component-constants';

export type CardCheckoutResult =
  | { type: 'success'; paymentIdempotencyId?: string }
  | { type: 'failure'; error?: string; isLoadError?: boolean; isSystemError?: boolean }
  | { type: 'closed' };

interface CardCheckoutScreenProps {
  checkoutId: string;
  merchantName: string;
  onResult: (result: CardCheckoutResult) => void;
  onBack: () => void;
}

const REDIRECT_PATH = '/card-checkout-redirect';

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
      onResult({
        type: 'failure',
        error: params.error && params.error !== 'null' ? params.error : undefined,
      });
      return false;

    case 'paymentSystemInitializationFailed':
      onResult({
        type: 'failure',
        error: params.error && params.error !== 'null' ? params.error : undefined,
        isSystemError: true,
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

  // Android only: intercept navigations to block redirect URL loading.
  // Omitted on iOS because onShouldStartLoadWithRequest fires for ALL frames
  // (main + iframes) and each call round-trips through a singleton decision
  // manager, which can stall 3DS iframe navigations and cause a blank screen.
  const handleShouldStartLoad = useCallback(
    (event: WebViewNavigation): boolean => {
      return handleRedirectUrl(event.url, hasCompletedRef, onResult);
    },
    [onResult]
  );

  const handleWebViewError = useCallback(() => {
    if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onResult({ type: 'failure', error: Strings.api.cardCheckoutUnavailable, isLoadError: true });
    }
  }, [onResult]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        // Android: block redirect URL loading (safe — only fires for main frame).
        // iOS: omitted — fires for all frames and can stall 3DS iframe navigations.
        {...(Platform.OS !== 'ios' && {
          onShouldStartLoadWithRequest: handleShouldStartLoad,
        })}
        // Override window.open() → window.top.location.href in all frames
        // before page JS runs, so 3DS iframes navigate the main frame.
        injectedJavaScriptBeforeContentLoaded={WINDOW_OPEN_OVERRIDE_JS}
        injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
        // Allow window.open() without user gesture at the native level.
        // Combined with NO onOpenWindow prop, iOS native code falls back to
        // [webView loadRequest:] which reliably loads the URL in the same WebView.
        javaScriptCanOpenWindowsAutomatically
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <FetchingBankLoader />
          </View>
        )}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        nestedScrollEnabled
        mixedContentMode="compatibility"
        {...(Platform.OS === 'ios' && { userAgent: IOS_USER_AGENT })}
        sharedCookiesEnabled={Platform.OS === 'ios'}
        allowsInlineMediaPlayback
        injectedJavaScript={FIT_PAGE_JS}
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
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
});

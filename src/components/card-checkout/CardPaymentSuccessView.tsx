import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { getFontFamily } from '../../constants/typography';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';

type CardPaymentResultType = 'success' | 'failure';

interface CardPaymentResultViewProps {
  type: CardPaymentResultType;
  error?: string;
  onClose: () => void;
}

const AUTO_CLOSE_DELAY_MS = 2000;

export function CardPaymentResultView({
  type,
  error,
  onClose,
}: CardPaymentResultViewProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const lottieRef = useRef<LottieView>(null);

  // Explicitly play after layout settles — autoPlay alone is unreliable
  // when the BottomSheet is still transitioning.
  const onLayout = useCallback(() => {
    lottieRef.current?.play();
  }, []);

  // Auto-close after delay for success
  useEffect(() => {
    if (type !== 'success') return;
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, AUTO_CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [type]);

  if (type === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.content} onLayout={onLayout}>
          <LottieView
            ref={lottieRef}
            source={require('../../assets/animations/tick_mark.json')}
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <View style={styles.spacer} />
          <Text style={styles.titleText}>
            {Strings.verifyingPayment.paymentSuccessful}
          </Text>
        </View>
      </View>
    );
  }

  // Failure
  return (
    <View style={styles.container}>
      <BottomSheetHeader title="Payment Failed" onClose={onClose} />
      <View style={styles.content}>
        <View style={styles.failureIcon}>
          <Text style={styles.failureIconText}>✕</Text>
        </View>
        <View style={styles.spacer} />
        <Text style={styles.titleText}>Payment Failed</Text>
        {error ? (
          <>
            <View style={styles.spacerSmall} />
            <Text style={styles.errorText}>{error}</Text>
          </>
        ) : null}
        <View style={styles.spacerSmall} />
        <Text style={styles.subtitleText}>
          Please try again or use a different payment method.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.large,
  },
  animation: {
    width: Spacing.xtraLarge * 3,
    height: Spacing.xtraLarge * 3,
  },
  spacer: {
    height: Spacing.medium,
  },
  spacerSmall: {
    height: Spacing.small,
  },
  titleText: {
    fontFamily: getFontFamily('700'),
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: getFontFamily('500'),
    fontSize: 14,
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontFamily: getFontFamily('500'),
    fontSize: 13,
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 18,
  },
  failureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failureIconText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#DC2626',
  },
});

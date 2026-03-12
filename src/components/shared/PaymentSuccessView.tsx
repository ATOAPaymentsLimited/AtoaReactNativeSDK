import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import type { TransactionDetails } from '../../types/payment';
import { isCompleted } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { getFontFamily } from '../../constants/typography';

const AUTO_CLOSE_DELAY_MS = 2000;

interface PaymentSuccessViewProps {
  transactionDetails?: TransactionDetails;
  onClose: () => void;
}

export function PaymentSuccessView({ transactionDetails, onClose }: PaymentSuccessViewProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const lottieRef = useRef<LottieView>(null);

  // If transactionDetails is provided but not completed, close immediately
  useEffect(() => {
    if (transactionDetails && !isCompleted(transactionDetails)) {
      onCloseRef.current();
    }
  }, [transactionDetails]);

  // Explicitly play after layout settles — autoPlay alone is unreliable
  // when the BottomSheet is still transitioning.
  const onLayout = useCallback(() => {
    lottieRef.current?.play();
  }, []);

  // Auto-close after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, AUTO_CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

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
  titleText: {
    fontFamily: getFontFamily('700'),
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
  },
});

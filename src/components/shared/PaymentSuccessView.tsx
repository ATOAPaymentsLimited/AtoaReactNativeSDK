import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import LottieView from 'lottie-react-native';
import type { TransactionDetails } from '../../types/payment';
import { isCompleted } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { getFontFamily } from '../../constants/typography';

interface PaymentSuccessViewProps {
  transactionDetails?: TransactionDetails;
  onClose: () => void;
}

export function PaymentSuccessView({
  transactionDetails,
  onClose,
}: PaymentSuccessViewProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // If transactionDetails is provided but not completed, close immediately
  useEffect(() => {
    if (transactionDetails && !isCompleted(transactionDetails)) {
      onCloseRef.current();
      return;
    }
  }, [transactionDetails]);

  // Auto-close after 2s for completed payments
  useEffect(() => {
    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BottomSheetView style={styles.container}>
      <View style={styles.successContent}>
        <LottieView
          source={require('../../assets/animations/tick_mark.json')}
          autoPlay
          loop={false}
          style={styles.tickAnimation}
        />
        <View style={styles.spacer} />
        <Text style={styles.successText}>{Strings.verifyingPayment.paymentSuccessful}</Text>
      </View>
    </BottomSheetView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xtraLarge * 8,
  },
  tickAnimation: {
    width: Spacing.xtraLarge * 3,
    height: Spacing.xtraLarge * 3,
  },
  spacer: {
    height: Spacing.medium,
  },
  successText: {
    fontFamily: getFontFamily('700'),
    fontSize: 16,
    color: Colors.black,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  statusText: {
    fontFamily: getFontFamily('500'),
    fontSize: 16,
    color: Colors.grey600,
  },
});

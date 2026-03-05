import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import type { TransactionDetails } from '../../types/payment';
import { isCompleted } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { getFontFamily } from '../../constants/typography';

interface PaymentStatusViewProps {
  transactionDetails: TransactionDetails;
  onClose: () => void;
}

export function PaymentStatusView({
  transactionDetails,
  onClose,
}: PaymentStatusViewProps) {

  useEffect(() => {
    if (!isCompleted(transactionDetails)) {
      onClose();
    }
  }, [transactionDetails, onClose]);

  // Completed - show success
  if (isCompleted(transactionDetails)) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

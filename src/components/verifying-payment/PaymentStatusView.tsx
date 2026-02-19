import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import type { TransactionDetails } from '../../types/payment';
import { isCompleted, isFailed, isPending } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { FetchingBankLoader } from '../shared/FetchingBankLoader';
import { ErrorWidget } from '../shared/ErrorWidget';

interface PaymentStatusViewProps {
  transactionDetails: TransactionDetails;
  onClose: () => void;
}

export function PaymentStatusView({
  transactionDetails,
  onClose,
}: PaymentStatusViewProps) {
  // Pending - show loading
  if (isPending(transactionDetails)) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title="Payment In Progress" onClose={onClose} />
        <FetchingBankLoader />
      </View>
    );
  }

  // Failed - show error
  if (isFailed(transactionDetails)) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title="Payment Status" onClose={onClose} />
        <ErrorWidget
          title="Payment Failed"
          message={
            transactionDetails.errorDescription ??
            'Your payment could not be processed. Please try again.'
          }
        />
      </View>
    );
  }

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
          <Text style={styles.successText}>Payment Successful</Text>
        </View>
      </View>
    );
  }

  // Other statuses
  return (
    <View style={styles.container}>
      <BottomSheetHeader title="Payment Status" onClose={onClose} />
      <View style={styles.centerContent}>
        <Text style={styles.statusText}>
          Status: {transactionDetails.status}
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
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  statusText: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grey600,
  },
});

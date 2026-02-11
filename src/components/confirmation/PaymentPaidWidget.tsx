import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface PaymentPaidWidgetProps {
  amount?: number;
  time?: string;
  referenceId?: string;
}

export function PaymentPaidWidget({
  amount,
  time,
  referenceId,
}: PaymentPaidWidgetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkText}>✓</Text>
      </View>

      <View style={styles.spacerLarge} />

      {amount != null && amount > 0 && (
        <>
          <Text style={styles.amount}>£{amount.toFixed(2)}</Text>
          <View style={styles.spacerLarge} />
        </>
      )}

      <Text style={styles.title}>Payment Already Paid</Text>

      <View style={styles.spacerLarge} />

      {time && <Text style={styles.detail}>Paid on {time}</Text>}
      {referenceId && (
        <Text style={styles.detail}>Reference No. {referenceId}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.huge,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.positiveDarker,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  spacerLarge: {
    height: Spacing.xtraLarge,
  },
  amount: {
    fontFamily: 'Figtree',
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
  },
  title: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },
  detail: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grey500,
    marginTop: Spacing.small,
  },
});

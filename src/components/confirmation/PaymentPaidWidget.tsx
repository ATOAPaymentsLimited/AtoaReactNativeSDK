import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { SvgIcon } from '../shared/SvgIcon';

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
        <SvgIcon name="tick" size={Spacing.large} color={Colors.white} />
      </View>

      <View style={styles.spacerLarge} />

      {amount != null && amount > 0 && (
        <>
          <Text style={styles.amount}>£{amount.toFixed(2)}</Text>
          <View style={styles.spacerLarge} />
        </>
      )}

      <Text style={styles.title}>{Strings.paymentPaid.title}</Text>

      <View style={styles.spacerLarge} />

      {time && <Text style={styles.detail}>{Strings.paymentPaid.paidOn(time)}</Text>}
      {referenceId && (
        <Text style={styles.detail}>{Strings.paymentPaid.referenceNo(referenceId)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing.huge,
    paddingTop: 48,
    paddingBottom: 32,
  },
  checkCircle: {
    width: Spacing.large * 2,
    height: Spacing.large * 2,
    borderRadius: Spacing.large,
    backgroundColor: Colors.positiveDarker,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.small,
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

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from '../shared/SvgIcon';

interface BankLimitCardProps {
  amount: number;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const BankLimitCard = React.memo(function BankLimitCard({
  amount,
}: BankLimitCardProps) {
  return (
    <View style={styles.container}>
      <SvgIcon name="info" size={Spacing.large} color={Colors.errorDarker} />
      <Text style={styles.text}>
        {'Some banks listed below might not handle the payments of '}
        <Text style={styles.amountText}>{'£'}{formatAmount(amount)}</Text>
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.errorSubtle,
    borderRadius: Spacing.small,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
  },
  text: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.errorDarker,
    lineHeight: 18,
    flex: 1,
    marginLeft: Spacing.small,
  },
  amountText: {
    fontWeight: '700',
  },
});

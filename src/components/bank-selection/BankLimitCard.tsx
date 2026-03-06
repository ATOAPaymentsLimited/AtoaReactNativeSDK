import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { SvgIcon } from '../shared/SvgIcon';
import { formatAmount } from '../../utils/formatAmount';
import { getFontFamily } from '../../constants/typography';

interface BankLimitCardProps {
  amount: number;
}

export const BankLimitCard = React.memo(function BankLimitCard({
  amount,
}: BankLimitCardProps) {
  return (
    <View style={styles.container}>
      <SvgIcon name="info" size={Spacing.large} color={Colors.errorDarker} />
      <Text style={styles.text}>
        {Strings.bankSelection.bankLimitWarning}
        <Text style={styles.amountText}>{formatAmount(amount)}</Text>
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
    gap: Spacing.small,
  },
  text: {
    fontFamily: getFontFamily('500'),
    fontSize: 12,
    color: Colors.errorDarker,
    lineHeight: 18,
    flex: 1,
  },
  amountText: {
    fontFamily: getFontFamily('700'),
  },
});

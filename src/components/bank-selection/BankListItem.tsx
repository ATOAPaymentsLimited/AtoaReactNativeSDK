import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { BankInstitution } from '../../types/bank';
import { getBankIcon } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from '../shared/SvgIcon';

interface BankListItemProps {
  bank: BankInstitution;
  isSelected: boolean;
  onPress: (bank: BankInstitution) => void;
}

export const BankListItem = React.memo(function BankListItem({ bank, isSelected, onPress }: BankListItemProps) {
  const iconUrl = getBankIcon(bank);
  const isDisabled = !bank.enabled;

  return (
    <TouchableOpacity
      style={[styles.container, isDisabled && styles.disabled]}
      onPress={() => onPress(bank)}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {iconUrl && (
          <Image
            source={{ uri: iconUrl }}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.nameContainer}>
        <Text style={[styles.name, isDisabled && styles.nameDisabled]} numberOfLines={1}>
          {bank.fullName}
        </Text>
        {isDisabled && (
          <View style={styles.downIndicator}>
            <SvgIcon name="iconError" size={12} color={Colors.errorDarker} />
          </View>
        )}
      </View>
      <View
        style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
      >
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.large,
  },
  disabled: {
    opacity: 0.4,
  },
  iconContainer: {
    width: Spacing.xtraLarge + Spacing.large + Spacing.small,
    height: Spacing.xtraLarge + Spacing.large + Spacing.small,
    borderRadius: Spacing.mini + Spacing.tiny,
    borderWidth: 1,
    borderColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.mini,
    overflow: 'hidden',
  },
  icon: {
    width: Spacing.xtraLarge,
    height: Spacing.xtraLarge,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.medium,
  },
  name: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey700,
    flex: 1,
  },
  nameDisabled: {
    color: Colors.grey400,
  },
  downIndicator: {
    marginLeft: Spacing.small,
  },
  radioOuter: {
    width: Spacing.xtraLarge + Spacing.mini,
    height: Spacing.xtraLarge + Spacing.mini,
    borderRadius: (Spacing.xtraLarge + Spacing.mini) / 2,
    borderWidth: 1.5,
    borderColor: Colors.grey300,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.medium,
  },
  radioOuterSelected: {
    borderWidth: 2,
    borderColor: Colors.black,
  },
  radioInner: {
    width: Spacing.medium,
    height: Spacing.medium,
    borderRadius: Spacing.medium / 2,
    backgroundColor: Colors.black,
  },
});

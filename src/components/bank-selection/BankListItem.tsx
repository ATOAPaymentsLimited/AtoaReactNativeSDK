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
  forceDisabled?: boolean;
}

export const BankListItem = React.memo(function BankListItem({ bank, isSelected, onPress, forceDisabled }: BankListItemProps) {
  const iconUrl = getBankIcon(bank);
  const isDisabled = !bank.enabled;
  const notSupported =  !!forceDisabled;

  return (
    <TouchableOpacity
      style={[styles.container, notSupported && styles.disabled]}
      onPress={() => onPress(bank)}
      disabled={!!forceDisabled}
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
          <View style={styles.downBadge}>
            <SvgIcon name="highImportance" size={16} color={Colors.errorDefault} />
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
    paddingVertical: Spacing.medium,
  },
  disabled: {
    opacity: 0.4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  icon: {
    width: 20,
    height: 20,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: Spacing.medium,
    gap: Spacing.small,
  },
  name: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey700,
    flexShrink: 1,
  },
  nameDisabled: {
    color: Colors.grey600,
  },
  downBadge: {
    backgroundColor: Colors.errorSubtle,
    borderRadius: 16,
    paddingHorizontal: Spacing.mini,
    paddingVertical: Spacing.tiny,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
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

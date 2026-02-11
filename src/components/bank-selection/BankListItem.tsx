import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { BankInstitution } from '../../types/bank';
import { getBankIcon } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

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
        <Text style={styles.name} numberOfLines={1}>
          {bank.fullName}
        </Text>
        {isDisabled && (
          <View style={styles.downIndicator}>
            <Text style={styles.downText}>↓</Text>
          </View>
        )}
      </View>
      <View
        style={[styles.checkbox, isSelected && styles.checkboxSelected]}
      >
        {isSelected && <Text style={styles.checkText}>✓</Text>}
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
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.grey200,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  icon: {
    width: 32,
    height: 32,
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
    color: Colors.black,
    flex: 1,
  },
  downIndicator: {
    marginLeft: Spacing.small,
  },
  downText: {
    color: Colors.errorDarker,
    fontSize: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Spacing.medium,
    borderWidth: 1.5,
    borderColor: Colors.grey300,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.medium,
  },
  checkboxSelected: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  checkText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

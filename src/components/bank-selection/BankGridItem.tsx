import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { BankInstitution } from '../../types/bank';
import { getBankIcon } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface BankGridItemProps {
  bank: BankInstitution;
  isSelected: boolean;
  onPress: (bank: BankInstitution) => void;
}

export const BankGridItem = React.memo(function BankGridItem({ bank, isSelected, onPress }: BankGridItemProps) {
  const iconUrl = getBankIcon(bank);
  const isDisabled = !bank.enabled;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selected,
        isDisabled && styles.disabled,
      ]}
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
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
        {isDisabled && (
          <View style={styles.downBadge}>
            <Text style={styles.downBadgeText}>↓</Text>
          </View>
        )}
      </View>
      <Text
        style={[
          styles.name,
          isSelected && styles.nameSelected,
          isDisabled && styles.nameDisabled,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {bank.name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  selected: {},
  disabled: {
    opacity: 0.4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: Spacing.medium,
    borderWidth: 1.5,
    borderColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    overflow: 'visible',
  },
  icon: {
    width: 56,
    height: 56,
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  downBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.errorDarker,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downBadgeText: {
    color: Colors.white,
    fontSize: 12,
  },
  name: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grey700,
    marginTop: Spacing.small,
    textAlign: 'center',
  },
  nameSelected: {
    fontWeight: '700',
    color: Colors.black,
  },
  nameDisabled: {
    color: Colors.grey400,
  },
});

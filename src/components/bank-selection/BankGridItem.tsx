import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { BankInstitution } from '../../types/bank';
import { getBankIcon } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from '../shared/SvgIcon';

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
        isDisabled && styles.disabled,
      ]}
      onPress={() => onPress(bank)}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        isSelected && styles.iconContainerSelected,
      ]}>
        {iconUrl && (
          <Image
            source={{ uri: iconUrl }}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
        {isSelected && (
          <View style={styles.checkmark}>
            <SvgIcon name="tick" size={10} color={Colors.white} />
          </View>
        )}
        {isDisabled && (
          <View style={styles.downBadge}>
            <SvgIcon name="iconError" size={12} color={Colors.white} />
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

const ICON_CONTAINER_SIZE = Spacing.xtraLarge * 3 + Spacing.medium + Spacing.tiny;
const ICON_SIZE = Spacing.mediumLarge * 2 + Spacing.tiny;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: Spacing.xtraLarge * 3,
    borderRadius: Spacing.medium,
    borderWidth: 1.5,
    borderColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    overflow: 'visible',
    padding: Spacing.small,
  },
  iconContainerSelected: {
    borderWidth: 2,
    borderColor: Colors.black,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  checkmark: {
    position: 'absolute',
    top: Spacing.mini,
    right: Spacing.mini,
    width: Spacing.small * 2,
    height: Spacing.small * 2,
    borderRadius: Spacing.small,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downBadge: {
    position: 'absolute',
    top: Spacing.mini,
    right: Spacing.mini,
    width: Spacing.small * 2,
    height: Spacing.small * 2,
    borderRadius: Spacing.small,
    backgroundColor: Colors.errorDarker,
    justifyContent: 'center',
    alignItems: 'center',
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

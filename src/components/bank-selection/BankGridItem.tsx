import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { BankInstitution } from '../../types/bank';
import { getBankIcon } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from '../shared/SvgIcon';
import { getFontFamily } from '../../constants/typography';

interface BankGridItemProps {
  bank: BankInstitution;
  isSelected: boolean;
  onPress: (bank: BankInstitution) => void;
  forceDisabled?: boolean;
}

export const BankGridItem = React.memo(function BankGridItem({ bank, isSelected, onPress, forceDisabled }: BankGridItemProps) {
  const iconUrl = getBankIcon(bank);
  const isDisabled = !bank.enabled || !!forceDisabled;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDisabled && styles.containerDisabled,
      ]}
      onPress={() => onPress(bank)}
      disabled={!!forceDisabled}
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
            <SvgIcon name="highImportance" size={16} color={Colors.errorDefault} />
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
  containerDisabled: {
    opacity: 0.4,
  },
  iconContainer: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    overflow: 'visible',
  },
  iconContainerSelected: {
    borderWidth: 2,
    borderColor: Colors.black,
  },
  icon: {
    width: 32,
    height: 32,
  },
  checkmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: Colors.errorSubtle,
    borderRadius: 16,
    paddingHorizontal: Spacing.mini,
    paddingVertical: Spacing.tiny,
  },
  name: {
    fontFamily: getFontFamily('500'),
    fontSize: 12,
    color: Colors.grey700,
    marginTop: Spacing.small,
    textAlign: 'center',
  },
  nameSelected: {
    fontFamily: getFontFamily('700'),
    color: Colors.black,
  },
  nameDisabled: {
    color: Colors.grey400,
  },
});

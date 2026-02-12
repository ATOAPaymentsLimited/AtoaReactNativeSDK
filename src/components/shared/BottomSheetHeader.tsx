import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from './SvgIcon';

interface BottomSheetHeaderProps {
  title: string;
  onClose?: () => void;
  onBack?: () => void;
  showHelp?: boolean;
  onHelp?: () => void;
}

export function BottomSheetHeader({
  title,
  onClose,
  onBack,
  showHelp,
  onHelp,
}: BottomSheetHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconButton}>
            <SvgIcon name="back" size={Spacing.large} color={Colors.black} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.sideRight, showHelp && onHelp && styles.sideRightWide]}>
        {showHelp && onHelp && (
          <TouchableOpacity onPress={onHelp} style={styles.iconButton}>
            <SvgIcon name="help" size={Spacing.large} />
          </TouchableOpacity>
        )}
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <SvgIcon name="close" size={Spacing.large} color={Colors.black} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.medium,
  },
  side: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.small,
  },
  sideRightWide: {
    width: 48 + Spacing.large * 2 + Spacing.small,
  },
  title: {
    fontFamily: 'Figtree',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25.2,
    color: Colors.black,
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: Spacing.large * 2,
    height: Spacing.large * 2,
    borderRadius: Spacing.large,
    backgroundColor: Colors.grey50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

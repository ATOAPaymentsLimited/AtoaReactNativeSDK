import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

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
            <Text style={styles.iconText}>{'‹'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side}>
        {showHelp && onHelp && (
          <TouchableOpacity onPress={onHelp} style={styles.iconButton}>
            <Text style={styles.iconText}>?</Text>
          </TouchableOpacity>
        )}
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Text style={styles.closeText}>✕</Text>
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
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: Colors.grey600,
  },
  closeText: {
    fontSize: 16,
    color: Colors.grey600,
  },
});

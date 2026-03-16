import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { Strings } from '../../constants/strings';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { getFontFamily } from '../../constants/typography';

interface CardErrorScreenProps {
  title?: string;
  message?: string;
  onClose: () => void;
  onPayByBank?: () => void;
}

export function CardErrorScreen({
  title = Strings.error.defaultTitle,
  message,
  onClose,
  onPayByBank,
}: CardErrorScreenProps) {
  return (
    <View style={styles.container}>
      <BottomSheetHeader title={Strings.card.payByCard} onClose={onClose} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}
        {onPayByBank && (
          <LedgerButton
            title="Pay by bank"
            onPress={onPayByBank}
            variant="secondary"
            size="xtraLarge"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.large,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.medium,
  },
  title: {
    fontFamily: getFontFamily('700'),
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 23.2,
  },
  message: {
    fontFamily: getFontFamily('400'),
    fontSize: 14,
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 21,
  },
});

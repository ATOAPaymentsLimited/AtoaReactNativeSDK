import React from 'react';
import { View, StyleSheet } from 'react-native';

import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { ErrorWidget } from '../shared/ErrorWidget';
import { LedgerButton } from '../shared/LedgerButton';
import { Strings } from '../../constants/strings';
import { Spacing } from '../../constants/spacing';

interface CardErrorScreenProps {
  title?: string;
  message?: string;
  onClose: () => void;
  onPayByBank?: () => void;
}

export function CardErrorScreen({
  title,
  message,
  onClose,
  onPayByBank,
}: CardErrorScreenProps) {
  return (
    <View style={styles.container}>
      <BottomSheetHeader title={Strings.cardConfirmation.payByCard} onClose={onClose} />
      <View style={styles.content}>
        <ErrorWidget title={title} message={message} />
        {onPayByBank && (
          <>
            <View style={styles.spacer} />
            <View style={styles.fullWidth}>
              <LedgerButton
                title="Pay by bank"
                onPress={onPayByBank}
                variant="secondary"
                size="xtraLarge"
              />
            </View>
          </>
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
  },
  spacer: {
    height: Spacing.large,
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
});

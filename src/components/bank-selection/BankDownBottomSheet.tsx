import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import type { BankInstitution } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { SvgIcon } from '../shared/SvgIcon';
import { LedgerButton } from '../shared/LedgerButton';
import { getFontFamily } from '../../constants/typography';

interface BankDownBottomSheetProps {
  bank: BankInstitution;
  onClose: () => void;
}

export function BankDownBottomSheet({
  bank,
  onClose,
}: BankDownBottomSheetProps) {
  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.content}>
            <View style={styles.badge}>
              <SvgIcon
                name="iconError"
                size={24}
                color={Colors.errorDefault}
              />
              <Text style={styles.badgeText}>{Strings.bankDown.badge}</Text>
            </View>

            <View style={styles.spacerBadgeMessage} />

            <Text style={styles.message}>
              <Text style={styles.bankName}>{bank.name}</Text>
              {Strings.bankDown.message}
            </Text>

            <View style={styles.spacerMessageButton} />

            <LedgerButton
              title={Strings.bankDown.selectAnother}
              onPress={onClose}
              variant="secondary"
              size="xtraLarge"
            />
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Spacing.xtraLarge,
    borderTopRightRadius: Spacing.xtraLarge,
    paddingBottom: 32,
  },
  handle: {
    width: 50,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.grey300,
    alignSelf: 'center',
    marginTop: Spacing.medium,
    marginBottom: Spacing.large,
  },
  content: {
    paddingHorizontal: Spacing.xtraLarge,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorSubtle,
    borderRadius: Spacing.large,
    height: 32,
    paddingHorizontal: Spacing.medium,
    gap: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: getFontFamily('700'),
    fontSize: 11,
    color: Colors.errorDefault,
  },
  spacerBadgeMessage: {
    height: Spacing.xtraLarge,
  },
  spacerMessageButton: {
    height: Spacing.huge,
  },
  message: {
    fontFamily: getFontFamily('400'),
    fontSize: 16,
    color: Colors.black,
    lineHeight: 23.2,
  },
  bankName: {
    fontFamily: getFontFamily('700'),
  },
});

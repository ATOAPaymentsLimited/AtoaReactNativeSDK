import React from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import type { BankInstitution } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from '../shared/SvgIcon';
import { LedgerButton } from '../shared/LedgerButton';

interface BankDownBottomSheetProps {
  visible: boolean;
  bank: BankInstitution | null;
  onClose: () => void;
}

export function BankDownBottomSheet({
  visible,
  bank,
  onClose,
}: BankDownBottomSheetProps) {
  if (!bank) {
    return null;
  }

  return (
    <Modal
      visible={visible}
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
              <Text style={styles.badgeText}>Downtime</Text>
            </View>

            <View style={styles.spacerBadgeMessage} />

            <Text style={styles.message}>
              <Text style={styles.bankName}>{bank.name}</Text>
              {' bank is currently down for maintenance. Please select a different bank and try again.'}
            </Text>

            <View style={styles.spacerMessageButton} />

            <LedgerButton
              title="Select another bank"
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
    fontFamily: 'Figtree',
    fontSize: 11,
    fontWeight: '700',
    color: Colors.errorDefault,
  },
  spacerBadgeMessage: {
    height: Spacing.xtraLarge,
  },
  spacerMessageButton: {
    height: Spacing.huge,
  },
  message: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '400',
    color: Colors.black,
    lineHeight: 23.2,
  },
  bankName: {
    fontWeight: '700',
  },
});

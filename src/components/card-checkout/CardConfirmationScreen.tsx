import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import { isCardPaymentEnabled } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { InfoWidget } from '../shared/InfoWidget';
import { ErrorWidget } from '../shared/ErrorWidget';
import { ReviewDetailsTile } from '../confirmation/ReviewDetailsTile';
import { SvgIcon } from '../shared/SvgIcon';
import { formatAmount } from '../../utils/formatAmount';
import { getFontFamily } from '../../constants/typography';

interface CardConfirmationScreenProps {
  onClose: () => void;
  onConfirm: () => void;
  onChangePaymentMethod?: () => void;
}

export function CardConfirmationScreen({
  onClose,
  onConfirm,
  onChangePaymentMethod,
}: CardConfirmationScreenProps) {
  const { state, brandingColors } = useBankInstitutions();
  const { paymentDetails, bankAuthError } = state;

  const amount = paymentDetails?.amount;
  const amountStr = amount ? formatAmount(amount.amount, amount.currency) : '';
  const merchantName = paymentDetails?.merchantBusinessName ?? '';
  const storeImg = paymentDetails?.storeImg;

  if (bankAuthError) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title={Strings.cardConfirmation.title} onClose={onClose} />
        <View style={styles.errorContent}>
          <ErrorWidget message={bankAuthError.message} />
        </View>
      </View>
    );
  }

  if (!isCardPaymentEnabled(paymentDetails)) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title={Strings.cardConfirmation.title} onClose={onClose} />
        <View style={styles.errorContent}>
          <ErrorWidget
            title={Strings.cardConfirmation.notEnabledTitle}
            message={Strings.cardConfirmation.notEnabledMessage}
          />
          {onChangePaymentMethod && (
            <LedgerButton
              title="Pay by bank instead"
              onPress={onChangePaymentMethod}
              variant="primary2"
              size="xtraLarge"
              backgroundColor={brandingColors?.backgroundColor}
              foregroundColor={brandingColors?.foregroundColor}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BottomSheetHeader title={Strings.cardConfirmation.title} onClose={onClose} />

        <InfoWidget message={Strings.cardConfirmation.infoMessage} />

        <View style={styles.spacer} />

        {/* Payment details tile */}
        <ReviewDetailsTile
          iconUrl={storeImg}
          heading={Strings.cardConfirmation.payingTo}
          content={merchantName}
          rightText={amountStr}
        />

        <View style={styles.spacer} />

        {/* Card payment method tile */}
        <View style={styles.cardMethodTile}>
          <View style={styles.cardLogosRow}>
            <SvgIcon name="mastercard" size={20} />
          </View>
          <View style={styles.cardMethodTextContainer}>
            <Text style={styles.cardMethodHeading}>{Strings.cardConfirmation.payWith}</Text>
            <Text style={styles.cardMethodContent}>{Strings.cardConfirmation.cardPayment}</Text>
          </View>
          {onChangePaymentMethod && (
            <TouchableOpacity onPress={onChangePaymentMethod}>
              <Text style={styles.changeText}>{Strings.confirmation.change}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.spacer} />

        <LedgerButton
          title={Strings.cardConfirmation.payByCard}
          onPress={onConfirm}
          variant="primary2"
          size="xtraLarge"
          backgroundColor={brandingColors?.backgroundColor}
          foregroundColor={brandingColors?.foregroundColor}
        />

        <View style={styles.spacerXl} />

        {/* Terms */}
        <Text style={styles.termsText}>
          {Strings.cardConfirmation.termsPrefix}
          <Text
            style={styles.termsLink}
            onPress={() =>
              Linking.openURL('https://paywithatoa.co.uk/terms/')
            }
          >
            {Strings.cardConfirmation.termsLink}
          </Text>
        </Text>
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    paddingHorizontal: Spacing.large,
    paddingBottom: Spacing.large,
  },
  spacer: {
    height: Spacing.large,
  },
  spacerXl: {
    height: Spacing.huge,
  },
  cardMethodTile: {
    flexDirection: 'row',
    backgroundColor: Colors.grey50,
    padding: Spacing.large,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey200,
    alignItems: 'center',
  },
  cardLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: Spacing.medium,
  },
  cardMethodTextContainer: {
    flex: 1,
  },
  cardMethodHeading: {
    fontFamily: getFontFamily('600'),
    fontSize: 12,
    color: Colors.grey500,
  },
  cardMethodContent: {
    fontFamily: getFontFamily('700'),
    fontSize: 14,
    color: Colors.black,
    marginTop: 2,
  },
  changeText: {
    fontFamily: getFontFamily('700'),
    fontSize: 14,
    color: '#E42646',
    textDecorationLine: 'underline',
    marginLeft: Spacing.small,
  },
  termsText: {
    fontFamily: getFontFamily('400'),
    fontSize: 11,
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 17.6,
    paddingBottom: Spacing.huge,
  },
  termsLink: {
    color: Colors.grey500,
    fontFamily: getFontFamily('700'),
  },
  errorContent: {
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.huge,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

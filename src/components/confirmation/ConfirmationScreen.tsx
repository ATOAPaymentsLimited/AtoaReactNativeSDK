import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, Platform } from 'react-native';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import { getBankIcon } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { InfoWidget } from '../shared/InfoWidget';
import { AtoaLoader } from '../shared/AtoaLoader';
import { ReviewDetailsTile } from './ReviewDetailsTile';

interface ConfirmationScreenProps {
  onClose: () => void;
  onGoToBank: () => void;
  onChangeBank: () => void;
}

export function ConfirmationScreen({
  onClose,
  onGoToBank,
  onChangeBank,
}: ConfirmationScreenProps) {
  const { state, brandingColors } = useBankInstitutions();
  const { paymentDetails, selectedBank, isAppInstalled, showLinkExpired } =
    state;

  const amount = paymentDetails?.amount;
  const amountStr = amount
    ? `${amount.currency === 'GBP' ? '£' : amount.currency} ${amount.amount.toFixed(2)}`
    : '';
  const merchantName = paymentDetails?.merchantBusinessName ?? '';
  const bankName = selectedBank?.fullName ?? '';
  const bankIconUrl = selectedBank ? getBankIcon(selectedBank) : undefined;
  const storeImg = paymentDetails?.storeImg;

  const handleAppStorePress = useCallback(() => {
    const paymentAuth = state.paymentAuth;
    if (!paymentAuth) {
      return;
    }
    let uri: string | undefined;
    if (Platform.OS === 'android') {
      uri = paymentAuth.playStoreLink ?? undefined;
    } else {
      uri = paymentAuth.appStoreLink ?? undefined;
    }
    if (uri) {
      Linking.openURL(uri);
    }
  }, [state.paymentAuth]);

  if (state.isLoadingAuth) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title="Review" onClose={onClose} />
        <View style={styles.loaderContainer}>
          <AtoaLoader />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BottomSheetHeader title="Review" onClose={onClose} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <InfoWidget message="Confirm the details below and go to your bank to authorise the payment." />

        <View style={styles.spacer} />

        {/* Payment details tile */}
        <ReviewDetailsTile
          iconUrl={storeImg}
          heading={merchantName}
          content={amountStr}
        />

        <View style={styles.spacer} />

        {/* Bank details tile */}
        <ReviewDetailsTile
          iconUrl={bankIconUrl}
          heading="Paying from"
          content={bankName}
          actionText="Change"
          onAction={onChangeBank}
        />

        {/* App not installed warning */}
        {!isAppInstalled && (
          <>
            <View style={styles.spacer} />
            <InfoWidget
              message={`We recommend installing the ${bankName} app for the best experience.`}
              variant="warning"
            />
            <View style={styles.spacerSmall} />
            <LedgerButton
              title={`Install ${selectedBank?.name ?? 'Bank'} App`}
              onPress={handleAppStorePress}
              variant="ghost"
            />
          </>
        )}

        {/* Link expired */}
        {showLinkExpired && (
          <>
            <View style={styles.spacer} />
            <InfoWidget
              message="Payment link has expired. Please try again."
              variant="error"
            />
          </>
        )}

        <View style={styles.spacerLarge} />

        <LedgerButton
          title="Go to Bank"
          onPress={onGoToBank}
          variant="primary2"
          backgroundColor={brandingColors.backgroundColor}
          foregroundColor={brandingColors.foregroundColor}
          disabled={showLinkExpired}
        />

        <View style={styles.spacer} />

        {/* Terms */}
        <Text style={styles.termsText}>
          By continuing you accept Atoa&apos;s{' '}
          <Text
            style={styles.termsLink}
            onPress={() =>
              Linking.openURL('https://paywithatoa.co.uk/terms-of-service')
            }
          >
            Terms of Service
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.large,
    paddingBottom: Spacing.huge,
  },
  spacer: {
    height: Spacing.large,
  },
  spacerSmall: {
    height: Spacing.small,
  },
  spacerLarge: {
    height: Spacing.xtraLarge,
  },
  termsText: {
    fontFamily: 'Figtree',
    fontSize: 11,
    color: Colors.grey500,
    textAlign: 'center',
  },
  termsLink: {
    color: Colors.brandPrimary,
    textDecorationLine: 'underline',
  },
});

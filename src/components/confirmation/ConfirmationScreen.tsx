import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Linking, Platform } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import { getBankIcon } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { InfoWidget } from '../shared/InfoWidget';
import { SvgIcon } from '../shared/SvgIcon';
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
  const { state, dispatch, selectBank, brandingColors } = useBankInstitutions();
  const { paymentDetails, selectedBank, isAppInstalled, showLinkExpired } =
    state;

  const amount = paymentDetails?.amount;
  const amountStr = amount
    ? `${!amount.currency || amount.currency === 'GBP' ? '£' : amount.currency}${amount.amount.toFixed(2)}`
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

  const handleRefresh = useCallback(() => {
    if (!selectedBank) {
      return;
    }
    dispatch({ type: 'SET_SHOW_LINK_EXPIRED', payload: false });
    selectBank(selectedBank);
  }, [dispatch, selectBank, selectedBank]);

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

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <InfoWidget message="We'll send you to your bank's app or website to confirm this payment." />

        <View style={styles.spacer} />

        {/* Payment details tile */}
        <ReviewDetailsTile
          iconUrl={storeImg}
          heading="Paying to"
          content={merchantName}
          rightText={amountStr}
        />

        <View style={styles.spacer} />

        {/* Bank details tile */}
        <ReviewDetailsTile
          iconUrl={bankIconUrl}
          heading="From"
          content={bankName}
          actionText="Change"
          onAction={onChangeBank}
        />

        {/* App not installed warning */}
        {!isAppInstalled && (
          <>
            <View style={styles.spacer} />
            <View style={styles.appWarningBanner}>
              <SvgIcon
                name="warningFilled"
                size={16}
                color={Colors.errorDarker}
              />
              <Text style={styles.appWarningText}>
                {'For a smoother payment, we recommend downloading the '}
                <Text
                  style={styles.appWarningLink}
                  onPress={handleAppStorePress}
                >
                  {selectedBank?.name ?? 'Bank'} app
                </Text>
                {' Or, continue using internet banking if that works better for you.'}
              </Text>
            </View>
          </>
        )}

        {showLinkExpired && (
          <>
            <View style={styles.spacer} />
            <Text style={styles.linkExpiredText}>
              {'Link expired,  '}
              <Text style={styles.linkExpiredRefresh} onPress={handleRefresh}>
                Refresh
              </Text>
              {' to try again'}
            </Text>
          </>
        )}

        <View style={styles.spacer} />

        <LedgerButton
          title={`Go to ${selectedBank?.name ?? 'Bank'}  \u2192`}
          onPress={onGoToBank}
          variant="primary2"
          size="xtraLarge"
          backgroundColor={brandingColors?.backgroundColor}
          foregroundColor={brandingColors?.foregroundColor}
          disabled={showLinkExpired}
        />

        <View style={styles.spacerMedium} />

        <View style={styles.poweredByContainer}>
          <Text style={styles.poweredByText}>Powered by </Text>
          <View style={styles.poweredByLogo}>
            <SvgIcon name="atoaLogo" size={30} color="#E42646" />
          </View>
        </View>

        <View style={styles.spacerXl} />

        {/* Terms */}
        <Text style={styles.termsText}>
           By continuing, you trust this merchant and accept Atoa&apos;s{' '}
          <Text
            style={styles.termsLink}
            onPress={() =>
              Linking.openURL('https://paywithatoa.co.uk/terms-of-service')
            }
          >
            terms
          </Text>
        </Text>
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  content: {
    paddingHorizontal: Spacing.large,
    paddingBottom: Spacing.large,
  },
  spacer: {
    height: Spacing.large,
  },
  spacerMedium: {
    height: Spacing.medium,
  },
  spacerXl: {
    height: Spacing.huge,
  },
  linkExpiredText: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.errorDefault,
    textAlign: 'center',
    lineHeight: 21,
  },
  linkExpiredRefresh: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  appWarningBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.errorSubtle,
    borderRadius: 12,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    gap: Spacing.small,
    alignItems: 'flex-start',
  },
  appWarningText: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '400',
    color: Colors.errorDarker,
    lineHeight: 18,
    flex: 1,
  },
  appWarningLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
  poweredByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poweredByText: {
    fontFamily: 'Figtree',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grey500,
  },
  poweredByLogo: {
    width: 30,
    height: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  termsText: {
    fontFamily: 'Figtree',
    fontSize: 11,
    fontWeight: '400',
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 17.6,
    paddingBottom: Spacing.huge * 3,
  },
  termsBold: {
    fontWeight: '600',
  },
   termsLink: {
    color: Colors.grey500,
    fontWeight: '700',
  },
});

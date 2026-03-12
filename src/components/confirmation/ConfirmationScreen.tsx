import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform, AppState, type AppStateStatus } from 'react-native';
import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import { getBankIcon } from '../../types/bank';
import { isCardPaymentEnabled } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { InfoWidget } from '../shared/InfoWidget';
import { SvgIcon } from '../shared/SvgIcon';
import { AtoaLoader } from '../shared/AtoaLoader';
import { ErrorWidget } from '../shared/ErrorWidget';
import { ReviewDetailsTile } from './ReviewDetailsTile';
import { formatAmount } from '../../utils/formatAmount';
import { ERROR_BANK_APP_DOWN, ERROR_BANK_DOWN, INACTIVE_STATE_PATTERN } from '../../constants/component-constants';
import { getFontFamily } from '../../constants/typography';

interface ConfirmationScreenProps {
  mode: 'bank' | 'card';
  onClose: () => void;
  onConfirm: () => void;
  onChangeSelection: () => void;
}

export function ConfirmationScreen({
  mode,
  onClose,
  onConfirm,
  onChangeSelection,
}: ConfirmationScreenProps) {
  const { state, dispatch, selectBank, checkBankAppAvailability, brandingColors } = useBankInstitutions();
  const { paymentDetails, selectedBank, isAppInstalled, showLinkExpired, bankAuthError } =
    state;
  const appStateRef = useRef(AppState.currentState);

  const isBank = mode === 'bank';

  // Re-check bank app availability when app returns from background (bank mode only)
  useEffect(() => {
    if (!isBank) { return; }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(INACTIVE_STATE_PATTERN) &&
        nextAppState === 'active'
      ) {
        checkBankAppAvailability();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [isBank, checkBankAppAvailability]);

  const amount = paymentDetails?.amount;
  const amountStr = amount ? formatAmount(amount.amount, amount.currency) : '';
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

  // --- Loading state ---
  if (state.isLoadingAuth) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title={isBank ? Strings.confirmation.title : Strings.cardConfirmation.title} onClose={onClose} />
        <View style={styles.loaderContainer}>
          <AtoaLoader />
        </View>
      </View>
    );
  }

  // --- Error states ---
  if (isBank && bankAuthError) {
    const errMsg = bankAuthError.message?.trim();
    const isBankDown =
      errMsg?.toLowerCase().includes(ERROR_BANK_APP_DOWN) ||
      errMsg?.toLowerCase().includes(ERROR_BANK_DOWN);
    if (isBankDown && selectedBank) {
      return (
        <BottomSheetView>
          <View style={styles.bankDownContent}>
            <View style={styles.bankDownBadge}>
              <SvgIcon name="iconError" size={24} color={Colors.errorDefault} />
              <Text style={styles.bankDownBadgeText}>{Strings.bankDown.badge}</Text>
            </View>
            <View style={styles.spacerXl} />
            <Text style={styles.bankDownMessage}>
              <Text style={styles.bankDownBankName}>{selectedBank.name}</Text>
              {Strings.bankDown.message}
            </Text>
            <View style={styles.spacerXl} />
            <LedgerButton
              title={Strings.bankDown.selectAnother}
              onPress={onChangeSelection}
              variant="secondary"
              size="xtraLarge"
            />
          </View>
        </BottomSheetView>
      );
    }

    return (
      <BottomSheetView>
        <BottomSheetHeader title={Strings.confirmation.title} onClose={onClose} />
        <View style={styles.errorContent}>
          <ErrorWidget message={bankAuthError.message} />
        </View>
      </BottomSheetView>
    );
  }

  if (!isBank && bankAuthError) {
    return (
      <BottomSheetView>
        <BottomSheetHeader title={Strings.cardConfirmation.title} onClose={onClose} />
        <View style={styles.errorContent}>
          <ErrorWidget message={bankAuthError.message} />
          <View style={styles.spacer} />
          <View style={styles.fullWidth}>
            <LedgerButton
              title={Strings.cardConfirmation.payByBank}
              onPress={onChangeSelection}
              variant="secondary"
              size="xtraLarge"
            />
          </View>
          <View style={styles.spacerXl} />
        </View>
      </BottomSheetView>
    );
  }

  if (!isBank && state.paymentDetailsError) {
    return (
      <BottomSheetView>
        <BottomSheetHeader title={Strings.cardConfirmation.title} onClose={onClose} />
        <View style={styles.errorContent}>
          <ErrorWidget message={state.paymentDetailsError.message} />
          <View style={styles.spacerXl} />
        </View>
      </BottomSheetView>
    );
  }

  if (!isBank && !isCardPaymentEnabled(paymentDetails)) {
    return (
      <BottomSheetView>
        <BottomSheetHeader title="" onClose={onClose} />
        <View style={styles.errorContent}>
          <ErrorWidget
            title={Strings.cardConfirmation.notEnabledTitle}
            message={Strings.cardConfirmation.notEnabledMessage}
          />
          <View style={styles.fullWidth}>
            <LedgerButton
              title={Strings.cardConfirmation.payByBank}
              onPress={onChangeSelection}
              variant="primary2"
              size="xtraLarge"
              backgroundColor={brandingColors?.backgroundColor}
              foregroundColor={brandingColors?.foregroundColor}
            />
          </View>
          <View style={styles.spacerXl} />
        </View>
      </BottomSheetView>
    );
  }

  // --- Main confirmation view ---
  const infoMessage = isBank
    ? Strings.confirmation.infoMessage
    : Strings.cardConfirmation.infoMessage;

  const confirmButtonTitle = isBank
    ? Strings.confirmation.goToBank(selectedBank?.name ?? Strings.confirmation.defaultBankName)
    : Strings.cardConfirmation.payByCard;

  const termsPrefix = isBank
    ? Strings.confirmation.termsPrefix
    : Strings.cardConfirmation.termsPrefix;

  const termsLink = isBank
    ? Strings.confirmation.termsLink
    : Strings.cardConfirmation.termsLink;

  return (
    <View style={styles.container}>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <BottomSheetHeader title={Strings.confirmation.title} onClose={onClose} />

        <InfoWidget message={infoMessage} />

        <View style={styles.spacer} />

        {/* Payment details tile */}
        <ReviewDetailsTile
          iconUrl={storeImg}
          heading={Strings.confirmation.payingTo}
          content={merchantName}
          rightText={amountStr}
        />

        <View style={styles.spacer} />

        {/* Bank details tile (bank mode) */}
        {isBank && (
          <ReviewDetailsTile
            iconUrl={bankIconUrl}
            heading={Strings.confirmation.from}
            content={bankName}
            actionText={Strings.confirmation.change}
            onAction={onChangeSelection}
          />
        )}

        {/* Card payment method tile (card mode) */}
        {!isBank && (
          <View style={styles.cardMethodTile}>
            <View style={styles.cardLogosRow}>
              <SvgIcon name="mastercard" size={20} />
            </View>
            <View style={styles.cardMethodTextContainer}>
              <Text style={styles.cardMethodHeading}>{Strings.cardConfirmation.payWith}</Text>
              <Text style={styles.cardMethodContent}>{Strings.cardConfirmation.cards}</Text>
            </View>
            <TouchableOpacity onPress={onChangeSelection}>
              <Text style={styles.changeText}>{Strings.confirmation.change}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App not installed warning (bank mode only) */}
        {isBank && !isAppInstalled && (
          <>
            <View style={styles.spacer} />
            <View style={styles.appWarningBanner}>
              <SvgIcon
                name="warningFilled"
                size={16}
                color={Colors.errorDarker}
              />
              <Text style={styles.appWarningText}>
                {Strings.confirmation.appWarningPrefix}
                <Text
                  style={styles.appWarningLink}
                  onPress={handleAppStorePress}
                >
                  {selectedBank?.name ?? Strings.confirmation.defaultBankName}{Strings.confirmation.appWarningSuffix}
                </Text>
                {Strings.confirmation.appWarningAlt}
              </Text>
            </View>
          </>
        )}

        {/* Link expired (bank mode only) */}
        {isBank && showLinkExpired && (
          <>
            <View style={styles.spacer} />
            <Text style={styles.linkExpiredText}>
              {Strings.confirmation.linkExpired}
              <Text style={styles.linkExpiredRefresh} onPress={handleRefresh}>
                {Strings.confirmation.refresh}
              </Text>
              {Strings.confirmation.linkExpiredSuffix}
            </Text>
          </>
        )}

        <View style={styles.spacer} />

        <LedgerButton
          title={confirmButtonTitle}
          onPress={onConfirm}
          variant="primary2"
          size="xtraLarge"
          backgroundColor={brandingColors?.backgroundColor}
          foregroundColor={brandingColors?.foregroundColor}
          disabled={isBank && showLinkExpired}
        />

        <View style={styles.spacerXl} />

        {/* Terms */}
        <Text style={styles.termsText}>
          {termsPrefix}
          <Text
            style={styles.termsLink}
            onPress={() =>
              Linking.openURL('https://paywithatoa.co.uk/terms/')
            }
          >
            {termsLink}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  linkExpiredText: {
    fontFamily: getFontFamily('500'),
    fontSize: 14,
    color: Colors.errorDefault,
    textAlign: 'center',
    lineHeight: 21,
  },
  linkExpiredRefresh: {
    fontFamily: getFontFamily('700'),
    textDecorationLine: 'underline',
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
    fontFamily: getFontFamily('400'),
    fontSize: 12,
    color: Colors.errorDarker,
    lineHeight: 18,
    flex: 1,
  },
  appWarningLink: {
    fontFamily: getFontFamily('700'),
    textDecorationLine: 'underline',
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
    color: Colors.actionRed,
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
  bankDownContent: {
    paddingHorizontal: Spacing.xtraLarge,
    paddingTop: Spacing.large,
    minHeight: 260,
  },
  bankDownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorSubtle,
    borderRadius: Spacing.large,
    height: 32,
    paddingHorizontal: Spacing.medium,
    gap: 6,
    alignSelf: 'flex-start',
  },
  bankDownBadgeText: {
    fontFamily: getFontFamily('700'),
    fontSize: 11,
    color: Colors.errorDefault,
  },
  bankDownMessage: {
    fontFamily: getFontFamily('400'),
    fontSize: 16,
    color: Colors.black,
    lineHeight: 23.2,
  },
  bankDownBankName: {
    fontFamily: getFontFamily('700'),
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  errorContent: {
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.huge,
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

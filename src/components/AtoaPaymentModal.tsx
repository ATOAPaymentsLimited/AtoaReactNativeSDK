import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { PaymentProvider, usePaymentContext } from '../hooks/PaymentContext';
import { ConnectivityProvider } from '../hooks/ConnectivityContext';
import { useBankInstitutions } from '../hooks/useBankInstitutions';
import { TransactionType } from '../types/transaction';
import type { AtoaPayOptions } from '../types/sdk';
import type { TransactionDetails } from '../types/payment';
import { isCompleted, isFailed, isCardPaymentEnabled } from '../types/payment';
import { AtoaException } from '../types/error';
import { Colors } from '../constants/colors';
import { Strings } from '../constants/strings';
import { Spacing } from '../constants/spacing';
import { BankSelectionScreen } from './bank-selection/BankSelectionScreen';
import { HowToMakePaymentScreen } from './how-to-pay/HowToMakePaymentScreen';
import { ConfirmationScreen } from './confirmation/ConfirmationScreen';
import { VerifyingPaymentScreen } from './verifying-payment/VerifyingPaymentScreen';
import { CardCheckoutScreen, type CardCheckoutResult } from './card-checkout';
import { CardErrorScreen } from './card-checkout/CardErrorScreen';
import { PaymentSuccessView } from './shared/PaymentSuccessView';
import { ConnectivityWrapper } from './shared/ConnectivityWrapper';
import { FetchingBankLoader } from './shared/FetchingBankLoader';

type Screen =
  | 'loading'
  | 'howToPay'
  | 'bankSelection'
  | 'confirmation'
  | 'verifying'
  | 'cardCheckout'
  | 'cardError'
  | 'cardPaymentSuccess'

interface AtoaPaymentModalProps {
  options: AtoaPayOptions;
  onComplete: (result: TransactionDetails | null) => void;
}

export function AtoaPaymentModal({
  options,
  onComplete,
}: AtoaPaymentModalProps) {
  // Suppress LogBox warnings/errors while the SDK modal is active
  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    return () => {
      LogBox.ignoreAllLogs(false);
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ConnectivityProvider>
        <PaymentProvider options={options}>
          <AtoaPaymentModalInner options={options} onComplete={onComplete} />
        </PaymentProvider>
      </ConnectivityProvider>
    </GestureHandlerRootView>
  );
}

function AtoaPaymentModalInner({
  options,
  onComplete,
}: AtoaPaymentModalProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('loading');
  const [confirmationMode, setConfirmationMode] = useState<'bank' | 'card'>('bank');
  const [switchedFromCard, setSwitchedFromCard] = useState(false);
  const { state, dispatch, client } = usePaymentContext();
  const {
    getPaymentDetailsAndBanks,
    startPolling,
    stopPolling,
    resetSelectBank,
    selectBank,
    selectCardPayment,
  } = useBankInstitutions();
  const hasInitializedRef = useRef(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const handleCloseRef = useRef<() => void>(() => {});

  // Initialize: fetch payment details and banks
  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;
    getPaymentDetailsAndBanks().then(() => setIsDataReady(true));
  }, [getPaymentDetailsAndBanks]);

  // Determine showHowPaymentWorks after data is fully loaded (including matchLastBank)
  useEffect(() => {
    if (!isDataReady || state.showHowPaymentWorks !== null) {
      return;
    }
    const hasError = !!state.bankFetchingError || !!state.paymentDetailsError;
    const shouldShow =
      options.showHowPaymentWorks &&
      !hasError &&
      !state.hasLastPaymentDetails &&
      state.lastBankDetails == null;
    dispatch({ type: 'SET_SHOW_HOW_PAYMENT_WORKS', payload: shouldShow });
    if (options.transactionType === TransactionType.CARD) {
      setConfirmationMode('card');
      selectCardPayment();
    } else if (shouldShow) {
      setCurrentScreen('howToPay');
    } else if (!state.hasLastPaymentDetails) {
      setCurrentScreen('bankSelection');
    }
  }, [isDataReady, state.showHowPaymentWorks, state.hasLastPaymentDetails, state.lastBankDetails, state.bankFetchingError, state.paymentDetailsError, options.showHowPaymentWorks, dispatch, options.transactionType, selectCardPayment]);

  // Auto-select last bank if available, skip to confirmation
  const hasAutoSelectedRef = useRef(false);
  useEffect(() => {
    if (
      !hasAutoSelectedRef.current &&
      state.hasLastPaymentDetails &&
      state.lastBankDetails &&
      !state.isLoading &&
      !state.isLoadingDetails
    ) {
      hasAutoSelectedRef.current = true;
      selectBank(state.lastBankDetails).then((result) => {
        if (result !== 'success') {
          // Auto-select failed — fall back to manual bank selection
          dispatch({ type: 'SET_HAS_LAST_PAYMENT_DETAILS', payload: false });
          dispatch({ type: 'SET_LAST_BANK_DETAILS', payload: null });
        }
      });
    }
  }, [
    state.hasLastPaymentDetails,
    state.lastBankDetails,
    state.isLoading,
    state.isLoadingDetails,
    selectBank,
    dispatch,
  ]);

  // Navigate to confirmation when bank is selected and auth is ready
  // (skip if cardCheckoutId is present — card flow is handled separately)
  useEffect(() => {
    if (
      state.paymentAuth &&
      !state.paymentAuth.cardCheckoutId &&
      state.selectedBank &&
      !state.isLoadingAuth &&
      (currentScreen === 'bankSelection' || currentScreen === 'loading' || currentScreen === 'howToPay')
    ) {
      setConfirmationMode('bank');
      setCurrentScreen('confirmation');
      startPolling();
    }
  }, [state.paymentAuth, state.selectedBank, state.isLoadingAuth, currentScreen, startPolling]);

  // Navigate directly to card checkout when card auth is ready (skip confirmation)
  useEffect(() => {
    if (
      state.paymentAuth?.cardCheckoutId &&
      !state.isLoadingAuth &&
      (currentScreen === 'loading' || currentScreen === 'bankSelection')
    ) {
      setConfirmationMode('card');
      setCurrentScreen('cardCheckout');
    }
  }, [state.paymentAuth, state.isLoadingAuth, currentScreen]);

  // Navigate to confirmation when secure payment auth fails
  useEffect(() => {
    if (
      state.bankAuthError &&
      (currentScreen === 'bankSelection' || currentScreen === 'loading')
    ) {
      if (confirmationMode === 'card') {
        setCurrentScreen('cardError');
      } else if (state.selectedBank) {
        setCurrentScreen('confirmation');
      }
    }
  }, [state.bankAuthError, state.selectedBank, currentScreen, confirmationMode]);

  // Navigate to card error when payment details fail for card flow
  useEffect(() => {
    if (
      state.paymentDetailsError &&
      confirmationMode === 'card' &&
      currentScreen === 'loading'
    ) {
      setCurrentScreen('cardError');
    }
  }, [state.paymentDetailsError, confirmationMode, currentScreen]);

  // Navigate back to confirmation when link expires during verifying
  useEffect(() => {
    if (state.showLinkExpired && currentScreen === 'verifying') {
      setCurrentScreen('confirmation');
    }
  }, [state.showLinkExpired, currentScreen]);

  const handleClose = useCallback(() => {
    stopPolling();
    options.onUserClose?.({
      paymentRequestId: options.paymentId,
      redirectUrlParams: state.transactionDetails?.redirectUrlParams,
      signature: state.transactionDetails?.signature,
      signatureHash: state.transactionDetails?.signatureHash,
    });
    onComplete(state.transactionDetails);
  }, [stopPolling, options, state.transactionDetails, onComplete]);

  // Keep ref in sync so BackHandler always calls the latest handleClose
  handleCloseRef.current = handleClose;

  // Handle hardware back button
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleCloseRef.current();
        return true;
      }
    );
    return () => subscription.remove();
  }, []);

  const handleHowToPayContinue = useCallback(() => {
    dispatch({ type: 'SET_SHOW_HOW_PAYMENT_WORKS', payload: false });
    setCurrentScreen('bankSelection');
  }, [dispatch]);

  const handleGoToBank = useCallback(() => {
    setCurrentScreen('verifying');
  }, []);

  const handlePayByCard = useCallback(() => {
    setConfirmationMode('card');
    setCurrentScreen('loading');
    selectCardPayment();
  }, [selectCardPayment]);

  const handleCardCheckoutResult = useCallback(
    async (result: CardCheckoutResult) => {
      const idempotencyId =
        result.type === 'success'
          ? result.paymentIdempotencyId
          : state.paymentAuth?.paymentIdempotencyId;

      if (result.type === 'success') {
        let details: TransactionDetails | null = null;
        if (idempotencyId) {
          const MAX_ATTEMPTS = 5;
          const DELAY_MS = 2000;
          for (let i = 0; i < MAX_ATTEMPTS; i++) {
            try {
              details = await client.getPaymentStatus(idempotencyId);
              dispatch({ type: 'SET_TRANSACTION_DETAILS', payload: details });
              options.onPaymentStatusChange?.({
                status: typeof details.status === 'string' ? details.status : '',
                redirectUrlParams: details.redirectUrlParams,
                signature: details.signature,
                signatureHash: details.signatureHash,
              });
              if (isCompleted(details) || isFailed(details)) {
                break;
              }
            } catch {
              // Status fetch failed — retry
            }
            if (i < MAX_ATTEMPTS - 1) {
              await new Promise<void>(r => setTimeout(r, DELAY_MS));
            }
          }
        }
        if (details && isCompleted(details)) {
          setCurrentScreen('cardPaymentSuccess');
        } else {
          onComplete(details);
        }
      } else if (result.type === 'failure') {
        stopPolling();
        let details: TransactionDetails | null = null;
        if (idempotencyId) {
          try {
            details = await client.getPaymentStatus(idempotencyId);
          } catch {
            // Status fetch failed
          }
        }
        onComplete(details);
      } else if (result.type === 'closed') {
        resetSelectBank();
        setSwitchedFromCard(true);
        setCurrentScreen('bankSelection');
      }
    },
    [dispatch, client, options, state.paymentAuth, stopPolling, onComplete, resetSelectBank]
  );

  const handleChangeBank = useCallback(() => {
    resetSelectBank();
    setConfirmationMode('bank');
    setCurrentScreen('bankSelection');
  }, [resetSelectBank]);

  const navigateToHowToPay = useCallback(() => {
    setCurrentScreen('howToPay');
  }, []);

  const isPaymentCompleted =
    currentScreen === 'cardPaymentSuccess' ||
    (currentScreen === 'verifying' &&
      state.transactionDetails != null &&
      isCompleted(state.transactionDetails));

  const needsFixedHeight =
    currentScreen === 'bankSelection' ||
    currentScreen === 'cardCheckout' ||
    currentScreen === 'cardError' ||
    currentScreen === 'loading' ||
    state.isLoading ||
    state.isLoadingDetails;
  const snapPoints = useMemo(
    () => (needsFixedHeight ? ['95%'] : undefined),
    [needsFixedHeight]
  );

  const bankSelectionBack = useMemo(
    () =>
      state.showHowPaymentWorks === false && options.showHowPaymentWorks
        ? navigateToHowToPay
        : handleClose,
    [state.showHowPaymentWorks, options.showHowPaymentWorks, navigateToHowToPay, handleClose]
  );

  const cardPaymentEnabled = useMemo(
    () => (options.transactionType == null || switchedFromCard) && isCardPaymentEnabled(state.paymentDetails),
    [options.transactionType, switchedFromCard, state.paymentDetails]
  );

  const confirmationOnChange = options.transactionType == null ? handleChangeBank : undefined;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return (
          <View style={styles.loadingSplash}>
            <FetchingBankLoader />
          </View>
        );
      case 'howToPay':
        return (
          <HowToMakePaymentScreen
            onContinue={handleHowToPayContinue}
            onClose={handleClose}
          />
        );
      case 'bankSelection':
        return (
          <BankSelectionScreen
            onBack={bankSelectionBack}
            onHelp={navigateToHowToPay}
            cardPaymentEnabled={cardPaymentEnabled}
            onPayByCard={handlePayByCard}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationScreen
            onClose={handleClose}
            onConfirm={handleGoToBank}
            onChangeSelection={confirmationOnChange}
          />
        );
      case 'verifying':
        return <VerifyingPaymentScreen onClose={handleClose} />;
      case 'cardCheckout': {
        const checkoutId = state.paymentAuth?.cardCheckoutId;
        if (!checkoutId) {
          dispatch({
            type: 'SET_BANK_AUTH_ERROR',
            payload: new AtoaException('custom', Strings.api.cardCheckoutUnavailable),
          });
          setCurrentScreen('bankSelection');
          return null;
        }
        return (
          <CardCheckoutScreen
            checkoutId={checkoutId}
            merchantName={state.paymentDetails?.merchantBusinessName ?? ''}
            onResult={handleCardCheckoutResult}
            onBack={options.transactionType === TransactionType.CARD ? handleClose : handleChangeBank}
          />
        );
      }
      case 'cardError': {
        const cardNotEnabled = !isCardPaymentEnabled(state.paymentDetails);
        const errorTitle = cardNotEnabled ? Strings.bankSelection.paymentProcessingError : undefined;
        const errorMessage =
           state.paymentDetailsError?.message ?? state.bankAuthError?.message;
        const showPayByBank = cardNotEnabled || options.transactionType == null;
        return (
          <CardErrorScreen
            title={errorTitle}
            message={errorMessage}
            onClose={handleClose}
            onPayByBank={showPayByBank ? handleChangeBank : undefined}
          />
        );
      }
      case 'cardPaymentSuccess':
        return <PaymentSuccessView onClose={handleClose} />;
    }
  };

  return (
    <View style={styles.overlay}>
      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={!needsFixedHeight}
        enablePanDownToClose={isPaymentCompleted}
        onClose={handleClose}
        enableContentPanningGesture={currentScreen === 'verifying'}
        handleComponent={null}
        backgroundStyle={styles.background}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <View style={styles.sheetContent}>
          <ConnectivityWrapper onBack={handleClose}>
            {renderScreen()}
          </ConnectivityWrapper>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  background: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Spacing.xtraLarge,
    borderTopRightRadius: Spacing.xtraLarge,
  },
  sheetContent: {
    flex: 1,
    paddingTop: Spacing.small,
    borderTopLeftRadius: Spacing.xtraLarge,
    borderTopRightRadius: Spacing.xtraLarge,
    overflow: 'hidden',
  },
  loadingSplash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

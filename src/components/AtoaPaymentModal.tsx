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
import { isCompleted, isCardPaymentEnabled, TransactionStatus } from '../types/payment';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { BankSelectionScreen } from './bank-selection/BankSelectionScreen';
import { HowToMakePaymentScreen } from './how-to-pay/HowToMakePaymentScreen';
import { ConfirmationScreen } from './confirmation/ConfirmationScreen';
import { VerifyingPaymentScreen } from './verifying-payment/VerifyingPaymentScreen';
import { CardCheckoutScreen, type CardCheckoutResult } from './card-checkout';
import { PaymentSuccessView } from './shared/PaymentSuccessView';
import { ConnectivityWrapper } from './shared/ConnectivityWrapper';
import { SDKLoader } from './shared/AtoaLoader';

type Screen =
  | 'loading'
  | 'howToPay'
  | 'bankSelection'
  | 'confirmation'
  | 'verifying'
  | 'cardCheckout'
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { state, dispatch } = usePaymentContext();
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
    const shouldShow =
      options.showHowPaymentWorks &&
      !state.hasLastPaymentDetails &&
      state.lastBankDetails == null;
    dispatch({ type: 'SET_SHOW_HOW_PAYMENT_WORKS', payload: shouldShow });
    if (options.transactionType === TransactionType.CARD) {
      selectCardPayment();
    } else if (shouldShow) {
      setCurrentScreen('howToPay');
    } else if (!state.hasLastPaymentDetails) {
      setCurrentScreen('bankSelection');
    }
  }, [isDataReady, state.showHowPaymentWorks, state.hasLastPaymentDetails, state.lastBankDetails, options.showHowPaymentWorks, dispatch, options.transactionType, selectCardPayment]);

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

  // Navigate to card confirmation when card auth is ready
  useEffect(() => {
    if (
      state.paymentAuth?.cardCheckoutId &&
      !state.isLoadingAuth &&
      (currentScreen === 'loading' || currentScreen === 'bankSelection')
    ) {
      setConfirmationMode('card');
      setCurrentScreen('confirmation');
    }
  }, [state.paymentAuth, state.isLoadingAuth, currentScreen]);

  // Navigate to confirmation when secure payment auth fails
  useEffect(() => {
    if (
      state.bankAuthError &&
      (currentScreen === 'bankSelection' || currentScreen === 'loading') &&
      (state.selectedBank || confirmationMode === 'card')
    ) {
      setCurrentScreen('confirmation');
    }
  }, [state.bankAuthError, state.selectedBank, currentScreen, confirmationMode]);

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

  const handlePayByCard = useCallback(async () => {
    setConfirmationMode('card');
    await selectCardPayment();
  }, [selectCardPayment]);

  const handleCardConfirmationConfirm = useCallback(() => {
    if (state.paymentAuth?.cardCheckoutId) {
      setCurrentScreen('cardCheckout');
    }
  }, [state.paymentAuth]);

  const handleCardCheckoutResult = useCallback(
    (result: CardCheckoutResult) => {
      const paymentIdempotencyId =
        result.type === 'success' ? result.paymentIdempotencyId : undefined;

      if (result.type === 'success') {
        // Set synthetic transaction details so handleClose passes them to onComplete
        dispatch({
          type: 'SET_TRANSACTION_DETAILS',
          payload: {
            applicationUserId: '',
            paidAmount: state.paymentDetails?.amount?.amount ?? 0,
            currency: state.paymentDetails?.amount?.currency ?? 'GBP',
            status: TransactionStatus.COMPLETED,
            createdAt: new Date().toISOString(),
            paymentIdempotencyId: paymentIdempotencyId ?? '',
          },
        });
        setCurrentScreen('cardPaymentSuccess');
      } else if (result.type === 'failure') {
        // Close the sheet immediately with FAILED transaction details
        // so the host app can show its own failure UI (e.g. snackbar)
        const failedDetails: TransactionDetails = {
          applicationUserId: '',
          paidAmount: state.paymentDetails?.amount?.amount ?? 0,
          currency: state.paymentDetails?.amount?.currency ?? 'GBP',
          status: TransactionStatus.FAILED,
          createdAt: new Date().toISOString(),
          paymentIdempotencyId: '',
          errorDescription: result.error,
        };
        stopPolling();
        onComplete(failedDetails);
      } else if (result.type === 'closed') {
        // User tapped "switch to bank" in webview
        resetSelectBank();
        setCurrentScreen('bankSelection');
      }
    },
    [dispatch, state.paymentDetails, stopPolling, onComplete, resetSelectBank]
  );

  const handleChangeBank = useCallback(() => {
    resetSelectBank();
    setConfirmationMode('bank');
    setCurrentScreen('bankSelection');
  }, [resetSelectBank]);

  const handleVerifyingClose = useCallback(
    (_result: 'completed' | 'closed') => {
      handleClose();
    },
    [handleClose]
  );

  const isPaymentCompleted =
    currentScreen === 'cardPaymentSuccess' ||
    (currentScreen === 'verifying' &&
      state.transactionDetails != null &&
      isCompleted(state.transactionDetails));

  const needsFixedHeight =
    currentScreen === 'bankSelection' ||
    currentScreen === 'cardCheckout' ||
    currentScreen === 'loading' ||
    state.isLoading ||
    state.isLoadingDetails;
  const snapPoints = useMemo(
    () => (needsFixedHeight ? ['95%'] : undefined),
    [needsFixedHeight]
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'loading':
        return (
          <View style={styles.loadingSplash}>
            <SDKLoader />
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
            onBack={
              state.showHowPaymentWorks === false &&
              options.showHowPaymentWorks
                ? () => setCurrentScreen('howToPay')
                : handleClose
            }
            onHelp={() => setCurrentScreen('howToPay')}
            cardPaymentEnabled={isCardPaymentEnabled(state.paymentDetails)}
            onPayByCard={handlePayByCard}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationScreen
            mode={confirmationMode}
            onClose={handleClose}
            onConfirm={confirmationMode === 'bank' ? handleGoToBank : handleCardConfirmationConfirm}
            onChangeSelection={handleChangeBank}
          />
        );
      case 'verifying':
        return <VerifyingPaymentScreen onClose={handleVerifyingClose} />;
      case 'cardCheckout': {
        const checkoutId = state.paymentAuth?.cardCheckoutId;
        if (!checkoutId) {
          return (
            <View style={styles.loadingSplash}>
              <SDKLoader />
            </View>
          );
        }
        return (
          <CardCheckoutScreen
            checkoutId={checkoutId}
            merchantName={state.paymentDetails?.merchantBusinessName ?? ''}
            onResult={handleCardCheckoutResult}
            onBack={() => setCurrentScreen('confirmation')}
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
        ref={bottomSheetRef}
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

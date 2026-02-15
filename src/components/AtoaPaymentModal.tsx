import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { PaymentProvider, usePaymentContext } from '../hooks/PaymentContext';
import { ConnectivityProvider } from '../hooks/ConnectivityContext';
import { useBankInstitutions } from '../hooks/useBankInstitutions';
import type { AtoaPayOptions } from '../types/sdk';
import type { TransactionDetails } from '../types/payment';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { BankSelectionScreen } from './bank-selection/BankSelectionScreen';
import { HowToMakePaymentScreen } from './how-to-pay/HowToMakePaymentScreen';
import { ConfirmationScreen } from './confirmation/ConfirmationScreen';
import { PaymentPaidWidget } from './confirmation/PaymentPaidWidget';
import { VerifyingPaymentScreen } from './verifying-payment/VerifyingPaymentScreen';
import { AtoaException } from '../types/error';
import { ConnectivityWrapper } from './shared/ConnectivityWrapper';
import { SDKLoader } from './shared/AtoaLoader';

type Screen =
  | 'loading'
  | 'howToPay'
  | 'bankSelection'
  | 'confirmation'
  | 'verifying'
  | 'paymentPaid';

interface AtoaPaymentModalProps {
  options: AtoaPayOptions;
  onComplete: (result: TransactionDetails | null) => void;
}

export function AtoaPaymentModal({
  options,
  onComplete,
}: AtoaPaymentModalProps) {
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
  const [currentScreen, setCurrentScreen] = useState<Screen>(
    options.showHowPaymentWorks ? 'howToPay' : 'bankSelection'
  );
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { state, dispatch } = usePaymentContext();
  const {
    getPaymentDetailsAndBanks,
    stopPolling,
    resetSelectBank,
    selectBank,
  } = useBankInstitutions();
  const contentHeight = 0;
  const hasInitializedRef = useRef(false);
  const handleCloseRef = useRef<() => void>(() => {});

  // Initialize: fetch payment details and banks
  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;
    getPaymentDetailsAndBanks();
  }, [getPaymentDetailsAndBanks, options.showHowPaymentWorks]);

  // Determine showHowPaymentWorks after data is loaded
  useEffect(() => {
    if (
      state.isLoading ||
      state.isLoadingDetails ||
      state.showHowPaymentWorks !== null
    ) {
      return;
    }
    const shouldShow =
      options.showHowPaymentWorks &&
      !state.hasLastPaymentDetails &&
      state.lastBankDetails == null;
    dispatch({ type: 'SET_SHOW_HOW_PAYMENT_WORKS', payload: shouldShow });
    if (shouldShow) {
      setCurrentScreen('howToPay');
    } else if (!state.hasLastPaymentDetails) {
      setCurrentScreen('bankSelection');
    }
  }, [
    state.isLoading,
    state.isLoadingDetails,
    state.showHowPaymentWorks,
    state.hasLastPaymentDetails,
    state.lastBankDetails,
    options.showHowPaymentWorks,
    dispatch,
  ]);

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
      selectBank(state.lastBankDetails);
    }
  }, [
    state.hasLastPaymentDetails,
    state.lastBankDetails,
    state.isLoading,
    state.isLoadingDetails,
    selectBank,
  ]);

  // Navigate to confirmation when bank is selected and auth is ready
  useEffect(() => {
    if (
      state.paymentAuth &&
      state.selectedBank &&
      !state.isLoadingAuth &&
      (currentScreen === 'bankSelection' || currentScreen === 'loading' || currentScreen === 'howToPay')
    ) {
      setCurrentScreen('confirmation');
    }
  }, [state.paymentAuth, state.selectedBank, state.isLoadingAuth, currentScreen]);

  // Handle bankAuthError for "already paid"
  useEffect(() => {
    if (state.bankAuthError instanceof AtoaException) {
      const err = state.bankAuthError as AtoaException;
      if (err.amount != null && err.referenceId != null) {
        setCurrentScreen('paymentPaid');
      }
    }
  }, [state.bankAuthError]);

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

  const handleChangeBank = useCallback(() => {
    resetSelectBank();
    setCurrentScreen('bankSelection');
  }, [resetSelectBank]);

  const handleVerifyingClose = useCallback(
    (result: 'completed' | 'closed') => {
      if (result === 'completed' && state.transactionDetails) {
        onComplete(state.transactionDetails);
      } else {
        handleClose();
      }
    },
    [state.transactionDetails, onComplete, handleClose]
  );

  const needsFixedHeight =
    currentScreen === 'bankSelection' ||
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
          <View style={[styles.loadingSplash, { height: contentHeight }]}>
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
          />
        );
      case 'confirmation':
        return (
          <ConfirmationScreen
            onClose={handleClose}
            onGoToBank={handleGoToBank}
            onChangeBank={handleChangeBank}
          />
        );
      case 'verifying':
        return <VerifyingPaymentScreen onClose={handleVerifyingClose} />;
      case 'paymentPaid': {
        const err = state.bankAuthError as AtoaException | null;
        return (
          <PaymentPaidWidget
            amount={err?.amount}
            time={err?.time}
            referenceId={err?.referenceId}
          />
        );
      }
    }
  };

  return (
    <View style={styles.overlay}>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={!needsFixedHeight}
        enablePanDownToClose={false}
        enableContentPanningGesture={
          currentScreen !== 'loading' &&
          currentScreen !== 'howToPay' &&
          currentScreen !== 'confirmation' &&
          currentScreen !== 'bankSelection'
        }
        handleComponent={null}
        backgroundStyle={styles.background}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <View style={styles.sheetContent}>
          <ConnectivityWrapper onBack={handleClose} height={contentHeight}>
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
    paddingTop: Spacing.large,
    paddingBottom: Spacing.huge,
  },
  loadingSplash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

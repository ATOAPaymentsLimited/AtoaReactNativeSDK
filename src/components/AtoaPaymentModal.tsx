import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { PaymentProvider, usePaymentContext } from '../hooks/PaymentContext';
import { useBankInstitutions } from '../hooks/useBankInstitutions';
import type { AtoaPayOptions } from '../types/sdk';
import type { TransactionDetails } from '../types/payment';
import { Colors } from '../constants/colors';
import { BankSelectionScreen } from './bank-selection/BankSelectionScreen';
import { HowToMakePaymentScreen } from './how-to-pay/HowToMakePaymentScreen';
import { ConfirmationScreen } from './confirmation/ConfirmationScreen';
import { PaymentPaidWidget } from './confirmation/PaymentPaidWidget';
import { VerifyingPaymentScreen } from './verifying-payment/VerifyingPaymentScreen';
import { AtoaException } from '../types/error';

type Screen =
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
      <PaymentProvider options={options}>
        <AtoaPaymentModalInner options={options} onComplete={onComplete} />
      </PaymentProvider>
    </GestureHandlerRootView>
  );
}

function AtoaPaymentModalInner({
  options,
  onComplete,
}: AtoaPaymentModalProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>('bankSelection');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { state, dispatch } = usePaymentContext();
  const {
    getPaymentDetailsAndBanks,
    authorizeBank,
    startPolling,
    stopPolling,
    resetSelectBank,
  } = useBankInstitutions();
  const hasInitializedRef = useRef(false);
  const handleCloseRef = useRef<() => void>(() => {});

  // Initialize: fetch payment details and banks
  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;
    getPaymentDetailsAndBanks(options.showHowPaymentWorks);
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

  // Navigate to confirmation when bank is selected and auth is ready
  useEffect(() => {
    if (
      state.paymentAuth &&
      state.selectedBank &&
      !state.isLoadingAuth &&
      currentScreen === 'bankSelection'
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

  const renderScreen = () => {
    switch (currentScreen) {
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
                : undefined
            }
            onClose={handleClose}
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
        snapPoints={['90%']}
        enablePanDownToClose={false}
        enableDynamicSizing={false}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.background}
      >
        <BottomSheetView style={styles.sheetContent}>
          {renderScreen()}
        </BottomSheetView>
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
  handle: {
    backgroundColor: Colors.grey300,
    width: 40,
  },
  background: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContent: {
    flex: 1,
  },
});

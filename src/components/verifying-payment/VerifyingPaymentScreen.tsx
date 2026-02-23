import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import { getBankIcon } from '../../types/bank';
import { isCompleted, isAwaitingAuth, isNotInitiated } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { ErrorWidget } from '../shared/ErrorWidget';
import { DotLoadingAnimation } from '../shared/DotLoadingAnimation';
import { PaymentStatusView } from './PaymentStatusView';

interface VerifyingPaymentScreenProps {
  onClose: (result: 'completed' | 'closed') => void;
}

export function VerifyingPaymentScreen({
  onClose,
}: VerifyingPaymentScreenProps) {
  const { state, authorizeBank, startPolling } = useBankInstitutions();
  const { startListening, stop, transactionDetails, paymentStatusError } =
    usePaymentStatus();
  const hasStartedRef = useRef(false);
  const hasCompletedRef = useRef(false);
  const stopRef = useRef(stop);
  stopRef.current = stop;

  const paymentAuth = state.paymentAuth;
  const selectedBank = state.selectedBank;
  const bankIconUrl = selectedBank ? getBankIcon(selectedBank) : undefined;

  // Start authorization and polling on mount
  useEffect(() => {
    if (hasStartedRef.current || !paymentAuth) {
      return;
    }
    hasStartedRef.current = true;

    const start = async () => {
      // Delay 1 second before opening bank app
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      await authorizeBank();
      startPolling();
      startListening(paymentAuth.paymentIdempotencyId);
    };

    start();

    return () => {
      stopRef.current();
    };
  }, [paymentAuth, authorizeBank, startPolling, startListening]);

  const handleClose = useCallback(() => {
    stop();
    if (transactionDetails) {
      onClose('completed');
    } else {
      onClose('closed');
    }
  }, [stop, transactionDetails, onClose]);

  // Auto-dismiss on completed status
  useEffect(() => {
    if (hasCompletedRef.current) {
      return;
    }
    if (transactionDetails && isCompleted(transactionDetails)) {
      hasCompletedRef.current = true;
      stop();
      const timer = setTimeout(() => {
        onClose('completed');
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [transactionDetails, stop, onClose]);

  // Show payment status view when we have a terminal status
  if (
    transactionDetails &&
    !isAwaitingAuth(transactionDetails) &&
    !isNotInitiated(transactionDetails)
  ) {
    return (
      <PaymentStatusView
        transactionDetails={transactionDetails}
        onClose={handleClose}
      />
    );
  }

  // Show error
  if (paymentStatusError) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title="Payment in progress" onClose={handleClose} />
        <ErrorWidget
          message={paymentStatusError.message}
          onRetry={() => {
            if (paymentAuth) {
              startListening(paymentAuth.paymentIdempotencyId);
            }
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BottomSheetHeader title="Payment in progress" onClose={handleClose} />

      <View style={styles.contentArea}>
        {/* Atoa Logo + Dot Loading + Bank Icon */}
        <View style={styles.animationRow}>
          <Image
            source={require('../../assets/images/red-back-atoa-logo.png')}
            style={styles.atoaLogo}
            resizeMode="contain"
          />

          <DotLoadingAnimation />

          {bankIconUrl ? (
            <View style={styles.bankIconContainer}>
              <Image
                source={{ uri: bankIconUrl }}
                style={styles.bankIcon}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.bankIconPlaceholder} />
          )}
        </View>

        <View style={styles.spacerLogos} />

        <Text style={styles.verifyingText}>
          {'Verifying payment status\nwith your bank.'}
        </Text>

        <View style={styles.spacerText} />

        <Text style={styles.noteText}>
          <Text style={styles.noteBold}>Note:</Text>
          {' Do not press back or close this screen until the transaction is complete.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: 40,
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.large,
  },
  animationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.medium,
  },
  atoaLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  bankIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.25,
    borderColor: Colors.grey100,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bankIcon: {
    width: 25,
    height: 25,
  },
  bankIconPlaceholder: {
    width: 40,
    height: 40,
  },
  spacerLogos: {
    height: 48,
  },
  spacerText: {
    height: Spacing.large,
  },
  verifyingText: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 23.2,
  },
  noteText: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.large,
  },
  noteBold: {
    fontWeight: '700',
  },
});

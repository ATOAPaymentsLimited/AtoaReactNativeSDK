import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import { getBankIcon } from '../../types/bank';
import { isCompleted, isAwaitingAuth, isNotInitiated } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { ErrorWidget } from '../shared/ErrorWidget';
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
  const { height } = useWindowDimensions();

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
      // Delay 1 second before opening bank app (matching Flutter)
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
        <BottomSheetHeader title="Payment In Progress" onClose={handleClose} />
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
      <BottomSheetHeader title="Payment In Progress" onClose={handleClose} />

      <View style={[styles.centerContent, { height: height * 0.4 }]}>
        {/* Atoa Logo → Dot Loading → Bank Icon */}
        <View style={styles.animationRow}>
          <Image
            source={require('../../assets/images/red-back-atoa-logo.png')}
            style={styles.atoaLogo}
            resizeMode="contain"
          />

          <View style={styles.dotContainer}>
            <LottieView
              source={require('../../assets/animations/dot-loading.json')}
              autoPlay
              loop
              style={styles.dotAnimation}
            />
          </View>

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

        <View style={styles.spacerLarge} />

        <Text style={styles.verifyingText}>Verifying your payment</Text>

        <View style={styles.spacerSmall} />

        <Text style={styles.warningText}>
          Do not close this window
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atoaLogo: {
    width: 72,
    height: 72,
  },
  dotContainer: {
    width: 72,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotAnimation: {
    width: 72,
    height: 40,
  },
  bankIconContainer: {
    width: 72,
    height: 72,
    borderRadius: Spacing.medium,
    borderWidth: 1.25,
    borderColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.small,
  },
  bankIcon: {
    width: 56,
    height: 56,
  },
  bankIconPlaceholder: {
    width: 72,
    height: 72,
  },
  spacerLarge: {
    height: Spacing.large * 2,
  },
  spacerSmall: {
    height: Spacing.small,
  },
  verifyingText: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
  },
  warningText: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '400',
    color: Colors.grey500,
  },
});

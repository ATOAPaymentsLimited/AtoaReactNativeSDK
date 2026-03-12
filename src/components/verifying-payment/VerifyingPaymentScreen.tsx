import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import { getBankIcon } from '../../types/bank';
import { isCompleted, isAwaitingAuth, isNotInitiated } from '../../types/payment';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { ErrorWidget } from '../shared/ErrorWidget';
import { DotLoadingAnimation } from '../shared/DotLoadingAnimation';
import { PaymentSuccessView } from '../shared/PaymentSuccessView';
import { AtoaLogoSource } from '../../constants/images';
import { getFontFamily } from '../../constants/typography';
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
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopRef = useRef(stop);
  stopRef.current = stop;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const paymentAuth = state.paymentAuth;
  const selectedBank = state.selectedBank;
  const bankIconUrl = selectedBank ? getBankIcon(selectedBank) : undefined;

  // Start authorization and polling on mount (bank flow only)
  useEffect(() => {
    if (hasStartedRef.current || !paymentAuth) {
      return;
    }
    hasStartedRef.current = true;

    const start = async () => {
      // Delay then open bank app via deep link
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

  // Auto-dismiss on completed status.
  // Store the timer in a ref so that late-arriving poll responses
  // (which update the transactionDetails reference after stop())
  // cannot cancel the timer via effect cleanup.
  useEffect(() => {
    if (hasCompletedRef.current) {
      return;
    }
    if (transactionDetails && isCompleted(transactionDetails)) {
      hasCompletedRef.current = true;
      stopRef.current();
      autoCloseTimerRef.current = setTimeout(() => {
        onCloseRef.current('completed');
      }, 2000);
    }
  }, [transactionDetails]);

  // Clear auto-close timer on unmount only
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  // Show payment status view when we have a terminal status
  if (
    transactionDetails &&
    !isAwaitingAuth(transactionDetails) &&
    !isNotInitiated(transactionDetails)
  ) {
    return (
      <PaymentSuccessView
        transactionDetails={transactionDetails}
        onClose={handleClose}
      />
    );
  }

  // Show error
  if (paymentStatusError) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader title={Strings.verifyingPayment.title} onClose={handleClose} />
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
      <BottomSheetHeader title={Strings.verifyingPayment.title} onClose={handleClose} />

      <View style={styles.contentArea}>
        {/* Atoa Logo + Dot Loading + Bank Icon */}
        <View style={styles.animationRow}>
          <Image
            source={AtoaLogoSource}
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
          {Strings.verifyingPayment.verifyingStatus}
        </Text>

        <View style={styles.spacerText} />

        <Text style={styles.noteText}>
          <Text style={styles.noteBold}>{Strings.verifyingPayment.notePrefix}</Text>
          {Strings.verifyingPayment.noteMessage}
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
    fontFamily: getFontFamily('700'),
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 23.2,
  },
  noteText: {
    fontFamily: getFontFamily('500'),
    fontSize: 12,
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.large,
  },
  noteBold: {
    fontFamily: getFontFamily('700'),
  },
});

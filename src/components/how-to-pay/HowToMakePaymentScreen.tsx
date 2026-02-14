import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { SvgIcon } from '../shared/SvgIcon';
import { DotLoadingAnimation } from '../shared/DotLoadingAnimation';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';

interface HowToMakePaymentScreenProps {
  onContinue: () => void;
  onClose: () => void;
}

const STEPS = [
  'Select your bank from the list below',
  'You will be redirected to your bank app to authorise the payment',
  'Once the payment is complete, you will be redirected back',
];

export function HowToMakePaymentScreen({
  onContinue,
  onClose,
}: HowToMakePaymentScreenProps) {
  const { brandingColors, state } = useBankInstitutions();

  const VISIBLE_BANK_COUNT = 3;
  const remainingCount = state.bankList.length - VISIBLE_BANK_COUNT;

  return (
    <View style={styles.container}>
      <BottomSheetHeader title="How to pay with bank app?" onClose={onClose} />

      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacerHuge} />

        {/* Bank Logos */}
        <View style={styles.logosContainer}>
          <Image
            source={require('../../assets/images/red-back-atoa-logo.png')}
            style={styles.atoaLogo}
            resizeMode="contain"
          />
          <DotLoadingAnimation />
          <View style={styles.bankIconsRow}>
                    <Image
                        source={require('../../assets/images/bank-logos.png')}
                        style={styles.bankLogos}
                        resizeMode="contain"
                    />
            {remainingCount > 0 && (
              <View style={[styles.bankIconCircle, styles.bankCountCircle, styles.bankIconOverlap]}>
                <Text style={styles.bankCountText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.spacerXtraLarge} />
        <View style={styles.spacerXtraLarge} />

        {/* Steps */}
        {STEPS.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}


        {/* Trust badge */}
        <View style={styles.trustContainer}>
          <SvgIcon name="shield" size={Spacing.xtraLarge} />
          <View style={{ width: Spacing.small }} />
          <Text style={styles.trustText}>
            Trusted by thousands of businesses in the UK
          </Text>
        </View>

        <View style={styles.spacerHuge} />

        <LedgerButton
          title="I understand, continue →"
          onPress={onContinue}
          variant="primary2"
          backgroundColor={brandingColors?.backgroundColor}
          foregroundColor={brandingColors?.foregroundColor}
        />
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  content: {
    paddingHorizontal: Spacing.large,
    paddingBottom: 100,
  },
  spacerHuge: {
    height: Spacing.huge,
  },
  spacerXtraLarge: {
    height: Spacing.large,
  },
  logosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atoaLogo: {
    width: 40,
    height: 40,
  },
  bankIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.grey100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bankIconImage: {
    width: 28,
    height: 28,
  },
  bankCountCircle: {
    backgroundColor: Colors.grey100,
  },
  bankCountText: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.grey700,
  },
  bankIconOverlap: {
    marginLeft: -40,
  },
  bankLogos: {
    height: 40,
    width: 120,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.large * 2,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.infoSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.large,
  },
  stepNumber: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.infoDarker,
  },
  stepText: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '400',
    color: Colors.black,
    flex: 1,
    lineHeight: 21,
    paddingTop: 5,
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.positiveLighter,
    borderRadius: Spacing.small + Spacing.tiny,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
  },
  trustText: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.positiveDarker,
  },
});

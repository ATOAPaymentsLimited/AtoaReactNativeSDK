import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import LottieView from 'lottie-react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { SvgIcon } from '../shared/SvgIcon';
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
  const { brandingColors } = useBankInstitutions();

  return (
    <View style={styles.container}>
      <BottomSheetHeader title="How to pay with bank app" onClose={onClose} />

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
          <View style={styles.dotContainer}>
            <LottieView
              source={require('../../assets/animations/dot-loading.json')}
              autoPlay
              loop
              style={styles.dotAnimation}
            />
          </View>
          <Image
            source={require('../../assets/images/bank-logos.png')}
            style={styles.bankLogos}
            resizeMode="contain"
          />
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

        <View style={styles.spacerHuge} />

        {/* Trust badge */}
        <View style={styles.trustContainer}>
          <SvgIcon name="shield" size={Spacing.xtraLarge} />
          <View style={{ width: Spacing.small }} />
          <Text style={styles.trustText}>
            Trusted by thousands of businesses across the UK
          </Text>
        </View>

        <View style={styles.spacerHuge} />

        <LedgerButton
          title="I understand, Continue"
          onPress={onContinue}
          variant="primary2"
          backgroundColor={brandingColors.backgroundColor}
          foregroundColor={brandingColors.foregroundColor}
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
    height: Spacing.xtraLarge,
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
  dotContainer: {
    width: 41,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotAnimation: {
    width: 41,
    height: 30,
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
    justifyContent: 'center',
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

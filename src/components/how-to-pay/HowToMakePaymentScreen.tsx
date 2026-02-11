import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacerHuge} />

        {/* Bank Logos */}
        <View style={styles.logosContainer}>
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
          <Text style={styles.shieldIcon}>🛡</Text>
          <Text style={styles.trustText}>
            Trusted by thousands of businesses across the UK
          </Text>
        </View>

        <View style={styles.spacerHuge} />

        <LedgerButton
          title="Continue"
          onPress={onContinue}
          variant="primary2"
          backgroundColor={brandingColors.backgroundColor}
          foregroundColor={brandingColors.foregroundColor}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.large,
    paddingBottom: Spacing.huge,
  },
  spacerHuge: {
    height: Spacing.huge,
  },
  spacerXtraLarge: {
    height: Spacing.xtraLarge,
  },
  logosContainer: {
    alignItems: 'center',
  },
  bankLogos: {
    height: 60,
    width: '80%',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.large * 2,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.infoSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.medium,
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
  },
  shieldIcon: {
    fontSize: 16,
    marginRight: Spacing.small,
  },
  trustText: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.grey600,
  },
});

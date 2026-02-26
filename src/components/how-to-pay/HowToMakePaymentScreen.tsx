import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { LedgerButton } from '../shared/LedgerButton';
import { SvgIcon } from '../shared/SvgIcon';
import { DotLoadingAnimation } from '../shared/DotLoadingAnimation';
import { SDKLoader } from '../shared/AtoaLoader';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import type { BankInstitution } from '../../types/bank';
import { getBankIcon } from '../../types/bank';
import { VISIBLE_BANK_COUNT } from '../../constants/component-constants';

interface HowToMakePaymentScreenProps {
  onContinue: () => void;
  onClose: () => void;
}

function BankIconCircle({ bank }: { bank: BankInstitution }) {
  const iconUrl = getBankIcon(bank);
  return (
    <View style={styles.bankIconCircle}>
      {iconUrl && (
        <Image
          source={{ uri: iconUrl }}
          style={styles.bankIconImage}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

export function HowToMakePaymentScreen({
  onContinue,
  onClose,
}: HowToMakePaymentScreenProps) {
  const { brandingColors, state } = useBankInstitutions();
  const isLoading = state.isLoading || state.isLoadingDetails;
  const visibleBanks = state.bankList.slice(0, VISIBLE_BANK_COUNT);
  const remainingCount = Math.max(0, state.bankList.length - VISIBLE_BANK_COUNT);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <SDKLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BottomSheetHeader title={Strings.howToPay.title} onClose={onClose} />

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
            {visibleBanks.map((bank) => (
              <BankIconCircle key={bank.id} bank={bank} />
            ))}
            {remainingCount > 0 && (
              <View style={[styles.bankIconCircle, styles.bankCountCircle]}>
                <Text style={styles.bankCountText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.spacerXl} />

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepContainer}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepText}>
              {Strings.howToPay.step1Prefix}
              <Text style={styles.stepTextBold}>{Strings.howToPay.step1Bold}</Text>
              {Strings.howToPay.step1Suffix}
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepText}>
              {Strings.howToPay.step2Prefix}
              <Text style={styles.stepTextBold}>{Strings.howToPay.step2Bold}</Text>
              {Strings.howToPay.step2Suffix}
            </Text>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepText}>
              {Strings.howToPay.step3Prefix}
              <Text style={styles.stepTextBold}>{Strings.howToPay.step3Bold}</Text>
              {Strings.howToPay.step3Suffix}
            </Text>
          </View>
        </View>

        {/* Trust badge */}
        <View style={styles.trustContainer}>
          <SvgIcon name="shield" size={20} />
          <Text style={styles.trustText}>
            {Strings.howToPay.trustBadge}
          </Text>
        </View>

        <View style={styles.spacerHuge} />

        <LedgerButton
          title={Strings.howToPay.continueButton}
          onPress={onContinue}
          variant="primary2"
          size="xtraLarge"
          backgroundColor={brandingColors?.backgroundColor}
          foregroundColor={brandingColors?.foregroundColor}
        />

        <View style={styles.poweredByContainer}>
          <Text style={styles.poweredByText}>{Strings.howToPay.poweredBy}</Text>
          <View style={styles.poweredByLogo}>
            <SvgIcon name="atoaLogo" size={30} color="#E42646" />
          </View>
        </View>
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  content: {
    paddingHorizontal: Spacing.large,
    paddingBottom: Spacing.large,
  },
  spacerHuge: {
    height: Spacing.huge,
  },
  spacerXl: {
    height: 40,
  },
  logosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  atoaLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  bankIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.25,
    borderColor: Colors.grey100,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: -10,
  },
  bankIconImage: {
    width: 22,
    height: 22,
  },
  bankCountCircle: {
    backgroundColor: Colors.grey100,
    borderColor: Colors.white,
    borderRadius: 20,
  },
  bankCountText: {
    fontFamily: 'Figtree',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grey700,
  },
  stepsContainer: {
    gap: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.large,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.infoSubtle,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Colors.grey700,
    flex: 1,
    lineHeight: 21,
  },
  stepTextBold: {
    fontWeight: '700',
  },
  trustContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.positiveSubtle,
    borderRadius: 10,
    paddingVertical: Spacing.medium,
    paddingHorizontal: Spacing.large,
    gap: Spacing.small,
    marginTop: Spacing.huge,
  },
  trustText: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.positiveDarker,
  },
  poweredByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.medium,
    paddingBottom: Spacing.huge * 3 + Spacing.medium,
  },
  poweredByText: {
    fontFamily: 'Figtree',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grey500,
  },
  poweredByLogo: {
    width: 30,
    height: 12,
    overflow: 'hidden',
    justifyContent: 'center',
  },
});

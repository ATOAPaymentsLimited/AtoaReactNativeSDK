import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Linking, Pressable } from 'react-native';
import { DotLoadingAnimation } from '../shared/DotLoadingAnimation';
import { SvgIcon } from '../shared/SvgIcon';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { AtoaLogoSource } from '../../constants/images';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { getFontFamily } from '../../constants/typography';

interface CardVerifyingScreenProps {
  onClose: () => void;
  checkoutUrl?: string;
}

export function CardVerifyingScreen({ onClose, checkoutUrl }: CardVerifyingScreenProps) {
  const handleOpenCheckout = useCallback(() => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl);
    }
  }, [checkoutUrl]);

  return (
    <View style={styles.container}>
      <BottomSheetHeader title={Strings.verifyingPayment.title} onClose={onClose} />
      <View style={styles.content}>
        <View style={styles.animationRow}>
          <Image source={AtoaLogoSource} style={styles.atoaLogo} resizeMode="contain" />
          <DotLoadingAnimation />
          <View style={styles.cardIconRow}>
            <SvgIcon name="visa" size={20} />
            <SvgIcon name="mastercard" size={20} />
          </View>
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
        {checkoutUrl && (
          <>
            <View style={styles.spacerText} />
            <Pressable onPress={handleOpenCheckout} hitSlop={8}>
              <Text style={styles.redirectLink}>
                {Strings.card.tapToOpenCheckout}
              </Text>
            </Pressable>
          </>
        )}
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
  content: {
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
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spacerLogos: {
    height: 48,
  },
  verifyingText: {
    fontFamily: getFontFamily('700'),
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 23.2,
  },
  spacerText: {
    height: Spacing.large,
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
  redirectLink: {
    fontFamily: getFontFamily('600'),
    fontSize: 12,
    color: Colors.black,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

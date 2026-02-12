import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from './SvgIcon';

type InfoVariant = 'info' | 'error' | 'warning';

interface InfoWidgetProps {
  message: string;
  variant?: InfoVariant;
}

export const InfoWidget = React.memo(function InfoWidget({ message, variant = 'info' }: InfoWidgetProps) {
  const variantColors = getVariantColors(variant);

  return (
    <View style={[styles.container, { backgroundColor: variantColors.bg }]}>
      <SvgIcon name="info" size={Spacing.large} color={variantColors.text} />
      <Text style={[styles.text, { color: variantColors.text }]}>
        {message}
      </Text>
    </View>
  );
});

function getVariantColors(variant: InfoVariant) {
  switch (variant) {
    case 'info':
      return { bg: Colors.infoSubtle, text: Colors.infoDarker };
    case 'error':
      return { bg: Colors.errorSubtle, text: Colors.errorDarker };
    case 'warning':
      return { bg: Colors.warningSubtle, text: Colors.warningDarker };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Spacing.small,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
  },
  text: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
    marginLeft: Spacing.small,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type InfoVariant = 'info' | 'error' | 'warning';

interface InfoWidgetProps {
  message: string;
  variant?: InfoVariant;
}

export const InfoWidget = React.memo(function InfoWidget({ message, variant = 'info' }: InfoWidgetProps) {
  const variantColors = getVariantColors(variant);

  return (
    <View style={[styles.container, { backgroundColor: variantColors.bg }]}>
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
    borderRadius: Spacing.small,
    padding: Spacing.medium,
  },
  text: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
});

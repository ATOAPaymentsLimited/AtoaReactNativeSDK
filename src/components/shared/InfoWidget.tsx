import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from './SvgIcon';
import { type InfoVariant, VARIANT_CONFIG } from '../../constants/component-constants';
import { getFontFamily } from '../../constants/typography';

interface InfoWidgetProps {
  message: string;
  variant?: InfoVariant;
}

export const InfoWidget = React.memo(function InfoWidget({
  message,
  variant = 'info',
}: InfoWidgetProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <SvgIcon name={config.icon} size={Spacing.large} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>
        {message}
      </Text>
    </View>
  );
});


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.small,
    paddingVertical: Spacing.small,
    paddingHorizontal: Spacing.medium,
    gap: Spacing.small,
  },
  text: {
    fontFamily: getFontFamily('500'),
    fontSize: 11,
    lineHeight: 17.6,
    flex: 1,
  },
});

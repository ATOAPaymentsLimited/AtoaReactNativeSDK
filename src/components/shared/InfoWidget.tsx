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

const VARIANT_CONFIG: Record<
  InfoVariant,
  { bg: string; color: string; icon: 'info' | 'warningFilled' }
> = {
  info: { bg: Colors.infoSubtle, color: Colors.infoDarker, icon: 'info' },
  error: { bg: Colors.errorSubtle, color: Colors.errorDarker, icon: 'warningFilled' },
  warning: { bg: Colors.warningSubtle, color: Colors.warningDarker, icon: 'warningFilled' },
};

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
    fontFamily: 'Figtree',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 17.6,
    flex: 1,
  },
});

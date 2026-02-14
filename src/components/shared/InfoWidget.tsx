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

export const InfoWidget = React.memo(function InfoWidget({ message }: InfoWidgetProps) {

  return (
    <View style={[styles.container, { backgroundColor: Colors.infoSubtle }]}>
      <SvgIcon name="info" size={Spacing.large} color={Colors.infoDarker} />
      <Text style={[styles.text, { color: Colors.infoDarker }]}>
        {message}
      </Text>
    </View>
  );
});


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

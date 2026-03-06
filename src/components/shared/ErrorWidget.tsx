import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { getFontFamily } from '../../constants/typography';

interface ErrorWidgetProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorWidget({
  title = Strings.error.defaultTitle,
  message,
  onRetry,
}: ErrorWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text style={styles.retryText}>{Strings.error.retry}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.huge,
    gap: Spacing.medium,
  },
  title: {
    fontFamily: getFontFamily('700'),
    fontSize: 16,
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 23.2,
  },
  message: {
    fontFamily: getFontFamily('400'),
    fontSize: 14,
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 21,
  },
  retryText: {
    fontFamily: getFontFamily('700'),
    fontSize: 14,
    color: '#E42646',
    textDecorationLine: 'underline',
    lineHeight: 22.4,
  },
});

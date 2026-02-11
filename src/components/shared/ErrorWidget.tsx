import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface ErrorWidgetProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorWidget({
  title = 'Oops! Something went wrong',
  message,
  onRetry,
}: ErrorWidgetProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorIcon}>⚠</Text>
      <View style={styles.spacerLarge} />
      <Text style={styles.title}>{title}</Text>
      {message && (
        <>
          <View style={styles.spacerSmall} />
          <Text style={styles.message}>{message}</Text>
        </>
      )}
      {onRetry && (
        <>
          <View style={styles.spacerLarge} />
          <TouchableOpacity onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </>
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
  },
  errorIcon: {
    fontSize: 64,
    color: Colors.grey600,
  },
  spacerLarge: {
    height: Spacing.huge,
  },
  spacerSmall: {
    height: Spacing.small,
  },
  title: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grey500,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brandPrimary,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
});

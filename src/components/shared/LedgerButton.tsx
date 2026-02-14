import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

type ButtonVariant =
  | 'primary1'
  | 'primary2'
  | 'secondary'
  | 'tertiary'
  | 'ghost';

type ButtonSize = 'xtraLarge' | 'large' | 'medium' | 'small' | 'xtraSmall';

const BUTTON_HEIGHTS: Record<ButtonSize, number> = {
  xtraLarge: 48,
  large: 40,
  medium: 32,
  small: 28,
  xtraSmall: 24,
};

interface LedgerButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function LedgerButton({
  title,
  onPress,
  variant = 'primary1',
  size = 'large',
  disabled = false,
  loading = false,
  backgroundColor,
  foregroundColor,
  style,
  textStyle,
}: LedgerButtonProps) {
  const variantStyles = getVariantStyles(
    variant,
    backgroundColor,
    foregroundColor
  );

  return (
    <TouchableOpacity
      style={[
        styles.base,
        { height: BUTTON_HEIGHTS[size] },
        variantStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyles.text.color as string}
          size="small"
        />
      ) : (
        <Text
          style={[styles.text, variantStyles.text, textStyle]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function getVariantStyles(
  variant: ButtonVariant,
  bgColor?: string,
  fgColor?: string
): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'primary1':
      return {
        container: { backgroundColor: Colors.brandPrimary },
        text: { color: Colors.white },
      };
    case 'primary2':
      return {
        container: { backgroundColor: bgColor ?? Colors.black },
        text: { color: fgColor ?? Colors.white },
      };
    case 'secondary':
      return {
        container: { backgroundColor: Colors.grey50 },
        text: { color: Colors.black },
      };
    case 'tertiary':
      return {
        container: { backgroundColor: Colors.transparent },
        text: { color: Colors.brandPrimary },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: Colors.white,
          borderWidth: 1,
          borderColor: Colors.black,
        },
        text: { color: Colors.black },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    height: BUTTON_HEIGHTS.large,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.large,
  },
  text: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.4,
  },
});

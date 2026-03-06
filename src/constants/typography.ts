import { Platform, StyleSheet } from 'react-native';

const iosFontMap: Record<string, string> = {
  '400': 'Figtree-Regular',
  '500': 'Figtree-Medium',
  '600': 'Figtree-SemiBold',
  '700': 'Figtree-Bold',
};

const androidFontMap: Record<string, string> = {
  '400': 'Figtree',
  '500': 'Figtree_medium',
  '600': 'Figtree_semibold',
  '700': 'Figtree_bold',
};

export function getFontFamily(weight: '400' | '500' | '600' | '700' = '400') {
  const map = Platform.OS === 'ios' ? iosFontMap : androidFontMap;
  return map[weight] ?? map['400'];
}

export const Typography = StyleSheet.create({
  displayLarge: {
    fontFamily: getFontFamily('700'),
    fontSize: 48,
    letterSpacing: 0,
  },
  displayMedium: {
    fontFamily: getFontFamily('700'),
    fontSize: 36,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: getFontFamily('700'),
    fontSize: 32,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: getFontFamily('700'),
    fontSize: 32,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: getFontFamily('700'),
    fontSize: 28,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: getFontFamily('700'),
    fontSize: 24,
    lineHeight: 31.2,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: getFontFamily('400'),
    fontSize: 24,
    lineHeight: 31.2,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: getFontFamily('400'),
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleSmall: {
    fontFamily: getFontFamily('400'),
    fontSize: 16,
    lineHeight: 23.2,
    letterSpacing: 0,
  },
  labelLarge: {
    fontFamily: getFontFamily('400'),
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
  },
  labelMedium: {
    fontFamily: getFontFamily('400'),
    fontSize: 18,
    lineHeight: 25.2,
    letterSpacing: 0,
  },
  labelSmall: {
    fontFamily: getFontFamily('400'),
    fontSize: 13,
    lineHeight: 19.5,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontFamily: getFontFamily('400'),
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: getFontFamily('400'),
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0,
  },
  bodySmall: {
    fontFamily: getFontFamily('400'),
    fontSize: 11,
    lineHeight: 17.6,
    letterSpacing: 0,
  },
});

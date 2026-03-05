import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { SvgIcon } from './SvgIcon';
import { FONT_FAMILY } from '../../constants/typography';

export function RequestExpiredView() {
  return (
    <View style={styles.container}>
      <SvgIcon name="highImportance" size={24} color={Colors.grey400} />
      <View style={styles.textGroup}>
        <Text style={styles.title}>{Strings.requestExpired.title}</Text>
        <Text style={styles.message}>
          {Strings.requestExpired.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xtraLarge,
    paddingHorizontal: Spacing.large,
  },
  textGroup: {
    gap: Spacing.medium,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
    lineHeight: 23.2,
  },
  message: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 21,
  },
});

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from '../shared/SvgIcon';

interface ReviewDetailsTileProps {
  iconUrl?: string;
  heading: string;
  content: string;
  rightText?: string;
  actionText?: string;
  onAction?: () => void;
}

export function ReviewDetailsTile({
  iconUrl,
  heading,
  content,
  rightText,
  actionText,
  onAction,
}: ReviewDetailsTileProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {iconUrl ? (
          <Image
            source={{ uri: iconUrl }}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : (
          <SvgIcon name="businessImg" size={40} />
        )}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.content} numberOfLines={1}>
          {content}
        </Text>
      </View>
      {rightText && (
        <Text style={styles.rightText}>{rightText}</Text>
      )}
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.grey50,
    padding: Spacing.large,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.grey200,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.grey200,
    overflow: 'hidden',
    marginRight: Spacing.medium,
  },
  icon: {
    width: 40,
    height: 40,
  },
  textContainer: {
    flex: 1,
  },
  heading: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.grey500,
  },
  content: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginTop: 2,
  },
  rightText: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginLeft: Spacing.small,
  },
  actionText: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '700',
    color: '#E42646',
    textDecorationLine: 'underline',
    marginLeft: Spacing.small,
  },
});

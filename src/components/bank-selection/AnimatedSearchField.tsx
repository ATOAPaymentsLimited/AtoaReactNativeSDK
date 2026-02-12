import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { SvgIcon } from '../shared/SvgIcon';

interface AnimatedSearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
}

const PLACEHOLDER_TEXTS = ['Personal Banks', 'Business Banks'];

export function AnimatedSearchField({
  value,
  onChangeText,
}: AnimatedSearchFieldProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value.length > 0) {
      return;
    }
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [value, fadeAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.searchIconContainer}>
        <SvgIcon name="search" size={16} color={Colors.black} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder=""
          placeholderTextColor={Colors.grey500}
          cursorColor={Colors.black}
        />
        {value.length === 0 && (
          <Animated.View
            style={[styles.placeholderContainer, { opacity: fadeAnim }]}
            pointerEvents="none"
          >
            <Animated.Text style={styles.placeholderText}>
              {PLACEHOLDER_TEXTS[placeholderIndex]}
            </Animated.Text>
          </Animated.View>
        )}
      </View>
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clearButton}
        >
          <SvgIcon name="close" size={18} color={Colors.black} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.grey200,
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.small + Spacing.tiny,
    marginHorizontal: Spacing.large,
  },
  searchIconContainer: {
    marginRight: Spacing.small,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    padding: 0,
    height: 20,
  },
  placeholderContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  placeholderText: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.grey500,
  },
  clearButton: {
    marginLeft: Spacing.small,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

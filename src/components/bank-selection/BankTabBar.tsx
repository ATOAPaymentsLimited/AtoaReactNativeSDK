import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface BankTabBarProps {
  selectedIndex: number;
  onTabChange: (index: number) => void;
}

export const BankTabBar = React.memo(function BankTabBar({ selectedIndex, onTabChange }: BankTabBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, selectedIndex === 0 && styles.tabSelected]}
        onPress={() => onTabChange(0)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            selectedIndex === 0 && styles.tabTextSelected,
          ]}
        >
          Personal Banks
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, selectedIndex === 1 && styles.tabSelected]}
        onPress={() => onTabChange(1)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            selectedIndex === 1 && styles.tabTextSelected,
          ]}
        >
          Business Banks
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.grey50,
    borderRadius: 12,
    height: 44,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabSelected: {
    backgroundColor: Colors.white,
    shadowColor: '#778994',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 3,
  },
  tabText: {
    fontFamily: 'Figtree',
    fontSize: 13,
    fontWeight: '500',
    color: Colors.grey600,
  },
  tabTextSelected: {
    fontWeight: '700',
    color: Colors.black,
  },
});

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LogBox } from 'react-native';
import { useConnectivityContext } from '../../hooks/ConnectivityContext';
import type { ReconnectionCallback } from '../../hooks/useConnectivity';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { SvgIcon } from './SvgIcon';
import { FONT_FAMILY } from '../../constants/typography';

interface ConnectivityWrapperProps {
  children: React.ReactNode;
  showBackIcon?: boolean;
  height?: number;
  onBack?: () => void;
  onReloadCallbacks?: ReconnectionCallback[];
}

export function ConnectivityWrapper({
  children,
  showBackIcon = true,
  height,
  onBack,
  onReloadCallbacks = [],
}: ConnectivityWrapperProps) {
  const {
    isDisconnected,
    addReconnectionCallback,
    removeReconnectionCallback,
  } = useConnectivityContext();

  // Hide LogBox warnings bar when showing no-connectivity UI
  useEffect(() => {
    if (isDisconnected) {
      LogBox.ignoreAllLogs(true);
    }
    return () => {
      LogBox.ignoreAllLogs(false);
    };
  }, [isDisconnected]);

  // Register/unregister reconnection callbacks on mount/unmount
  useEffect(() => {
    for (const cb of onReloadCallbacks) {
      addReconnectionCallback(cb);
    }
    return () => {
      for (const cb of onReloadCallbacks) {
        removeReconnectionCallback(cb);
      }
    };
  }, [onReloadCallbacks, addReconnectionCallback, removeReconnectionCallback]);

  return (
    <View style={styles.container}>
      {children}
      {isDisconnected && (
        <>
          <View style={[styles.overlay, height ? { height } : undefined]} />
          <View style={[styles.overlayContent, height ? { height } : undefined]}>
            {showBackIcon && onBack && (
              <View style={styles.backButtonContainer}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={onBack}
                  activeOpacity={0.7}
                >
                  <SvgIcon
                    name="back"
                    size={Spacing.large}
                    color={Colors.black}
                  />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.centeredContent}>
              <SvgIcon
                name="wifiOff"
                size={Spacing.xtraLarge * 2 + Spacing.tiny}
                color={Colors.grey500}
              />
              <View style={styles.spacer} />
              <Text style={styles.title}>{Strings.connectivity.title}</Text>
              <View style={styles.spacer} />
              <Text style={styles.message}>
                {Strings.connectivity.message}
              </Text>
              <View style={styles.spacer} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    padding: Spacing.medium,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  backButton: {
    width: Spacing.large * 2,
    height: Spacing.large * 2,
    borderRadius: Spacing.large,
    backgroundColor: Colors.grey50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: Spacing.huge,
  },
  title: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    textAlign: 'center',
  },
  message: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.black,
    textAlign: 'center',
  },
});

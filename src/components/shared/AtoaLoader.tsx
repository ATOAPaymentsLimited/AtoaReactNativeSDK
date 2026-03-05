import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
  Rect,
} from 'react-native-svg';
import { SvgIcon } from './SvgIcon';
import {
  ATOA_LOGO_PATH,
  LOGO_VB_WIDTH,
  LOGO_VB_HEIGHT,
  SHIMMER_BAND_WIDTH,
} from '../../constants/component-constants';

interface AtoaLoaderProps {
  size?: number;
}

export function AtoaLoader({ size = 48 }: AtoaLoaderProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <SvgIcon name="spinner" size={size} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// --- SDKLoader: Atoa logo with shimmer effect ---

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface SDKLoaderProps {
  width?: number;
  baseColor?: string;
}

export function SDKLoader({
  width = 72,
  baseColor = '#E42646',
}: SDKLoaderProps) {
  const height = (width * LOGO_VB_HEIGHT) / LOGO_VB_WIDTH;
  const shimmerX = useRef(new Animated.Value(-SHIMMER_BAND_WIDTH)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: LOGO_VB_WIDTH,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerX]);

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${LOGO_VB_WIDTH} ${LOGO_VB_HEIGHT}`}
    >
      <Defs>
        <ClipPath id="logoClip">
          <Path fillRule="evenodd" clipRule="evenodd" d={ATOA_LOGO_PATH} />
        </ClipPath>
        <LinearGradient
          id="shimmerGrad"
          x1="0"
          y1="0"
          x2="1"
          y2="0"
          gradientUnits="objectBoundingBox"
        >
          <Stop offset="0" stopColor="white" stopOpacity={0} />
          <Stop offset="0.5" stopColor="white" stopOpacity={0.5} />
          <Stop offset="1" stopColor="white" stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect
        x="0"
        y="0"
        width={LOGO_VB_WIDTH}
        height={LOGO_VB_HEIGHT}
        fill={baseColor}
        clipPath="url(#logoClip)"
      />
      <AnimatedRect
        x={shimmerX}
        y="0"
        width={SHIMMER_BAND_WIDTH}
        height={LOGO_VB_HEIGHT}
        fill="url(#shimmerGrad)"
        clipPath="url(#logoClip)"
      />
    </Svg>
  );
}

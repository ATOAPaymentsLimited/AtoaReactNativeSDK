import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

const DOT_COUNT = 5;
const DOT_SIZE = 4;
const DOT_GAP = 4;
const BOUNCE_HEIGHT = 8;
const ANIMATION_DURATION = 300;
const STAGGER_DELAY = 100;

export function DotLoadingAnimation() {
  const anims = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * STAGGER_DELAY),
          Animated.timing(anim, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.delay(
            (DOT_COUNT - 1 - i) * STAGGER_DELAY + ANIMATION_DURATION
          ),
        ])
      )
    );

    Animated.parallel(animations).start();

    return () => {
      animations.forEach((a) => a.stop());
    };
  }, [anims]);

  return (
    <View style={styles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -BOUNCE_HEIGHT],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DOT_GAP,
    paddingHorizontal: 12,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.grey400,
  },
});

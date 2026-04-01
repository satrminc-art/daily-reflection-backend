import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  scaleFrom?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedReveal({
  children,
  delay = 0,
  duration = 440,
  distance = 16,
  scaleFrom = 0.988,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: duration + 90,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [delay, distance, duration, opacity, scale, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

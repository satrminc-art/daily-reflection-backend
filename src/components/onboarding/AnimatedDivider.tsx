import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, ViewStyle } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { palette } from "@/utils/theme";

interface Props {
  delay?: number;
  width?: number;
  style?: ViewStyle;
}

export function AnimatedDivider({ delay = 0, width = 58, style }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const scaleX = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(scaleX, {
        toValue: 1,
        duration: 420,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.7,
        duration: 280,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [delay, opacity, scaleX]);

  return (
    <Animated.View
      style={[
        styles.rule,
        style,
        {
          width,
          backgroundColor: colors.accent,
          opacity,
          transform: [{ scaleX }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  rule: {
    height: 2,
    borderRadius: 999,
    alignSelf: "center",
  },
});

import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";

interface Props {
  lines: string[];
  textStyle: StyleProp<TextStyle>;
  lineHeight: number;
  align?: "center" | "left";
  startDelay?: number;
  stagger?: number;
  duration?: number;
}

export function StaggeredRevealText({
  lines,
  textStyle,
  lineHeight,
  align = "center",
  startDelay = 0,
  stagger = 160,
  duration = 620,
}: Props) {
  return (
    <View style={styles.wrap}>
      {lines.map((line, index) => (
        <RevealLine
          key={`${line}-${index}`}
          line={line}
          textStyle={textStyle}
          lineHeight={lineHeight}
          align={align}
          delay={startDelay + index * stagger}
          duration={duration}
        />
      ))}
    </View>
  );
}

function RevealLine({
  line,
  textStyle,
  lineHeight,
  align,
  delay,
  duration,
}: {
  line: string;
  textStyle: StyleProp<TextStyle>;
  lineHeight: number;
  align: "center" | "left";
  delay: number;
  duration: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

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
        duration: duration + 60,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [delay, duration, opacity, translateY]);

  return (
    <View style={[styles.lineMask, { height: lineHeight + 6, alignItems: align === "center" ? "center" : "flex-start" }]}>
      <Animated.View style={{ opacity, transform: [{ translateY }] }}>
        <Text style={[textStyle, { textAlign: align }]}>{line}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  lineMask: {
    overflow: "hidden",
    width: "100%",
  },
});

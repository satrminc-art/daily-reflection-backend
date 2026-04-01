import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  label: string;
  supportingText?: string;
  selected: boolean;
  onPress: () => void;
  labelDirection?: "ltr" | "rtl";
  compact?: boolean;
}

export function OnboardingOptionCard({
  label,
  supportingText,
  selected,
  onPress,
  labelDirection = "ltr",
  compact = false,
}: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const selectedTextColor = colorScheme === "dark" ? colors.primaryText : "#1C1712";
  const selectedScale = useRef(new Animated.Value(selected ? 1.012 : 1)).current;
  const selectedGlow = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const checkOpacity = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(selectedScale, {
        toValue: selected ? 1.012 : 1,
        duration: 380,
        easing: undefined,
        useNativeDriver: true,
      }),
      Animated.timing(selectedGlow, {
        toValue: selected ? 1 : 0,
        duration: 420,
        easing: undefined,
        useNativeDriver: true,
      }),
      Animated.timing(checkOpacity, {
        toValue: selected ? 1 : 0,
        duration: 360,
        easing: undefined,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checkOpacity, selected, selectedGlow, selectedScale]);

  const indicatorScale = selectedGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.72, 1],
  });
  const overlayOpacity = selectedGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.38],
  });

  return (
    <Animated.View style={{ transform: [{ scale: selectedScale }] }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={({ pressed }) => [
          styles.card,
          compact && styles.cardCompact,
          {
            backgroundColor: selected ? colors.card : colors.surface,
            borderColor: selected ? colors.borderStrong : colors.border,
            borderWidth: selected ? 1.5 : 1,
            shadowColor: selected ? colors.shadowStrong : colors.shadow,
          },
          pressed && styles.pressed,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selectedOverlay,
            {
              backgroundColor: colors.paperTint,
              opacity: overlayOpacity,
            },
          ]}
        />
        <View style={styles.copy}>
          <Text
            style={[
              styles.label,
              compact && styles.labelCompact,
              {
                color: selected ? selectedTextColor : colors.primaryText,
                fontFamily: typography.display,
                writingDirection: labelDirection,
                textAlign: labelDirection === "rtl" ? "right" : "left",
              },
            ]}
          >
            {label}
          </Text>
          {supportingText ? (
            <Text
              style={[
                styles.supportingText,
                compact && styles.supportingTextCompact,
                { color: selected ? colors.primaryText : colors.secondaryText },
              ]}
            >
              {supportingText}
            </Text>
          ) : null}
        </View>
        <Animated.View
          style={[
            styles.indicator,
            {
              borderColor: selected ? colors.borderStrong : colors.borderStrong,
              backgroundColor: selected ? colors.accent : "transparent",
              transform: [{ scale: indicatorScale }],
              opacity: selected ? 1 : 0.82,
            },
          ]}
        >
          <Animated.Text style={[styles.checkmark, { color: colors.background, opacity: checkOpacity }]}>✓</Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
    minHeight: 76,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 1,
    overflow: "hidden",
  },
  cardCompact: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 22,
  },
  pressed: {
    transform: [{ scale: 0.992 }, { translateY: 1 }],
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  label: {
    fontSize: 19,
    lineHeight: 26,
  },
  labelCompact: {
    fontSize: 17,
    lineHeight: 23,
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  supportingTextCompact: {
    fontSize: 13,
    lineHeight: 17,
  },
  indicator: {
    width: 19,
    height: 19,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  checkmark: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 10,
  },
});

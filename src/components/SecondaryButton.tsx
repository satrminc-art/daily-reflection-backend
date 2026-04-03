import React from "react";
import { Platform, Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "text" | "soft";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function SecondaryButton({
  label,
  onPress,
  variant = "text",
  disabled = false,
  style,
  labelStyle,
}: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  const isSoft = variant === "soft";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      android_ripple={
        Platform.OS === "android"
          ? {
              color: colors.accentSoft,
              borderless: false,
            }
          : undefined
      }
      style={({ pressed }) => [
        styles.base,
        isSoft
          ? {
              minHeight: 56,
              borderRadius: 20,
              borderWidth: 1,
              paddingHorizontal: 20,
              backgroundColor: colors.paperTint,
              borderColor: colors.border,
            }
          : styles.textButton,
        style,
        disabled && styles.disabled,
        pressed && !disabled && (isSoft ? styles.softPressed : styles.textPressed),
      ]}
    >
      <Text
        style={[
          styles.label,
          isSoft
            ? { color: colors.primaryText, fontFamily: typography.action }
            : { color: colors.secondaryText, fontFamily: typography.action },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  textButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.18,
    fontWeight: "700",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.42,
  },
  textPressed: {
    opacity: 0.7,
    transform: [{ translateY: 1 }],
  },
  softPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.986 }, { translateY: 1 }],
  },
});

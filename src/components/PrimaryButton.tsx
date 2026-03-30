import React from "react";
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, variant = "primary", disabled = false, style }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  const variantStyle =
    variant === "primary"
      ? { backgroundColor: colors.accent, borderColor: colors.borderStrong, shadowColor: colors.shadowStrong }
      : variant === "secondary"
        ? { backgroundColor: colors.elevatedSurface, borderColor: colors.borderStrong }
        : { backgroundColor: "transparent", borderColor: "transparent" };

  const textColor =
    variant === "primary" ? colors.background : variant === "secondary" ? colors.primaryText : colors.secondaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={
        Platform.OS === "android"
          ? {
              color: colors.accentSoft,
              borderless: false,
            }
          : undefined
      }
      hitSlop={4}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        style,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: textColor, fontFamily: typography.action }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});

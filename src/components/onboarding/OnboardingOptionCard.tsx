import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        {
          backgroundColor: selected ? colors.paperTint : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          shadowColor: selected ? colors.shadowStrong : colors.shadow,
        },
        pressed && styles.pressed,
      ]}
    >
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
      <View
        style={[
          styles.indicator,
          {
            borderColor: selected ? colors.accent : colors.borderStrong,
            backgroundColor: selected ? colors.accent : "transparent",
          },
        ]}
      >
        {selected ? <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    minHeight: 70,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 1,
  },
  cardCompact: {
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  label: {
    fontSize: 20,
    lineHeight: 27,
  },
  labelCompact: {
    fontSize: 17,
    lineHeight: 23,
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 19,
  },
  supportingTextCompact: {
    fontSize: 13,
    lineHeight: 17,
  },
  indicator: {
    width: 15,
    height: 15,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  checkmark: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 10,
  },
});

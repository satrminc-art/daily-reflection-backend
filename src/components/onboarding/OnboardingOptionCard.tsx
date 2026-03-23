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
}

export function OnboardingOptionCard({ label, supportingText, selected, onPress }: Props) {
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
        {
          backgroundColor: selected ? colors.paperTint : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          shadowColor: selected ? colors.shadowStrong : colors.shadow,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.copy}>
        <Text style={[styles.label, { color: selected ? selectedTextColor : colors.primaryText, fontFamily: typography.display }]}>
          {label}
        </Text>
        {supportingText ? (
          <Text style={[styles.supportingText, { color: selected ? colors.primaryText : colors.secondaryText }]}>
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
    paddingVertical: 18,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 21,
    lineHeight: 28,
  },
  supportingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 10,
  },
});

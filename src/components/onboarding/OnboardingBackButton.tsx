import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  label?: string;
  onPress: () => void;
}

export function OnboardingBackButton({ label = "Back", onPress }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const { t } = useAppStrings();
  const resolvedLabel = label === "Back" ? t("common.back") : label;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={resolvedLabel}
        hitSlop={8}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.elevatedSurface,
            borderColor: colors.border,
          },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.arrow, { color: colors.secondaryText, fontFamily: typography.action }]}>‹</Text>
        <Text style={[styles.label, { color: colors.secondaryText, fontFamily: typography.body }]}>{resolvedLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingLeft: 4,
  },
  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  arrow: {
    fontSize: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
});

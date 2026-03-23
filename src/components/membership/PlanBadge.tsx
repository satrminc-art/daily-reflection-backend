import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  label: string;
  subtle?: boolean;
}

export function PlanBadge({ label, subtle = false }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: subtle ? colors.card : colors.paperTint,
          borderColor: subtle ? colors.border : colors.accentSoft,
        },
      ]}
    >
      <Text style={[styles.label, { color: subtle ? colors.secondaryText : colors.accent, fontFamily: typography.meta }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
});

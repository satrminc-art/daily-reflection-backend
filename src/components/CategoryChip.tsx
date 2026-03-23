import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { ReflectionCategory } from "@/types/reflection";
import { palette } from "@/utils/theme";

interface Props {
  category: ReflectionCategory;
  selected: boolean;
  onPress: () => void;
}

export function CategoryChip({ category, selected, onPress }: Props) {
  const { colorScheme } = useAppContext();
  const { categoryLabel } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primaryText : colors.surface,
          borderColor: selected ? colors.primaryText : colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: selected ? colors.background : colors.primaryText, fontFamily: typography.meta }]}>
        {categoryLabel(category)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

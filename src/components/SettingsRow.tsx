import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

export function SettingsRow({ label, value, onPress, danger = false }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  const content = (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: danger ? colors.danger : colors.primaryText, fontFamily: typography.body }]}>{label}</Text>
      {value ? <Text style={[styles.value, { color: colors.secondaryText, fontFamily: typography.meta }]}>{value}</Text> : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 66,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    lineHeight: 25,
    minWidth: 0,
  },
  value: {
    fontSize: 14,
    lineHeight: 22,
    flexShrink: 1,
    minWidth: 0,
    textAlign: "right",
  },
});

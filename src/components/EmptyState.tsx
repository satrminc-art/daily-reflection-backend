import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View style={[styles.container, { backgroundColor: colors.elevatedSurface, borderColor: colors.borderStrong }]}>
      <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 10,
    width: "100%",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
});

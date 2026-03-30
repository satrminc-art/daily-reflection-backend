import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function EditorialHeader({ eyebrow, title, subtitle }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={[styles.eyebrow, { color: colors.accent }]}>{eyebrow}</Text> : null}
      {title ? <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{title}</Text> : null}
      {subtitle ? <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    width: "100%",
  },
});

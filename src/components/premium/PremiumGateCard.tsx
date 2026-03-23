import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  message: string;
  actionLabel: string;
  onPress: () => void;
}

export function PremiumGateCard({ title, message, actionLabel, onPress }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>
      <PrimaryButton label={actionLabel} onPress={onPress} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 10,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600",
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    marginTop: 6,
  },
});

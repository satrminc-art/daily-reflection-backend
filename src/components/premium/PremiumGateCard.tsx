import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
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
  const { premiumLabel } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const isLightMode = colorScheme === "light";
  const cardColor = isLightMode ? "#EFE9E1" : colors.elevatedSurface;
  const borderColor = isLightMode ? "rgba(120, 90, 60, 0.15)" : colors.borderStrong;
  const titleColor = colors.primaryText;
  const messageColor = colors.secondaryText;
  const badgeColor = isLightMode ? "#A07C5B" : colors.accent;
  const badgeSurface = isLightMode ? "rgba(160, 124, 91, 0.1)" : "rgba(196, 163, 122, 0.12)";

  return (
    <View style={[styles.card, { backgroundColor: cardColor, borderColor, shadowColor: colors.shadow }]}>
      <View style={[styles.badge, { backgroundColor: badgeSurface }]}>
        <Text style={[styles.badgeLabel, { color: badgeColor, fontFamily: typography.meta }]}>{premiumLabel()}</Text>
      </View>
      <Text style={[styles.title, { color: titleColor, fontFamily: typography.display }]}>{title}</Text>
      <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
      <PrimaryButton label={actionLabel} onPress={onPress} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    width: "100%",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 1,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeLabel: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  message: {
    fontSize: 14,
    lineHeight: 23,
  },
  button: {
    marginTop: 6,
  },
});

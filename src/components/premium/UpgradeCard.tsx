import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  body: string;
  actionLabel: string;
  onPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export function UpgradeCard({
  title,
  body,
  actionLabel,
  onPress,
  secondaryLabel,
  onSecondaryPress,
}: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.elevatedSurface,
          borderColor: colors.borderStrong,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={[styles.rule, { backgroundColor: colors.accent }]} />
      <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>
        {title}
      </Text>
      <Text style={[styles.body, { color: colors.secondaryText, fontFamily: typography.body }]}>
        {body}
      </Text>
      <View style={styles.actions}>
        <PrimaryButton label={actionLabel} onPress={onPress} />
        {secondaryLabel && onSecondaryPress ? (
          <PrimaryButton label={secondaryLabel} onPress={onSecondaryPress} variant="ghost" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 1,
  },
  rule: {
    width: 48,
    height: 2,
    borderRadius: 999,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
});

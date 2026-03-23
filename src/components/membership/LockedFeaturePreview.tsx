import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PlanBadge } from "@/components/membership/PlanBadge";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  body: string;
}

export function LockedFeaturePreview({ title, body }: Props) {
  const { colorScheme } = useAppContext();
  const { t } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{title}</Text>
        <PlanBadge label="Premium" subtle />
      </View>
      <Text style={[styles.body, { color: colors.secondaryText }]}>{body}</Text>
      <Text style={[styles.note, { color: colors.tertiaryText }]}>{t("membership.lockedFeatureFootnote")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 17,
    lineHeight: 23,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
  },
});

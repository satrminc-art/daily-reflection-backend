import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  MembershipFeatureCategoryId,
  MembershipFeatureDefinition,
} from "@/constants/premiumFeatures";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  category: MembershipFeatureCategoryId;
  features: MembershipFeatureDefinition[];
}

export function PremiumFeatureList({ category, features }: Props) {
  const { colorScheme } = useAppContext();
  const { membershipFeatureCategoryLabel, membershipFeatureLabel, t } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View style={styles.group}>
      <Text style={[styles.heading, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
        {membershipFeatureCategoryLabel(category)}
      </Text>
      {features.map((feature) => (
        <View key={feature.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: colors.accentSoft, borderColor: colors.border }]} />
          <View style={styles.copyWrap}>
            <Text style={[styles.label, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {membershipFeatureLabel(feature.id)}
            </Text>
            <Text style={[styles.status, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
              {feature.live ? t("membership.liveNow") : t("membership.preparedNext")}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 10,
  },
  heading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  copyWrap: {
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    lineHeight: 21,
  },
  status: {
    fontSize: 11,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
});

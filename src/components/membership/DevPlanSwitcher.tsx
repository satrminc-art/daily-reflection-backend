import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMembership } from "@/hooks/useMembership";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

const PLANS = [
  { label: "Freemium", value: "freemium" as const },
  { label: "Premium", value: "premium" as const },
  { label: "Lifelong", value: "lifelong" as const },
];

export function DevPlanSwitcher() {
  const { colorScheme } = useAppContext();
  const { t } = useAppStrings();
  const membership = useMembership();
  const colors = palette[colorScheme];
  const typography = useTypography();

  if (!membership.devOverrideEnabled) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.body, { color: colors.secondaryText, fontFamily: typography.body }]}>{t("membership.devBody")}</Text>
      {PLANS.map((plan) => {
        const active = membership.membershipTier === plan.value && membership.isUsingDevOverride;
        return (
          <Pressable
            key={plan.value}
            onPress={() => membership.setDevMembershipTier(plan.value)}
            style={[
              styles.row,
              {
                backgroundColor: active ? colors.paperTint : colors.card,
                borderColor: active ? colors.accent : colors.border,
              },
            ]}
          >
            <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.body }]}>{plan.label}</Text>
            {active ? <Text style={[styles.active, { color: colors.accent, fontFamily: typography.meta }]}>{t("settings.current")}</Text> : null}
          </Pressable>
        );
      })}
      <Pressable
        onPress={() => membership.setDevMembershipTier(null)}
        style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.title, { color: colors.secondaryText, fontFamily: typography.body }]}>{t("membership.devReset")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  active: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
});

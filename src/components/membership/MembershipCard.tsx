import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PlanBadge } from "@/components/membership/PlanBadge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  plan: "Freemium" | "Premium" | "Lifelong";
  summary: string;
  note?: string;
  priceText?: string;
  planBadge?: string;
  active?: boolean;
  activeLabel?: string;
  onPress?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
  actionDisabled?: boolean;
}

export function MembershipCard({
  plan,
  summary,
  note,
  priceText,
  planBadge,
  active = false,
  activeLabel,
  onPress,
  actionLabel,
  onActionPress,
  actionDisabled = false,
}: Props) {
  const { colorScheme } = useAppContext();
  const { planLabel } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const isPremiumTier = plan === "Premium" || plan === "Lifelong";
  const isLifelong = plan === "Lifelong";

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: active ? (isLifelong ? colors.paperTint : colors.surface) : colors.card,
          borderColor: active ? colors.borderStrong : isPremiumTier ? colors.borderStrong : colors.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{planLabel(plan)}</Text>
          {planBadge ? <PlanBadge label={planBadge} subtle /> : null}
        </View>
        {active && activeLabel ? <PlanBadge label={activeLabel} /> : null}
      </View>
      <Text style={[styles.summary, { color: colors.secondaryText }]}>{summary}</Text>
      {note ? <Text style={[styles.note, { color: colors.tertiaryText }]}>{note}</Text> : null}
      {priceText ? <Text style={[styles.price, { color: colors.primaryText }]}>{priceText}</Text> : null}
      {actionLabel && onActionPress ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onActionPress}
          disabled={actionDisabled}
          variant="secondary"
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
  },
  topRow: {
    flexDirection: "column",
    justifyContent: "flex-start",
    gap: 12,
    alignItems: "flex-start",
  },
  titleWrap: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
  },
  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "600",
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontSize: 12,
    lineHeight: 17,
  },
  price: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  actionButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    minHeight: 46,
    paddingHorizontal: 18,
  },
});

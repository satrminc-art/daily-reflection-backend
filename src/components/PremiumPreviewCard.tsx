import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  description: string;
  badge?: string;
  currentLabel?: string;
  locked?: boolean;
  specimen?: string;
  swatch?: string;
  mood?: string;
  current?: boolean;
  onPress?: () => void;
  radioSelected?: boolean;
  preview?: React.ReactNode;
  showSelectionIndicator?: boolean;
}

export function PremiumPreviewCard({
  title,
  description,
  badge,
  currentLabel,
  locked = false,
  specimen,
  swatch,
  mood,
  current = false,
  onPress,
  radioSelected = false,
  preview,
  showSelectionIndicator = true,
}: Props) {
  const { colorScheme } = useAppContext();
  const { currentLabel: currentLabelText, premiumLabel } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const isLightMode = colorScheme === "light";
  const cardColor = isLightMode ? (current ? "#F2ECE4" : "#EFE9E1") : colors.card;
  const borderColor = isLightMode
    ? current
      ? "#A07C5B"
      : "rgba(120, 90, 60, 0.15)"
    : current
      ? colors.borderStrong
      : colors.border;
  const titleColor = colors.primaryText;
  const secondaryColor = colors.secondaryText;
  const mutedColor = colors.tertiaryText;
  const accentColor = isLightMode ? "#A07C5B" : colors.accent;
  const badgeColor = current ? accentColor : locked ? accentColor : mutedColor;
  const resolvedBadge = badge ?? premiumLabel();
  const resolvedCurrentLabel = currentLabel ?? currentLabelText();
  const showPremiumUpsellBadge = locked || current || resolvedBadge !== premiumLabel();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor,
          shadowColor: colors.shadow,
          opacity: locked ? 0.72 : 1,
        },
        onPress && pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          {swatch ? <View style={[styles.swatch, { backgroundColor: swatch, borderColor: colors.border }]} /> : null}
          <View style={styles.titleCopy}>
            <Text style={[styles.title, { color: titleColor, fontFamily: typography.display }]}>{title}</Text>
            {resolvedBadge && showPremiumUpsellBadge ? (
              <Text style={[styles.inlineBadge, { color: badgeColor, borderColor: current ? accentColor : borderColor }]}>
                {current ? resolvedCurrentLabel : locked ? premiumLabel() : resolvedBadge}
              </Text>
            ) : null}
          </View>
        </View>
        {showSelectionIndicator ? (
          <View style={styles.statusWrap}>
            <View
              style={[
                styles.radioOuter,
                {
                  borderColor: radioSelected ? accentColor : borderColor,
                  backgroundColor: radioSelected ? colors.accentSoft : "transparent",
                },
              ]}
            >
              {radioSelected ? <View style={[styles.radioInner, { backgroundColor: accentColor }]} /> : null}
            </View>
          </View>
        ) : null}
      </View>
      {preview ? <View style={styles.previewWrap}>{preview}</View> : null}
      {specimen ? <Text style={[styles.specimen, { color: titleColor, fontFamily: typography.specimen }]}>{specimen}</Text> : null}
      {mood ? <Text style={[styles.mood, { color: secondaryColor }]}>{mood}</Text> : null}
      <Text style={[styles.description, { color: secondaryColor }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    gap: 14,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 12,
  },
  titleWrap: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
  },
  titleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 10,
  },
  previewWrap: {
    marginTop: 2,
    marginBottom: 2,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: 0.15,
  },
  inlineBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  statusWrap: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    gap: 4,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  specimen: {
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: -0.25,
  },
  mood: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },
});

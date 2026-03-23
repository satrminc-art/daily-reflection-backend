import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
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
}

export function PremiumPreviewCard({
  title,
  description,
  badge = "Premium",
  currentLabel = "Current",
  locked = false,
  specimen,
  swatch,
  mood,
  current = false,
  onPress,
  radioSelected = false,
  preview,
}: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: current ? colors.borderStrong : colors.border,
          opacity: locked ? 0.72 : 1,
        },
        onPress && pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          {swatch ? <View style={[styles.swatch, { backgroundColor: swatch, borderColor: colors.border }]} /> : null}
          <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{title}</Text>
        </View>
        <View style={styles.statusWrap}>
          <Text style={[styles.badge, { color: current ? colors.accent : colors.tertiaryText }]}>
            {current ? currentLabel : locked ? "Premium" : badge}
          </Text>
          <View
            style={[
              styles.radioOuter,
              {
                borderColor: radioSelected ? colors.accent : colors.borderStrong,
                backgroundColor: radioSelected ? colors.accentSoft : "transparent",
              },
            ]}
          >
            {radioSelected ? <View style={[styles.radioInner, { backgroundColor: colors.accent }]} /> : null}
          </View>
        </View>
      </View>
      {preview}
      {specimen ? <Text style={[styles.specimen, { color: colors.primaryText, fontFamily: typography.specimen }]}>{specimen}</Text> : null}
      {mood ? <Text style={[styles.mood, { color: colors.secondaryText }]}>{mood}</Text> : null}
      <Text style={[styles.description, { color: colors.secondaryText }]}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  cardPressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  statusWrap: {
    alignItems: "flex-end",
    gap: 8,
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
    lineHeight: 20,
  },
});

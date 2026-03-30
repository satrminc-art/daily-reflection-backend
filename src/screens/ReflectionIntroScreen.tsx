import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

type ReflectionIntroScreenProps = {
  onStart?: () => void;
};

export function ReflectionIntroScreen({ onStart }: ReflectionIntroScreenProps) {
  const { colorScheme } = useAppContext();
  const typography = useTypography();
  const colors = palette[colorScheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]}>
      <View style={styles.screen}>
        <View style={styles.centeredContent}>
          <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>
            This moment is yours.
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText, fontFamily: typography.body }]}>
            Not everything you feel should fade.{"\n"}Some thoughts deserve a place to stay.
          </Text>

          <View
            style={[
              styles.quoteCard,
              {
                backgroundColor: colorScheme === "dark" ? colors.elevatedSurface : "#F7F7F5",
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.cardRule, { backgroundColor: colorScheme === "dark" ? colors.accent : "#AE8F72" }]} />
            <Text style={[styles.cardText, { color: colors.primaryText, fontFamily: typography.display }]}>
              What matters to you{"\n"}shouldn’t be lost in time.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="Start my space" onPress={onStart ?? (() => {})} style={styles.primaryButton} />
          <Pressable onPress={onStart ?? (() => {})} hitSlop={8} style={styles.secondaryTapArea}>
            <Text style={[styles.secondaryHint, { color: colors.tertiaryText, fontFamily: typography.body }]}>
              Begin quietly
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
    marginBottom: 14,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 320,
    marginBottom: 34,
  },
  quoteCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
  },
  cardRule: {
    width: 44,
    height: 2,
    borderRadius: 999,
    marginBottom: 20,
    opacity: 0.78,
  },
  cardText: {
    textAlign: "center",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
  },
  footer: {
    gap: 12,
  },
  primaryButton: {
    alignSelf: "stretch",
  },
  secondaryTapArea: {
    alignSelf: "center",
    paddingVertical: 8,
  },
  secondaryHint: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
});

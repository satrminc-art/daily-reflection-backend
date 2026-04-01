import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AnimatedReveal } from "@/components/onboarding/AnimatedReveal";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { RootStackParamList } from "@/navigation/types";
import { getReflectionEntryById, resolveReflectionTexts } from "@/services/reflectionService";
import { getDisplayDatePartsForAppLanguage, getTodayKey } from "@/utils/date";
import { getEffectiveReflectionLanguages } from "@/utils/reflection";
import { palette } from "@/utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "ReflectionPreview">;

export function ReflectionPreviewScreen({ navigation }: Props) {
  const {
    appState,
    colorScheme,
    markDailyReflectionPreviewSeen,
    markInitialPremiumOfferSeen,
    todaysReflection,
    todayReady,
  } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const { locale, t } = useAppStrings();

  const effectiveReflectionLanguages = useMemo(
    () =>
      getEffectiveReflectionLanguages({
        appLanguage: appState.preferredLanguage,
        reflectionLanguageMode: appState.reflectionLanguageMode,
        reflectionLanguage: appState.reflectionLanguage,
        reflectionLanguages: appState.reflectionLanguages,
        subscriptionModel: appState.subscriptionModel,
      }),
    [
      appState.preferredLanguage,
      appState.reflectionLanguage,
      appState.reflectionLanguageMode,
      appState.reflectionLanguages,
      appState.subscriptionModel,
    ],
  );
  const reflectionEntry = todaysReflection ? getReflectionEntryById(todaysReflection.id) : null;
  const reflectionText = useMemo(() => {
    if (!todaysReflection || !reflectionEntry) {
      return null;
    }

    const options = resolveReflectionTexts(reflectionEntry, effectiveReflectionLanguages);
    return options[0]?.text ?? todaysReflection.text;
  }, [effectiveReflectionLanguages, reflectionEntry, todaysReflection]);
  const calendarParts = useMemo(
    () => getDisplayDatePartsForAppLanguage(todaysReflection?.date ?? getTodayKey(), locale),
    [locale, todaysReflection?.date],
  );
  const previewTags = useMemo(() => {
    if (!todaysReflection) {
      return null;
    }

    const formatTag = (value: string) =>
      value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    return `${formatTag(todaysReflection.category)} ・ ${formatTag(todaysReflection.tone)}`;
  }, [todaysReflection]);

  async function handleContinue() {
    await markDailyReflectionPreviewSeen();
    navigation.replace("Membership");
  }

  async function handleOpenLater() {
    await markDailyReflectionPreviewSeen();
    await markInitialPremiumOfferSeen();
    navigation.reset({
      index: 0,
      routes: [{ name: "Today" }],
    });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <AnimatedReveal delay={40} distance={10}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>
              {t("preview.title")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("preview.subtitle")}
            </Text>
          </View>
        </AnimatedReveal>

        <AnimatedReveal delay={170} duration={420} distance={16}>
          <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
          <View style={styles.previewMeta}>
            <Text style={[styles.month, { color: colors.accent, fontFamily: typography.meta }]}>
              {calendarParts.monthDisplayLabel}
            </Text>
            <View style={[styles.dateBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.dateBadgeDay, { color: colors.primaryText, fontFamily: typography.display }]}>
                {calendarParts.dayNumber}
              </Text>
            </View>
          </View>

          <Text style={[styles.weekday, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
            {calendarParts.weekdayDisplayLabel}
          </Text>

          <View style={styles.reflectionWrap}>
            <Text style={[styles.reflectionText, { color: colors.primaryText, fontFamily: typography.display }]}>
              {todayReady && reflectionText ? reflectionText : t("preview.loading")}
            </Text>
          </View>

          {previewTags ? (
            <View style={styles.tagWrap}>
              <Text style={[styles.tags, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                {previewTags}
              </Text>
            </View>
          ) : null}
          </View>
        </AnimatedReveal>

        <AnimatedReveal delay={320} duration={380} distance={16}>
          <View style={styles.footer}>
          <PrimaryButton label={t("preview.primaryAction")} onPress={() => void handleContinue()} />
          <PrimaryButton label={t("preview.secondaryAction")} onPress={() => void handleOpenLater()} variant="ghost" />
          <Text style={[styles.bridgeText, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("preview.bridge")}
          </Text>
          </View>
        </AnimatedReveal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 10,
    paddingTop: 12,
  },
  title: {
    fontSize: 33,
    lineHeight: 40,
    textAlign: "center",
    maxWidth: 320,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    maxWidth: 312,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 26,
  },
  previewMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  month: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.9,
    fontWeight: "700",
  },
  dateBadge: {
    minWidth: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  dateBadgeDay: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "600",
  },
  weekday: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.6,
    textAlign: "center",
    marginBottom: 18,
  },
  reflectionWrap: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 22,
  },
  reflectionText: {
    width: "100%",
    flexShrink: 1,
    flexWrap: "wrap",
    fontSize: 35,
    lineHeight: 47,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  tagWrap: {
    alignItems: "center",
  },
  tags: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  footer: {
    gap: 10,
    marginTop: 8,
  },
  bridgeText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    paddingHorizontal: 14,
    paddingTop: 6,
  },
});

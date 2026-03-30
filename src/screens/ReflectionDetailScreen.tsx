import React, { useMemo } from "react";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Alert, StyleSheet, Text, View } from "react-native";
import { CalendarCard } from "@/components/CalendarCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ReflectionNoteCard } from "@/components/ReflectionNoteCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { RootStackParamList } from "@/navigation/types";
import { getReflectionEntryById, resolveReflectionTexts } from "@/services/reflectionService";
import { SupportedLanguage } from "@/types/reflection";
import { formatLongDate } from "@/utils/date";
import { canSaveAdditionalReflection } from "@/utils/membershipHelpers";
import { getEffectiveReflectionLanguages } from "@/utils/reflection";
import { palette } from "@/utils/theme";

type Props = {
  route: RouteProp<RootStackParamList, "ReflectionDetail">;
};

export function ReflectionDetailScreen({ route }: Props) {
  const {
    colorScheme,
    appState,
    favorites,
    getReflectionForDate,
    toggleFavorite,
    setReflectionCardLanguageSelection,
  } = useAppContext();
  const { locale, t, reflectionTitle } = useAppStrings();
  const membership = useMembership();
  const navigation = useNavigation<any>();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const reflection = getReflectionForDate(route.params.date);
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
  const reflectionEntry = reflection ? getReflectionEntryById(reflection.id) : null;
  const reflectionTextOptions = useMemo(
    () => (reflectionEntry ? resolveReflectionTexts(reflectionEntry, effectiveReflectionLanguages) : []),
    [effectiveReflectionLanguages, reflectionEntry],
  );
  const selectedReflectionLanguage =
    appState.quoteLanguageSelections[route.params.date] ??
    reflectionTextOptions[0]?.requestedLanguage ??
    effectiveReflectionLanguages[0] ??
    "en";
  const activeReflectionTextOption =
    reflectionTextOptions.find((option) => option.requestedLanguage === selectedReflectionLanguage) ?? reflectionTextOptions[0] ?? null;
  const reflectionCardTabs = reflectionTextOptions.map((option) => ({
    code: option.requestedLanguage,
    label: option.requestedLanguage.toUpperCase(),
  }));

  if (!reflection) {
    return (
      <ScreenContainer scroll>
        <Text style={{ color: colors.primaryText }}>{t("reflection.unavailable")}</Text>
      </ScreenContainer>
    );
  }

  async function handleToggleFavorite() {
    const canSave = canSaveAdditionalReflection(
      membership.effectiveEntitlement,
      favorites.length,
      reflection.isFavorite,
    );

    if (!canSave) {
      Alert.alert(t("today.saveLimitTitle"), t("today.saveLimitBody"));
      return;
    }

    await toggleFavorite(reflection.id, reflection.date);
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.headerBlock}>
        <Text style={[styles.date, { color: colors.secondaryText }]}>{formatLongDate(reflection.date, locale)}</Text>
        <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{reflectionTitle()}</Text>
      </View>
      <CalendarCard
        reflection={reflection}
        reflectionText={activeReflectionTextOption?.text ?? reflection.text}
        languageTabs={reflectionCardTabs}
        activeLanguageCode={activeReflectionTextOption?.requestedLanguage ?? selectedReflectionLanguage}
        onSelectLanguage={(language: SupportedLanguage) => {
          setReflectionCardLanguageSelection(reflection.date, language).catch((error) => {
            console.warn("Failed to update reflection detail language", error);
          });
        }}
      />
      <View style={styles.noteWrap}>
        <ReflectionNoteCard
          date={reflection.date}
          reflectionId={reflection.id}
          isSaved={reflection.isFavorite}
          reflectionText={activeReflectionTextOption?.text ?? reflection.text}
          reflectionLanguage={activeReflectionTextOption?.requestedLanguage ?? selectedReflectionLanguage}
        />
      </View>
      <PrimaryButton
        label={reflection.isFavorite ? t("favorites.removeAction") : t("favorites.keepAction")}
        onPress={() => {
          handleToggleFavorite().catch((error) => {
            console.warn("Failed to update kept reflection", error);
          });
        }}
        variant={reflection.isFavorite ? "secondary" : "primary"}
        style={styles.button}
      />
      {reflection.isFavorite ? (
        <PrimaryButton
          label={t("collections.addAction")}
          onPress={() => navigation.navigate("Collections", { reflectionId: reflection.id, date: reflection.date })}
          variant={membership.hasFeature("personal-collections") ? "ghost" : "secondary"}
          style={styles.secondaryButton}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: 18,
    gap: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "600",
  },
  button: {
    marginTop: 18,
  },
  secondaryButton: {
    marginTop: 10,
  },
  noteWrap: {
    marginTop: 18,
  },
});

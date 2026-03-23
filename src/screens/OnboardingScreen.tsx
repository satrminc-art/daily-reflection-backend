import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { OnboardingOptionCard } from "@/components/onboarding/OnboardingOptionCard";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { getLanguageScreenCopy, LANGUAGE_OPTIONS } from "@/localization/languages";
import { OnboardingPreference, SupportedLanguage } from "@/types/reflection";
import { palette } from "@/utils/theme";

type OnboardingStep =
  | "welcome"
  | "language"
  | "name"
  | "acknowledgement"
  | "preference"
  | "transition";

export function OnboardingScreen() {
  const { colorScheme, appState, completeOnboarding } = useAppContext();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [searchQuery, setSearchQuery] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage | null>(
    appState.preferredLanguage ?? "en",
  );
  const [userName, setUserName] = useState(appState.userName ?? "");
  const [userPreferences, setUserPreferences] = useState<OnboardingPreference[]>(appState.userPreferences);
  const opacity = useRef(new Animated.Value(1)).current;
  const hasAnimated = useRef(false);
  const { t, acknowledgementTitle, preferenceLabel } = useAppStrings(preferredLanguage);
  const languageScreenCopy = getLanguageScreenCopy(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
      return;
    }

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, step]);

  useEffect(() => {
    if (step !== "transition") {
      return;
    }

    const timeout = setTimeout(() => {
      completeOnboarding({
        preferredLanguage,
        userName: userName.trim() || null,
        userPreferences,
      }).catch((error) => {
        console.warn("Unable to complete onboarding", error);
        setStep("preference");
      });
    }, 520);

    return () => clearTimeout(timeout);
  }, [completeOnboarding, preferredLanguage, step, userName, userPreferences]);

  const filteredLanguages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return LANGUAGE_OPTIONS;
    }

    return LANGUAGE_OPTIONS.filter((language) =>
      [language.englishName, language.nativeName, language.code].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [searchQuery]);

  function togglePreference(preference: OnboardingPreference) {
    setUserPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : [...current, preference],
    );
  }

  function renderStep() {
    switch (step) {
      case "welcome":
        return (
          <OnboardingScaffold
            title={t("onboarding.welcomeTitle")}
            subtitle={t("onboarding.welcomeBody")}
            footer={<PrimaryButton label={t("common.continue")} onPress={() => setStep("language")} />}
          >
            <Text style={[styles.heroText, { color: colors.primaryText, fontFamily: typography.display }]}>
              {t("onboarding.welcomeHero")}
            </Text>
          </OnboardingScaffold>
        );
      case "language":
        return (
          <OnboardingScaffold
            title={languageScreenCopy.title}
            subtitle={languageScreenCopy.subtitle}
          >
            <View style={[styles.searchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={languageScreenCopy.searchPlaceholder}
                placeholderTextColor={colors.tertiaryText}
                style={[
                  styles.searchInput,
                  { color: colors.primaryText, borderColor: colors.borderStrong, fontFamily: typography.body },
                ]}
              />
            </View>
            <PrimaryButton
              label={languageScreenCopy.continueLabel}
              onPress={() => setStep("name")}
              disabled={!preferredLanguage}
            />
            <View style={styles.languageList}>
              {filteredLanguages.map((language) => (
                <OnboardingOptionCard
                  key={language.code}
                  label={language.nativeName}
                  supportingText={`${language.englishName} · ${language.code.toUpperCase()}`}
                  selected={preferredLanguage === language.code}
                  onPress={() => setPreferredLanguage(language.code)}
                />
              ))}
            </View>
          </OnboardingScaffold>
        );
      case "name":
        return (
          <OnboardingScaffold
            title={t("onboarding.nameTitle")}
            subtitle={t("onboarding.nameBody")}
            footer={
              <>
                <PrimaryButton label={t("common.continue")} onPress={() => setStep("acknowledgement")} />
                <PrimaryButton
                  label={t("common.continueWithoutName")}
                  onPress={() => {
                    setUserName("");
                    setStep("acknowledgement");
                  }}
                  variant="ghost"
                />
              </>
            }
          >
            <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                value={userName}
                onChangeText={setUserName}
                placeholder={t("onboarding.namePlaceholder")}
                placeholderTextColor={colors.tertiaryText}
                style={[
                  styles.input,
                  { color: colors.primaryText, borderColor: colors.borderStrong, fontFamily: typography.body },
                ]}
                selectionColor={colors.accent}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                maxLength={40}
              />
            </View>
          </OnboardingScaffold>
        );
      case "acknowledgement":
        return (
          <OnboardingScaffold
            title={acknowledgementTitle(userName)}
            subtitle={t("onboarding.ackBody")}
            footer={<PrimaryButton label={t("common.continue")} onPress={() => setStep("preference")} />}
          >
            <Text style={[styles.centeredCardText, { color: colors.secondaryText }]}>{t("onboarding.ackCard")}</Text>
          </OnboardingScaffold>
        );
      case "preference":
        return (
          <OnboardingScaffold
            title={t("onboarding.preferenceTitle")}
            footer={
              <PrimaryButton
                label={t("common.continue")}
                onPress={() => setStep("transition")}
                disabled={!userPreferences.length}
              />
            }
          >
            {(["clarity", "calm", "direction", "focus"] as OnboardingPreference[]).map((preference) => {
              const localizedPreference = preferenceLabel(preference);
              return (
                <OnboardingOptionCard
                  key={preference}
                  label={localizedPreference.title}
                  supportingText={localizedPreference.body}
                  selected={userPreferences.includes(preference)}
                  onPress={() => togglePreference(preference)}
                />
              );
            })}
          </OnboardingScaffold>
        );
      case "transition":
        return (
          <OnboardingScaffold title={t("onboarding.transitionTitle")}>
            <View style={styles.transitionWrap}>
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.transitionText, { color: colors.secondaryText }]}>
                {t("onboarding.transitionBody")}
              </Text>
            </View>
          </OnboardingScaffold>
        );
      default:
        return null;
    }
  }

  return (
    <ScreenContainer scroll contentContainerStyle={styles.screenContent}>
      <Animated.View style={[styles.animatedContainer, { opacity }]}>{renderStep()}</Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: "center",
    paddingVertical: 28,
  },
  animatedContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  heroText: {
    fontSize: 24,
    lineHeight: 34,
    textAlign: "center",
    letterSpacing: Platform.OS === "android" ? -0.2 : -0.35,
  },
  searchCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
  },
  searchInput: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 16,
  },
  languageList: {
    gap: 12,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 18,
  },
  centeredCardText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  transitionWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 34,
  },
  transitionText: {
    fontSize: 15,
    lineHeight: 22,
  },
});

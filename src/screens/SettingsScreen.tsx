import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { AccordionSection } from "@/components/AccordionSection";
import { AdaptiveTimePicker } from "@/components/AdaptiveTimePicker";
import { __DEV_OVERRIDE_ENABLED__ } from "@/config/devFlags";
import { CategoryChip } from "@/components/CategoryChip";
import { EditorialHeader } from "@/components/EditorialHeader";
import { DevPlanSwitcher } from "@/components/membership/DevPlanSwitcher";
import { LockedFeaturePreview } from "@/components/membership/LockedFeaturePreview";
import { PremiumGateCard } from "@/components/premium/PremiumGateCard";
import { PremiumPreviewCard } from "@/components/PremiumPreviewCard";
import { PageStylePreview } from "@/components/PageStylePreview";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SettingsRow } from "@/components/SettingsRow";
import { SettingsSubsectionHeading } from "@/components/settings/SettingsSubsectionHeading";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useSubscription } from "@/hooks/useSubscription";
import { useTypography } from "@/hooks/useTypography";
import { filterLanguageOptions, getLanguageOption, LANGUAGE_OPTIONS, QUOTE_LANGUAGE_OPTIONS } from "@/localization/languages";
import { getQuietNoteColor, getQuietPaperColor, parseHexColor, rgbToHex } from "@/theme/paperColor";
import { PAGE_STYLE_PRESETS, PAPER_THEME_PRESETS, TYPOGRAPHY_PRESETS } from "@/theme/presets";
import { ReflectionItem, ThemePreference } from "@/types/reflection";
import { isPackageLocked } from "@/utils/subscriptionHelpers";
import { formatLongDate, formatTimeLabel } from "@/utils/date";
import { palette } from "@/utils/theme";
import {
  buildSavedReflectionsExport,
  buildSavedReflectionsExportHtml,
  exportSavedReflections,
  exportSavedReflectionsPdf,
} from "@/services/exportService";

type SettingsSectionId = "standard" | "current-plan" | "about" | "dev";

export function SettingsScreen() {
  const {
    colorScheme,
    appState,
    favorites,
    getReflectionNote,
    personalization,
    updatePaperTheme,
    updateCustomPaperColor,
    updateNoteBackgroundColor,
    updateTypographyPreset,
    updatePageStyle,
    updateCategories,
    updateLanguage,
    updateNotificationTime,
    updateQuoteLanguages,
    resetPaperThemeToPreset,
    updateTheme,
    resetAllData,
  } = useAppContext();
  const navigation = useNavigation<any>();
  const subscription = useSubscription();
  const membership = useMembership();
  const {
    currentLabel,
    locale,
    aboutBody,
    aboutCreator,
    aboutTitle,
    pageStyleMeta,
    paperThemeMeta,
    subscriptionPlanMeta,
    t,
    typographyMeta,
    categoryLabel,
    membershipFeatureLabel,
    sourceTypeLabel,
    toneLabel,
    languageOptionLabel,
  } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const [expandedSection, setExpandedSection] = useState<SettingsSectionId | null>(null);
  const [isPrivateSettingsExpanded, setIsPrivateSettingsExpanded] = useState(false);
  const [languageQuery, setLanguageQuery] = useState("");
  const [isLanguageSearchActive, setIsLanguageSearchActive] = useState(false);
  const [quoteLanguageQuery, setQuoteLanguageQuery] = useState("");
  const [isQuoteLanguageSearchActive, setIsQuoteLanguageSearchActive] = useState(false);
  const [isCustomPaperPickerOpen, setIsCustomPaperPickerOpen] = useState(false);
  const [customPaperDraft, setCustomPaperDraft] = useState(appState.preferences.customPaperColor);
  const [isNoteBackgroundPickerOpen, setIsNoteBackgroundPickerOpen] = useState(false);
  const [noteBackgroundDraft, setNoteBackgroundDraft] = useState(appState.preferences.noteBackgroundColor);
  const [timeValue, setTimeValue] = useState(() => {
    const value = new Date();
    value.setHours(appState.preferences.notificationTime.hour, appState.preferences.notificationTime.minute, 0, 0);
    return value;
  });

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    setCustomPaperDraft(appState.preferences.customPaperColor);
  }, [appState.preferences.customPaperColor]);

  useEffect(() => {
    setNoteBackgroundDraft(appState.preferences.noteBackgroundColor);
  }, [appState.preferences.noteBackgroundColor]);

  const filteredLanguages = useMemo(() => {
    return filterLanguageOptions(languageQuery, LANGUAGE_OPTIONS);
  }, [languageQuery]);

  const currentLanguage = getLanguageOption(appState.preferredLanguage);
  const visibleLanguageOptions = useMemo(() => {
    if (!isLanguageSearchActive) {
      return [];
    }

    return filteredLanguages.filter((language) => language.code !== appState.preferredLanguage);
  }, [appState.preferredLanguage, filteredLanguages, isLanguageSearchActive]);
  const filteredQuoteLanguages = useMemo(
    () => filterLanguageOptions(quoteLanguageQuery, QUOTE_LANGUAGE_OPTIONS),
    [quoteLanguageQuery],
  );
  const selectedQuoteLanguageOptions = useMemo(
    () =>
      appState.quoteLanguages
        .map((code) => getLanguageOption(code))
        .filter((language): language is NonNullable<typeof language> => Boolean(language)),
    [appState.quoteLanguages],
  );
  const visibleQuoteLanguageOptions = useMemo(() => {
    if (!isQuoteLanguageSearchActive || !quoteLanguageQuery.trim()) {
      return [];
    }

    return filteredQuoteLanguages.filter((language) => !appState.quoteLanguages.includes(language.code));
  }, [appState.quoteLanguages, filteredQuoteLanguages, isQuoteLanguageSearchActive, quoteLanguageQuery]);
  const activePlanMeta = subscriptionPlanMeta(membership.currentPlanLabel);
  const membershipSectionTitle = membership.isPremiumActive ? "Premium" : "Freemium";
  const hasPremiumPaperColors = membership.hasFeature("premium-paper-colors");
  const hasPremiumTypography = membership.hasFeature("premium-typography");
  const hasPremiumLayouts = membership.hasFeature("premium-layouts");
  const hasPdfExport = membership.hasFeature("pdf-export");
  const isCustomPaperActive = appState.preferences.paperMode === "custom";
  const customPaperColor = appState.preferences.customPaperColor;
  const customPaperPreviewColor = getQuietPaperColor(customPaperColor);
  const customPaperDraftPreviewColor = getQuietPaperColor(customPaperDraft);
  const customPaperRgb = parseHexColor(customPaperDraft) ?? parseHexColor(customPaperColor) ?? { red: 233, green: 226, blue: 216 };
  const noteBackgroundColor = appState.preferences.noteBackgroundColor;
  const noteBackgroundPreviewColor = getQuietNoteColor(noteBackgroundColor, "#FFFFFF");
  const noteBackgroundDraftPreviewColor = getQuietNoteColor(noteBackgroundDraft, "#FFFFFF");
  const noteBackgroundRgb = parseHexColor(noteBackgroundDraft) ?? parseHexColor(noteBackgroundColor) ?? { red: 255, green: 255, blue: 255 };
  const membershipLabel =
    membership.membershipTier === "lifelong"
      ? "Lifelong"
      : membership.membershipTier === "premium"
        ? "Premium"
        : "Freemium";

  function confirmAppearanceChange(targetName: string, onConfirm: () => void | Promise<void>) {
    Alert.alert(
      t("settings.appearanceConfirmTitle"),
      `${t("settings.appearanceConfirmMessageLead")} ${targetName}?`,
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.appearanceConfirmApply"),
          onPress: () => {
            Promise.resolve(onConfirm()).catch((error) => {
              console.warn("Failed to apply appearance change", error);
            });
          },
        },
      ],
    );
  }
  async function handleReset() {
    Alert.alert(t("settings.resetTitle"), t("settings.resetBody"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.reset"),
        style: "destructive",
        onPress: () => {
          resetAllData();
        },
      },
    ]);
  }

  async function toggleTheme(enabled: boolean) {
    const nextTheme: ThemePreference = enabled ? "dark" : "light";
    await updateTheme(nextTheme);
  }

  function handleManageSubscription() {
    Alert.alert(t("settings.manageSubscription"), t("settings.manageSubscriptionBody"));
  }

  async function handleRestore() {
    try {
      await membership.restore();
      Alert.alert(t("settings.restoreSuccessTitle"), t("settings.restoreSuccessBody"));
    } catch {
      Alert.alert(t("settings.restoreErrorTitle"), t("settings.restoreErrorBody"));
    }
  }

  function buildSavedCollectionExportArgs() {
    return {
      reflections: favorites,
      getNote: (date: string, reflectionId: string) => getReflectionNote(date, reflectionId),
      getLanguage: (date: string) => getLanguageOption(appState.quoteLanguageSelections[date])?.nativeName ?? null,
      collectionTitle: t("settings.exportCollectionTitle"),
      collectionSubtitle: t("settings.exportCollectionSubtitle"),
      collectionCountLabel: t("settings.exportCollectionCount"),
      formattedDate: (date: string) => formatLongDate(date, locale),
      reflectionLabel: t("settings.exportReflectionLabel"),
      categoryLabel: t("settings.exportCategoryLabel"),
      languageLabel: t("settings.exportLanguageLabel"),
      sourceLabel: t("settings.exportSourceLabel"),
      sourceTypeLabel,
      categoryValue: (reflection: ReflectionItem) => `${categoryLabel(reflection.category)} · ${toneLabel(reflection.tone)}`,
      exportedOnLabel: t("settings.exportExportedOnLabel"),
      exportedOnValue: formatLongDate(new Date().toISOString().slice(0, 10), locale),
      noteLabel: t("today.noteTitle"),
    } as const;
  }

  async function handleExportSavedReflections() {
    const exportArgs = buildSavedCollectionExportArgs();

    const body = buildSavedReflectionsExport(exportArgs);

    await exportSavedReflections({
      subject: t("settings.exportSavedReflectionsSubject"),
      body,
      emptyTitle: t("settings.exportEmptyTitle"),
      emptyMessage: t("settings.exportEmptyMessage"),
      fallbackTitle: t("settings.exportSavedReflectionsFallbackTitle"),
      emailIntro: t("settings.exportEmailIntro"),
      filePrefix: t("settings.exportFilePrefix"),
      dialogTitle: t("settings.exportSavedReflectionsFallbackTitle"),
    });
  }

  async function handleExportSavedReflectionsPdf() {
    const exportArgs = buildSavedCollectionExportArgs();
    const html = buildSavedReflectionsExportHtml(exportArgs);

    await exportSavedReflectionsPdf({
      html,
      emptyTitle: t("settings.exportEmptyTitle"),
      emptyMessage: t("settings.exportEmptyMessage"),
      fallbackTitle: t("settings.exportPdfFallbackTitle"),
      filePrefix: t("settings.exportPdfFilePrefix"),
      dialogTitle: t("settings.exportPdfFallbackTitle"),
    });
  }

  function toggleSection(section: SettingsSectionId) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((current) => (current === section ? null : section));
  }

  function togglePrivateSettings() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsPrivateSettingsExpanded((current) => !current);
  }

  function openLanguageSearch() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLanguageSearchActive(true);
  }

  function closeLanguageSearch() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLanguageQuery("");
    setIsLanguageSearchActive(false);
  }

  function openQuoteLanguageSearch() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsQuoteLanguageSearchActive(true);
  }

  function closeQuoteLanguageSearch() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuoteLanguageQuery("");
    setIsQuoteLanguageSearchActive(false);
  }

  async function handleLanguageSelect(languageCode: (typeof LANGUAGE_OPTIONS)[number]["code"]) {
    await updateLanguage(languageCode);
    closeLanguageSearch();
  }

  async function handleToggleQuoteLanguage(languageCode: (typeof QUOTE_LANGUAGE_OPTIONS)[number]["code"]) {
    const current = appState.quoteLanguages;
    const isSelected = current.includes(languageCode);

    if (isSelected && current.length === 1) {
      return;
    }

    const next = isSelected
      ? current.filter((item) => item !== languageCode)
      : [...current, languageCode];

    await updateQuoteLanguages(next);
  }

  async function handleSelectPaperTheme(paperThemeId: (typeof PAPER_THEME_PRESETS)[number]["id"]) {
    const selectedPreset = PAPER_THEME_PRESETS.find((preset) => preset.id === paperThemeId);
    if (!selectedPreset) {
      return;
    }

    const isLocked = isPackageLocked(hasPremiumPaperColors, selectedPreset.availability);
    if (isLocked) {
      navigation.navigate("Membership");
      return;
    }

    if (!isCustomPaperActive && personalization.paperTone.id === paperThemeId) {
      return;
    }

    confirmAppearanceChange(paperThemeMeta(paperThemeId).title, async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updatePaperTheme(paperThemeId);
    });
  }

  async function handleSelectTypographyPreset(typographyPresetId: (typeof TYPOGRAPHY_PRESETS)[number]["id"]) {
    const selectedPreset = TYPOGRAPHY_PRESETS.find((preset) => preset.id === typographyPresetId);
    if (!selectedPreset) {
      return;
    }

    const isLocked = isPackageLocked(hasPremiumTypography, selectedPreset.availability);
    if (isLocked) {
      navigation.navigate("Membership");
      return;
    }

    if (personalization.fontStyle.id === typographyPresetId) {
      return;
    }

    confirmAppearanceChange(typographyMeta(typographyPresetId).title, async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateTypographyPreset(typographyPresetId);
    });
  }

  async function handleSelectPageStyle(pageStyleId: (typeof PAGE_STYLE_PRESETS)[number]["id"]) {
    const selectedPreset = PAGE_STYLE_PRESETS.find((preset) => preset.id === pageStyleId);
    if (!selectedPreset) {
      return;
    }

    const isLocked = isPackageLocked(hasPremiumLayouts, selectedPreset.availability);
    if (isLocked) {
      navigation.navigate("Membership");
      return;
    }

    if (personalization.pageStyle.id === pageStyleId) {
      return;
    }

    confirmAppearanceChange(pageStyleMeta(pageStyleId).title, async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updatePageStyle(pageStyleId);
    });
  }

  function openCustomPaperPicker() {
    if (!hasPremiumPaperColors) {
      navigation.navigate("Membership");
      return;
    }

    setCustomPaperDraft(customPaperColor);
    setIsCustomPaperPickerOpen(true);
  }

  function closeCustomPaperPicker() {
    setIsCustomPaperPickerOpen(false);
  }

  function openNoteBackgroundPicker() {
    if (!hasPremiumPaperColors) {
      navigation.navigate("Membership");
      return;
    }

    setNoteBackgroundDraft(noteBackgroundColor);
    setIsNoteBackgroundPickerOpen(true);
  }

  function closeNoteBackgroundPicker() {
    setIsNoteBackgroundPickerOpen(false);
  }

  function updateCustomPaperChannel(channel: "red" | "green" | "blue", value: number) {
    const nextColor = rgbToHex({
      red: channel === "red" ? value : customPaperRgb.red,
      green: channel === "green" ? value : customPaperRgb.green,
      blue: channel === "blue" ? value : customPaperRgb.blue,
    });

    setCustomPaperDraft(nextColor);
  }

  function updateNoteBackgroundChannel(channel: "red" | "green" | "blue", value: number) {
    const nextColor = rgbToHex({
      red: channel === "red" ? value : noteBackgroundRgb.red,
      green: channel === "green" ? value : noteBackgroundRgb.green,
      blue: channel === "blue" ? value : noteBackgroundRgb.blue,
    });

    setNoteBackgroundDraft(nextColor);
  }

  async function handleApplyCustomPaperTheme() {
    const isSameCustomColor = isCustomPaperActive && customPaperDraft.toUpperCase() === customPaperColor.toUpperCase();
    if (isSameCustomColor) {
      closeCustomPaperPicker();
      return;
    }

    confirmAppearanceChange(t("settings.customPaperTheme"), async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateCustomPaperColor(customPaperDraft);
      setIsCustomPaperPickerOpen(false);
    });
  }

  async function handleResetCustomPaperTheme() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await resetPaperThemeToPreset();
    setIsCustomPaperPickerOpen(false);
  }

  async function handleApplyNoteBackgroundColor() {
    const isSameNoteColor = noteBackgroundDraft.toUpperCase() === noteBackgroundColor.toUpperCase();
    if (isSameNoteColor) {
      closeNoteBackgroundPicker();
      return;
    }

    confirmAppearanceChange(t("settings.noteBackground"), async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateNoteBackgroundColor(noteBackgroundDraft);
      setIsNoteBackgroundPickerOpen(false);
    });
  }

  async function handleResetNoteBackgroundColor() {
    if (noteBackgroundColor.toUpperCase() === "#FFFFFF") {
      setIsNoteBackgroundPickerOpen(false);
      return;
    }

    confirmAppearanceChange(t("settings.noteBackground"), async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateNoteBackgroundColor("#FFFFFF");
      setIsNoteBackgroundPickerOpen(false);
    });
  }

  return (
    <ScreenContainer scroll>
      <EditorialHeader
        eyebrow={t("settings.eyebrow")}
      />

      <View style={styles.stack}>
        <AccordionSection
          title={t("settings.standardSectionTitle")}
          expanded={expandedSection === "standard"}
          onPress={() => toggleSection("standard")}
        >
          <View style={styles.innerGroup}>
            <SettingsSubsectionHeading
              title={t("settings.notificationTime")}
              value={formatTimeLabel(timeValue.getHours(), timeValue.getMinutes(), locale)}
            />
            <AdaptiveTimePicker
              value={timeValue}
              onChange={(date) => {
                setTimeValue(date);
                updateNotificationTime({ hour: date.getHours(), minute: date.getMinutes() });
              }}
            />
          </View>

          <View style={styles.innerGroup}>
            <SettingsSubsectionHeading title={t("settings.preferredCategories")} />
            <View style={styles.chipWrap}>
              {REFLECTION_CATEGORIES.map((category) => {
                const isSelected = appState.preferences.selectedCategories.includes(category);
                return (
                  <CategoryChip
                    key={category}
                    category={category}
                    selected={isSelected}
                    onPress={() => {
                      const current = appState.preferences.selectedCategories;
                      const next = isSelected
                        ? current.filter((item) => item !== category)
                        : [...current, category];
                      updateCategories(next);
                    }}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.innerGroup}>
            <View style={styles.themeRow}>
              <View style={styles.themeCopy}>
                <SettingsSubsectionHeading title={t("settings.darkMode")} />
                <Text style={[styles.blockBody, { color: colors.secondaryText }]}>
                  {t("settings.darkModeBody")}
                </Text>
              </View>
              <Switch
                value={appState.preferences.theme === "dark"}
                onValueChange={toggleTheme}
                trackColor={{ true: colors.accent, false: colors.border }}
              />
            </View>
          </View>

          <View style={styles.innerGroup}>
            <SettingsSubsectionHeading
              title={t("settings.language")}
              value={currentLanguage?.nativeName ?? "English"}
            />
            <Text style={[styles.blockBody, { color: colors.secondaryText }]}>{t("settings.languageBody")}</Text>
            {currentLanguage ? (
              <Pressable
                onPress={openLanguageSearch}
                style={({ pressed }) => [
                  styles.languageRow,
                  {
                    backgroundColor: colors.paperTint,
                    borderColor: colors.accent,
                  },
                  pressed && styles.languageRowPressed,
                ]}
              >
                <View style={styles.languageCopy}>
                  <Text style={[styles.languageName, { color: colors.primaryText, fontFamily: typography.display }]}>{currentLanguage.nativeName}</Text>
                  <Text style={[styles.languageMeta, { color: colors.secondaryText, fontFamily: typography.body }]}>
                    {languageOptionLabel(currentLanguage.code)}
                  </Text>
                </View>
                <Text style={[styles.currentTag, { color: colors.accent, fontFamily: typography.meta }]}>{currentLabel()}</Text>
              </Pressable>
            ) : null}
            <View
              style={[
                styles.searchInputWrap,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                value={languageQuery}
                onChangeText={(value) => {
                  if (!isLanguageSearchActive) {
                    openLanguageSearch();
                  }
                  setLanguageQuery(value);
                }}
                onFocus={openLanguageSearch}
                onBlur={() => {
                  if (!languageQuery.trim()) {
                    closeLanguageSearch();
                  }
                }}
                placeholder={t("common.searchLanguage")}
                placeholderTextColor={colors.tertiaryText}
                style={[
                  styles.searchInput,
                  {
                    color: colors.primaryText,
                    fontFamily: typography.body,
                  },
                ]}
              />
              {isLanguageSearchActive && languageQuery.length ? (
                <Pressable onPress={closeLanguageSearch} hitSlop={6}>
                  <Text style={[styles.clearSearch, { color: colors.tertiaryText, fontFamily: typography.meta }]}>{t("common.cancel")}</Text>
                </Pressable>
              ) : null}
            </View>
            {isLanguageSearchActive ? (
              <View style={styles.languageList}>
                {visibleLanguageOptions.slice(0, 10).map((language) => (
                  <Pressable
                    key={language.code}
                    onPress={() => {
                      handleLanguageSelect(language.code).catch((error) => {
                        console.warn("Failed to update language", error);
                      });
                    }}
                    style={({ pressed }) => [
                      styles.languageRow,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      pressed && styles.languageRowPressed,
                    ]}
                  >
                    <View style={styles.languageCopy}>
                      <Text style={[styles.languageName, { color: colors.primaryText, fontFamily: typography.display }]}>{language.nativeName}</Text>
                      <Text style={[styles.languageMeta, { color: colors.secondaryText, fontFamily: typography.body }]}>
                        {languageOptionLabel(language.code)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.innerGroup}>
            <SettingsSubsectionHeading
              title={t("settings.resetTitle")}
              onPress={handleReset}
              danger
            />
          </View>
        </AccordionSection>

        <AccordionSection
          title={membershipSectionTitle}
          expanded={expandedSection === "current-plan"}
          onPress={() => toggleSection("current-plan")}
        >
          <Text style={[styles.planLead, { color: colors.secondaryText }]}>{activePlanMeta.summary}</Text>

          <View style={styles.innerGroup}>
            <SettingsRow label={t("settings.subscriptionStatus")} value={membershipLabel} />
            <SettingsRow label={t("membership.openMembership")} onPress={() => navigation.navigate("Membership")} />
            <SettingsRow
              label={t("settings.restorePurchases")}
              onPress={() => {
                handleRestore().catch(() => undefined);
              }}
            />
            <SettingsRow
              label={t("settings.manageSubscription")}
              onPress={handleManageSubscription}
            />
          </View>

          <AccordionSection
            title={t("settings.privateSettingsTitle")}
            expanded={isPrivateSettingsExpanded}
            onPress={togglePrivateSettings}
          >
            {!membership.hasFeature("quote-language-choice") ? (
              <PremiumGateCard
                title={t("settings.premiumPreviewTitle")}
                message={t("settings.premiumPreviewBody")}
                actionLabel={t("settings.upgradeAction")}
                onPress={() => navigation.navigate("Membership")}
              />
            ) : (
              <>
                <View style={styles.innerGroup}>
                  <SettingsSubsectionHeading title={t("settings.quoteLanguages")} />
                  <Text style={[styles.blockBody, { color: colors.secondaryText }]}>{t("settings.quoteLanguagesBody")}</Text>
                  <View style={styles.languageList}>
                    {selectedQuoteLanguageOptions.map((language) => {
                      const isAppLanguage = language.code === appState.preferredLanguage;
                      return (
                        <Pressable
                          key={language.code}
                          onPress={() => {
                            handleToggleQuoteLanguage(language.code).catch((error) => {
                              console.warn("Failed to update quote languages", error);
                            });
                          }}
                          style={({ pressed }) => [
                            styles.languageRow,
                            {
                              backgroundColor: colors.paperTint,
                              borderColor: colors.accent,
                            },
                            pressed && styles.languageRowPressed,
                          ]}
                        >
                          <View style={styles.languageCopy}>
                            <Text style={[styles.languageName, { color: colors.primaryText, fontFamily: typography.display }]}>{language.nativeName}</Text>
                            <Text style={[styles.languageMeta, { color: colors.secondaryText, fontFamily: typography.body }]}>
                              {languageOptionLabel(language.code)}
                            </Text>
                          </View>
                          <View style={styles.languageTagStack}>
                            <Text style={[styles.currentTag, { color: colors.accent, fontFamily: typography.meta }]}>
                              {t("settings.quoteLanguagesSelectedTag")}
                            </Text>
                            {isAppLanguage ? (
                              <Text style={[styles.currentTag, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                                {t("settings.quoteLanguagesAppTag")}
                              </Text>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View
                    style={[
                      styles.searchInputWrap,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      value={quoteLanguageQuery}
                      onChangeText={(value) => {
                        if (!isQuoteLanguageSearchActive) {
                          openQuoteLanguageSearch();
                        }
                        setQuoteLanguageQuery(value);
                      }}
                      onFocus={openQuoteLanguageSearch}
                      onBlur={() => {
                        if (!quoteLanguageQuery.trim()) {
                          closeQuoteLanguageSearch();
                        }
                      }}
                      placeholder={t("settings.quoteLanguagesSearchPlaceholder")}
                      placeholderTextColor={colors.tertiaryText}
                      style={[
                        styles.searchInput,
                        {
                          color: colors.primaryText,
                          fontFamily: typography.body,
                        },
                      ]}
                    />
                    {isQuoteLanguageSearchActive && quoteLanguageQuery.length ? (
                      <Pressable onPress={closeQuoteLanguageSearch} hitSlop={6}>
                        <Text style={[styles.clearSearch, { color: colors.tertiaryText, fontFamily: typography.meta }]}>{t("common.cancel")}</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  {isQuoteLanguageSearchActive && quoteLanguageQuery.trim().length > 0 ? (
                    <View style={styles.languageList}>
                      {visibleQuoteLanguageOptions.map((language) => {
                        const isAppLanguage = language.code === appState.preferredLanguage;
                        return (
                          <Pressable
                            key={language.code}
                            onPress={() => {
                              handleToggleQuoteLanguage(language.code).catch((error) => {
                                console.warn("Failed to update quote languages", error);
                              });
                            }}
                            style={({ pressed }) => [
                              styles.languageRow,
                              {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                              },
                              pressed && styles.languageRowPressed,
                            ]}
                          >
                            <View style={styles.languageCopy}>
                              <Text style={[styles.languageName, { color: colors.primaryText, fontFamily: typography.display }]}>{language.nativeName}</Text>
                              <Text style={[styles.languageMeta, { color: colors.secondaryText, fontFamily: typography.body }]}>
                                {languageOptionLabel(language.code)}
                              </Text>
                            </View>
                            {isAppLanguage ? (
                              <Text style={[styles.currentTag, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                                {t("settings.quoteLanguagesAppTag")}
                              </Text>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                </View>

                <View style={styles.innerGroup}>
                  <SettingsSubsectionHeading title={t("settings.exportSavedReflections")} />
                  <Text style={[styles.blockBody, styles.exportBody, { color: colors.secondaryText }]}>
                    {t("settings.exportSavedReflectionsBody")}
                  </Text>
                  <View style={styles.exportActionStack}>
                    <Pressable
                      onPress={() => {
                        handleExportSavedReflections().catch((error) => {
                          console.warn("Failed to export saved reflections", error);
                        });
                      }}
                      style={({ pressed }) => [
                        styles.exportActionRow,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        },
                        pressed && styles.languageRowPressed,
                      ]}
                    >
                      <Text style={[styles.exportActionLabel, { color: colors.primaryText, fontFamily: typography.action }]}>
                        {t("settings.exportAction")}
                      </Text>
                    </Pressable>
                    {hasPdfExport ? (
                      <Pressable
                        onPress={() => {
                          handleExportSavedReflectionsPdf().catch((error) => {
                            console.warn("Failed to export saved reflections as PDF", error);
                          });
                        }}
                        style={({ pressed }) => [
                          styles.exportActionRow,
                          {
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                          },
                          pressed && styles.languageRowPressed,
                        ]}
                      >
                        <Text style={[styles.exportActionLabel, { color: colors.primaryText, fontFamily: typography.action }]}>
                          {t("settings.exportPdfAction")}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>

                <View style={styles.innerGroup}>
                  <SettingsSubsectionHeading title={t("settings.paperThemes")} />
                  {PAPER_THEME_PRESETS.map((preset) => (
                    <PremiumPreviewCard
                      key={preset.id}
                      onPress={() => {
                        handleSelectPaperTheme(preset.id).catch((error) => {
                          console.warn("Failed to update paper theme", error);
                        });
                      }}
                      title={paperThemeMeta(preset.id).title}
                      description={paperThemeMeta(preset.id).description}
                      swatch={preset.swatch}
                      current={!isCustomPaperActive && personalization.paperTone.id === preset.id}
                      radioSelected={!isCustomPaperActive && personalization.paperTone.id === preset.id}
                      currentLabel={currentLabel()}
                      badge={preset.availability === "included" ? t("settings.included") : "Premium"}
                      locked={isPackageLocked(hasPremiumPaperColors, preset.availability)}
                    />
                  ))}
                  <PremiumPreviewCard
                    onPress={openCustomPaperPicker}
                    title={t("settings.customPaperTheme")}
                    description={t("settings.customPaperThemeBody")}
                    swatch={customPaperPreviewColor}
                    current={isCustomPaperActive}
                    radioSelected={isCustomPaperActive}
                    currentLabel={currentLabel()}
                    badge="Premium"
                    locked={!hasPremiumPaperColors}
                  />
                </View>

                <View style={styles.innerGroup}>
                  <SettingsSubsectionHeading title={t("settings.noteBackground")} />
                  <Text style={[styles.blockBody, { color: colors.secondaryText }]}>{t("settings.noteBackgroundBody")}</Text>
                  <PremiumPreviewCard
                    onPress={openNoteBackgroundPicker}
                    title={t("settings.noteBackground")}
                    description={t("settings.noteBackgroundBody")}
                    swatch={noteBackgroundPreviewColor}
                    currentLabel={currentLabel()}
                    badge="Premium"
                    locked={!hasPremiumPaperColors}
                  />
                </View>

                <View style={styles.innerGroup}>
                  <SettingsSubsectionHeading title={t("settings.typographyStyles")} />
                  {TYPOGRAPHY_PRESETS.map((preset) => (
                    <PremiumPreviewCard
                      key={preset.id}
                      onPress={() => {
                        handleSelectTypographyPreset(preset.id).catch((error) => {
                          console.warn("Failed to update typography preset", error);
                        });
                      }}
                      title={typographyMeta(preset.id).title}
                      description={typographyMeta(preset.id).description}
                      specimen={typographyMeta(preset.id).specimen}
                      current={personalization.fontStyle.id === preset.id}
                      radioSelected={personalization.fontStyle.id === preset.id}
                      currentLabel={currentLabel()}
                      badge={preset.availability === "included" ? t("settings.included") : "Premium"}
                      locked={isPackageLocked(hasPremiumTypography, preset.availability)}
                    />
                  ))}
                </View>

                <View style={styles.innerGroup}>
                  <SettingsSubsectionHeading title={t("settings.pageStyles")} />
                  {PAGE_STYLE_PRESETS.map((preset) => (
                    <PremiumPreviewCard
                      key={preset.id}
                      onPress={() => {
                        handleSelectPageStyle(preset.id).catch((error) => {
                          console.warn("Failed to update page style", error);
                        });
                      }}
                      title={pageStyleMeta(preset.id).title}
                      description={pageStyleMeta(preset.id).description}
                      mood={pageStyleMeta(preset.id).mood}
                      preview={<PageStylePreview pageStyleId={preset.id} />}
                      current={personalization.pageStyle.id === preset.id}
                      radioSelected={personalization.pageStyle.id === preset.id}
                      currentLabel={currentLabel()}
                      badge={preset.availability === "included" ? t("settings.included") : "Premium"}
                      locked={isPackageLocked(hasPremiumLayouts, preset.availability)}
                    />
                  ))}
                </View>

                <LockedFeaturePreview
                  title={membershipFeatureLabel("weekly-recap")}
                  body={t("membership.placeholderWeeklyRecap")}
                />
                <LockedFeaturePreview
                  title={membershipFeatureLabel("monthly-recap")}
                  body={t("membership.placeholderMonthlyRecap")}
                />
                <LockedFeaturePreview
                  title={membershipFeatureLabel("personal-collections")}
                  body={t("membership.placeholderCollections")}
                />
              </>
            )}
          </AccordionSection>
        </AccordionSection>

        <AccordionSection
          title={aboutTitle()}
          expanded={expandedSection === "about"}
          onPress={() => toggleSection("about")}
        >
          <View style={styles.aboutBlock}>
            <Text style={[styles.aboutBody, { color: colors.secondaryText }]}>{aboutBody()}</Text>
            <Text style={[styles.aboutCreator, { color: colors.tertiaryText }]}>{aboutCreator()}</Text>
          </View>
        </AccordionSection>

        {__DEV_OVERRIDE_ENABLED__ ? (
          <AccordionSection
            title={t("settings.devSectionTitle")}
            expanded={expandedSection === "dev"}
            onPress={() => toggleSection("dev")}
          >
            <DevPlanSwitcher />
          </AccordionSection>
        ) : null}
      </View>
      <Modal
        visible={isCustomPaperPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeCustomPaperPicker}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SettingsSubsectionHeading title={t("settings.customPaperTheme")} />
            <Text style={[styles.blockBody, { color: colors.secondaryText }]}>
              {t("settings.customPaperThemePickerBody")}
            </Text>

            <View
              style={[
                styles.customPaperPreview,
                { backgroundColor: customPaperDraftPreviewColor, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.customPaperPreviewTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                {t("settings.customPaperThemePreview")}
              </Text>
              <Text style={[styles.customPaperPreviewValue, { color: colors.secondaryText }]}>
                {customPaperDraft}
              </Text>
            </View>

            <View style={styles.sliderStack}>
              {([
                ["red", t("settings.customPaperRed"), customPaperRgb.red, colors.clay],
                ["green", t("settings.customPaperGreen"), customPaperRgb.green, colors.sage],
                ["blue", t("settings.customPaperBlue"), customPaperRgb.blue, colors.blueGray],
              ] as const).map(([channel, label, value, tint]) => (
                <View key={channel} style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: colors.primaryText, fontFamily: typography.body }]}>{label}</Text>
                    <Text style={[styles.sliderValue, { color: colors.secondaryText }]}>{value}</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={value}
                    minimumTrackTintColor={tint}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.accent}
                    onValueChange={(nextValue) => {
                      updateCustomPaperChannel(channel, nextValue);
                    }}
                  />
                </View>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  handleResetCustomPaperTheme().catch((error) => {
                    console.warn("Failed to reset custom paper theme", error);
                  });
                }}
                style={({ pressed }) => [pressed && styles.languageRowPressed]}
              >
                <Text style={[styles.modalActionText, { color: colors.secondaryText, fontFamily: typography.action }]}>
                  {t("settings.customPaperReset")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  handleApplyCustomPaperTheme().catch((error) => {
                    console.warn("Failed to apply custom paper color", error);
                  });
                }}
                style={({ pressed }) => [pressed && styles.languageRowPressed]}
              >
                <Text style={[styles.modalActionText, { color: colors.primaryText, fontFamily: typography.action }]}>
                  {t("common.continue")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isNoteBackgroundPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeNoteBackgroundPicker}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <SettingsSubsectionHeading title={t("settings.noteBackground")} />
            <Text style={[styles.blockBody, { color: colors.secondaryText }]}>
              {t("settings.noteBackgroundBody")}
            </Text>

            <View
              style={[
                styles.customPaperPreview,
                { backgroundColor: noteBackgroundDraftPreviewColor, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.customPaperPreviewTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                {t("settings.noteBackgroundPreview")}
              </Text>
              <Text style={[styles.customPaperPreviewValue, { color: colors.secondaryText }]}>
                {noteBackgroundDraft}
              </Text>
            </View>

            <View style={styles.sliderStack}>
              {([
                ["red", t("settings.customPaperRed"), noteBackgroundRgb.red, colors.clay],
                ["green", t("settings.customPaperGreen"), noteBackgroundRgb.green, colors.sage],
                ["blue", t("settings.customPaperBlue"), noteBackgroundRgb.blue, colors.blueGray],
              ] as const).map(([channel, label, value, tint]) => (
                <View key={channel} style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: colors.primaryText, fontFamily: typography.body }]}>{label}</Text>
                    <Text style={[styles.sliderValue, { color: colors.secondaryText }]}>{value}</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={value}
                    minimumTrackTintColor={tint}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.accent}
                    onValueChange={(nextValue) => {
                      updateNoteBackgroundChannel(channel, nextValue);
                    }}
                  />
                </View>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  handleResetNoteBackgroundColor().catch((error) => {
                    console.warn("Failed to reset note background color", error);
                  });
                }}
                style={({ pressed }) => [pressed && styles.languageRowPressed]}
              >
                <Text style={[styles.modalActionText, { color: colors.secondaryText, fontFamily: typography.action }]}>
                  {t("settings.noteBackgroundReset")}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  handleApplyNoteBackgroundColor().catch((error) => {
                    console.warn("Failed to apply note background color", error);
                  });
                }}
                style={({ pressed }) => [pressed && styles.languageRowPressed]}
              >
                <Text style={[styles.modalActionText, { color: colors.primaryText, fontFamily: typography.action }]}>
                  {t("common.continue")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 8,
    marginBottom: 10,
  },
  innerGroup: {
    gap: 12,
  },
  blockTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
  },
  blockBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportBody: {
    marginLeft: 18,
  },
  exportActionStack: {
    marginLeft: 18,
    gap: 10,
    alignItems: "flex-start",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  themeCopy: {
    flex: 1,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchInputWrap: {
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 14,
  },
  clearSearch: {
    fontSize: 12,
    lineHeight: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  languageList: {
    gap: 10,
  },
  languageRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  languageRowPressed: {
    opacity: 0.92,
  },
  languageCopy: {
    flex: 1,
    gap: 4,
  },
  languageName: {
    fontSize: 18,
    lineHeight: 24,
  },
  languageMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  currentTag: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  languageTagStack: {
    alignItems: "flex-end",
    gap: 6,
  },
  exportActionRow: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignSelf: "flex-start",
  },
  exportActionLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  customPaperPreview: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 4,
  },
  customPaperPreviewTitle: {
    fontSize: 16,
  },
  customPaperPreviewValue: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  sliderStack: {
    gap: 10,
  },
  sliderRow: {
    gap: 4,
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 12,
    letterSpacing: 0.4,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  subheading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginTop: 8,
  },
  planLead: {
    fontSize: 14,
    lineHeight: 20,
  },
  aboutBlock: {
    gap: 12,
    paddingRight: 8,
  },
  aboutBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  aboutCreator: {
    fontSize: 13,
    lineHeight: 20,
  },
});

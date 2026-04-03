import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { CategoryChip } from "@/components/CategoryChip";
import { EditorialHeader } from "@/components/EditorialHeader";
import { PremiumGateCard } from "@/components/premium/PremiumGateCard";
import { UpgradeCard } from "@/components/premium/UpgradeCard";
import { PremiumPreviewCard } from "@/components/PremiumPreviewCard";
import { PageStylePreview } from "@/components/PageStylePreview";
import { SegmentedControl } from "@/components/SegmentedControl";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SettingsRow } from "@/components/SettingsRow";
import { SettingsAccordionItem } from "@/components/settings/SettingsAccordionItem";
import { SettingsSubsectionHeading } from "@/components/settings/SettingsSubsectionHeading";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useSubscription } from "@/hooks/useSubscription";
import { useTypography } from "@/hooks/useTypography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPremiumPromptCopy } from "@/services/premiumPromptService";
import {
  filterLanguageOptions,
  getLanguageDirection,
  getLanguageOption,
  getOfficialLanguageDisplayLabel,
  getSupportedAppLanguages,
  getSupportedReflectionLanguages,
} from "@/localization/languages";
import {
  formatHexInputDisplay,
  getQuietAppBackgroundColor,
  getQuietNoteColor,
  getQuietPaperColor,
  isHexColorInputPotentiallyValid,
  isValidHexColorInput,
  normalizeHexInput,
  parseHexColor,
  rgbToHex,
} from "@/theme/paperColor";
import { APPEARANCE_PRESETS, PAGE_STYLE_PRESETS, TYPOGRAPHY_PRESETS } from "@/theme/presets";
import { ReflectionItem, SupportedLanguage, ThemePreference } from "@/types/reflection";
import { getEffectiveReflectionLanguages } from "@/utils/reflection";
import { isPackageLocked } from "@/utils/subscriptionHelpers";
import { formatLongDate, formatTimeLabel } from "@/utils/date";
import { ensureReadableTextColorAcrossBackgrounds } from "@/utils/color/colorAdjust";
import { getMinimumContrastRatio } from "@/utils/color/contrast";
import { palette } from "@/utils/theme";
import {
  buildSavedReflectionsExport,
  buildSavedReflectionsExportHtml,
  exportSavedReflections,
  exportSavedReflectionsPdf,
} from "@/services/exportService";

type SettingsSectionId = "standard" | "private" | "premium" | "about";
type PrivateSettingsItemId =
  | "color-style"
  | "thought-library"
  | "quote-languages"
  | "email-export"
  | "note-background"
  | "typography"
  | "page-styles";
type PrivateSettingsGroupId = "appearance" | "collection-order" | "language-content" | "collection-sharing" | "premium";
type StandardSettingsItemId =
  | "notification-time"
  | "ritual-delivery"
  | "categories"
  | "dark-mode"
  | "language"
  | "reset";

export function SettingsScreen() {
  const {
    colorScheme,
    appState,
    favorites,
    getReflectionNote,
    personalization,
    updateAppBackgroundColor,
    updateCustomPaperColor,
    updateNoteBackgroundColor,
    updateTypographyPreset,
    updatePageStyle,
    updateCategories,
    updateNotificationDeliveryPreferences,
    updateLanguage,
    updateNotificationTime,
    updateReflectionLanguages,
    updateReflectionLanguageMode,
    resetPaperThemeToPreset,
    updateTheme,
    updateAppearanceMode,
    updateAppearancePreset,
    markPremiumPromptOpened,
    resetAllData,
    updateTextColorMode,
    updateCustomTextColor,
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
    appearancePresetMeta,
    pageStyleMeta,
    planLabel,
    premiumLabel,
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
  const insets = useSafeAreaInsets();
  const typography = useTypography();
  const isLightMode = colorScheme === "light";
  const settingsBackground = colors.appBackground;
  const settingsCard = isLightMode ? "#EFE9E1" : colors.card;
  const settingsCardActive = isLightMode ? "#F2ECE4" : colors.elevatedSurface;
  const settingsPrimaryText = colors.primaryText;
  const settingsSecondaryText = colors.secondaryText;
  const settingsTertiaryText = colors.tertiaryText;
  const settingsBorder = isLightMode ? "rgba(120, 90, 60, 0.15)" : colors.border;
  const settingsAccent = isLightMode ? "#A07C5B" : colors.accent;
  const personalizationPrompt = useMemo(
    () => getPremiumPromptCopy("personalization", appState.preferredLanguage),
    [appState.preferredLanguage],
  );
  const [expandedSection, setExpandedSection] = useState<SettingsSectionId | null>(null);
  const [expandedStandardItem, setExpandedStandardItem] = useState<StandardSettingsItemId | null>(null);
  const [expandedPrivateItem, setExpandedPrivateItem] = useState<PrivateSettingsItemId | null>(null);
  const [expandedPrivateGroup, setExpandedPrivateGroup] = useState<PrivateSettingsGroupId | null>("appearance");
  const [languageQuery, setLanguageQuery] = useState("");
  const [isLanguageSearchActive, setIsLanguageSearchActive] = useState(false);
  const [isCustomPaperPickerOpen, setIsCustomPaperPickerOpen] = useState(false);
  const [customPaperDraft, setCustomPaperDraft] = useState(appState.preferences.customPaperColor);
  const [customPaperHexInput, setCustomPaperHexInput] = useState(formatHexInputDisplay(appState.preferences.customPaperColor));
  const [isAppBackgroundPickerOpen, setIsAppBackgroundPickerOpen] = useState(false);
  const [appBackgroundDraft, setAppBackgroundDraft] = useState(appState.preferences.appBackgroundColor);
  const [appBackgroundHexInput, setAppBackgroundHexInput] = useState(formatHexInputDisplay(appState.preferences.appBackgroundColor));
  const [isTextColorPickerOpen, setIsTextColorPickerOpen] = useState(false);
  const [textColorDraft, setTextColorDraft] = useState(appState.preferences.customTextColor);
  const [textColorHexInput, setTextColorHexInput] = useState(formatHexInputDisplay(appState.preferences.customTextColor));
  const [isNoteBackgroundPickerOpen, setIsNoteBackgroundPickerOpen] = useState(false);
  const [noteBackgroundDraft, setNoteBackgroundDraft] = useState(appState.preferences.noteBackgroundColor);
  const [noteBackgroundHexInput, setNoteBackgroundHexInput] = useState(formatHexInputDisplay(appState.preferences.noteBackgroundColor));
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
    setCustomPaperHexInput(formatHexInputDisplay(appState.preferences.customPaperColor));
  }, [appState.preferences.customPaperColor]);

  useEffect(() => {
    setAppBackgroundDraft(appState.preferences.appBackgroundColor);
    setAppBackgroundHexInput(formatHexInputDisplay(appState.preferences.appBackgroundColor));
  }, [appState.preferences.appBackgroundColor]);

  useEffect(() => {
    setTextColorDraft(appState.preferences.customTextColor);
    setTextColorHexInput(formatHexInputDisplay(appState.preferences.customTextColor));
  }, [appState.preferences.customTextColor]);

  useEffect(() => {
    setNoteBackgroundDraft(appState.preferences.noteBackgroundColor);
    setNoteBackgroundHexInput(formatHexInputDisplay(appState.preferences.noteBackgroundColor));
  }, [appState.preferences.noteBackgroundColor]);

  const availableAppLanguages = useMemo(
    () => getSupportedAppLanguages(appState.subscriptionModel),
    [appState.subscriptionModel],
  );
  const availableReflectionLanguages = useMemo(
    () => getSupportedReflectionLanguages(appState.subscriptionModel),
    [appState.subscriptionModel],
  );

  const filteredLanguages = useMemo(() => {
    return filterLanguageOptions(languageQuery, availableAppLanguages);
  }, [availableAppLanguages, languageQuery]);

  const currentLanguage = getLanguageOption(appState.preferredLanguage);
  const effectiveReflectionLanguages = getEffectiveReflectionLanguages({
    appLanguage: appState.preferredLanguage,
    reflectionLanguageMode: appState.reflectionLanguageMode,
    reflectionLanguage: appState.reflectionLanguage,
    reflectionLanguages: appState.reflectionLanguages,
    subscriptionModel: appState.subscriptionModel,
  });
  const effectiveReflectionLanguage = effectiveReflectionLanguages[0] ?? appState.preferredLanguage ?? "en";
  const currentReflectionLanguage = getLanguageOption(effectiveReflectionLanguage);
  const selectedReflectionLanguageOptions = effectiveReflectionLanguages
    .map((language) => getLanguageOption(language))
    .filter(Boolean);
  const canChooseReflectionLanguage = membership.hasFeature("quote-language-choice");
  const reflectionFollowsApp = !canChooseReflectionLanguage || appState.reflectionLanguageMode === "same_as_app";
  const reflectionSectionBody = canChooseReflectionLanguage
    ? t("settings.quoteLanguagesPremiumBody")
    : t("settings.quoteLanguagesBody");
  const reflectionLanguageHint = reflectionFollowsApp
    ? t("settings.quoteLanguagesCurrentHintSameAsApp")
    : t("settings.quoteLanguagesCurrentHintCustom");
  const visibleLanguageOptions = useMemo(() => {
    if (!isLanguageSearchActive) {
      return [];
    }

    return filteredLanguages.filter((language) => language.code !== appState.preferredLanguage);
  }, [appState.preferredLanguage, filteredLanguages, isLanguageSearchActive]);
  const activePlanMeta = subscriptionPlanMeta(membership.currentPlanLabel);
  const hasPremiumPaperColors = membership.hasFeature("premium-paper-colors");
  const hasPremiumTypography = membership.hasFeature("premium-typography");
  const hasPremiumLayouts = membership.hasFeature("premium-layouts");
  const hasPdfExport = membership.hasFeature("pdf-export");
  const hasPrivateSettingsAccess = membership.isPremiumActive;
  const canCustomizeAppearance = hasPremiumPaperColors;
  const appearanceMode = canCustomizeAppearance ? appState.preferences.appearanceMode : "default";
  const selectedAppearancePresetId = appState.preferences.selectedAppearancePresetId;
  const selectedAppearancePreset =
    APPEARANCE_PRESETS.find((preset) => preset.id === selectedAppearancePresetId) ?? APPEARANCE_PRESETS[0];
  const isCustomPaperActive = appState.preferences.paperMode === "custom";
  const customPaperColor = appState.preferences.customPaperColor;
  const customPaperPreviewColor = getQuietPaperColor(customPaperColor);
  const customPaperDraftPreviewColor = getQuietPaperColor(customPaperDraft);
  const customPaperRgb = parseHexColor(customPaperDraft) ?? parseHexColor(customPaperColor) ?? { red: 233, green: 226, blue: 216 };
  const appBackgroundColor = appState.preferences.appBackgroundColor;
  const appBackgroundPreviewColor = getQuietAppBackgroundColor(appBackgroundColor, "#FFFFFF");
  const appBackgroundDraftPreviewColor = getQuietAppBackgroundColor(appBackgroundDraft, "#FFFFFF");
  const appBackgroundRgb = parseHexColor(appBackgroundDraft) ?? parseHexColor(appBackgroundColor) ?? { red: 255, green: 255, blue: 255 };
  const isDefaultAppBackgroundDraft = appBackgroundDraft.toUpperCase() === "#FFFFFF";
  const textColorMode = appState.preferences.textColorMode;
  const customTextColor = appState.preferences.customTextColor;
  const textColorRgb = parseHexColor(textColorDraft) ?? parseHexColor(customTextColor) ?? { red: 34, green: 27, blue: 21 };
  const activePaperPreviewColor = isCustomPaperActive ? customPaperPreviewColor : getQuietPaperColor(personalization.paperTone.swatch);
  const noteBackgroundColor = appState.preferences.noteBackgroundColor;
  const noteBackgroundPreviewColor = getQuietNoteColor(noteBackgroundColor, "#FFFFFF");
  const noteBackgroundDraftPreviewColor = getQuietNoteColor(noteBackgroundDraft, "#FFFFFF");
  const noteBackgroundRgb = parseHexColor(noteBackgroundDraft) ?? parseHexColor(noteBackgroundColor) ?? { red: 255, green: 255, blue: 255 };
  const activeTextPreviewColor = textColorMode === "custom" ? customTextColor : colors.primaryText;
  const textContrastBackgrounds = [activePaperPreviewColor, colors.appBackground];
  const textContrastPreview = ensureReadableTextColorAcrossBackgrounds(
    textColorDraft,
    [activePaperPreviewColor, colors.appBackground],
    colors.primaryText,
    4.5,
  );
  const textDraftRawContrast = getMinimumContrastRatio(textColorDraft, textContrastBackgrounds);
  const appBackgroundContrastPreview = ensureReadableTextColorAcrossBackgrounds(
    activeTextPreviewColor,
    [activePaperPreviewColor, appBackgroundDraftPreviewColor],
    colors.primaryText,
    4.5,
  );
  const appBackgroundRawContrast = getMinimumContrastRatio(activeTextPreviewColor, [
    activePaperPreviewColor,
    appBackgroundDraftPreviewColor,
  ]);
  const paperContrastPreview = ensureReadableTextColorAcrossBackgrounds(
    activeTextPreviewColor,
    [customPaperDraftPreviewColor, colors.appBackground],
    colors.primaryText,
    4.5,
  );
  const paperRawContrast = getMinimumContrastRatio(activeTextPreviewColor, [customPaperDraftPreviewColor, colors.appBackground]);
  const isCustomPaperHexInvalid = customPaperHexInput.trim().length > 0 && !isHexColorInputPotentiallyValid(customPaperHexInput);
  const isAppBackgroundHexInvalid = appBackgroundHexInput.trim().length > 0 && !isHexColorInputPotentiallyValid(appBackgroundHexInput);
  const isTextColorHexInvalid = textColorHexInput.trim().length > 0 && !isHexColorInputPotentiallyValid(textColorHexInput);
  const isNoteBackgroundHexInvalid = noteBackgroundHexInput.trim().length > 0 && !isHexColorInputPotentiallyValid(noteBackgroundHexInput);
  const membershipLabel =
    membership.membershipTier === "lifelong"
      ? planLabel("Lifelong")
      : membership.membershipTier === "premium"
        ? planLabel("Premium")
        : planLabel("Freemium");
  const privateGroupProgress = {
    appearance: React.useRef(new Animated.Value(expandedPrivateGroup === "appearance" ? 1 : 0)).current,
    "collection-order": React.useRef(new Animated.Value(expandedPrivateGroup === "collection-order" ? 1 : 0)).current,
    "language-content": React.useRef(new Animated.Value(expandedPrivateGroup === "language-content" ? 1 : 0)).current,
    "collection-sharing": React.useRef(new Animated.Value(expandedPrivateGroup === "collection-sharing" ? 1 : 0)).current,
    premium: React.useRef(new Animated.Value(expandedPrivateGroup === "premium" ? 1 : 0)).current,
  } as const;

  useEffect(() => {
    (Object.entries(privateGroupProgress) as [PrivateSettingsGroupId, Animated.Value][]).forEach(([key, value]) => {
      Animated.timing(value, {
        toValue: expandedPrivateGroup === key ? 1 : 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
    });
  }, [expandedPrivateGroup]);

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

  function animateAccordionTransition() {
    LayoutAnimation.configureNext({
      duration: 240,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
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
      getLanguage: (_date: string) =>
        currentReflectionLanguage ? getOfficialLanguageDisplayLabel(currentReflectionLanguage.code) : null,
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
    animateAccordionTransition();
    setExpandedSection((current) => (current === section ? null : section));
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

  function togglePrivateItem(item: PrivateSettingsItemId) {
    animateAccordionTransition();
    setExpandedPrivateItem((current) => (current === item ? null : item));
  }

  function togglePrivateGroup(group: PrivateSettingsGroupId) {
    if (!hasPrivateSettingsAccess) {
      navigation.navigate("Membership");
      return;
    }

    animateAccordionTransition();
    setExpandedPrivateGroup((current) => (current === group ? null : group));
  }

  function toggleStandardItem(item: StandardSettingsItemId) {
    animateAccordionTransition();
    setExpandedStandardItem((current) => (current === item ? null : item));
  }

  async function handleLanguageSelect(languageCode: SupportedLanguage) {
    await updateLanguage(languageCode);
    closeLanguageSearch();
  }

  async function handleSelectReflectionLanguageMode(mode: "same_as_app" | "custom") {
    if (!canChooseReflectionLanguage && mode === "custom") {
      navigation.navigate("Membership");
      return;
    }

    await updateReflectionLanguageMode(mode);
  }

  async function handleReflectionLanguageToggle(languageCode: SupportedLanguage) {
    if (!canChooseReflectionLanguage) {
      navigation.navigate("Membership");
      return;
    }

    const currentLanguages = appState.reflectionLanguages.length
      ? appState.reflectionLanguages
      : [appState.preferredLanguage ?? "en"];
    const nextLanguages = currentLanguages.includes(languageCode)
      ? currentLanguages.filter((language) => language !== languageCode)
      : [...currentLanguages, languageCode];

    if (!nextLanguages.length) {
      return;
    }

    await updateReflectionLanguages(nextLanguages);
  }

  async function handleSelectAppearanceMode(nextMode: "default" | "preset" | "custom") {
    if (nextMode === appearanceMode) {
      return;
    }

    if (!canCustomizeAppearance && nextMode !== "default") {
      navigation.navigate("Membership");
      return;
    }

    const targetName =
      nextMode === "default"
        ? t("settings.colorStyleDefault")
        : nextMode === "preset"
          ? t("settings.colorStylePresets")
          : t("settings.colorStyleCustom");

    confirmAppearanceChange(targetName, async () => {
      animateAccordionTransition();
      await updateAppearanceMode(nextMode);
    });
  }

  async function handleSelectAppearancePreset(
    appearancePresetId: (typeof APPEARANCE_PRESETS)[number]["id"],
  ) {
    const selectedPreset = APPEARANCE_PRESETS.find((preset) => preset.id === appearancePresetId);
    if (!selectedPreset) {
      return;
    }

    if (!canCustomizeAppearance) {
      navigation.navigate("Membership");
      return;
    }

    if (appearanceMode === "preset" && selectedAppearancePresetId === appearancePresetId) {
      return;
    }

    confirmAppearanceChange(appearancePresetMeta(appearancePresetId).title, async () => {
      animateAccordionTransition();
      await updateAppearancePreset(appearancePresetId);
    });
  }

  function openAppBackgroundPicker() {
    if (!hasPremiumPaperColors) {
      navigation.navigate("Membership");
      return;
    }

    setAppBackgroundDraft(appBackgroundColor);
    setAppBackgroundHexInput(formatHexInputDisplay(appBackgroundColor));
    setIsAppBackgroundPickerOpen(true);
  }

  function closeAppBackgroundPicker() {
    setIsAppBackgroundPickerOpen(false);
  }

  function openTextColorPicker() {
    if (!hasPremiumPaperColors) {
      navigation.navigate("Membership");
      return;
    }

    setTextColorDraft(customTextColor);
    setTextColorHexInput(formatHexInputDisplay(customTextColor));
    setIsTextColorPickerOpen(true);
  }

  function closeTextColorPicker() {
    setIsTextColorPickerOpen(false);
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
    setCustomPaperHexInput(formatHexInputDisplay(customPaperColor));
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
    setNoteBackgroundHexInput(formatHexInputDisplay(noteBackgroundColor));
    setIsNoteBackgroundPickerOpen(true);
  }

  function closeNoteBackgroundPicker() {
    setIsNoteBackgroundPickerOpen(false);
  }

  function updateHexDraft(
    value: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    setDraft: React.Dispatch<React.SetStateAction<string>>,
  ) {
    const normalized = normalizeHexInput(value);
    const hasHash = value.trim().startsWith("#");
    const displayValue = normalized ? `#${normalized}` : hasHash ? "#" : "";

    setInput(displayValue);

    if (isValidHexColorInput(normalized)) {
      setDraft(formatHexInputDisplay(normalized));
    }
  }

  function normalizeHexDraftField(
    value: string,
    fallback: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
  ) {
    const normalized = normalizeHexInput(value);
    setInput(isValidHexColorInput(normalized) ? formatHexInputDisplay(normalized) : formatHexInputDisplay(fallback));
  }

  function updateAppBackgroundChannel(channel: "red" | "green" | "blue", value: number) {
    const nextColor = rgbToHex({
      red: channel === "red" ? value : appBackgroundRgb.red,
      green: channel === "green" ? value : appBackgroundRgb.green,
      blue: channel === "blue" ? value : appBackgroundRgb.blue,
    });

    setAppBackgroundDraft(nextColor);
    setAppBackgroundHexInput(nextColor);
  }

  function updateTextColorChannel(channel: "red" | "green" | "blue", value: number) {
    const nextColor = rgbToHex({
      red: channel === "red" ? value : textColorRgb.red,
      green: channel === "green" ? value : textColorRgb.green,
      blue: channel === "blue" ? value : textColorRgb.blue,
    });

    setTextColorDraft(nextColor);
    setTextColorHexInput(nextColor);
  }

  function updateCustomPaperChannel(channel: "red" | "green" | "blue", value: number) {
    const nextColor = rgbToHex({
      red: channel === "red" ? value : customPaperRgb.red,
      green: channel === "green" ? value : customPaperRgb.green,
      blue: channel === "blue" ? value : customPaperRgb.blue,
    });

    setCustomPaperDraft(nextColor);
    setCustomPaperHexInput(nextColor);
  }

  function updateNoteBackgroundChannel(channel: "red" | "green" | "blue", value: number) {
    const nextColor = rgbToHex({
      red: channel === "red" ? value : noteBackgroundRgb.red,
      green: channel === "green" ? value : noteBackgroundRgb.green,
      blue: channel === "blue" ? value : noteBackgroundRgb.blue,
    });

    setNoteBackgroundDraft(nextColor);
    setNoteBackgroundHexInput(nextColor);
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

  async function handleApplyAppBackgroundColor() {
    const isSameColor = appBackgroundDraft.toUpperCase() === appBackgroundColor.toUpperCase();
    if (isSameColor) {
      closeAppBackgroundPicker();
      return;
    }

    confirmAppearanceChange(t("settings.appBackground"), async () => {
      animateAccordionTransition();
      await updateAppBackgroundColor(appBackgroundDraft);
      setIsAppBackgroundPickerOpen(false);
    });
  }

  async function handleResetAppBackgroundColor() {
    if (appBackgroundColor.toUpperCase() === "#FFFFFF") {
      setAppBackgroundDraft("#FFFFFF");
      setAppBackgroundHexInput("#FFFFFF");
      closeAppBackgroundPicker();
      return;
    }

    confirmAppearanceChange(t("settings.appBackground"), async () => {
      animateAccordionTransition();
      await updateAppBackgroundColor("#FFFFFF");
      setIsAppBackgroundPickerOpen(false);
    });
  }

  async function handleApplyTextColor() {
    const nextReadableTextColor = textContrastPreview.color;
    const isSameColor = textColorMode === "custom" && nextReadableTextColor.toUpperCase() === customTextColor.toUpperCase();
    if (isSameColor) {
      closeTextColorPicker();
      return;
    }

    confirmAppearanceChange(t("settings.textColorCustomTitle"), async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateCustomTextColor(nextReadableTextColor);
      setIsTextColorPickerOpen(false);
    });
  }

  async function handleResetTextColor() {
    if (textColorMode === "default") {
      setTextColorHexInput(formatHexInputDisplay(customTextColor));
      setIsTextColorPickerOpen(false);
      return;
    }

    confirmAppearanceChange(t("settings.textColorDefaultTitle"), async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateTextColorMode("default");
      setIsTextColorPickerOpen(false);
    });
  }

  async function handleResetCustomPaperTheme() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await resetPaperThemeToPreset();
    setCustomPaperHexInput(formatHexInputDisplay(customPaperColor));
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
      setNoteBackgroundHexInput("#FFFFFF");
      setIsNoteBackgroundPickerOpen(false);
      return;
    }

    confirmAppearanceChange(t("settings.noteBackground"), async () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await updateNoteBackgroundColor("#FFFFFF");
      setIsNoteBackgroundPickerOpen(false);
    });
  }

  function renderHexColorField(params: {
    value: string;
    fallback: string;
    invalid: boolean;
    onChange: (value: string) => void;
    onBlur: () => void;
  }) {
    const normalizedPreview = isValidHexColorInput(params.value)
      ? formatHexInputDisplay(params.value)
      : formatHexInputDisplay(params.fallback);

    return (
      <View
        style={[
          styles.hexFieldCard,
          {
            backgroundColor: settingsCard,
            borderColor: params.invalid ? settingsAccent : settingsBorder,
          },
        ]}
      >
        <View style={styles.hexFieldHeader}>
          <Text style={[styles.hexFieldLabel, { color: settingsPrimaryText, fontFamily: typography.meta }]}>
            {t("settings.colorCode")}
          </Text>
          <Text style={[styles.hexFieldPreviewValue, { color: settingsTertiaryText, fontFamily: typography.meta }]}>
            {normalizedPreview}
          </Text>
        </View>
        <TextInput
          value={params.value}
          onChangeText={params.onChange}
          onBlur={params.onBlur}
          autoCapitalize="characters"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="default"
          maxLength={7}
          selectionColor={settingsAccent}
          placeholder={formatHexInputDisplay(params.fallback)}
          placeholderTextColor={settingsTertiaryText}
          style={[
            styles.hexFieldInput,
            {
              borderColor: settingsBorder,
              backgroundColor: settingsCardActive,
              color: settingsPrimaryText,
              fontFamily: typography.action,
            },
          ]}
        />
        <Text style={[styles.hexFieldHint, { color: params.invalid ? settingsAccent : settingsSecondaryText }]}>
          {params.invalid ? t("settings.colorCodeInvalid") : t("settings.colorCodeHint")}
        </Text>
      </View>
    );
  }

  function renderContrastStatus(params: {
    ratio: number;
    adjusted?: boolean;
    backgroundColor?: string;
  }) {
    const isGood = params.ratio >= 4.5;

    return (
      <View
        style={[
          styles.contrastCard,
          {
            backgroundColor: params.backgroundColor ?? settingsCardActive,
            borderColor: settingsBorder,
          },
        ]}
      >
        <View style={styles.contrastHeader}>
          <Text style={[styles.contrastBadge, { color: isGood ? settingsAccent : settingsSecondaryText, fontFamily: typography.meta }]}>
            {isGood ? "✓" : "!"}
          </Text>
          <Text style={[styles.contrastTitle, { color: settingsPrimaryText, fontFamily: typography.body }]}>
            {isGood ? t("settings.contrastGood") : t("settings.contrastLow")}
          </Text>
          <Text style={[styles.contrastRatio, { color: settingsSecondaryText, fontFamily: typography.meta }]}>
            {params.ratio.toFixed(1)}:1
          </Text>
        </View>
        {params.adjusted ? (
          <Text style={[styles.contrastHint, { color: settingsSecondaryText }]}>
            {t("settings.contrastAdjusted")}
          </Text>
        ) : null}
      </View>
    );
  }

  function renderSettingsGroup(
    group: PrivateSettingsGroupId,
    title: string,
    children: React.ReactNode,
  ) {
    const expanded = expandedPrivateGroup === group;
    const locked = !hasPrivateSettingsAccess;
    const progress = privateGroupProgress[group];
    const rotate = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "90deg"],
    });
    const accentOpacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.42],
    });

    return (
      <View
        style={[
          styles.settingsGroup,
          {
            backgroundColor: locked
              ? isLightMode
                ? "#F1EBE3"
                : colors.surfaceMuted
              : settingsCard,
            borderColor: locked
              ? isLightMode
                ? "rgba(160, 124, 91, 0.18)"
                : colors.borderStrong
              : expanded
                ? settingsAccent
                : settingsBorder,
            shadowOpacity: locked ? 0.035 : 0.02,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded, disabled: locked }}
          onPress={() => togglePrivateGroup(group)}
          style={({ pressed }) => [
            styles.settingsGroupHeader,
            locked ? styles.settingsGroupHeaderLocked : null,
            pressed && styles.languageRowPressed,
          ]}
        >
          <View style={styles.settingsGroupTitleWrap}>
            {locked ? (
              <View style={[styles.lockedPremiumBadge, { backgroundColor: isLightMode ? "rgba(160, 124, 91, 0.1)" : "rgba(196, 163, 122, 0.12)" }]}>
                <Text style={[styles.lockedPremiumBadgeLabel, { color: settingsAccent, fontFamily: typography.meta }]}>
                  {premiumLabel()}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.settingsGroupTitle, { color: settingsPrimaryText, fontFamily: typography.display }]}>
              {title}
            </Text>
            {locked ? (
              <Text style={[styles.settingsGroupLockHint, { color: settingsSecondaryText, fontFamily: typography.body }]}>
                {t("settings.privateSettingsLockedHint")}
              </Text>
            ) : null}
            <Animated.View
              style={[
                styles.settingsGroupAccent,
                {
                  backgroundColor: settingsAccent,
                  opacity: locked ? 0.16 : accentOpacity,
                },
              ]}
            />
          </View>
          {locked ? null : (
            <Animated.Text
              style={[
                styles.settingsGroupChevron,
                {
                  color: settingsAccent,
                  fontFamily: typography.meta,
                  transform: [{ rotate }],
                },
              ]}
            >
              ›
            </Animated.Text>
          )}
        </Pressable>
        {!locked && expanded ? <View style={styles.settingsGroupContent}>{children}</View> : null}
      </View>
    );
  }

  function appearancePresetNoteLabel(
    note: (typeof APPEARANCE_PRESETS)[number]["note"] | undefined,
  ) {
    switch (note) {
      case "balanced":
        return t("settings.colorStylePresetTagBalanced");
      case "warm-calm":
        return t("settings.colorStylePresetTagWarmCalm");
      case "readable":
        return t("settings.colorStylePresetTagReadable");
      case "quiet":
        return t("settings.colorStylePresetTagQuiet");
      case "recommended":
      default:
        return t("settings.colorStylePresetTagRecommended");
    }
  }

  function resolveHarmonyHint() {
    const background = parseHexColor(appBackgroundDraftPreviewColor);
    const paper = parseHexColor(customPaperDraftPreviewColor);

    if (!background || !paper) {
      return t("settings.colorStyleAdvancedBody");
    }

    const backgroundBrightness = (background.red + background.green + background.blue) / 3;
    const paperBrightness = (paper.red + paper.green + paper.blue) / 3;
    const distance = Math.abs(backgroundBrightness - paperBrightness);

    if (distance < 10) {
      return t("settings.colorStylePresetTagReadable");
    }

    if (paper.red >= paper.blue && paper.green >= paper.blue) {
      return t("settings.colorStylePresetTagWarmCalm");
    }

    return t("settings.colorStylePresetTagBalanced");
  }

  function renderAppearancePreviewCard(params: {
    appBackground: string;
    paper: string;
    text: string;
    label?: string;
    elevated?: boolean;
  }) {
    return (
      <View
        style={[
          styles.appearancePreviewCard,
          {
            backgroundColor: params.appBackground,
            borderColor: settingsBorder,
          },
        ]}
      >
        <View
          style={[
            styles.appearancePreviewPaper,
            params.elevated ? styles.appearancePreviewPaperElevated : null,
            {
              backgroundColor: params.paper,
              borderColor: "rgba(120, 90, 60, 0.12)",
            },
          ]}
        >
          <View style={styles.appearancePreviewPaperHeader}>
            <Text style={[styles.appearancePreviewEyebrow, { color: params.text, fontFamily: typography.meta }]}>
              {params.label ?? t("settings.colorStylePreview")}
            </Text>
            <View style={[styles.appearancePreviewDot, { backgroundColor: params.text, opacity: 0.18 }]} />
          </View>
          <View style={styles.appearancePreviewTextRows}>
            <View style={[styles.appearancePreviewTextShort, { backgroundColor: params.text }]} />
            <View style={[styles.appearancePreviewTextLong, { backgroundColor: params.text, opacity: 0.74 }]} />
            <View style={[styles.appearancePreviewTextMedium, { backgroundColor: params.text, opacity: 0.54 }]} />
          </View>
        </View>
      </View>
    );
  }

  function renderPrivateSettingsContent() {
    return (
      <>
        {renderSettingsGroup(
          "appearance",
          t("settings.groupAppearance"),
          <>
            <SettingsAccordionItem
              title={t("settings.colorStyle")}
              expanded={expandedPrivateItem === "color-style"}
              onPress={() => togglePrivateItem("color-style")}
            >
              <View style={styles.colorStyleIntro}>
                <Text style={[styles.colorStyleEyebrow, { color: settingsAccent, fontFamily: typography.meta }]}>
                  {t("settings.privateSettingsTitle")}
                </Text>
                <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>{t("settings.colorStyleBody")}</Text>
              </View>
              <SegmentedControl
                options={[
                  { label: t("settings.colorStyleDefault"), value: "default" },
                  { label: t("settings.colorStylePresets"), value: "preset" },
                  { label: t("settings.colorStyleCustom"), value: "custom" },
                ]}
                value={appearanceMode}
                variant="editorial"
                onChange={(next) => {
                  handleSelectAppearanceMode(next).catch((error) => {
                    console.warn("Failed to switch appearance mode", error);
                  });
                }}
              />

              <View
                style={[
                  styles.appearanceHeroCard,
                  {
                    backgroundColor: settingsCard,
                    borderColor: settingsBorder,
                  },
                ]}
              >
                <View style={styles.appearanceHeroHeader}>
                  <View style={styles.appearanceHeroCopy}>
                    <Text style={[styles.appearanceHeroTitle, { color: settingsPrimaryText, fontFamily: typography.display }]}>
                      {t("settings.colorStylePreview")}
                    </Text>
                    <Text style={[styles.appearanceHeroMeta, { color: settingsSecondaryText, fontFamily: typography.meta }]}>
                      {appearanceMode === "default"
                        ? t("settings.colorStyleDefault")
                        : appearanceMode === "preset"
                          ? appearancePresetMeta(selectedAppearancePreset.id).title
                          : t("settings.colorStyleCustom")}
                    </Text>
                    <Text style={[styles.appearanceHeroBody, { color: settingsSecondaryText }]}>
                      {appearanceMode === "default"
                        ? t("settings.colorStyleDefaultBody")
                        : appearanceMode === "preset"
                          ? appearancePresetMeta(selectedAppearancePreset.id).description
                          : t("settings.colorStyleCustomBody")}
                    </Text>
                  </View>
                </View>
                {renderAppearancePreviewCard({
                  appBackground:
                    appearanceMode === "preset"
                      ? selectedAppearancePreset.appBackground
                      : appearanceMode === "custom"
                        ? appBackgroundDraftPreviewColor
                        : "#FFFFFF",
                  paper:
                    appearanceMode === "preset"
                      ? selectedAppearancePreset.paper
                      : appearanceMode === "custom"
                        ? customPaperDraftPreviewColor
                        : getQuietPaperColor("#F6EFE5"),
                  text:
                    appearanceMode === "preset"
                      ? selectedAppearancePreset.text
                      : appearanceMode === "custom"
                        ? textContrastPreview.color
                        : colors.primaryText,
                  elevated: true,
                })}
              </View>

              {appearanceMode === "default" ? (
                <View
                  style={[
                    styles.recommendedCard,
                    {
                      backgroundColor: settingsCardActive,
                      borderColor: settingsAccent,
                    },
                  ]}
                >
                  <View style={styles.recommendedHeader}>
                    <View style={styles.recommendedCopy}>
                      <Text style={[styles.recommendedEyebrow, { color: settingsAccent, fontFamily: typography.meta }]}>
                        {t("settings.colorStylePresetTagRecommended")}
                      </Text>
                      <Text style={[styles.recommendedTitle, { color: settingsPrimaryText, fontFamily: typography.display }]}>
                        {t("settings.colorStyleDefault")}
                      </Text>
                      <Text style={[styles.recommendedBody, { color: settingsSecondaryText }]}>
                        {t("settings.colorStyleDefaultBody")}
                      </Text>
                    </View>
                    <Text style={[styles.recommendedTag, { color: settingsAccent, fontFamily: typography.meta }]}>
                      {currentLabel()}
                    </Text>
                  </View>
                  {renderAppearancePreviewCard({
                    appBackground: "#FFFFFF",
                    paper: getQuietPaperColor("#F6EFE5"),
                    text: colors.primaryText,
                    elevated: true,
                  })}
                </View>
              ) : null}

              {appearanceMode === "preset" || !canCustomizeAppearance ? (
                <View style={styles.appearancePresetGrid}>
                  {APPEARANCE_PRESETS.map((preset) => (
                    <PremiumPreviewCard
                      key={preset.id}
                      onPress={() => {
                        handleSelectAppearancePreset(preset.id).catch((error) => {
                          console.warn("Failed to apply appearance preset", error);
                        });
                      }}
                      title={appearancePresetMeta(preset.id).title}
                      description={appearancePresetMeta(preset.id).description}
                      current={appearanceMode === "preset" && selectedAppearancePresetId === preset.id}
                      radioSelected={appearanceMode === "preset" && selectedAppearancePresetId === preset.id}
                      currentLabel={currentLabel()}
                      badge={appearancePresetNoteLabel(preset.note)}
                      locked={!canCustomizeAppearance}
                      preview={renderAppearancePreviewCard({
                        appBackground: preset.appBackground,
                        paper: preset.paper,
                        text: preset.text,
                        elevated: appearanceMode === "preset" && selectedAppearancePresetId === preset.id,
                      })}
                    />
                  ))}
                </View>
              ) : null}

              {appearanceMode === "custom" ? (
                <View style={styles.innerGroup}>
                  <View
                    style={[
                      styles.appearanceGuidanceCard,
                      {
                        backgroundColor: settingsCardActive,
                        borderColor: settingsBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.appearanceGuidanceEyebrow, { color: settingsAccent, fontFamily: typography.meta }]}>
                      {t("settings.colorStyleCustom")}
                    </Text>
                    <Text style={[styles.appearanceGuidanceTitle, { color: settingsPrimaryText, fontFamily: typography.display }]}>
                      {t("settings.colorStyleAdvancedTitle")}
                    </Text>
                    <Text style={[styles.appearanceGuidanceBody, { color: settingsSecondaryText }]}>
                      {t("settings.colorStyleAdvancedBody")}
                    </Text>
                    <Text style={[styles.appearanceGuidanceHint, { color: settingsAccent, fontFamily: typography.meta }]}>
                      {resolveHarmonyHint()}
                    </Text>
                  </View>

                  <PremiumPreviewCard
                    onPress={openAppBackgroundPicker}
                    title={t("settings.appBackground")}
                    description={t("settings.appBackgroundBody")}
                    currentLabel={currentLabel()}
                    badge="RGB + HEX"
                    current
                    radioSelected
                    preview={renderAppearancePreviewCard({
                      appBackground: appBackgroundPreviewColor,
                      paper: activePaperPreviewColor,
                      text: activeTextPreviewColor,
                      label: t("settings.appBackgroundSurfaceLabel"),
                      elevated: true,
                    })}
                  />

                  <PremiumPreviewCard
                    onPress={openCustomPaperPicker}
                    title={t("settings.customPaperTheme")}
                    description={t("settings.customPaperThemeBody")}
                    currentLabel={currentLabel()}
                    badge="RGB + HEX"
                    current={isCustomPaperActive}
                    radioSelected={isCustomPaperActive}
                    preview={renderAppearancePreviewCard({
                      appBackground: appBackgroundPreviewColor,
                      paper: customPaperPreviewColor,
                      text: activeTextPreviewColor,
                      elevated: true,
                    })}
                  />

                  <PremiumPreviewCard
                    onPress={openTextColorPicker}
                    title={t("settings.textColor")}
                    description={t("settings.textColorBody")}
                    currentLabel={currentLabel()}
                    badge="RGB + HEX"
                    current={textColorMode === "custom"}
                    radioSelected={textColorMode === "custom"}
                    preview={renderAppearancePreviewCard({
                      appBackground: appBackgroundPreviewColor,
                      paper: activePaperPreviewColor,
                      text: textColorMode === "custom" ? customTextColor : colors.primaryText,
                      elevated: true,
                    })}
                  />
                </View>
              ) : null}

              {!canCustomizeAppearance ? (
                <UpgradeCard
                  title={personalizationPrompt.title}
                  body={personalizationPrompt.body}
                  actionLabel={personalizationPrompt.cta}
                  onPress={() => {
                    void markPremiumPromptOpened("personalization");
                    navigation.navigate("Membership");
                  }}
                />
              ) : null}
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.noteBackground")}
              expanded={expandedPrivateItem === "note-background"}
              onPress={() => togglePrivateItem("note-background")}
            >
              <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>{t("settings.noteBackgroundBody")}</Text>
              <PremiumPreviewCard
                onPress={openNoteBackgroundPicker}
                title={t("settings.noteBackground")}
                description={t("settings.noteBackgroundBody")}
                swatch={noteBackgroundPreviewColor}
                currentLabel={currentLabel()}
                badge={premiumLabel()}
                locked={!hasPremiumPaperColors}
              />
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.typographyStyles")}
              expanded={expandedPrivateItem === "typography"}
              onPress={() => togglePrivateItem("typography")}
            >
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
                  badge={preset.availability === "included" ? t("settings.included") : premiumLabel()}
                  locked={isPackageLocked(hasPremiumTypography, preset.availability)}
                />
              ))}
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.pageStyles")}
              expanded={expandedPrivateItem === "page-styles"}
              onPress={() => togglePrivateItem("page-styles")}
            >
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
                  badge={preset.availability === "included" ? t("settings.included") : premiumLabel()}
                  locked={isPackageLocked(hasPremiumLayouts, preset.availability)}
                />
              ))}
            </SettingsAccordionItem>
          </>,
        )}

        {renderSettingsGroup(
          "collection-order",
          t("settings.groupCollectionOrder"),
          <SettingsAccordionItem
            title={t("settings.premiumCollectionsTitle")}
            expanded={expandedPrivateItem === "thought-library"}
            onPress={() => togglePrivateItem("thought-library")}
          >
            <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
              {t("settings.premiumCollectionsBody")}
            </Text>
            <PremiumPreviewCard
              onPress={() => {
                if (membership.hasFeature("personal-collections")) {
                  navigation.navigate("Collections");
                  return;
                }

                navigation.navigate("Membership");
              }}
              title={t("settings.premiumCollectionsTitle")}
              description={t("settings.premiumCollectionsBody")}
              badge={membership.hasFeature("personal-collections") ? currentLabel() : premiumLabel()}
              current={membership.hasFeature("personal-collections")}
              locked={!membership.hasFeature("personal-collections")}
              showSelectionIndicator={false}
              preview={renderAppearancePreviewCard({
                appBackground: colors.appBackground,
                paper: colors.paperSurface,
                text: colors.primaryText,
                label: t("collections.title"),
                elevated: true,
              })}
            />
          </SettingsAccordionItem>,
        )}

        {renderSettingsGroup(
          "language-content",
          t("settings.groupLanguageContent"),
            <SettingsAccordionItem
              title={t("settings.quoteLanguages")}
              expanded={expandedPrivateItem === "quote-languages"}
              onPress={() => togglePrivateItem("quote-languages")}
            >
              <View style={styles.innerGroup}>
                <SettingsSubsectionHeading
                  title={t("settings.quoteLanguages")}
                  value={getOfficialLanguageDisplayLabel(currentReflectionLanguage?.code ?? "en")}
                />
                <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>{reflectionSectionBody}</Text>
                <View
                  style={[
                    styles.languageRow,
                    {
                      backgroundColor: settingsCardActive,
                      borderColor: settingsAccent,
                    },
                  ]}
                >
                  <View style={styles.languageCopy}>
                  <Text
                    style={[
                      styles.languageName,
                        {
                          color: settingsPrimaryText,
                          fontFamily: typography.display,
                          writingDirection: getLanguageDirection(currentReflectionLanguage?.code ?? "en"),
                        },
                      ]}
                    >
                      {getOfficialLanguageDisplayLabel(currentReflectionLanguage?.code ?? "en")}
                    </Text>
                    <Text style={[styles.languageMeta, { color: settingsSecondaryText, fontFamily: typography.body }]}>
                      {reflectionFollowsApp
                        ? t("settings.reflectionLanguageFollowsApp")
                        : selectedReflectionLanguageOptions.map((language) => getOfficialLanguageDisplayLabel(language?.code ?? "en")).join(" · ")}
                    </Text>
                    <Text style={[styles.languageSupportText, { color: settingsTertiaryText }]}>
                      {reflectionLanguageHint}
                    </Text>
                  </View>
                  <View style={styles.languageTagStack}>
                    <Text style={[styles.currentTag, { color: settingsAccent, fontFamily: typography.meta }]}>
                      {reflectionFollowsApp ? t("settings.quoteLanguagesAppTag") : t("settings.quoteLanguagesSelectedTag")}
                    </Text>
                    {!canChooseReflectionLanguage ? (
                      <Text style={[styles.languageSecondaryTag, { color: settingsSecondaryText, fontFamily: typography.meta }]}>
                        {premiumLabel()}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {!canChooseReflectionLanguage ? (
                  <>
                    <Text style={[styles.languageSectionNote, { color: settingsSecondaryText }]}>
                      {t("settings.quoteLanguagesLockedBody")}
                    </Text>
                    <UpgradeCard
                      title={personalizationPrompt.title}
                      body={personalizationPrompt.body}
                      actionLabel={personalizationPrompt.cta}
                      onPress={() => {
                        void markPremiumPromptOpened("personalization");
                        navigation.navigate("Membership");
                      }}
                    />
                  </>
                ) : (
                  <>
                    <SegmentedControl
                      options={[
                        { label: t("settings.reflectionLanguageSameAsApp"), value: "same_as_app" },
                        { label: t("settings.reflectionLanguageCustom"), value: "custom" },
                      ]}
                      value={appState.reflectionLanguageMode}
                      onChange={(nextMode) => {
                        handleSelectReflectionLanguageMode(nextMode as "same_as_app" | "custom").catch((error) => {
                          console.warn("Failed to update reflection language mode", error);
                        });
                      }}
                    />

                    {appState.reflectionLanguageMode === "custom" ? (
                      <>
                        <Text style={[styles.languageSectionNote, { color: settingsSecondaryText }]}>
                          {t("settings.quoteLanguagesSelectMultiple")}
                        </Text>
                        <Text style={[styles.languageSupportLabel, { color: settingsTertiaryText, fontFamily: typography.meta }]}>
                          {t("settings.quoteLanguagesSelectedLanguages")}
                        </Text>
                        <View style={styles.languageChipList}>
                          {availableReflectionLanguages.map((language) => {
                            const selected = appState.reflectionLanguages.includes(language.code);
                            return (
                              <Pressable
                                key={language.code}
                                onPress={() => {
                                  handleReflectionLanguageToggle(language.code).catch((error) => {
                                    console.warn("Failed to update reflection languages", error);
                                  });
                                }}
                                style={({ pressed }) => [
                                  styles.languageChip,
                                  {
                                    backgroundColor: selected ? settingsCardActive : settingsCard,
                                    borderColor: selected ? settingsAccent : settingsBorder,
                                  },
                                  pressed ? styles.languageRowPressed : null,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.languageChipLabel,
                                    {
                                      color: selected ? settingsPrimaryText : settingsSecondaryText,
                                      fontFamily: typography.meta,
                                    },
                                  ]}
                                >
                                  {getOfficialLanguageDisplayLabel(language.code)}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                        <Text style={[styles.languageSectionNote, { color: settingsTertiaryText }]}>
                          {t("settings.quoteLanguagesFallbackBody")}
                        </Text>
                      </>
                    ) : (
                      <Text style={[styles.languageSectionNote, { color: settingsSecondaryText }]}>
                        {t("settings.quoteLanguagesCurrentHintSameAsApp")}
                      </Text>
                    )}
                  </>
                )}
              </View>
          </SettingsAccordionItem>,
        )}

        {renderSettingsGroup(
          "collection-sharing",
          t("settings.groupCollectionSharing"),
          <SettingsAccordionItem
            title={t("settings.exportSavedReflections")}
            expanded={expandedPrivateItem === "email-export"}
            onPress={() => togglePrivateItem("email-export")}
          >
          <Text style={[styles.blockBody, styles.exportBody, { color: settingsSecondaryText }]}>
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
                  borderColor: settingsBorder,
                  backgroundColor: settingsCard,
                },
                pressed && styles.languageRowPressed,
              ]}
            >
              <Text style={[styles.exportActionLabel, { color: settingsPrimaryText, fontFamily: typography.action }]}>
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
                    borderColor: settingsBorder,
                    backgroundColor: settingsCard,
                  },
                  pressed && styles.languageRowPressed,
                ]}
              >
                <Text style={[styles.exportActionLabel, { color: settingsPrimaryText, fontFamily: typography.action }]}>
                  {t("settings.exportPdfAction")}
                </Text>
              </Pressable>
            ) : null}
          </View>
          </SettingsAccordionItem>,
        )}

        {!hasPrivateSettingsAccess ? (
          <UpgradeCard
            title={personalizationPrompt.title}
            body={personalizationPrompt.body}
            actionLabel={personalizationPrompt.cta}
            onPress={() => {
              void markPremiumPromptOpened("personalization");
              navigation.navigate("Membership");
            }}
          />
        ) : null}
      </>
    );
  }

  return (
    <ScreenContainer
      scroll
      contentContainerStyle={[styles.screenContent, { backgroundColor: settingsBackground }]}
    >
      <EditorialHeader
        eyebrow={t("settings.eyebrow")}
      />

      <View style={styles.stack}>
        <View>
          <AccordionSection
            title={t("settings.standardSectionTitle")}
            expanded={expandedSection === "standard"}
            onPress={() => toggleSection("standard")}
            variant="standard"
            style={styles.standardSection}
          >
            <SettingsAccordionItem
              title={t("settings.notificationTime")}
              expanded={expandedStandardItem === "notification-time"}
              onPress={() => toggleStandardItem("notification-time")}
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
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.deliveryRitual")}
              expanded={expandedStandardItem === "ritual-delivery"}
              onPress={() => toggleStandardItem("ritual-delivery")}
            >
              <View style={styles.innerGroup}>
                <SettingsSubsectionHeading title={t("settings.deliveryRitual")} />
                <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
                  {t("settings.deliveryRitualBody")}
                </Text>

                <View style={styles.themeRow}>
                  <View style={styles.themeCopy}>
                    <SettingsSubsectionHeading title={t("settings.notificationsEnabled")} />
                    <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
                      {t("settings.notificationsEnabledBody")}
                    </Text>
                  </View>
                  <Switch
                    value={appState.preferences.notificationsEnabled}
                    onValueChange={(value) => {
                      updateNotificationDeliveryPreferences({ notificationsEnabled: value });
                    }}
                    trackColor={{ true: settingsAccent, false: settingsBorder }}
                  />
                </View>

                <View style={styles.themeRow}>
                  <View style={styles.themeCopy}>
                    <SettingsSubsectionHeading title={t("settings.soundEnabled")} />
                    <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
                      {t("settings.soundEnabledBody")}
                    </Text>
                  </View>
                  <Switch
                    value={appState.preferences.soundEnabled && !appState.preferences.silentMode}
                    onValueChange={(value) => {
                      updateNotificationDeliveryPreferences({ soundEnabled: value, silentMode: value ? false : undefined });
                    }}
                    disabled={!appState.preferences.notificationsEnabled || appState.preferences.silentMode}
                    trackColor={{ true: settingsAccent, false: settingsBorder }}
                  />
                </View>

                <View style={styles.themeRow}>
                  <View style={styles.themeCopy}>
                    <SettingsSubsectionHeading title={t("settings.hapticsEnabled")} />
                    <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
                      {t("settings.hapticsEnabledBody")}
                    </Text>
                  </View>
                  <Switch
                    value={appState.preferences.hapticsEnabled && !appState.preferences.silentMode}
                    onValueChange={(value) => {
                      updateNotificationDeliveryPreferences({ hapticsEnabled: value, silentMode: value ? false : undefined });
                    }}
                    disabled={appState.preferences.silentMode}
                    trackColor={{ true: settingsAccent, false: settingsBorder }}
                  />
                </View>

                <View style={styles.themeRow}>
                  <View style={styles.themeCopy}>
                    <SettingsSubsectionHeading title={t("settings.silentMode")} />
                    <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
                      {t("settings.silentModeBody")}
                    </Text>
                  </View>
                  <Switch
                    value={appState.preferences.silentMode}
                    onValueChange={(value) => {
                      updateNotificationDeliveryPreferences({ silentMode: value });
                    }}
                    trackColor={{ true: settingsAccent, false: settingsBorder }}
                  />
                </View>
              </View>
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.preferredCategories")}
              expanded={expandedStandardItem === "categories"}
              onPress={() => toggleStandardItem("categories")}
            >
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
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.darkMode")}
              expanded={expandedStandardItem === "dark-mode"}
              onPress={() => toggleStandardItem("dark-mode")}
            >
              <View style={styles.innerGroup}>
                <View style={styles.themeRow}>
                  <View style={styles.themeCopy}>
                    <SettingsSubsectionHeading title={t("settings.darkMode")} />
                    <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
                      {t("settings.darkModeBody")}
                    </Text>
                  </View>
                  <Switch
                    value={appState.preferences.theme === "dark"}
                    onValueChange={toggleTheme}
                    trackColor={{ true: settingsAccent, false: settingsBorder }}
                  />
                </View>
              </View>
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.language")}
              expanded={expandedStandardItem === "language"}
              onPress={() => toggleStandardItem("language")}
            >
              <View style={styles.innerGroup}>
                <SettingsSubsectionHeading
                  title={t("settings.language")}
                  value={getOfficialLanguageDisplayLabel(currentLanguage?.code ?? "en")}
                />
                <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>{t("settings.languageBody")}</Text>
                {currentLanguage ? (
                  <Pressable
                    onPress={openLanguageSearch}
                    style={({ pressed }) => [
                      styles.languageRow,
                      {
                        backgroundColor: settingsCardActive,
                        borderColor: settingsAccent,
                      },
                      pressed && styles.languageRowPressed,
                    ]}
                  >
                    <View style={styles.languageCopy}>
                      <Text style={[styles.languageName, { color: settingsPrimaryText, fontFamily: typography.display }]}>
                        {getOfficialLanguageDisplayLabel(currentLanguage.code)}
                      </Text>
                      <Text style={[styles.languageMeta, { color: settingsSecondaryText, fontFamily: typography.body }]}>
                        {languageOptionLabel(currentLanguage.code)}
                      </Text>
                      <Text style={[styles.languageSupportText, { color: settingsTertiaryText }]}>
                        {t("settings.languageCurrentHint")}
                      </Text>
                    </View>
                    <Text style={[styles.currentTag, { color: settingsAccent, fontFamily: typography.meta }]}>
                      {currentLabel()}
                    </Text>
                  </Pressable>
                ) : null}
                <View
                  style={[
                    styles.searchInputWrap,
                    {
                      backgroundColor: settingsCard,
                      borderColor: settingsBorder,
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
                    placeholder={t("settings.languageSearchPlaceholder")}
                    placeholderTextColor={settingsTertiaryText}
                    style={[
                      styles.searchInput,
                      {
                        color: settingsPrimaryText,
                        fontFamily: typography.body,
                      },
                    ]}
                  />
                  {isLanguageSearchActive && languageQuery.length ? (
                    <Pressable onPress={closeLanguageSearch} hitSlop={6}>
                      <Text style={[styles.clearSearch, { color: settingsTertiaryText, fontFamily: typography.meta }]}>
                        {t("common.cancel")}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
                {isLanguageSearchActive ? (
                  <View style={styles.languageList}>
                    {visibleLanguageOptions.slice(0, 20).map((language) => (
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
                            backgroundColor: settingsCard,
                            borderColor: settingsBorder,
                          },
                          pressed && styles.languageRowPressed,
                        ]}
                      >
                        <View style={styles.languageCopy}>
                          <Text
                            style={[
                              styles.languageName,
                              {
                                color: settingsPrimaryText,
                                fontFamily: typography.display,
                                writingDirection: getLanguageDirection(language.code),
                              },
                            ]}
                          >
                            {getOfficialLanguageDisplayLabel(language.code)}
                          </Text>
                          <Text style={[styles.languageMeta, { color: settingsSecondaryText, fontFamily: typography.body }]}>
                            {languageOptionLabel(language.code)}
                          </Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            </SettingsAccordionItem>

            <SettingsAccordionItem
              title={t("settings.resetTitle")}
              expanded={expandedStandardItem === "reset"}
              onPress={() => toggleStandardItem("reset")}
            >
              <View style={styles.innerGroup}>
                <SettingsSubsectionHeading
                  title={t("settings.resetTitle")}
                  onPress={handleReset}
                  danger
                />
              </View>
            </SettingsAccordionItem>
          </AccordionSection>
        </View>

        <View>
          <AccordionSection
            title={t("settings.privateSettingsTitle")}
            expanded={expandedSection === "private"}
            onPress={() => toggleSection("private")}
            variant="private"
            style={styles.privateSection}
          >
            {renderPrivateSettingsContent()}
          </AccordionSection>
        </View>

        <View>
          <AccordionSection
            title={t("settings.mySubscription")}
            summary={activePlanMeta.summary}
            expanded={expandedSection === "premium"}
            onPress={() => toggleSection("premium")}
            variant="premium"
            style={styles.premiumSection}
          >
            <View style={styles.innerGroup}>
              <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
                {t("settings.premiumBody")}
              </Text>
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
          </AccordionSection>
        </View>

        <View>
          <AccordionSection
            title={aboutTitle()}
            expanded={expandedSection === "about"}
            onPress={() => toggleSection("about")}
            variant="about"
            style={styles.aboutSection}
          >
            <View style={styles.aboutBlock}>
              <Text style={[styles.aboutBody, { color: settingsSecondaryText }]}>{aboutBody()}</Text>
              <Text style={[styles.aboutCreator, { color: settingsTertiaryText }]}>{aboutCreator()}</Text>
            </View>
          </AccordionSection>
        </View>

      </View>
      <Modal
        visible={isAppBackgroundPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeAppBackgroundPicker}
      >
        <View style={[styles.modalBackdrop, styles.sheetBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <KeyboardAvoidingView
            style={styles.sheetKeyboardFrame}
            behavior={Platform.select({ ios: "padding", android: "height" })}
          >
            <View style={[styles.appBackgroundSheetCard, { backgroundColor: settingsCard, borderColor: settingsBorder }]}>
              <View style={[styles.sheetHandle, { backgroundColor: settingsBorder }]} />
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              >
                <SettingsSubsectionHeading title={t("settings.appBackground")} />
                <Text style={[styles.blockBody, styles.sheetLead, { color: settingsSecondaryText }]}>
                  {t("settings.appBackgroundBody")}
                </Text>

                <View
                  style={[
                    styles.customPaperPreview,
                    styles.appBackgroundPreviewStage,
                    styles.appBackgroundPreviewStageCompact,
                    {
                      backgroundColor: appBackgroundDraftPreviewColor,
                      borderColor: isDefaultAppBackgroundDraft ? "rgba(160, 124, 91, 0.22)" : settingsBorder,
                    },
                  ]}
                >
                  <View style={styles.appBackgroundPreviewHeader}>
                    <Text style={[styles.customPaperPreviewTitle, { color: settingsPrimaryText, fontFamily: typography.display }]}>
                      {t("settings.appBackgroundPreview")}
                    </Text>
                    <Text style={[styles.customPaperPreviewValue, { color: settingsSecondaryText }]}>
                      {appBackgroundDraft}
                    </Text>
                  </View>
                  <View style={styles.appBackgroundPreviewScene}>
                    <View
                      style={[
                        styles.appBackgroundPreviewPaper,
                        styles.appBackgroundPreviewPaperCompact,
                        {
                          backgroundColor: activePaperPreviewColor,
                          borderColor: "rgba(120, 90, 60, 0.12)",
                        },
                      ]}
                    >
                      <View style={[styles.appBackgroundPreviewDate, { backgroundColor: "rgba(120, 90, 60, 0.1)" }]} />
                      <View style={styles.appBackgroundPreviewLines}>
                        <View style={[styles.appBackgroundPreviewLine, { backgroundColor: "rgba(120, 90, 60, 0.08)" }]} />
                        <View style={[styles.appBackgroundPreviewLineLong, { backgroundColor: "rgba(120, 90, 60, 0.08)" }]} />
                      </View>
                    </View>
                  </View>
                </View>

                {textColorMode === "custom"
                  ? renderContrastStatus({
                      ratio: appBackgroundRawContrast,
                      adjusted: appBackgroundContrastPreview.adjusted,
                    })
                  : null}

                {renderHexColorField({
                  value: appBackgroundHexInput,
                  fallback: "#FFFFFF",
                  invalid: isAppBackgroundHexInvalid,
                  onChange: (value) => updateHexDraft(value, setAppBackgroundHexInput, setAppBackgroundDraft),
                  onBlur: () => normalizeHexDraftField(appBackgroundHexInput, appBackgroundDraft, setAppBackgroundHexInput),
                })}

                <View
                  style={[
                    styles.sliderPanel,
                    styles.sheetSliderPanel,
                    {
                      backgroundColor: settingsCardActive,
                      borderColor: settingsBorder,
                    },
                  ]}
                >
                  <Text style={[styles.sliderPanelBody, { color: settingsSecondaryText }]}>
                    {isDefaultAppBackgroundDraft ? t("settings.appBackgroundDefaultBody") : t("settings.appBackgroundBody")}
                  </Text>
                  <View style={styles.sliderStack}>
                    {([
                      ["red", t("settings.customPaperRed"), appBackgroundRgb.red, colors.clay],
                      ["green", t("settings.customPaperGreen"), appBackgroundRgb.green, colors.sage],
                      ["blue", t("settings.customPaperBlue"), appBackgroundRgb.blue, colors.blueGray],
                    ] as const).map(([channel, label, value, tint]) => (
                      <View key={channel} style={styles.sliderRow}>
                        <View style={styles.sliderHeader}>
                          <Text style={[styles.sliderLabel, { color: settingsPrimaryText, fontFamily: typography.body }]}>{label}</Text>
                          <Text style={[styles.sliderValue, { color: settingsSecondaryText }]}>{value}</Text>
                        </View>
                        <Slider
                          minimumValue={0}
                          maximumValue={255}
                          step={1}
                          value={value}
                          minimumTrackTintColor={tint}
                          maximumTrackTintColor={settingsBorder}
                          thumbTintColor={settingsAccent}
                          onValueChange={(nextValue) => {
                            updateAppBackgroundChannel(channel, nextValue);
                          }}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View
                style={[
                  styles.sheetFooter,
                  {
                    backgroundColor: settingsCard,
                    borderTopColor: settingsBorder,
                    paddingBottom: Math.max(insets.bottom, 14),
                  },
                ]}
              >
                <Pressable
                  onPress={() => {
                    handleResetAppBackgroundColor().catch((error) => {
                      console.warn("Failed to reset app background color", error);
                    });
                  }}
                  style={({ pressed }) => [
                    styles.sheetActionButton,
                    styles.sheetActionSecondary,
                    {
                      backgroundColor: settingsCardActive,
                      borderColor: settingsBorder,
                    },
                    pressed && styles.languageRowPressed,
                  ]}
                >
                  <Text style={[styles.sheetActionLabel, { color: settingsSecondaryText, fontFamily: typography.action }]}>
                    {t("settings.appBackgroundReset")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    handleApplyAppBackgroundColor().catch((error) => {
                      console.warn("Failed to apply app background color", error);
                    });
                  }}
                  style={({ pressed }) => [
                    styles.sheetActionButton,
                    styles.sheetActionPrimary,
                    {
                      backgroundColor: settingsAccent,
                      borderColor: settingsAccent,
                    },
                    pressed && styles.languageRowPressed,
                  ]}
                >
                  <Text style={[styles.sheetActionLabel, { color: "#FFF9F2", fontFamily: typography.action }]}>
                    {t("common.continue")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal
        visible={isTextColorPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeTextColorPicker}
      >
        <View style={[styles.modalBackdrop, styles.sheetBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <KeyboardAvoidingView
            style={styles.sheetKeyboardFrame}
            behavior={Platform.select({ ios: "padding", android: "height" })}
          >
            <View style={[styles.appBackgroundSheetCard, { backgroundColor: settingsCard, borderColor: settingsBorder }]}>
              <View style={[styles.sheetHandle, { backgroundColor: settingsBorder }]} />
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              >
                <SettingsSubsectionHeading title={t("settings.textColor")} />
                <Text style={[styles.blockBody, styles.sheetLead, { color: settingsSecondaryText }]}>
                  {t("settings.textColorBody")}
                </Text>

                <View
                  style={[
                    styles.customPaperPreview,
                    {
                      backgroundColor: activePaperPreviewColor,
                      borderColor: settingsBorder,
                    },
                  ]}
                >
                  <View style={styles.appBackgroundPreviewHeader}>
                    <Text style={[styles.customPaperPreviewTitle, { color: textContrastPreview.color, fontFamily: typography.display }]}>
                      {t("settings.textColorPreview")}
                    </Text>
                    <Text style={[styles.customPaperPreviewValue, { color: settingsSecondaryText }]}>
                      {textContrastPreview.color}
                    </Text>
                  </View>
                  <Text style={[styles.appBackgroundPreviewBody, { color: textContrastPreview.color }]}>
                    {t("settings.textColorCustomBody")}
                  </Text>
                  <Text style={[styles.textColorPreviewMeta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                    {t("settings.textColorBody")}
                  </Text>
                </View>

                {renderContrastStatus({
                  ratio: textDraftRawContrast,
                  adjusted: textContrastPreview.adjusted,
                  backgroundColor: settingsCardActive,
                })}

                {renderHexColorField({
                  value: textColorHexInput,
                  fallback: customTextColor,
                  invalid: isTextColorHexInvalid,
                  onChange: (value) => updateHexDraft(value, setTextColorHexInput, setTextColorDraft),
                  onBlur: () => normalizeHexDraftField(textColorHexInput, textColorDraft, setTextColorHexInput),
                })}

                <View
                  style={[
                    styles.sliderPanel,
                    styles.sheetSliderPanel,
                    {
                      backgroundColor: settingsCardActive,
                      borderColor: settingsBorder,
                    },
                  ]}
                >
                  <Text style={[styles.sliderPanelBody, { color: settingsSecondaryText }]}>
                    {t("settings.textColorCustomBody")}
                  </Text>
                  <View style={styles.sliderStack}>
                    {([
                      ["red", t("settings.customPaperRed"), textColorRgb.red, colors.clay],
                      ["green", t("settings.customPaperGreen"), textColorRgb.green, colors.sage],
                      ["blue", t("settings.customPaperBlue"), textColorRgb.blue, colors.blueGray],
                    ] as const).map(([channel, label, value, tint]) => (
                      <View key={channel} style={styles.sliderRow}>
                        <View style={styles.sliderHeader}>
                          <Text style={[styles.sliderLabel, { color: settingsPrimaryText, fontFamily: typography.body }]}>{label}</Text>
                          <Text style={[styles.sliderValue, { color: settingsSecondaryText }]}>{value}</Text>
                        </View>
                        <Slider
                          minimumValue={0}
                          maximumValue={255}
                          step={1}
                          value={value}
                          minimumTrackTintColor={tint}
                          maximumTrackTintColor={settingsBorder}
                          thumbTintColor={settingsAccent}
                          onValueChange={(nextValue) => {
                            updateTextColorChannel(channel, nextValue);
                          }}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View
                style={[
                  styles.sheetFooter,
                  {
                    backgroundColor: settingsCard,
                    borderTopColor: settingsBorder,
                    paddingBottom: Math.max(insets.bottom, 14),
                  },
                ]}
              >
                <Pressable
                  onPress={() => {
                    handleResetTextColor().catch((error) => {
                      console.warn("Failed to reset text color mode", error);
                    });
                  }}
                  style={({ pressed }) => [
                    styles.sheetActionButton,
                    styles.sheetActionSecondary,
                    {
                      backgroundColor: settingsCardActive,
                      borderColor: settingsBorder,
                    },
                    pressed && styles.languageRowPressed,
                  ]}
                >
                  <Text style={[styles.sheetActionLabel, { color: settingsSecondaryText, fontFamily: typography.action }]}>
                    {t("settings.textColorReset")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    handleApplyTextColor().catch((error) => {
                      console.warn("Failed to apply text color", error);
                    });
                  }}
                  style={({ pressed }) => [
                    styles.sheetActionButton,
                    styles.sheetActionPrimary,
                    {
                      backgroundColor: settingsAccent,
                      borderColor: settingsAccent,
                    },
                    pressed && styles.languageRowPressed,
                  ]}
                >
                  <Text style={[styles.sheetActionLabel, { color: "#FFF9F2", fontFamily: typography.action }]}>
                    {t("common.continue")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      <Modal
        visible={isCustomPaperPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeCustomPaperPicker}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <View style={[styles.modalCard, { backgroundColor: settingsCard, borderColor: settingsBorder }]}>
            <SettingsSubsectionHeading title={t("settings.customPaperTheme")} />
            <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
              {t("settings.customPaperThemePickerBody")}
            </Text>

            <View
              style={[
                styles.customPaperPreview,
                { backgroundColor: customPaperDraftPreviewColor, borderColor: settingsBorder },
              ]}
            >
              <Text style={[styles.customPaperPreviewTitle, { color: settingsPrimaryText, fontFamily: typography.display }]}>
                {t("settings.customPaperThemePreview")}
              </Text>
              <Text style={[styles.customPaperPreviewValue, { color: settingsSecondaryText }]}>
                {customPaperDraft}
              </Text>
            </View>

            {textColorMode === "custom"
              ? renderContrastStatus({
                  ratio: paperRawContrast,
                  adjusted: paperContrastPreview.adjusted,
                })
              : null}

            {renderHexColorField({
              value: customPaperHexInput,
              fallback: customPaperDraft,
              invalid: isCustomPaperHexInvalid,
              onChange: (value) => updateHexDraft(value, setCustomPaperHexInput, setCustomPaperDraft),
              onBlur: () => normalizeHexDraftField(customPaperHexInput, customPaperDraft, setCustomPaperHexInput),
            })}

            <View style={styles.sliderStack}>
              {([
                ["red", t("settings.customPaperRed"), customPaperRgb.red, colors.clay],
                ["green", t("settings.customPaperGreen"), customPaperRgb.green, colors.sage],
                ["blue", t("settings.customPaperBlue"), customPaperRgb.blue, colors.blueGray],
              ] as const).map(([channel, label, value, tint]) => (
                <View key={channel} style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: settingsPrimaryText, fontFamily: typography.body }]}>{label}</Text>
                    <Text style={[styles.sliderValue, { color: settingsSecondaryText }]}>{value}</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={value}
                    minimumTrackTintColor={tint}
                    maximumTrackTintColor={settingsBorder}
                    thumbTintColor={settingsAccent}
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
                <Text style={[styles.modalActionText, { color: settingsSecondaryText, fontFamily: typography.action }]}>
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
                <Text style={[styles.modalActionText, { color: settingsPrimaryText, fontFamily: typography.action }]}>
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
          <View style={[styles.modalCard, { backgroundColor: settingsCard, borderColor: settingsBorder }]}>
            <SettingsSubsectionHeading title={t("settings.noteBackground")} />
            <Text style={[styles.blockBody, { color: settingsSecondaryText }]}>
              {t("settings.noteBackgroundBody")}
            </Text>

            <View
              style={[
                styles.customPaperPreview,
                { backgroundColor: noteBackgroundDraftPreviewColor, borderColor: settingsBorder },
              ]}
            >
              <Text style={[styles.customPaperPreviewTitle, { color: settingsPrimaryText, fontFamily: typography.display }]}>
                {t("settings.noteBackgroundPreview")}
              </Text>
              <Text style={[styles.customPaperPreviewValue, { color: settingsSecondaryText }]}>
                {noteBackgroundDraft}
              </Text>
            </View>

            {renderHexColorField({
              value: noteBackgroundHexInput,
              fallback: "#FFFFFF",
              invalid: isNoteBackgroundHexInvalid,
              onChange: (value) => updateHexDraft(value, setNoteBackgroundHexInput, setNoteBackgroundDraft),
              onBlur: () => normalizeHexDraftField(noteBackgroundHexInput, noteBackgroundDraft, setNoteBackgroundHexInput),
            })}

            <View style={styles.sliderStack}>
              {([
                ["red", t("settings.customPaperRed"), noteBackgroundRgb.red, colors.clay],
                ["green", t("settings.customPaperGreen"), noteBackgroundRgb.green, colors.sage],
                ["blue", t("settings.customPaperBlue"), noteBackgroundRgb.blue, colors.blueGray],
              ] as const).map(([channel, label, value, tint]) => (
                <View key={channel} style={styles.sliderRow}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: settingsPrimaryText, fontFamily: typography.body }]}>{label}</Text>
                    <Text style={[styles.sliderValue, { color: settingsSecondaryText }]}>{value}</Text>
                  </View>
                  <Slider
                    minimumValue={0}
                    maximumValue={255}
                    step={1}
                    value={value}
                    minimumTrackTintColor={tint}
                    maximumTrackTintColor={settingsBorder}
                    thumbTintColor={settingsAccent}
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
                <Text style={[styles.modalActionText, { color: settingsSecondaryText, fontFamily: typography.action }]}>
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
                <Text style={[styles.modalActionText, { color: settingsPrimaryText, fontFamily: typography.action }]}>
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
  screenContent: {
    paddingTop: 22,
    paddingBottom: 28,
  },
  stack: {
    gap: 32,
    marginBottom: 24,
  },
  standardSection: {
    marginBottom: 2,
  },
  privateSection: {
    marginTop: 6,
  },
  premiumSection: {
    marginTop: 18,
  },
  aboutSection: {
    marginTop: 8,
  },
  innerGroup: {
    gap: 18,
  },
  settingsGroup: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
    gap: 0,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.02,
    shadowRadius: 14,
    elevation: 1,
  },
  settingsGroupHeader: {
    minHeight: 66,
    paddingVertical: 16,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  settingsGroupHeaderLocked: {
    paddingRight: 8,
  },
  settingsGroupTitleWrap: {
    flex: 1,
    gap: 12,
  },
  lockedPremiumBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: -2,
  },
  lockedPremiumBadgeLabel: {
    fontSize: 11,
    lineHeight: 13,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  settingsGroupTitle: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  settingsGroupLockHint: {
    fontSize: 13,
    lineHeight: 19,
    width: "100%",
  },
  settingsGroupAccent: {
    height: 1.5,
    width: 34,
    borderRadius: 999,
  },
  settingsGroupChevron: {
    fontSize: 14,
    lineHeight: 14,
    width: 18,
    textAlign: "center",
  },
  settingsGroupContent: {
    gap: 16,
    paddingTop: 4,
    paddingBottom: 14,
  },
  colorStyleIntro: {
    gap: 10,
  },
  colorStyleEyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.25,
  },
  appearancePresetGrid: {
    gap: 16,
  },
  appearanceHeroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    gap: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.035,
    shadowRadius: 18,
    elevation: 2,
  },
  appearanceHeroHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  appearanceHeroCopy: {
    width: "100%",
    gap: 6,
  },
  appearanceHeroTitle: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.24,
  },
  appearanceHeroBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  appearanceHeroMeta: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    lineHeight: 16,
  },
  appearancePreviewCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  appearancePreviewPaper: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 16,
    gap: 13,
  },
  appearancePreviewPaperElevated: {
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  appearancePreviewPaperHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  appearancePreviewEyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.15,
  },
  appearancePreviewDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  appearancePreviewTextRows: {
    gap: 9,
  },
  appearancePreviewTextShort: {
    height: 8,
    width: "44%",
    borderRadius: 999,
  },
  appearancePreviewTextMedium: {
    height: 8,
    width: "58%",
    borderRadius: 999,
  },
  appearancePreviewTextLong: {
    height: 8,
    width: "80%",
    borderRadius: 999,
  },
  recommendedCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.035,
    shadowRadius: 18,
    elevation: 2,
  },
  recommendedHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
  },
  recommendedCopy: {
    width: "100%",
    gap: 6,
  },
  recommendedEyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.25,
  },
  recommendedTitle: {
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: 0.2,
  },
  recommendedBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  recommendedTag: {
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  appearanceGuidanceCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 10,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },
  appearanceGuidanceEyebrow: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  appearanceGuidanceTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  appearanceGuidanceBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  appearanceGuidanceHint: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  blockTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  blockBody: {
    fontSize: 14,
    lineHeight: 24,
  },
  exportBody: {
    marginLeft: 18,
  },
  exportActionStack: {
    marginLeft: 18,
    gap: 12,
    alignItems: "flex-start",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  themeCopy: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  searchInputWrap: {
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
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
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  languageRowPressed: {
    opacity: 0.92,
  },
  languageCopy: {
    width: "100%",
    gap: 4,
  },
  languageName: {
    fontSize: 18,
    lineHeight: 25,
  },
  languageMeta: {
    fontSize: 13,
    lineHeight: 20,
  },
  languageSupportText: {
    fontSize: 12,
    lineHeight: 18,
  },
  currentTag: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  languageSecondaryTag: {
    fontSize: 10,
    lineHeight: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  languageTagStack: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
    gap: 6,
  },
  languageSectionNote: {
    fontSize: 13,
    lineHeight: 21,
  },
  languageSupportLabel: {
    fontSize: 11,
    lineHeight: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  languageChipList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  languageChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  languageChipLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  exportActionRow: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 15,
    alignSelf: "flex-start",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.025,
    shadowRadius: 10,
    elevation: 1,
  },
  exportActionLabel: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  sheetBackdrop: {
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 0,
  },
  sheetKeyboardFrame: {
    width: "100%",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    gap: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
    elevation: 2,
  },
  appBackgroundSheetCard: {
    borderWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    maxHeight: "88%",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    marginTop: 12,
    marginBottom: 6,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 14,
  },
  sheetLead: {
    marginTop: -2,
  },
  customPaperPreview: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 6,
  },
  customPaperPreviewTitle: {
    fontSize: 16,
    letterSpacing: 0.2,
  },
  customPaperPreviewValue: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  appBackgroundCardPreview: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  appBackgroundCardPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  appBackgroundCardPreviewEyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  appBackgroundCardPreviewHex: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  appBackgroundPaperSheet: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  appBackgroundPaperHeaderLine: {
    height: 7,
    width: 42,
    borderRadius: 999,
  },
  appBackgroundPaperRows: {
    gap: 8,
  },
  appBackgroundPaperRow: {
    height: 7,
    width: "72%",
    borderRadius: 999,
  },
  appBackgroundPaperRowShort: {
    height: 7,
    width: "46%",
    borderRadius: 999,
  },
  textColorCardPreview: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textPreviewLines: {
    gap: 10,
  },
  textPreviewLine: {
    height: 8,
    width: "46%",
    borderRadius: 999,
  },
  textPreviewLineLong: {
    height: 8,
    width: "78%",
    borderRadius: 999,
  },
  contrastCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  contrastHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contrastBadge: {
    width: 14,
    fontSize: 12,
    lineHeight: 12,
    textAlign: "center",
  },
  contrastTitle: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  contrastRatio: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  contrastHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  appBackgroundPreviewStage: {
    paddingVertical: 18,
    gap: 10,
  },
  appBackgroundPreviewStageCompact: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  appBackgroundPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  appBackgroundPreviewBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  textColorPreviewMeta: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  appBackgroundPreviewScene: {
    paddingTop: 6,
    paddingBottom: 2,
  },
  appBackgroundPreviewPaper: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    gap: 14,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  appBackgroundPreviewPaperCompact: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  appBackgroundPreviewDate: {
    width: 54,
    height: 22,
    borderRadius: 12,
  },
  appBackgroundPreviewLines: {
    gap: 10,
  },
  appBackgroundPreviewLine: {
    height: 8,
    width: "62%",
    borderRadius: 999,
  },
  appBackgroundPreviewLineLong: {
    height: 8,
    width: "84%",
    borderRadius: 999,
  },
  sliderPanel: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  sheetSliderPanel: {
    paddingVertical: 16,
    gap: 12,
  },
  sliderPanelBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  hexFieldCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 17,
    gap: 10,
  },
  hexFieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  hexFieldLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  hexFieldPreviewValue: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  hexFieldInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(120, 90, 60, 0.12)",
    backgroundColor: "rgba(255,255,255,0.32)",
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.8,
  },
  hexFieldHint: {
    fontSize: 12,
    lineHeight: 19,
  },
  sheetFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  sheetActionButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetActionSecondary: {
    flex: 1.15,
  },
  sheetActionPrimary: {
    flex: 0.85,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  sheetActionLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  sliderStack: {
    gap: 14,
  },
  sliderRow: {
    gap: 6,
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  aboutBlock: {
    gap: 14,
    paddingRight: 8,
  },
  aboutBody: {
    fontSize: 15,
    lineHeight: 24,
  },
  aboutCreator: {
    fontSize: 13,
    lineHeight: 21,
  },
});

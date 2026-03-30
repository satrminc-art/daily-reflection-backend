import { getLanguageOption, getOfficialLanguageDisplayLabel, resolveLocale } from "@/localization/languages";
import { MembershipFeatureCategoryId, MembershipFeatureId } from "@/constants/premiumFeatures";
import { AppearancePresetId, AppBackgroundPresetId, PageStylePresetId, PaperThemePresetId, TypographyPresetId } from "@/theme/presets";
import {
  OnboardingPreference,
  ReflectionCategory,
  ReflectionTone,
  SupportedLanguage,
} from "@/types/reflection";

export type TranslationKey =
  | "tabs.today"
  | "tabs.archive"
  | "tabs.favorites"
  | "tabs.settings"
  | "common.continue"
  | "common.continueWithoutName"
  | "common.notNow"
  | "common.allowNotifications"
  | "common.preparing"
  | "common.searchLanguage"
  | "common.cancel"
  | "common.reset"
  | "common.refresh"
  | "onboarding.arrivalBody"
  | "onboarding.arrivalAction"
  | "onboarding.welcomeTitle"
  | "onboarding.welcomeBody"
  | "onboarding.welcomeHero"
  | "onboarding.welcomeLineOne"
  | "onboarding.welcomeLineTwo"
  | "onboarding.welcomeLineThree"
  | "onboarding.languageTitle"
  | "onboarding.languageBody"
  | "onboarding.languageSearchPlaceholder"
  | "onboarding.nameTitle"
  | "onboarding.nameBody"
  | "onboarding.namePlaceholder"
  | "onboarding.ackBody"
  | "onboarding.ackCard"
  | "onboarding.preferenceTitle"
  | "onboarding.preferenceBody"
  | "onboarding.preferenceHint"
  | "onboarding.transitionTitle"
  | "onboarding.transitionBody"
  | "onboarding.transitionAction"
  | "onboarding.introTitle"
  | "onboarding.introBody"
  | "onboarding.introAction"
  | "onboarding.choiceTitle"
  | "onboarding.choiceBody"
  | "onboarding.choiceFreeTitle"
  | "onboarding.choiceFreeBody"
  | "onboarding.choiceFreeAction"
  | "onboarding.finishFreeAction"
  | "onboarding.choicePremiumTitle"
  | "onboarding.choicePremiumBody"
  | "onboarding.choicePremiumAction"
  | "onboarding.finishAction"
  | "onboarding.notificationTimeTitle"
  | "onboarding.notificationTimeBody"
  | "onboarding.ritualTimeTitle"
  | "onboarding.ritualTimeBody"
  | "onboarding.ritualTimeHint"
  | "onboarding.ritualTimeMorningTitle"
  | "onboarding.ritualTimeMorningBody"
  | "onboarding.ritualTimeMiddayTitle"
  | "onboarding.ritualTimeMiddayBody"
  | "onboarding.ritualTimeEveningTitle"
  | "onboarding.ritualTimeEveningBody"
  | "onboarding.ritualTimeLateTitle"
  | "onboarding.ritualTimeLateBody"
  | "onboarding.ritualTimeCustomTitle"
  | "onboarding.ritualTimeCustomBody"
  | "onboarding.notificationPermissionTitle"
  | "onboarding.notificationPermissionBody"
  | "onboarding.membershipBenefitKeep"
  | "onboarding.membershipBenefitCollections"
  | "onboarding.membershipBenefitStyle"
  | "onboarding.membershipBenefitNotes"
  | "today.eyebrow"
  | "today.title"
  | "today.defaultSubtitle"
  | "today.keep"
  | "today.kept"
  | "today.share"
  | "today.shareDialogTitle"
  | "today.shareFallbackMessage"
  | "today.shareUnavailableTitle"
  | "today.shareUnavailableBody"
  | "today.helper"
  | "today.noteTitle"
  | "today.notePlaceholder"
  | "today.saveLimitTitle"
  | "today.saveLimitBody"
  | "today.noteLockedBody"
  | "today.noteLimitHint"
  | "today.followUpAction"
  | "today.followUpLoading"
  | "today.followUpTitle"
  | "today.followUpError"
  | "today.followUpLimitBody"
  | "today.swipeHint"
  | "today.tomorrowHint"
  | "today.preparing"
  | "today.notificationEntryLine"
  | "today.lateOpenTitle"
  | "today.lateOpenBody"
  | "today.lateOpenPrimary"
  | "today.lateOpenSecondary"
  | "reflection.title"
  | "reflection.unavailable"
  | "settings.eyebrow"
  | "settings.title"
  | "settings.subtitle"
  | "settings.standardSectionTitle"
  | "settings.standardSectionSummary"
  | "settings.freemiumSectionSummary"
  | "settings.premiumSectionSummary"
  | "settings.plansSectionTitle"
  | "settings.plansSectionSummary"
  | "settings.notificationTime"
  | "settings.deliveryRitual"
  | "settings.deliveryRitualBody"
  | "settings.notificationsEnabled"
  | "settings.notificationsEnabledBody"
  | "settings.soundEnabled"
  | "settings.soundEnabledBody"
  | "settings.hapticsEnabled"
  | "settings.hapticsEnabledBody"
  | "settings.silentMode"
  | "settings.silentModeBody"
  | "settings.preferredCategories"
  | "settings.language"
  | "settings.languageBody"
  | "settings.languageCurrentHint"
  | "settings.languageSearchPlaceholder"
  | "settings.quoteLanguages"
  | "settings.quoteLanguagesBody"
  | "settings.quoteLanguagesPremiumBody"
  | "settings.quoteLanguagesLockedBody"
  | "settings.quoteLanguagesCurrentHintSameAsApp"
  | "settings.quoteLanguagesCurrentHintCustom"
  | "settings.quoteLanguagesFallbackBody"
  | "settings.quoteLanguagesSearchPlaceholder"
  | "settings.quoteLanguagesSelectMultiple"
  | "settings.quoteLanguagesSelectedLanguages"
  | "settings.quoteLanguagesSelectedTag"
  | "settings.quoteLanguagesAppTag"
  | "settings.reflectionLanguageSameAsApp"
  | "settings.reflectionLanguageCustom"
  | "settings.reflectionLanguageFollowsApp"
  | "settings.privateSettingsTitle"
  | "settings.privateSettingsLockedBody"
  | "settings.privateSettingsLockedHint"
  | "settings.privateSettingsUnlockAction"
  | "settings.groupAppearance"
  | "settings.groupCollectionOrder"
  | "settings.groupLanguageContent"
  | "settings.groupCollectionSharing"
  | "settings.groupPremium"
  | "settings.mySubscription"
  | "settings.exportAction"
  | "settings.exportSavedReflections"
  | "settings.exportSavedReflectionsSubject"
  | "settings.exportSavedReflectionsFallbackTitle"
  | "settings.exportSavedReflectionsBody"
  | "settings.exportPdfAction"
  | "settings.exportPdfFallbackTitle"
  | "settings.exportPdfFilePrefix"
  | "settings.exportCollectionTitle"
  | "settings.exportCollectionSubtitle"
  | "settings.exportCollectionCount"
  | "settings.exportReflectionLabel"
  | "settings.exportCategoryLabel"
  | "settings.exportLanguageLabel"
  | "settings.exportSourceLabel"
  | "settings.exportDateLabel"
  | "settings.exportExportedOnLabel"
  | "settings.exportDetailsLabel"
  | "settings.exportFilePrefix"
  | "settings.exportEmailIntro"
  | "settings.exportEmptyTitle"
  | "settings.exportEmptyMessage"
  | "settings.darkMode"
  | "settings.darkModeBody"
  | "settings.premiumTitle"
  | "settings.premiumBody"
  | "settings.premiumCollectionsTitle"
  | "settings.premiumCollectionsBody"
  | "settings.subscriptionStatus"
  | "settings.restorePurchases"
  | "settings.manageSubscription"
  | "settings.manageSubscriptionBody"
  | "settings.restoreSuccessTitle"
  | "settings.restoreSuccessBody"
  | "settings.restoreErrorTitle"
  | "settings.restoreErrorBody"
  | "settings.upgradeAction"
  | "settings.premiumPreviewTitle"
  | "settings.premiumPreviewBody"
  | "settings.colorStyle"
  | "settings.colorStyleBody"
  | "settings.colorStyleDefault"
  | "settings.colorStylePresets"
  | "settings.colorStyleCustom"
  | "settings.colorStyleDefaultBody"
  | "settings.colorStylePresetsBody"
  | "settings.colorStyleCustomBody"
  | "settings.colorStylePreview"
  | "settings.colorStyleLockedBody"
  | "settings.colorStyleAdvancedTitle"
  | "settings.colorStyleAdvancedBody"
  | "settings.colorStylePresetTagRecommended"
  | "settings.colorStylePresetTagBalanced"
  | "settings.colorStylePresetTagWarmCalm"
  | "settings.colorStylePresetTagReadable"
  | "settings.colorStylePresetTagQuiet"
  | "settings.paperThemes"
  | "settings.appBackground"
  | "settings.appBackgroundBody"
  | "settings.appBackgroundDefaultBody"
  | "settings.appBackgroundPreview"
  | "settings.appBackgroundSurfaceLabel"
  | "settings.appBackgroundReset"
  | "settings.textColor"
  | "settings.textColorBody"
  | "settings.textColorDefaultTitle"
  | "settings.textColorDefaultBody"
  | "settings.textColorCustomTitle"
  | "settings.textColorCustomBody"
  | "settings.textColorPreview"
  | "settings.textColorReset"
  | "settings.contrastGood"
  | "settings.contrastLow"
  | "settings.contrastAdjusted"
  | "settings.colorCode"
  | "settings.colorCodeHint"
  | "settings.colorCodeInvalid"
  | "settings.customPaperTheme"
  | "settings.customPaperThemeBody"
  | "settings.customPaperThemePickerBody"
  | "settings.customPaperThemePreview"
  | "settings.noteBackground"
  | "settings.noteBackgroundBody"
  | "settings.noteBackgroundPreview"
  | "settings.noteBackgroundReset"
  | "settings.customPaperRed"
  | "settings.customPaperGreen"
  | "settings.customPaperBlue"
  | "settings.customPaperReset"
  | "settings.appearanceConfirmTitle"
  | "settings.appearanceConfirmMessageLead"
  | "settings.appearanceConfirmApply"
  | "settings.typographyStyles"
  | "settings.pageStyles"
  | "settings.current"
  | "settings.aboutTitle"
  | "settings.aboutBody"
  | "settings.aboutCreator"
  | "settings.resetTitle"
  | "settings.resetBody"
  | "settings.resetButton"
  | "settings.included"
  | "settings.premium"
  | "archive.eyebrow"
  | "archive.title"
  | "archive.subtitle"
  | "archive.allReflections"
  | "archive.savedOnly"
  | "archive.searchPlaceholder"
  | "archive.premiumTitle"
  | "archive.premiumMessage"
  | "archive.emptyTitle"
  | "archive.emptyMessage"
  | "archive.noMatchTitle"
  | "archive.noMatchMessage"
  | "favorites.eyebrow"
  | "favorites.title"
  | "favorites.subtitle"
  | "favorites.emptyTitle"
  | "favorites.emptyMessage"
  | "favorites.noMatchTitle"
  | "favorites.noMatchMessage"
  | "favorites.keepAction"
  | "favorites.removeAction"
  | "favorites.deleteConfirmTitle"
  | "favorites.deleteConfirmMessage"
  | "favorites.searchPlaceholder"
  | "favorites.premiumTitle"
  | "favorites.premiumMessage"
  | "favorites.collectionsUpgradeTitle"
  | "favorites.collectionsUpgradeBody"
  | "favorites.collectionsUpgradeAction"
  | "favorites.savedCountLinePrefix"
  | "favorites.savedCountLineSuffix"
  | "collections.eyebrow"
  | "collections.title"
  | "collections.subtitle"
  | "collections.emptyTitle"
  | "collections.emptyMessage"
  | "collections.newAction"
  | "collections.createTitle"
  | "collections.createBody"
  | "collections.nameLabel"
  | "collections.descriptionLabel"
  | "collections.saveAction"
  | "collections.addAction"
  | "collections.addToPersonalCollectionsAction"
  | "collections.addHint"
  | "collections.addedTitle"
  | "collections.addedBody"
  | "collections.renameAction"
  | "collections.deleteAction"
  | "collections.deleteConfirmTitle"
  | "collections.deleteConfirmMessage"
  | "collections.countLabel"
  | "collections.detailEmptyTitle"
  | "collections.detailEmptyMessage"
  | "collections.removeAction"
  | "collections.removeConfirmTitle"
  | "collections.removeConfirmMessage"
  | "collections.lockedTitle"
  | "collections.lockedBody"
  | "collections.heroTitle"
  | "collections.heroBody"
  | "collections.emptyHeroTitle"
  | "collections.emptyHeroBody"
  | "collections.pagesSingle"
  | "collections.pagesPlural"
  | "collections.lastUpdatedPrefix"
  | "collections.editBody"
  | "collections.addSheetTitle"
  | "collections.addSheetBody"
  | "collections.addedNotice"
  | "list.saved"
  | "membership.eyebrow"
  | "membership.title"
  | "membership.subtitle"
  | "membership.heroLine"
  | "membership.premiumIncludedTitle"
  | "membership.premiumCardLine"
  | "membership.premiumCardBody"
  | "membership.lifelongCardLine"
  | "membership.lifelongCardBody"
  | "membership.lifelongCardNote"
  | "membership.freemiumMiniTitle"
  | "membership.freemiumMiniBody"
  | "membership.freeAction"
  | "membership.currentPlanCta"
  | "membership.includedWithLifelong"
  | "membership.postReflectionInviteTitle"
  | "membership.postReflectionInviteBody"
  | "membership.postReflectionInviteAction"
  | "membership.afterSaveUpgradeTitle"
  | "membership.afterSaveUpgradeBody"
  | "membership.dayThreeUpgradeTitle"
  | "membership.dayThreeUpgradeBody"
  | "membership.daySevenUpgradeTitle"
  | "membership.daySevenUpgradeBody"
  | "membership.gentleUpgradeTitle"
  | "membership.gentleUpgradeBody"
  | "membership.gentleUpgradeAction"
  | "membership.upgradeNotificationTitle"
  | "membership.upgradeNotificationBody"
  | "preview.title"
  | "preview.subtitle"
  | "preview.primaryAction"
  | "preview.secondaryAction"
  | "preview.loading"
  | "membership.anchorStay"
  | "membership.bestValue"
  | "membership.benefitKeepClose"
  | "membership.benefitWriteFreely"
  | "membership.benefitMoveMorePersonally"
  | "membership.benefitSavePages"
  | "membership.benefitCollections"
  | "membership.benefitStyle"
  | "membership.benefitUnlimited"
  | "membership.benefitNothingLost"
  | "membership.trialLineOne"
  | "membership.trialLineTwo"
  | "membership.socialProof"
  | "membership.valueGroupSpace"
  | "membership.valueGroupClarity"
  | "membership.valueGroupExpression"
  | "membership.valueSpaceOne"
  | "membership.valueSpaceTwo"
  | "membership.valueClarityOne"
  | "membership.valueClarityTwo"
  | "membership.valueExpressionOne"
  | "membership.valueExpressionTwo"
  | "membership.unlockAction"
  | "membership.openMembership"
  | "membership.lockedArchiveTitle"
  | "membership.lockedArchiveBody"
  | "membership.lockedSavedTitle"
  | "membership.lockedSavedBody"
  | "membership.stateTitle"
  | "membership.errorTitle"
  | "membership.errorBody"
  | "membership.lockedFeatureFootnote"
  | "membership.lifelongBadge"
  | "membership.planFreemium"
  | "membership.planPremium"
  | "membership.planLifelong"
  | "membership.choosePremium"
  | "membership.chooseLifelong"
  | "membership.switchToPremium"
  | "membership.unlockLifelong"
  | "membership.purchasePlaceholderTitle"
  | "membership.purchasePlaceholderBody"
  | "membership.purchaseSuccessTitle"
  | "membership.purchaseSuccessPremium"
  | "membership.purchaseSuccessLifelong"
  | "membership.purchaseErrorTitle"
  | "membership.purchaseErrorBody"
  | "membership.restoreSuccessTitle"
  | "membership.restoreSuccessBody"
  | "membership.restoreErrorTitle"
  | "membership.restoreErrorBody";

export type Messages = Record<TranslationKey, string>;
type SupportedTranslationLanguage = "en" | "de" | "pt-BR" | "fr" | "es";

export const englishMessages: Messages = {
  "tabs.today": "Today",
  "tabs.archive": "Archive",
  "tabs.favorites": "Favorites",
  "tabs.settings": "Settings",
  "common.continue": "Continue",
  "common.continueWithoutName": "Continue without name",
  "common.notNow": "Not now",
  "common.allowNotifications": "Allow notifications",
  "common.preparing": "Preparing...",
  "common.searchLanguage": "Search language",
  "common.cancel": "Cancel",
  "common.reset": "Reset",
  "common.refresh": "Refresh",
  "onboarding.arrivalBody": "A quiet place for the thoughts that should stay.",
  "onboarding.arrivalAction": "Begin",
  "onboarding.welcomeTitle": "Take a moment.",
  "onboarding.welcomeBody": "Some thoughts deserve more than a passing moment.",
  "onboarding.welcomeHero": "Not everything meaningful should disappear.",
  "onboarding.welcomeLineOne": "Your days are full.",
  "onboarding.welcomeLineTwo": "Your thoughts get lost in between.",
  "onboarding.welcomeLineThree": "One page a day.\nNothing more.",
  "onboarding.languageTitle": "Choose your language",
  "onboarding.languageBody": "You can change this anytime.",
  "onboarding.languageSearchPlaceholder": "Search language",
  "onboarding.nameTitle": "What should we call you?",
  "onboarding.nameBody": "This space can become more personal.",
  "onboarding.namePlaceholder": "Your name",
  "onboarding.ackBody": "This can become a space of your own.",
  "onboarding.ackCard": "One page each day. Quiet enough to notice what stays with you.",
  "onboarding.preferenceTitle": "What do you want more of?",
  "onboarding.preferenceBody": "Choose up to two things you want to orient yourself toward more often.",
  "onboarding.preferenceHint": "Choose up to two.",
  "onboarding.transitionTitle": "Let's begin.",
  "onboarding.transitionBody": "Your first page is ready.",
  "onboarding.transitionAction": "To first page",
  "onboarding.introTitle": "Your first page for today.",
  "onboarding.introBody": "Open it when you're ready.",
  "onboarding.introAction": "See first page",
  "onboarding.choiceTitle": "Make this space your own.",
  "onboarding.choiceBody": "Keep what matters close.\nShape it in the way that feels right to you.",
  "onboarding.choiceFreeTitle": "Free",
  "onboarding.choiceFreeBody": "A quiet beginning.\nOne page at a time.",
  "onboarding.choiceFreeAction": "Continue with Free",
  "onboarding.finishFreeAction": "Continue with Free",
  "onboarding.choicePremiumTitle": "Premium",
  "onboarding.choicePremiumBody": "Thoughts that matter deserve a place.\nMake this space something that truly feels like yours.",
  "onboarding.choicePremiumAction": "Start Premium",
  "onboarding.finishAction": "Open Daytri",
  "onboarding.notificationTimeTitle": "Choose the exact time.",
  "onboarding.notificationTimeBody": "Your daily page can arrive exactly when it fits.",
  "onboarding.ritualTimeTitle": "When is your moment?",
  "onboarding.ritualTimeBody": "Choose the part of the day that feels most like yours.",
  "onboarding.ritualTimeHint": "People stay more consistent when the moment truly fits their day.",
  "onboarding.ritualTimeMorningTitle": "Morning (6-9)",
  "onboarding.ritualTimeMorningBody": "Start your day with clarity",
  "onboarding.ritualTimeMiddayTitle": "Midday (11-14)",
  "onboarding.ritualTimeMiddayBody": "A short reset during your day",
  "onboarding.ritualTimeEveningTitle": "Evening (18-21)",
  "onboarding.ritualTimeEveningBody": "Reflect on your day",
  "onboarding.ritualTimeLateTitle": "Late Evening (21-23)",
  "onboarding.ritualTimeLateBody": "A calm way to close your day",
  "onboarding.ritualTimeCustomTitle": "Choose your own time",
  "onboarding.ritualTimeCustomBody": "Set a moment that truly fits your rhythm",
  "onboarding.notificationPermissionTitle": "Let it arrive gently.",
  "onboarding.notificationPermissionBody": "Only at the time you choose.",
  "onboarding.membershipBenefitKeep": "Save pages that stay with you",
  "onboarding.membershipBenefitCollections": "Build personal collections",
  "onboarding.membershipBenefitStyle": "Shape color, type, and atmosphere",
  "onboarding.membershipBenefitNotes": "Keep notes and thoughts with more intention",
  "today.eyebrow": "Today",
  "today.title": "Today",
  "today.defaultSubtitle": "One question, kept still for the day.",
  "today.keep": "Keep this",
  "today.kept": "Kept.",
  "today.share": "Share",
  "today.shareDialogTitle": "Share reflection card",
  "today.shareFallbackMessage": "Daily Reflection",
  "today.shareUnavailableTitle": "Unable to share",
  "today.shareUnavailableBody": "The reflection card could not be shared on this device.",
  "today.helper": "You can return to this anytime.",
  "today.noteTitle": "A quiet note",
  "today.notePlaceholder": "Your thoughts on this reflection ...",
  "today.saveLimitTitle": "A smaller kept collection lives here",
  "today.saveLimitBody": "Freemium keeps up to 7 saved reflections. Remove one or open Premium for a wider personal collection.",
  "today.noteLockedBody": "Freemium keeps notes for reflections you choose to keep. Premium opens longer notes and more space around what stays with you.",
  "today.noteLimitHint": "Freemium keeps notes shorter. Premium opens longer reflection notes.",
  "today.followUpAction": "Deepen the reflection",
  "today.followUpLoading": "A quieter impulse is arriving ...",
  "today.followUpTitle": "Further prompts",
  "today.followUpError": "A further prompt could not be prepared right now.",
  "today.followUpLimitBody": "The daily AI follow-up is already in use today. Premium opens more space for additional prompts.",
  "today.swipeHint": "Swipe gently across the page to move through saved days.",
  "today.tomorrowHint": "Tomorrow brings a new page.",
  "today.preparing": "Your reflection is being prepared.",
  "today.notificationEntryLine": "Your page for today",
  "today.lateOpenTitle": "Your page is still waiting.",
  "today.lateOpenBody": "Take a quiet moment with today's page, whenever it meets you.",
  "today.lateOpenPrimary": "Open today's page",
  "today.lateOpenSecondary": "Later",
  "reflection.title": "Reflection",
  "reflection.unavailable": "Reflection unavailable.",
  "settings.eyebrow": "Settings",
  "settings.title": "Quiet preferences",
  "settings.subtitle": "Everything here stays local-first, with room for future premium personalization and remote delivery later.",
  "settings.standardSectionTitle": "Default settings",
  "settings.standardSectionSummary": "Reminder time, categories, appearance, and language.",
  "settings.freemiumSectionSummary": "Included paper, type, and page choices.",
  "settings.premiumSectionSummary": "Future premium tones, typography, and page layouts.",
  "settings.plansSectionTitle": "Subscription models",
  "settings.plansSectionSummary": "Freemium, Premium, and Lifelong.",
  "settings.notificationTime": "Notification time",
  "settings.deliveryRitual": "Delivery ritual",
  "settings.deliveryRitualBody": "How this page arrives, with as little noise as possible.",
  "settings.notificationsEnabled": "Notifications",
  "settings.notificationsEnabledBody": "Keep the daily invitation active.",
  "settings.soundEnabled": "Sound",
  "settings.soundEnabledBody": "Let the reminder arrive with a quiet sound.",
  "settings.hapticsEnabled": "Haptics",
  "settings.hapticsEnabledBody": "A subtle touch when the page opens.",
  "settings.silentMode": "Silent Mode",
  "settings.silentModeBody": "Keep delivery visible, but without sound or haptics.",
  "settings.preferredCategories": "Preferred categories",
  "settings.language": "App language",
  "settings.languageBody": "Controls the language of the interface.",
  "settings.languageCurrentHint": "Navigation, settings, buttons, labels, and dates appear in this language.",
  "settings.languageSearchPlaceholder": "Search app language",
  "settings.quoteLanguages": "Reflection language",
  "settings.quoteLanguagesBody": "By default, your daily page follows the app language.",
  "settings.quoteLanguagesPremiumBody": "Choose one or more reflection languages independently.",
  "settings.quoteLanguagesLockedBody": "Independent reflection language opens in Premium and Lifelong.",
  "settings.quoteLanguagesCurrentHintSameAsApp": "Today's, archived, and saved reflections move with the app language.",
  "settings.quoteLanguagesCurrentHintCustom": "Today's, archived, and saved reflections use this language.",
  "settings.quoteLanguagesFallbackBody": "If a reflection is not yet available in this language, it quietly falls back to English.",
  "settings.quoteLanguagesSearchPlaceholder": "Search language",
  "settings.quoteLanguagesSelectMultiple": "Choose one or more languages for your reflections.",
  "settings.quoteLanguagesSelectedLanguages": "Selected languages",
  "settings.quoteLanguagesSelectedTag": "Selected",
  "settings.quoteLanguagesAppTag": "App",
  "settings.reflectionLanguageSameAsApp": "Same as app",
  "settings.reflectionLanguageCustom": "Custom language",
  "settings.reflectionLanguageFollowsApp": "Follows the app language",
  "settings.privateSettingsTitle": "Private settings",
  "settings.privateSettingsLockedBody": "More personal control over language, background, paper style, type, and export is available in Premium and Lifelong.",
  "settings.privateSettingsLockedHint": "More personal room in Premium.",
  "settings.privateSettingsUnlockAction": "Open with Premium",
  "settings.groupAppearance": "Appearance",
  "settings.groupCollectionOrder": "Collection & Order",
  "settings.groupLanguageContent": "Language & Content",
  "settings.groupCollectionSharing": "Collection & Sharing",
  "settings.groupPremium": "My Subscription",
  "settings.mySubscription": "My Subscription",
  "settings.exportSavedReflections": "Email saved reflections",
  "settings.exportAction": "Send now",
  "settings.exportSavedReflectionsSubject": "Saved reflections",
  "settings.exportSavedReflectionsFallbackTitle": "Saved reflections",
  "settings.exportSavedReflectionsBody": "Send your kept reflections and notes together as one quiet export, or keep them as a PDF journal.",
  "settings.exportPdfAction": "Export as PDF",
  "settings.exportPdfFallbackTitle": "Saved reflections PDF",
  "settings.exportPdfFilePrefix": "saved-reflections-journal",
  "settings.exportCollectionTitle": "Saved reflections",
  "settings.exportCollectionSubtitle": "A personal collection of reflections and notes",
  "settings.exportCollectionCount": "saved reflections",
  "settings.exportReflectionLabel": "Reflection",
  "settings.exportCategoryLabel": "Category",
  "settings.exportLanguageLabel": "Language",
  "settings.exportSourceLabel": "Source",
  "settings.exportDateLabel": "Date",
  "settings.exportExportedOnLabel": "Exported on",
  "settings.exportDetailsLabel": "Details",
  "settings.exportFilePrefix": "saved-reflections",
  "settings.exportEmailIntro": "Here is your saved collection of reflections and notes.",
  "settings.exportEmptyTitle": "Nothing to export yet",
  "settings.exportEmptyMessage": "Keep a few reflections first, and they will be ready for a quiet backup.",
  "settings.darkMode": "Dark mode",
  "settings.darkModeBody": "Keep the experience warm and quiet in low light too.",
  "settings.premiumTitle": "Premium personalization",
  "settings.premiumBody": "Premium opens the quieter parts of the app that help your reflections stay close.",
  "settings.premiumCollectionsTitle": "Your thought library",
  "settings.premiumCollectionsBody": "Arrange the reflections that matter most. Create your own collection from moments you want to keep close.",
  "settings.subscriptionStatus": "Subscription status",
  "settings.restorePurchases": "Restore Purchases",
  "settings.manageSubscription": "Manage Subscription",
  "settings.manageSubscriptionBody": "Subscription management opens here as soon as your App Store connection is available.",
  "settings.restoreSuccessTitle": "Restored",
  "settings.restoreSuccessBody": "Your purchases have been checked.",
  "settings.restoreErrorTitle": "Not available",
  "settings.restoreErrorBody": "Purchases could not be restored right now.",
  "settings.upgradeAction": "View Premium",
  "settings.premiumPreviewTitle": "Premium access",
  "settings.premiumPreviewBody": "Unlock the full archive, premium paper themes, refined typography, and more personal control.",
  "settings.colorStyle": "Color style",
  "settings.colorStyleBody": "Stay with the original balance, choose a curated atmosphere, or open the advanced color layer.",
  "settings.colorStyleDefault": "Default",
  "settings.colorStylePresets": "Presets",
  "settings.colorStyleCustom": "Custom",
  "settings.colorStyleDefaultBody": "The original calm design, kept exactly as intended.",
  "settings.colorStylePresetsBody": "Curated combinations with quiet contrast and a more atmospheric page.",
  "settings.colorStyleCustomBody": "Advanced color control for background, paper, and text, with harmony protection.",
  "settings.colorStylePreview": "Current appearance",
  "settings.colorStyleLockedBody": "Curated styles and advanced color control are available in Premium and Lifelong.",
  "settings.colorStyleAdvancedTitle": "Advanced color controls",
  "settings.colorStyleAdvancedBody": "Adjust background, paper, and text separately. The app keeps combinations calm and readable.",
  "settings.colorStylePresetTagRecommended": "Recommended",
  "settings.colorStylePresetTagBalanced": "Balanced",
  "settings.colorStylePresetTagWarmCalm": "Warm & calm",
  "settings.colorStylePresetTagReadable": "Most readable",
  "settings.colorStylePresetTagQuiet": "Quiet",
  "settings.paperThemes": "Paper themes",
  "settings.appBackground": "App background",
  "settings.appBackgroundBody": "Choose the base tone in which your pages come to rest.",
  "settings.appBackgroundDefaultBody": "White keeps the app especially calm and open.",
  "settings.appBackgroundPreview": "Current app tone",
  "settings.appBackgroundSurfaceLabel": "Behind your pages",
  "settings.appBackgroundReset": "Return to white",
  "settings.textColor": "Text color",
  "settings.textColorBody": "Choose whether your typography stays in its original tone or takes on a quieter personal color.",
  "settings.textColorDefaultTitle": "Default",
  "settings.textColorDefaultBody": "Keep the app's original editorial text rhythm.",
  "settings.textColorCustomTitle": "Custom",
  "settings.textColorCustomBody": "Shape a personal reading tone for the app's main text.",
  "settings.textColorPreview": "Current text tone",
  "settings.textColorReset": "Return to default",
  "settings.contrastGood": "Good readability",
  "settings.contrastLow": "This color combination may be hard to read.",
  "settings.contrastAdjusted": "Adjusted slightly for readability.",
  "settings.colorCode": "HEX color code",
  "settings.colorCodeHint": "Type a calm color directly or continue with the sliders.",
  "settings.colorCodeInvalid": "Please enter a valid HEX color like #E9E2D8.",
  "settings.customPaperTheme": "Custom paper tone",
  "settings.customPaperThemeBody": "Shape a quieter personal paper tone and keep it across the app.",
  "settings.customPaperThemePickerBody": "Choose a softer custom paper color. The app keeps the tone muted and readable while you adjust it.",
  "settings.customPaperThemePreview": "Current paper tone",
  "settings.noteBackground": "Note background",
  "settings.noteBackgroundBody": "Keep the quiet note bright by default or choose a softer personal tone just for the note field.",
  "settings.noteBackgroundPreview": "Current note tone",
  "settings.noteBackgroundReset": "Return to white",
  "settings.customPaperRed": "Red",
  "settings.customPaperGreen": "Green",
  "settings.customPaperBlue": "Blue",
  "settings.customPaperReset": "Return to preset paper colors",
  "settings.appearanceConfirmTitle": "Apply this style?",
  "settings.appearanceConfirmMessageLead": "Do you want to switch to",
  "settings.appearanceConfirmApply": "Apply",
  "settings.typographyStyles": "Typography styles",
  "settings.pageStyles": "Page styles",
  "settings.current": "Current",
  "settings.aboutTitle": "About",
  "settings.aboutBody": "A quiet place for one thoughtful page each day, designed to slow the pace just enough for reflection.",
  "settings.aboutCreator": "Created with care as a small personal space for attention, calm, and honest perspective.",
  "settings.resetTitle": "Reset local data",
  "settings.resetBody": "This will clear onboarding, favorites, archive selections, and preferences.",
  "settings.resetButton": "Reset local data",
  "settings.included": "Included",
  "settings.premium": "Premium",
  "archive.eyebrow": "Archive",
  "archive.title": "A quiet record of previous pages.",
  "archive.subtitle": "Browse dated reflections with the same gentle, paper-led atmosphere as today's page.",
  "archive.allReflections": "All reflections",
  "archive.savedOnly": "Saved only",
  "archive.searchPlaceholder": "Search by feeling, category, or phrase",
  "archive.premiumTitle": "A fuller archive lives in Premium",
  "archive.premiumMessage": "The free tier keeps a smaller recent archive. Premium opens the full dated library, search, and filters.",
  "archive.emptyTitle": "No pages match yet",
  "archive.emptyMessage": "Try a broader category, clear the search, or keep a few reflections to build a softer archive.",
  "archive.noMatchTitle": "Nothing matches this view",
  "archive.noMatchMessage": "Try a softer search, another category, or return to all reflections.",
  "favorites.eyebrow": "Favorites",
  "favorites.title": "Kept pages",
  "favorites.subtitle": "A smaller personal stack of reflections that stayed with you enough to keep.",
  "favorites.emptyTitle": "No kept pages yet",
  "favorites.emptyMessage": "Keep a reflection from today or the archive to begin a quieter personal collection.",
  "favorites.noMatchTitle": "Nothing matches your collection view",
  "favorites.noMatchMessage": "Try another phrase or clear the category to return to your kept pages.",
  "favorites.keepAction": "Keep this",
  "favorites.removeAction": "Remove from kept pages",
  "favorites.deleteConfirmTitle": "Remove kept reflection?",
  "favorites.deleteConfirmMessage": "This removes it from your kept collection. Notes stay with the dated page if it still exists in your archive.",
  "favorites.searchPlaceholder": "Search kept reflections",
  "favorites.premiumTitle": "A wider kept collection lives in Premium",
  "favorites.premiumMessage": "Freemium keeps a smaller stack. Premium opens unlimited kept pages, search, export, and personal collections.",
  "favorites.collectionsUpgradeTitle": "Your thoughts deserve order",
  "favorites.collectionsUpgradeBody": "Create personal collections and keep what truly matters.",
  "favorites.collectionsUpgradeAction": "Unlock collections",
  "favorites.savedCountLinePrefix": "You already saved",
  "favorites.savedCountLineSuffix": "thoughts",
  "collections.eyebrow": "Collections",
  "collections.title": "Personal collections",
  "collections.subtitle": "Shape quieter shelves for the reflections you chose to keep.",
  "collections.emptyTitle": "No collections yet",
  "collections.emptyMessage": "Start a first collection to gather saved reflections around a quieter theme.",
  "collections.newAction": "New collection",
  "collections.createTitle": "Create collection",
  "collections.createBody": "Give this collection a title and, if you like, a brief note about what it holds.",
  "collections.nameLabel": "Title",
  "collections.descriptionLabel": "Description",
  "collections.saveAction": "Save collection",
  "collections.addAction": "Add to collection",
  "collections.addToPersonalCollectionsAction": "To personal collections",
  "collections.addHint": "Choose a collection for this kept reflection, or begin a new one.",
  "collections.addedTitle": "Added",
  "collections.addedBody": "The reflection has been placed in your collection.",
  "collections.renameAction": "Rename collection",
  "collections.deleteAction": "Delete collection",
  "collections.deleteConfirmTitle": "Delete collection?",
  "collections.deleteConfirmMessage": "The collection will disappear, but the reflections themselves will remain in your kept pages.",
  "collections.countLabel": "saved reflections",
  "collections.detailEmptyTitle": "This collection is still quiet",
  "collections.detailEmptyMessage": "Add a kept reflection to give this collection its first page.",
  "collections.removeAction": "Remove from collection",
  "collections.removeConfirmTitle": "Remove reflection?",
  "collections.removeConfirmMessage": "This removes it only from this collection. It stays in your kept pages.",
  "collections.lockedTitle": "Personal collections live in Premium",
  "collections.lockedBody": "Premium and Lifelong let you shape your saved reflections into personal collections.",
  "collections.heroTitle": "Your thought library",
  "collections.heroBody": "Arrange thoughts you want to keep in personal collections.",
  "collections.emptyHeroTitle": "Your first collection",
  "collections.emptyHeroBody": "Here you gather pages that should remain. Create your first collection and give your thoughts a place.",
  "collections.pagesSingle": "page",
  "collections.pagesPlural": "pages",
  "collections.lastUpdatedPrefix": "Last added",
  "collections.editBody": "Adjust the title and, if you like, a brief note that gives this collection its character.",
  "collections.addSheetTitle": "Add to collection",
  "collections.addSheetBody": "Choose a personal collection for this kept reflection, or begin a new one.",
  "collections.addedNotice": "Added to collection",
  "list.saved": "Kept",
  "membership.eyebrow": "Membership",
  "membership.title": "Make this space truly yours.",
  "membership.subtitle": "Freemium begins gently. Premium and Lifelong open more room for beauty, ownership, and reflection.",
  "membership.heroLine": "Keep what matters.\nShape it in a way that feels right to you.",
  "membership.premiumIncludedTitle": "Premium unlocks",
  "membership.premiumCardLine": "More space. More depth.\nMore of what stays.",
  "membership.premiumCardBody": "Thoughts that matter deserve a place.\nMake this space something that truly belongs to you.",
  "membership.lifelongCardLine": "Once. For good.",
  "membership.lifelongCardBody": "A space that belongs to you forever.",
  "membership.lifelongCardNote": "Decide once.\nAnd everything stays with you — no renewal.",
  "membership.freemiumMiniTitle": "FREE",
  "membership.freemiumMiniBody": "A quiet beginning.\nOne page at a time.",
  "membership.freeAction": "Continue free",
  "membership.currentPlanCta": "Current plan",
  "membership.includedWithLifelong": "Included with Lifelong",
  "membership.postReflectionInviteTitle": "Keep what matters.",
  "membership.postReflectionInviteBody": "Some pages are worth keeping. Premium lets them stay with you.",
  "membership.postReflectionInviteAction": "Discover premium",
  "membership.afterSaveUpgradeTitle": "You can keep this page.",
  "membership.afterSaveUpgradeBody": "Premium lets it stay with you.",
  "membership.dayThreeUpgradeTitle": "You've already begun. Make it your space.",
  "membership.dayThreeUpgradeBody": "Keep pages that matter and make the space feel more personal.",
  "membership.daySevenUpgradeTitle": "What you hold onto stays.",
  "membership.daySevenUpgradeBody": "With Premium, nothing meaningful needs to get lost.",
  "membership.gentleUpgradeTitle": "Your space can be more than just today.",
  "membership.gentleUpgradeBody": "Create your own collections and let nothing get lost.",
  "membership.gentleUpgradeAction": "Discover premium",
  "membership.upgradeNotificationTitle": "What you hold onto stays.",
  "membership.upgradeNotificationBody": "Keep pages that matter and let nothing get lost.",
  "preview.title": "Your first page.",
  "preview.subtitle": "Take a moment.",
  "preview.primaryAction": "Continue",
  "preview.secondaryAction": "Open later",
  "preview.loading": "A quiet moment is being prepared.",
  "membership.anchorStay": "Most stay.",
  "membership.bestValue": "Best value",
  "membership.benefitKeepClose": "Keep more of what matters to you",
  "membership.benefitWriteFreely": "Write without feeling limited",
  "membership.benefitMoveMorePersonally": "Shape the space more around you",
  "membership.benefitSavePages": "Save pages you never want to lose",
  "membership.benefitCollections": "Create personal collections for your thoughts",
  "membership.benefitStyle": "Shape colors, typography, and style your way",
  "membership.benefitUnlimited": "Your own space — without limits",
  "membership.benefitNothingLost": "Everything stays. Nothing gets lost",
  "membership.trialLineOne": "7-day free trial",
  "membership.trialLineTwo": "Cancel anytime",
  "membership.socialProof": "Many users already keep their most important pages here.",
  "membership.valueGroupSpace": "Your space grows",
  "membership.valueGroupClarity": "More clarity",
  "membership.valueGroupExpression": "More expression",
  "membership.valueSpaceOne": "Keep more of what you want to return to",
  "membership.valueSpaceTwo": "Let important thoughts stay close",
  "membership.valueClarityOne": "Find saved pages more easily",
  "membership.valueClarityTwo": "Bring quiet order to what you keep",
  "membership.valueExpressionOne": "Write without feeling limited",
  "membership.valueExpressionTwo": "Shape the space more around you",
  "membership.unlockAction": "Unlock Premium",
  "membership.openMembership": "Open membership",
  "membership.lockedArchiveTitle": "Search and filters live in Premium",
  "membership.lockedArchiveBody": "Freemium keeps the archive quieter and shorter. Premium opens search, filters, and the full dated record.",
  "membership.lockedSavedTitle": "A fuller collection lives in Premium",
  "membership.lockedSavedBody": "Freemium keeps a smaller saved stack. Premium opens unlimited kept pages, search, and export.",
  "membership.stateTitle": "Your current plan",
  "membership.errorTitle": "Membership details are quiet for the moment",
  "membership.errorBody": "The current plan still works as expected. Store-based details can return when the connection is ready again.",
  "membership.lockedFeatureFootnote": "Prepared quietly for Premium.",
  "membership.lifelongBadge": "SUPPORTER",
  "membership.planFreemium": "Freemium",
  "membership.planPremium": "Premium",
  "membership.planLifelong": "Lifelong",
  "membership.choosePremium": "Start premium",
  "membership.chooseLifelong": "Unlock forever",
  "membership.switchToPremium": "Switch to Premium",
  "membership.unlockLifelong": "Unlock once",
  "membership.purchasePlaceholderTitle": "Purchase flow coming next",
  "membership.purchasePlaceholderBody": "This plan selection is ready for store billing later. In development, the local membership override can be used instead.",
  "membership.purchaseSuccessTitle": "Unlocked",
  "membership.purchaseSuccessPremium": "Premium is now available in your app.",
  "membership.purchaseSuccessLifelong": "Lifelong is now available in your app.",
  "membership.purchaseErrorTitle": "Purchase not completed",
  "membership.purchaseErrorBody": "The membership could not be updated right now.",
  "membership.restoreSuccessTitle": "Restored",
  "membership.restoreSuccessBody": "Your purchases were checked.",
  "membership.restoreErrorTitle": "Not available",
  "membership.restoreErrorBody": "Purchases could not be restored right now.",
};

export const germanMessages: Messages = {
  ...englishMessages,
  "tabs.today": "Heute",
  "tabs.archive": "Archiv",
  "tabs.favorites": "Gesammelt",
  "tabs.settings": "Einstellungen",
  "common.continue": "Weiter",
  "common.continueWithoutName": "Ohne Namen fortfahren",
  "common.notNow": "Nicht jetzt",
  "common.allowNotifications": "Benachrichtigungen erlauben",
  "common.preparing": "Wird still vorbereitet...",
  "common.searchLanguage": "Sprache suchen",
  "common.cancel": "Abbrechen",
  "common.reset": "Zurücksetzen",
  "common.refresh": "Aktualisieren",
  "onboarding.arrivalBody": "Ein ruhiger Ort für Gedanken, die bleiben dürfen.",
  "onboarding.arrivalAction": "Beginnen",
  "onboarding.welcomeTitle": "Nimm dir einen Moment.",
  "onboarding.welcomeBody": "Manche Gedanken verdienen mehr als ein Vorübergehen.",
  "onboarding.welcomeHero": "Nicht alles, was wichtig ist, sollte verschwinden.",
  "onboarding.welcomeLineOne": "Deine Tage sind voll.",
  "onboarding.welcomeLineTwo": "Dazwischen gehen Gedanken verloren.",
  "onboarding.welcomeLineThree": "Eine Seite am Tag.\nNicht mehr.",
  "onboarding.languageTitle": "Wähle deine Sprache",
  "onboarding.languageBody": "Du kannst sie jederzeit ändern.",
  "onboarding.languageSearchPlaceholder": "Sprache suchen",
  "onboarding.nameTitle": "Wie sollen wir dich nennen?",
  "onboarding.nameBody": "Dieser Raum darf persönlicher werden.",
  "onboarding.namePlaceholder": "Dein Name",
  "onboarding.ackBody": "Dieser Raum kann wirklich deiner werden.",
  "onboarding.ackCard": "Eine Seite pro Tag. Ruhig genug, um wahrzunehmen, was bei dir bleibt.",
  "onboarding.preferenceTitle": "Wovon möchtest du mehr?",
  "onboarding.preferenceBody": "Wähle bis zu zwei Dinge, nach denen du dich öfter ausrichten möchtest.",
  "onboarding.preferenceHint": "Bis zu zwei auswählen.",
  "onboarding.transitionTitle": "Lass uns beginnen.",
  "onboarding.transitionBody": "Deine erste Seite wartet bereits auf dich.",
  "onboarding.transitionAction": "Zur ersten Seite",
  "onboarding.introTitle": "Deine erste Seite für heute.",
  "onboarding.introBody": "Öffne sie, wenn du bereit bist.",
  "onboarding.introAction": "Erste Seite ansehen",
  "onboarding.choiceTitle": "Mach diesen Raum zu deinem.",
  "onboarding.choiceBody": "Behalte, was dir wichtig ist.\nGestalte es so, wie es sich für dich richtig anfühlt.",
  "onboarding.choiceFreeTitle": "Kostenlos",
  "onboarding.choiceFreeBody": "Ein stiller Anfang. Eine Seite nach der anderen.",
  "onboarding.choiceFreeAction": "Kostenlos weiter",
  "onboarding.finishFreeAction": "Kostenlos weiter",
  "onboarding.choicePremiumTitle": "Premium",
  "onboarding.choicePremiumBody": "Gedanken, die zählen, verdienen einen Platz.\nMach diesen Raum zu etwas, das wirklich dir gehört.",
  "onboarding.choicePremiumAction": "Premium starten",
  "onboarding.finishAction": "Daytri öffnen",
  "onboarding.notificationTimeTitle": "Wähle die genaue Zeit.",
  "onboarding.notificationTimeBody": "Deine tägliche Seite kann dich genau dann erreichen, wenn es für dich passt.",
  "onboarding.ritualTimeTitle": "Wann ist dein Moment?",
  "onboarding.ritualTimeBody": "Wähle den Teil des Tages, der sich für dich richtig anfühlt.",
  "onboarding.ritualTimeHint": "Am besten bleibt man dran, wenn der Moment wirklich zum Tag passt.",
  "onboarding.ritualTimeMorningTitle": "Morgen (6-9)",
  "onboarding.ritualTimeMorningBody": "Beginne deinen Tag mit Klarheit",
  "onboarding.ritualTimeMiddayTitle": "Mittag (11-14)",
  "onboarding.ritualTimeMiddayBody": "Ein kurzer stiller Reset in deinem Tag",
  "onboarding.ritualTimeEveningTitle": "Abend (18-21)",
  "onboarding.ritualTimeEveningBody": "Nimm deinen Tag noch einmal in Ruhe auf",
  "onboarding.ritualTimeLateTitle": "Später Abend (21-23)",
  "onboarding.ritualTimeLateBody": "Ein ruhiger Ausklang für deinen Tag",
  "onboarding.ritualTimeCustomTitle": "Eigene Zeit wählen",
  "onboarding.ritualTimeCustomBody": "Wähle den Moment, der wirklich zu deinem Rhythmus passt",
  "onboarding.notificationPermissionTitle": "Lass sie dich sanft erreichen.",
  "onboarding.notificationPermissionBody": "Nur zu der Zeit, die du wählst.",
  "onboarding.membershipBenefitKeep": "Bewahre Seiten, die bleiben",
  "onboarding.membershipBenefitCollections": "Lege persönliche Sammlungen an",
  "onboarding.membershipBenefitStyle": "Gestalte Farben, Typografie und Stimmung",
  "onboarding.membershipBenefitNotes": "Halte Notizen und Gedanken bewusster fest",
  "today.eyebrow": "Heute",
  "today.title": "Heute",
  "today.defaultSubtitle": "Eine Frage, die für diesen Tag still bleibt.",
  "today.keep": "Behalten",
  "today.kept": "Behalten.",
  "today.share": "Teilen",
  "today.shareDialogTitle": "Reflexionskarte teilen",
  "today.shareFallbackMessage": "Tägliche Reflexion",
  "today.shareUnavailableTitle": "Teilen nicht möglich",
  "today.shareUnavailableBody": "Diese Reflexionskarte konnte auf diesem Gerät nicht geteilt werden.",
  "today.helper": "Du kannst jederzeit hierher zurückkehren.",
  "today.noteTitle": "Eine stille Notiz",
  "today.notePlaceholder": "Deine Gedanken zu diesem Impuls ...",
  "today.saveLimitTitle": "Eine kleinere Sammlung lebt hier",
  "today.saveLimitBody": "Freemium bewahrt bis zu 7 gespeicherte Reflexionen. Entferne eine oder öffne Premium für mehr persönlichen Raum.",
  "today.noteLockedBody": "Freemium hält Notizen für die Reflexionen offen, die du bewusst behältst. Premium öffnet längere Notizen und mehr Raum um das, was bei dir bleibt.",
  "today.noteLimitHint": "Freemium hält Notizen bewusst kürzer. Premium öffnet längere Reflexionsnotizen.",
  "today.followUpAction": "Impuls vertiefen",
  "today.followUpLoading": "Ein weiterer stiller Impuls entsteht ...",
  "today.followUpTitle": "Vertiefende Impulse",
  "today.followUpError": "Ein vertiefender Impuls konnte gerade nicht vorbereitet werden.",
  "today.followUpLimitBody": "Der tägliche KI-Impuls ist heute bereits verwendet. Premium öffnet mehr Raum für weitere vertiefende Fragen.",
  "today.swipeHint": "Wische sanft über die Seite, um durch gespeicherte Tage zu gehen.",
  "today.tomorrowHint": "Morgen wartet eine neue Seite.",
  "today.preparing": "Deine Reflexion wird vorbereitet.",
  "today.notificationEntryLine": "Deine Seite für heute",
  "today.lateOpenTitle": "Deine Seite wartet noch.",
  "today.lateOpenBody": "Nimm dir einen stillen Moment für die heutige Seite, wenn sie zu dir passt.",
  "today.lateOpenPrimary": "Heutige Seite öffnen",
  "today.lateOpenSecondary": "Später",
  "reflection.title": "Reflexion",
  "reflection.unavailable": "Diese Reflexion ist nicht verfügbar.",
  "settings.eyebrow": "Einstellungen",
  "settings.title": "Dein ruhiger Raum",
  "settings.subtitle": "Hier ordnet sich alles still um deinen eigenen Rhythmus.",
  "settings.standardSectionTitle": "Standardeinstellungen",
  "settings.standardSectionSummary": "Erinnerungszeit, Kategorien, Erscheinung und Sprache.",
  "settings.freemiumSectionSummary": "Enthaltene Papier-, Schrift- und Seitenoptionen.",
  "settings.premiumSectionSummary": "Spätere Premium-Töne, Typografie und Seitenlayouts.",
  "settings.plansSectionTitle": "Abomodelle",
  "settings.plansSectionSummary": "Freemium, Premium und Lifelong.",
  "settings.notificationTime": "Erinnerungszeit",
  "settings.deliveryRitual": "Zustellung",
  "settings.deliveryRitualBody": "Wie dich diese Seite erreicht, so still wie möglich.",
  "settings.notificationsEnabled": "Mitteilung",
  "settings.notificationsEnabledBody": "Hält die tägliche Einladung offen.",
  "settings.soundEnabled": "Ton",
  "settings.soundEnabledBody": "Lässt die Erinnerung mit einem leisen Klang ankommen.",
  "settings.hapticsEnabled": "Haptik",
  "settings.hapticsEnabledBody": "Eine feine Berührung, wenn sich die Seite öffnet.",
  "settings.silentMode": "Stiller Modus",
  "settings.silentModeBody": "Die Seite bleibt da, aber ohne Ton und Haptik.",
  "settings.preferredCategories": "Bevorzugte Kategorien",
  "settings.language": "App-Sprache",
  "settings.languageBody": "Steuert die Sprache der Oberfläche.",
  "settings.languageCurrentHint": "Navigation, Einstellungen, Buttons, Beschriftungen und Datumsangaben erscheinen in dieser Sprache.",
  "settings.languageSearchPlaceholder": "App-Sprache suchen",
  "settings.quoteLanguages": "Sprache der Reflexionen",
  "settings.quoteLanguagesBody": "Standardmäßig folgt deine tägliche Seite der App-Sprache.",
  "settings.quoteLanguagesPremiumBody": "Wähle eine oder mehrere Sprachen für deine Reflexionen unabhängig.",
  "settings.quoteLanguagesLockedBody": "Eine eigene Sprache für Reflexionen öffnet sich in Premium und Lifelong.",
  "settings.quoteLanguagesCurrentHintSameAsApp": "Heutige, archivierte und gespeicherte Reflexionen bewegen sich mit der App-Sprache.",
  "settings.quoteLanguagesCurrentHintCustom": "Heutige, archivierte und gespeicherte Reflexionen erscheinen in dieser Sprache.",
  "settings.quoteLanguagesFallbackBody": "Wenn eine Reflexion in dieser Sprache noch nicht vorliegt, fällt sie still auf Englisch zurück.",
  "settings.quoteLanguagesSearchPlaceholder": "Sprache suchen",
  "settings.quoteLanguagesSelectMultiple": "Wähle eine oder mehrere Sprachen für deine Reflexionen.",
  "settings.quoteLanguagesSelectedLanguages": "Gewählte Sprachen",
  "settings.quoteLanguagesSelectedTag": "Aktiv",
  "settings.quoteLanguagesAppTag": "App",
  "settings.reflectionLanguageSameAsApp": "Wie App-Sprache",
  "settings.reflectionLanguageCustom": "Eigene Sprache",
  "settings.reflectionLanguageFollowsApp": "Folgt der App-Sprache",
  "settings.privateSettingsTitle": "Private Einstellungen",
  "settings.privateSettingsLockedBody": "Mehr persönlicher Spielraum für Sprache, Hintergrund, Papier, Schrift und Export liegt in Premium und Lifelong.",
  "settings.privateSettingsLockedHint": "Mehr persönlicher Spielraum",
  "settings.privateSettingsUnlockAction": "Mit Premium öffnen",
  "settings.groupAppearance": "Erscheinung",
  "settings.groupCollectionOrder": "Sammlung & Ordnung",
  "settings.groupLanguageContent": "Sprache & Inhalte",
  "settings.groupCollectionSharing": "Sammlung & Teilen",
  "settings.groupPremium": "Mein Abonnement",
  "settings.mySubscription": "Mein Abonnement",
  "settings.exportSavedReflections": "Gespeicherte Reflexionen per E-Mail senden",
  "settings.exportAction": "Jetzt senden",
  "settings.exportSavedReflectionsSubject": "Gespeicherte Reflexionen",
  "settings.exportSavedReflectionsFallbackTitle": "Gespeicherte Reflexionen",
  "settings.exportSavedReflectionsBody": "Sende deine behaltenen Seiten und Notizen gesammelt per E-Mail oder bewahre sie als ruhiges PDF-Journal.",
  "settings.exportPdfAction": "Als PDF exportieren",
  "settings.exportPdfFallbackTitle": "PDF deiner gespeicherten Reflexionen",
  "settings.exportPdfFilePrefix": "meine-reflexionen",
  "settings.exportCollectionTitle": "Gespeicherte Reflexionen",
  "settings.exportCollectionSubtitle": "Eine persönliche Sammlung aus Reflexionen und Notizen",
  "settings.exportCollectionCount": "gespeicherte Reflexionen",
  "settings.exportReflectionLabel": "Reflexion",
  "settings.exportCategoryLabel": "Kategorie",
  "settings.exportLanguageLabel": "Sprache",
  "settings.exportSourceLabel": "Quelle",
  "settings.exportDateLabel": "Datum",
  "settings.exportExportedOnLabel": "Exportiert am",
  "settings.exportDetailsLabel": "Details",
  "settings.exportFilePrefix": "meine-reflexionen",
  "settings.exportEmailIntro": "Hier ist deine gespeicherte Sammlung aus Reflexionen und Notizen.",
  "settings.exportEmptyTitle": "Noch nichts zum Exportieren",
  "settings.exportEmptyMessage": "Behalte zuerst einige Reflexionen, dann sind sie für ein stilles Backup bereit.",
  "settings.darkMode": "Dunkler Modus",
  "settings.darkModeBody": "Auch bei wenig Licht soll sich alles warm und ruhig anfühlen.",
  "settings.premiumTitle": "Premium-Personalisierung",
  "settings.premiumBody": "Premium öffnet mehr Raum für das, was du bewahren und gestalten möchtest.",
  "settings.premiumCollectionsTitle": "Deine Gedankenbibliothek",
  "settings.premiumCollectionsBody": "Ordne Gedanken, die dir wichtig sind.\nBewahre Momente, die bleiben sollen.",
  "settings.subscriptionStatus": "Abostatus",
  "settings.restorePurchases": "Käufe wiederherstellen",
  "settings.manageSubscription": "Abo verwalten",
  "settings.manageSubscriptionBody": "Die Aboverwaltung öffnet sich hier, sobald deine App-Store-Verbindung verfügbar ist.",
  "settings.restoreSuccessTitle": "Wiederhergestellt",
  "settings.restoreSuccessBody": "Deine Käufe wurden überprüft.",
  "settings.restoreErrorTitle": "Nicht möglich",
  "settings.restoreErrorBody": "Käufe konnten gerade nicht wiederhergestellt werden.",
  "settings.upgradeAction": "Premium ansehen",
  "settings.premiumPreviewTitle": "Premium-Zugang",
  "settings.premiumPreviewBody": "Öffne unbegrenzt gespeicherte Seiten, längere Notizen, Export und mehr persönlichen Gestaltungsspielraum.",
  "settings.colorStyle": "Farbklang",
  "settings.colorStyleBody": "Bleib beim ursprünglichen Gleichgewicht, wähle eine kuratierte Stimmung oder öffne die erweiterte Farbgestaltung.",
  "settings.colorStyleDefault": "Standard",
  "settings.colorStylePresets": "Presets",
  "settings.colorStyleCustom": "Eigen",
  "settings.colorStyleDefaultBody": "Das ursprüngliche ruhige Design, genau so bewahrt wie gedacht.",
  "settings.colorStylePresetsBody": "Kuratierte Kombinationen mit stiller Lesbarkeit und atmosphärischerem Seitengefühl.",
  "settings.colorStyleCustomBody": "Erweiterte Farbkontrolle für Hintergrund, Papier und Text mit Harmonie-Schutz.",
  "settings.colorStylePreview": "Aktuelle Erscheinung",
  "settings.colorStyleLockedBody": "Kuratierte Stile und erweiterte Farbkontrolle stehen in Premium und Lifelong zur Verfügung.",
  "settings.colorStyleAdvancedTitle": "Erweiterte Farbkontrolle",
  "settings.colorStyleAdvancedBody": "Passe Hintergrund, Papier und Text getrennt an. Die App hält Kombinationen ruhig und gut lesbar.",
  "settings.colorStylePresetTagRecommended": "Empfohlen",
  "settings.colorStylePresetTagBalanced": "Ausgewogen",
  "settings.colorStylePresetTagWarmCalm": "Warm & ruhig",
  "settings.colorStylePresetTagReadable": "Sehr gut lesbar",
  "settings.colorStylePresetTagQuiet": "Still",
  "settings.paperThemes": "Papierfarben",
  "settings.appBackground": "App-Hintergrund",
  "settings.appBackgroundBody": "Wähle den Grundton, in dem deine Seiten ruhen.",
  "settings.appBackgroundDefaultBody": "Weiß hält die App besonders ruhig und offen.",
  "settings.appBackgroundPreview": "Aktueller App-Ton",
  "settings.appBackgroundSurfaceLabel": "Hinter deinen Seiten",
  "settings.appBackgroundReset": "Zu Weiß zurückkehren",
  "settings.textColor": "Textfarbe",
  "settings.textColorBody": "Wähle, ob der Text im ursprünglichen Ton bleibt oder einen persönlichen Farbklang bekommt.",
  "settings.textColorDefaultTitle": "Standard",
  "settings.textColorDefaultBody": "Bewahre den ursprünglichen editorischen Textrhythmus der App.",
  "settings.textColorCustomTitle": "Eigener Ton",
  "settings.textColorCustomBody": "Forme einen persönlichen Leseton für die Haupttexte der App.",
  "settings.textColorPreview": "Aktueller Textton",
  "settings.textColorReset": "Zum Standard zurückkehren",
  "settings.contrastGood": "Gute Lesbarkeit",
  "settings.contrastLow": "Diese Farbkombination könnte schwer lesbar sein.",
  "settings.contrastAdjusted": "Für die Lesbarkeit leicht angepasst.",
  "settings.colorCode": "HEX-Farbcode",
  "settings.colorCodeHint": "Gib einen Farbton direkt ein oder gehe mit den Reglern weiter.",
  "settings.colorCodeInvalid": "Bitte gib einen gültigen HEX-Farbcode wie #E9E2D8 ein.",
  "settings.customPaperTheme": "Eigene Papierfarbe",
  "settings.customPaperThemeBody": "Gib deinen Seiten einen eigenen Papierklang und behalte ihn in der ganzen App.",
  "settings.customPaperThemePickerBody": "Wähle eine sanfte eigene Papierfarbe. Die App hält den Ton beim Anpassen gedämpft und gut lesbar.",
  "settings.customPaperThemePreview": "Aktueller Papierklang",
  "settings.noteBackground": "Notizenhintergrund",
  "settings.noteBackgroundBody": "Halte die stille Notiz standardmäßig hell oder wähle einen sanften eigenen Ton nur für das Notizfeld.",
  "settings.noteBackgroundPreview": "Aktueller Notizton",
  "settings.noteBackgroundReset": "Zu Weiß zurückkehren",
  "settings.customPaperRed": "Rot",
  "settings.customPaperGreen": "Grün",
  "settings.customPaperBlue": "Blau",
  "settings.customPaperReset": "Zu den Papierfarben zurückkehren",
  "settings.appearanceConfirmTitle": "Diesen Stil anwenden?",
  "settings.appearanceConfirmMessageLead": "Möchtest du zu",
  "settings.appearanceConfirmApply": "Anwenden",
  "settings.typographyStyles": "Schriftstile",
  "settings.pageStyles": "Seitenstile",
  "settings.current": "Aktuell",
  "settings.aboutTitle": "Über",
  "settings.aboutBody": "Ein stiller Ort für eine Seite am Tag, der das Tempo sanft senkt und Raum für ehrliche Gedanken lässt.",
  "settings.aboutCreator": "Mit Sorgfalt gemacht als kleiner persönlicher Raum für Aufmerksamkeit, Ruhe und klare Perspektive.",
  "settings.resetTitle": "Lokale Daten zurücksetzen",
  "settings.resetBody": "Dadurch werden Onboarding, Favoriten, Archiv-Auswahlen und Einstellungen gelöscht.",
  "settings.resetButton": "Lokale Daten zurücksetzen",
  "settings.included": "Enthalten",
  "settings.premium": "Premium",
  "archive.eyebrow": "Archiv",
  "archive.title": "Eine stille Spur früherer Seiten.",
  "archive.subtitle": "Durchsuche datierte Reflexionen in derselben sanften, papiernahen Stimmung wie auf der heutigen Seite.",
  "archive.allReflections": "Alle Reflexionen",
  "archive.savedOnly": "Nur behaltene",
  "archive.searchPlaceholder": "Nach Gefühl, Kategorie oder Satz suchen",
  "archive.premiumTitle": "Das ganze Archiv liegt in Premium",
  "archive.premiumMessage": "Freemium hält das Archiv bewusst kleiner. Premium öffnet Suche, Filter und mehr Raum rund um die Seiten, die du behalten möchtest.",
  "archive.emptyTitle": "Noch keine passenden Seiten",
  "archive.emptyMessage": "Versuche eine weitere Kategorie, lösche die Suche oder behalte ein paar Reflexionen für ein weicheres Archiv.",
  "archive.noMatchTitle": "Nichts passt zu dieser Ansicht",
  "archive.noMatchMessage": "Versuche eine sanftere Suche, eine andere Kategorie oder kehre zu allen Reflexionen zurück.",
  "favorites.eyebrow": "Gesammelt",
  "favorites.title": "Behaltene Seiten",
  "favorites.subtitle": "Ein kleiner persönlicher Stapel von Seiten, die nah genug geblieben sind, um sie zu bewahren.",
  "favorites.emptyTitle": "Noch keine behaltenen Seiten",
  "favorites.emptyMessage": "Behalte eine Seite von heute oder aus dem Archiv und beginne deine eigene stille Sammlung.",
  "favorites.noMatchTitle": "Nichts passt zu deiner Sammlung",
  "favorites.noMatchMessage": "Versuche einen anderen Begriff oder entferne die Kategorie, um zu deinen behaltenen Seiten zurückzukehren.",
  "favorites.keepAction": "Behalten",
  "favorites.removeAction": "Nicht mehr behalten",
  "favorites.deleteConfirmTitle": "Gespeicherte Reflexion entfernen?",
  "favorites.deleteConfirmMessage": "Dadurch wird sie aus deiner Sammlung entfernt. Notizen bleiben an der datierten Seite erhalten, wenn sie noch im Archiv existiert.",
  "favorites.searchPlaceholder": "Gesammelte Reflexionen durchsuchen",
  "favorites.premiumTitle": "Eine größere Sammlung liegt in Premium",
  "favorites.premiumMessage": "Freemium hält einen kleineren Stapel offen. Premium öffnet unbegrenzte Seiten, längere Notizen, Suche, Export und persönliche Sammlungen.",
  "favorites.collectionsUpgradeTitle": "Deine Gedanken verdienen Ordnung",
  "favorites.collectionsUpgradeBody": "Erstelle persönliche Sammlungen und behalte, was wirklich zählt.",
  "favorites.collectionsUpgradeAction": "Sammlungen freischalten",
  "favorites.savedCountLinePrefix": "Du hast bereits",
  "favorites.savedCountLineSuffix": "Gedanken gespeichert",
  "collections.eyebrow": "Sammlungen",
  "collections.title": "Persönliche Sammlungen",
  "collections.subtitle": "Ordne die Seiten, die du bewahren möchtest, in deine eigenen stillen Sammlungen.",
  "collections.emptyTitle": "Noch keine Sammlungen",
  "collections.emptyMessage": "Lege eine erste Sammlung an und gib den Seiten, die dir wichtig sind, einen eigenen Ort.",
  "collections.newAction": "Neue Sammlung",
  "collections.createTitle": "Sammlung anlegen",
  "collections.createBody": "Gib deiner Sammlung einen Titel und, wenn du magst, ein paar Worte zu ihrem Charakter.",
  "collections.nameLabel": "Titel",
  "collections.descriptionLabel": "Beschreibung",
  "collections.saveAction": "Sammlung sichern",
  "collections.addAction": "Zu Sammlung hinzufügen",
  "collections.addToPersonalCollectionsAction": "Zu persönlichen Sammlungen",
  "collections.addHint": "Wähle eine Sammlung für diese Seite oder beginne eine neue.",
  "collections.addedTitle": "Hinzugefügt",
  "collections.addedBody": "Die Reflexion liegt jetzt in deiner Sammlung.",
  "collections.renameAction": "Sammlung umbenennen",
  "collections.deleteAction": "Sammlung löschen",
  "collections.deleteConfirmTitle": "Sammlung löschen?",
  "collections.deleteConfirmMessage": "Die Sammlung verschwindet, aber die Reflexionen selbst bleiben in deinen behaltenen Seiten erhalten.",
  "collections.countLabel": "gespeicherte Reflexionen",
  "collections.detailEmptyTitle": "Diese Sammlung ist noch still",
  "collections.detailEmptyMessage": "Füge eine behaltene Reflexion hinzu, damit diese Sammlung ihre erste Seite bekommt.",
  "collections.removeAction": "Aus Sammlung entfernen",
  "collections.removeConfirmTitle": "Reflexion entfernen?",
  "collections.removeConfirmMessage": "Dadurch wird sie nur aus dieser Sammlung entfernt. In deinen behaltenen Seiten bleibt sie bestehen.",
  "collections.lockedTitle": "Persönliche Sammlungen liegen in Premium",
  "collections.lockedBody": "Mit Premium und Lifelong kannst du deine behaltenen Seiten in persönlichen Sammlungen ordnen.",
  "collections.heroTitle": "Deine Gedankenbibliothek",
  "collections.heroBody": "Ordne Gedanken, die du bewahren möchtest, in persönliche Sammlungen.",
  "collections.emptyHeroTitle": "Deine erste Sammlung",
  "collections.emptyHeroBody": "Hier sammelst du Seiten, die bleiben sollen.\nErstelle deine erste Sammlung und gib deinen Gedanken einen Ort.",
  "collections.pagesSingle": "Seite",
  "collections.pagesPlural": "Seiten",
  "collections.lastUpdatedPrefix": "Zuletzt ergänzt",
  "collections.editBody": "Passe Titel und, wenn du möchtest, eine kurze Notiz an, die dieser Sammlung ihren Charakter gibt.",
  "collections.addSheetTitle": "Zu Sammlung hinzufügen",
  "collections.addSheetBody": "Wähle eine persönliche Sammlung für diese behaltene Reflexion oder beginne eine neue.",
  "collections.addedNotice": "Zur Sammlung hinzugefügt",
  "list.saved": "Behalten",
  "membership.eyebrow": "Mitgliedschaft",
  "membership.title": "Mach diesen Raum wirklich zu deinem.",
  "membership.subtitle": "Freemium beginnt bewusst schlicht. Premium und Lifelong öffnen mehr Raum für das, was du bewahren und gestalten möchtest.",
  "membership.heroLine": "Behalte, was dir wichtig ist.\nGestalte es so, wie es sich für dich richtig anfühlt.",
  "membership.premiumIncludedTitle": "Premium öffnet",
  "membership.premiumCardLine": "Mehr Raum. Mehr Tiefe.\nMehr von dem, was bleibt.",
  "membership.premiumCardBody": "Gedanken, die zählen, verdienen einen Platz.\nMach diesen Raum zu etwas, das wirklich dir gehört.",
  "membership.lifelongCardLine": "Einmal. Für immer.",
  "membership.lifelongCardBody": "Ein Raum, der dir für immer gehört.",
  "membership.lifelongCardNote": "Einmal entscheiden.\nUnd alles bleibt bei dir – ohne Verlängerung.",
  "membership.freemiumMiniTitle": "KOSTENLOS",
  "membership.freemiumMiniBody": "Ein ruhiger Anfang.\nEine Seite nach der anderen.",
  "membership.freeAction": "Kostenlos weiter",
  "membership.currentPlanCta": "Aktueller Plan",
  "membership.includedWithLifelong": "In Lifelong enthalten",
  "membership.postReflectionInviteTitle": "Behalte, was dir wichtig ist.",
  "membership.postReflectionInviteBody": "Manche Seiten möchte man nicht verlieren. Mit Premium bleiben sie bei dir.",
  "membership.postReflectionInviteAction": "Premium entdecken",
  "membership.afterSaveUpgradeTitle": "Du kannst diese Seite behalten.",
  "membership.afterSaveUpgradeBody": "Mit Premium bleibt sie bei dir.",
  "membership.dayThreeUpgradeTitle": "Du hast bereits begonnen. Mach es zu deinem Raum.",
  "membership.dayThreeUpgradeBody": "Behalte Seiten, die dir wichtig sind, und gestalte diesen Raum persönlicher.",
  "membership.daySevenUpgradeTitle": "Was du festhältst, bleibt.",
  "membership.daySevenUpgradeBody": "Mit Premium geht nichts verloren, was dir wichtig ist.",
  "membership.gentleUpgradeTitle": "Dein Raum kann mehr sein als nur heute.",
  "membership.gentleUpgradeBody": "Erstelle eigene Sammlungen und lass nichts verloren gehen.",
  "membership.gentleUpgradeAction": "Premium entdecken",
  "membership.upgradeNotificationTitle": "Was du festhältst, bleibt.",
  "membership.upgradeNotificationBody": "Behalte Seiten, die dir wichtig sind, und lass nichts verloren gehen.",
  "preview.title": "Deine erste Seite.",
  "preview.subtitle": "Nimm dir einen Moment.",
  "preview.primaryAction": "Weiter",
  "preview.secondaryAction": "Später öffnen",
  "preview.loading": "Ein ruhiger Moment wird vorbereitet.",
  "membership.anchorStay": "Die meisten bleiben.",
  "membership.bestValue": "Bester Wert",
  "membership.benefitKeepClose": "Behalte mehr von dem, was dir wichtig ist",
  "membership.benefitWriteFreely": "Schreibe ohne Begrenzung",
  "membership.benefitMoveMorePersonally": "Gestalte diesen Raum persönlicher",
  "membership.benefitSavePages": "Seiten speichern, die du nie verlieren willst",
  "membership.benefitCollections": "Eigene Sammlungen für deine Gedanken",
  "membership.benefitStyle": "Farben, Schrift & Stil nach deinem Gefühl",
  "membership.benefitUnlimited": "Dein persönlicher Raum – ohne Begrenzung",
  "membership.benefitNothingLost": "Alles bleibt. Nichts geht verloren",
  "membership.trialLineOne": "7 Tage kostenlos testen",
  "membership.trialLineTwo": "Jederzeit kündbar",
  "membership.socialProof": "Schon viele Nutzer speichern ihre wichtigsten Seiten.",
  "membership.valueGroupSpace": "Dein Raum wächst",
  "membership.valueGroupClarity": "Mehr Überblick",
  "membership.valueGroupExpression": "Mehr Ausdruck",
  "membership.valueSpaceOne": "Behalte mehr von dem, worauf du zurückkommen willst",
  "membership.valueSpaceTwo": "Lass wichtige Gedanken näher bei dir bleiben",
  "membership.valueClarityOne": "Finde gespeicherte Seiten leichter wieder",
  "membership.valueClarityTwo": "Gib dem, was du behältst, eine ruhigere Ordnung",
  "membership.valueExpressionOne": "Schreibe ohne Begrenzung",
  "membership.valueExpressionTwo": "Gestalte diesen Raum persönlicher",
  "membership.unlockAction": "Premium freischalten",
  "membership.openMembership": "Mitgliedschaft öffnen",
  "membership.lockedArchiveTitle": "Suche und Filter liegen in Premium",
  "membership.lockedArchiveBody": "Freemium hält das Archiv stiller und kürzer. Premium öffnet Suche, Filter und die vollständige datierte Spur.",
  "membership.lockedSavedTitle": "Eine größere Sammlung liegt in Premium",
  "membership.lockedSavedBody": "Freemium hält deine gesammelten Seiten bewusst kleiner. Premium öffnet unbegrenzte Seiten, Suche und Export.",
  "membership.stateTitle": "Dein aktueller Plan",
  "membership.errorTitle": "Mitgliedschaftsdetails sind gerade still",
  "membership.errorBody": "Dein aktueller Plan funktioniert weiterhin. Store-basierte Details können zurückkehren, sobald die Verbindung wieder bereit ist.",
  "membership.lockedFeatureFootnote": "Still für Premium vorbereitet.",
  "membership.lifelongBadge": "SUPPORTER",
  "membership.planFreemium": "Freemium",
  "membership.planPremium": "Premium",
  "membership.planLifelong": "Lifelong",
  "membership.choosePremium": "Premium starten",
  "membership.chooseLifelong": "Einmal freischalten",
  "membership.switchToPremium": "Zu Premium wechseln",
  "membership.unlockLifelong": "Einmal freischalten",
  "membership.purchasePlaceholderTitle": "Kauffluss folgt als Nächstes",
  "membership.purchasePlaceholderBody": "Diese Planauswahl ist für Store-Billing vorbereitet. In der Entwicklung kann stattdessen der lokale Mitgliedschafts-Override verwendet werden.",
  "membership.purchaseSuccessTitle": "Freigeschaltet",
  "membership.purchaseSuccessPremium": "Premium wurde erfolgreich aktiviert.",
  "membership.purchaseSuccessLifelong": "Lifelong wurde erfolgreich aktiviert.",
  "membership.purchaseErrorTitle": "Kauf nicht abgeschlossen",
  "membership.purchaseErrorBody": "Die Mitgliedschaft konnte gerade nicht aktualisiert werden.",
  "membership.restoreSuccessTitle": "Wiederhergestellt",
  "membership.restoreSuccessBody": "Deine Käufe wurden überprüft.",
  "membership.restoreErrorTitle": "Nicht möglich",
  "membership.restoreErrorBody": "Käufe konnten gerade nicht wiederhergestellt werden.",
};

export const brazilianPortugueseMessages: Messages = {
  ...englishMessages,
  "tabs.today": "Hoje",
  "tabs.archive": "Arquivo",
  "tabs.favorites": "Guardadas",
  "tabs.settings": "Ajustes",
  "common.continue": "Continuar",
  "common.continueWithoutName": "Continuar sem nome",
  "common.notNow": "Agora não",
  "common.allowNotifications": "Ativar notificações",
  "common.preparing": "Preparando...",
  "common.searchLanguage": "Buscar idioma",
  "common.cancel": "Cancelar",
  "common.reset": "Redefinir",
  "common.refresh": "Atualizar",
  "onboarding.arrivalBody": "Um lugar silencioso para os pensamentos que merecem ficar.",
  "onboarding.arrivalAction": "Começar",
  "onboarding.welcomeTitle": "Pare por um instante.",
  "onboarding.welcomeBody": "Há pensamentos que merecem mais do que passar pelo dia.",
  "onboarding.welcomeHero": "Nem tudo o que importa deveria desaparecer.",
  "onboarding.welcomeLineOne": "Seus dias são cheios.",
  "onboarding.welcomeLineTwo": "Seus pensamentos se perdem no intervalo.",
  "onboarding.welcomeLineThree": "Uma página por dia.\nNada mais.",
  "onboarding.languageTitle": "Escolha seu idioma",
  "onboarding.languageBody": "Você pode mudar isso quando quiser.",
  "onboarding.languageSearchPlaceholder": "Buscar idioma",
  "onboarding.nameTitle": "Como devemos chamar você?",
  "onboarding.nameBody": "Este espaço pode se tornar mais pessoal.",
  "onboarding.namePlaceholder": "Seu nome",
  "onboarding.ackBody": "Este espaço pode se tornar realmente seu.",
  "onboarding.ackCard": "Uma página por dia. Silenciosa o bastante para notar o que continua com você.",
  "onboarding.preferenceTitle": "Do que você quer mais?",
  "onboarding.preferenceBody": "Escolha até duas coisas pelas quais você quer se orientar com mais frequência.",
  "onboarding.preferenceHint": "Escolha até duas.",
  "onboarding.transitionTitle": "Vamos começar.",
  "onboarding.transitionBody": "Sua primeira página já está pronta.",
  "onboarding.transitionAction": "Continuar",
  "onboarding.introTitle": "Sua primeira página de hoje.",
  "onboarding.introBody": "Abra quando estiver pronto.",
  "onboarding.introAction": "Ver primeira página",
  "onboarding.choiceTitle": "Faça deste espaço algo seu.",
  "onboarding.choiceBody": "Guarde o que importa perto de você.\nMolde este espaço do jeito que fizer sentido para você.",
  "onboarding.choiceFreeTitle": "Gratuito",
  "onboarding.choiceFreeBody": "Um começo sereno.\nUma página de cada vez.",
  "onboarding.choiceFreeAction": "Continuar no Gratuito",
  "onboarding.finishFreeAction": "Continuar no Gratuito",
  "onboarding.choicePremiumTitle": "Premium",
  "onboarding.choicePremiumBody": "Pensamentos que importam merecem um lugar.\nFaça deste espaço algo que realmente pareça seu.",
  "onboarding.choicePremiumAction": "Começar Premium",
  "onboarding.finishAction": "Abrir Daytri",
  "onboarding.notificationTimeTitle": "Escolha o horário exato.",
  "onboarding.notificationTimeBody": "Sua página diária pode chegar exatamente quando isso fizer sentido.",
  "onboarding.ritualTimeTitle": "Qual é o seu momento?",
  "onboarding.ritualTimeBody": "Escolha o momento do dia que mais combina com a sua rotina.",
  "onboarding.ritualTimeHint": "A constância costuma vir quando o momento realmente cabe no dia.",
  "onboarding.ritualTimeMorningTitle": "Manhã (6-9)",
  "onboarding.ritualTimeMorningBody": "Comece o dia com clareza",
  "onboarding.ritualTimeMiddayTitle": "Meio do dia (11-14)",
  "onboarding.ritualTimeMiddayBody": "Uma pausa curta no meio do seu dia",
  "onboarding.ritualTimeEveningTitle": "Noite (18-21)",
  "onboarding.ritualTimeEveningBody": "Reflita sobre o seu dia",
  "onboarding.ritualTimeLateTitle": "Fim da noite (21-23)",
  "onboarding.ritualTimeLateBody": "Uma forma calma de encerrar o dia",
  "onboarding.ritualTimeCustomTitle": "Escolher meu próprio horário",
  "onboarding.ritualTimeCustomBody": "Defina um momento que combine de verdade com o seu ritmo",
  "onboarding.notificationPermissionTitle": "Deixe que ela chegue com delicadeza.",
  "onboarding.notificationPermissionBody": "Só no horário que você escolher.",
  "onboarding.membershipBenefitKeep": "Guarde as páginas que ficam com você",
  "onboarding.membershipBenefitCollections": "Crie coleções pessoais",
  "onboarding.membershipBenefitStyle": "Ajuste cores, tipografia e atmosfera",
  "onboarding.membershipBenefitNotes": "Escreva notas e pensamentos com mais intenção",
  "today.eyebrow": "Hoje",
  "today.title": "Hoje",
  "today.defaultSubtitle": "Uma pergunta para acompanhar o seu dia em silêncio.",
  "today.keep": "Guardar",
  "today.kept": "Guardada.",
  "today.share": "Compartilhar",
  "today.shareDialogTitle": "Compartilhar cartão da reflexão",
  "today.shareFallbackMessage": "Reflexão diária",
  "today.shareUnavailableTitle": "Não foi possível compartilhar",
  "today.shareUnavailableBody": "O cartão da reflexão não pôde ser compartilhado neste dispositivo.",
  "today.helper": "Você pode voltar a isso quando quiser.",
  "today.noteTitle": "Uma nota quieta",
  "today.notePlaceholder": "Seus pensamentos sobre esta reflexão ...",
  "today.saveLimitTitle": "Uma coleção menor vive aqui",
  "today.saveLimitBody": "No Freemium, você pode guardar até 7 reflexões. Remova uma ou abra o Premium para ter mais espaço pessoal.",
  "today.noteLockedBody": "No Freemium, as notas ficam disponíveis para as reflexões que você escolhe guardar. O Premium abre notas mais longas e mais espaço ao redor do que permanece com você.",
  "today.noteLimitHint": "No Freemium, as notas permanecem mais curtas. O Premium abre notas de reflexão mais longas.",
  "today.followUpAction": "Aprofundar impulso",
  "today.followUpLoading": "Um novo impulso está tomando forma ...",
  "today.followUpTitle": "Impulsos para aprofundar",
  "today.followUpError": "No momento, não foi possível preparar um novo impulso.",
  "today.followUpLimitBody": "O impulso diário com IA já foi usado hoje. O Premium abre mais espaço para novos impulsos.",
  "today.swipeHint": "Deslize com calma pela página para percorrer os dias guardados.",
  "today.tomorrowHint": "Amanhã traz uma nova página.",
  "today.preparing": "Sua reflexão está sendo preparada.",
  "today.notificationEntryLine": "Sua página de hoje",
  "today.lateOpenTitle": "Sua página ainda está esperando.",
  "today.lateOpenBody": "Reserve um instante quieto para a página de hoje, quando fizer sentido para você.",
  "today.lateOpenPrimary": "Abrir a página de hoje",
  "today.lateOpenSecondary": "Mais tarde",
  "reflection.title": "Reflexão",
  "reflection.unavailable": "Esta reflexão não está disponível.",
  "settings.eyebrow": "Ajustes",
  "settings.title": "Seu espaço",
  "settings.subtitle": "Aqui tudo se ajusta com calma ao jeito que você quer viver a página.",
  "settings.standardSectionTitle": "Configurações padrão",
  "settings.standardSectionSummary": "Lembrete, categorias, aparência e idioma.",
  "settings.freemiumSectionSummary": "Opções incluídas de papel, tipografia e página.",
  "settings.premiumSectionSummary": "Futuros tons premium, tipografia e layouts de página.",
  "settings.plansSectionTitle": "Modelos de assinatura",
  "settings.plansSectionSummary": "Freemium, Premium e Lifelong.",
  "settings.notificationTime": "Horário do lembrete",
  "settings.deliveryRitual": "Entrega",
  "settings.deliveryRitualBody": "Como esta página chega até você, com o mínimo de ruído.",
  "settings.notificationsEnabled": "Notificações",
  "settings.notificationsEnabledBody": "Mantém o convite diário ativo.",
  "settings.soundEnabled": "Som",
  "settings.soundEnabledBody": "Deixa o lembrete chegar com um som discreto.",
  "settings.hapticsEnabled": "Háptica",
  "settings.hapticsEnabledBody": "Um toque sutil quando a página se abre.",
  "settings.silentMode": "Modo silencioso",
  "settings.silentModeBody": "Mantém a entrega visível, mas sem som nem háptica.",
  "settings.preferredCategories": "Categorias preferidas",
  "settings.language": "Idioma do app",
  "settings.languageBody": "Controla o idioma da interface.",
  "settings.languageCurrentHint": "Navegação, ajustes, botões, rótulos e datas aparecem neste idioma.",
  "settings.languageSearchPlaceholder": "Buscar idioma do app",
  "settings.quoteLanguages": "Idioma das reflexões",
  "settings.quoteLanguagesBody": "Por padrão, a sua página diária segue o idioma do app.",
  "settings.quoteLanguagesPremiumBody": "Escolha um ou mais idiomas para as suas reflexões de forma independente.",
  "settings.quoteLanguagesLockedBody": "O idioma independente das reflexões se abre no Premium e no Lifelong.",
  "settings.quoteLanguagesCurrentHintSameAsApp": "As reflexões de hoje, do arquivo e salvas acompanham o idioma do app.",
  "settings.quoteLanguagesCurrentHintCustom": "As reflexões de hoje, do arquivo e salvas usam este idioma.",
  "settings.quoteLanguagesFallbackBody": "Se uma reflexão ainda não estiver disponível neste idioma, ela recua com calma para o inglês.",
  "settings.quoteLanguagesSearchPlaceholder": "Buscar idioma",
  "settings.quoteLanguagesSelectMultiple": "Escolha um ou mais idiomas para as suas reflexões.",
  "settings.quoteLanguagesSelectedLanguages": "Idiomas selecionados",
  "settings.quoteLanguagesSelectedTag": "Ativo",
  "settings.quoteLanguagesAppTag": "App",
  "settings.reflectionLanguageSameAsApp": "Como o app",
  "settings.reflectionLanguageCustom": "Idioma próprio",
  "settings.reflectionLanguageFollowsApp": "Segue o idioma do app",
  "settings.privateSettingsTitle": "Configurações privadas",
  "settings.privateSettingsLockedBody": "Mais liberdade para idioma, fundo, papel, tipografia e exportação se abre no Premium e no Lifelong.",
  "settings.privateSettingsLockedHint": "Mais espaço pessoal no Premium.",
  "settings.privateSettingsUnlockAction": "Abrir com Premium",
  "settings.groupAppearance": "Aparência",
  "settings.groupCollectionOrder": "Coleção e ordem",
  "settings.groupLanguageContent": "Idioma e conteúdo",
  "settings.groupCollectionSharing": "Coleção e compartilhamento",
  "settings.groupPremium": "Minha assinatura",
  "settings.mySubscription": "Minha assinatura",
  "settings.exportSavedReflections": "Enviar reflexões salvas por e-mail",
  "settings.exportAction": "Enviar agora",
  "settings.exportSavedReflectionsSubject": "Reflexões salvas",
  "settings.exportSavedReflectionsFallbackTitle": "Reflexões salvas",
  "settings.exportSavedReflectionsBody": "Envie suas páginas guardadas e anotações em um só e-mail ou preserve tudo em um PDF sereno.",
  "settings.exportPdfAction": "Exportar como PDF",
  "settings.exportPdfFallbackTitle": "PDF das suas reflexões salvas",
  "settings.exportPdfFilePrefix": "minhas-reflexoes",
  "settings.exportCollectionTitle": "Reflexões guardadas",
  "settings.exportCollectionSubtitle": "Uma coleção pessoal de reflexões e anotações",
  "settings.exportCollectionCount": "reflexões guardadas",
  "settings.exportReflectionLabel": "Reflexão",
  "settings.exportCategoryLabel": "Categoria",
  "settings.exportLanguageLabel": "Idioma",
  "settings.exportSourceLabel": "Origem",
  "settings.exportDateLabel": "Data",
  "settings.exportExportedOnLabel": "Exportado em",
  "settings.exportDetailsLabel": "Detalhes",
  "settings.exportFilePrefix": "reflexoes-guardadas",
  "settings.exportEmailIntro": "Aqui está sua coleção guardada de reflexões e anotações.",
  "settings.exportEmptyTitle": "Ainda não há nada para exportar",
  "settings.exportEmptyMessage": "Guarde algumas reflexões primeiro, e elas estarão prontas para um backup silencioso.",
  "settings.darkMode": "Modo escuro",
  "settings.darkModeBody": "Mantenha a experiência acolhedora e tranquila também com pouca luz.",
  "settings.premiumTitle": "Personalização premium",
  "settings.premiumBody": "O Premium abre mais espaço para guardar, organizar e moldar este lugar ao seu modo.",
  "settings.premiumCollectionsTitle": "Sua biblioteca de pensamentos",
  "settings.premiumCollectionsBody": "Organize os pensamentos que importam.\nGuarde os momentos que merecem permanecer.",
  "settings.subscriptionStatus": "Status da assinatura",
  "settings.restorePurchases": "Restaurar compras",
  "settings.manageSubscription": "Gerenciar assinatura",
  "settings.manageSubscriptionBody": "O gerenciamento da assinatura se abre aqui assim que a sua conexão com a App Store estiver disponível.",
  "settings.restoreSuccessTitle": "Restaurado",
  "settings.restoreSuccessBody": "Suas compras foram verificadas.",
  "settings.restoreErrorTitle": "Não foi possível",
  "settings.restoreErrorBody": "No momento, não foi possível restaurar as compras.",
  "settings.upgradeAction": "Ver Premium",
  "settings.premiumPreviewTitle": "Acesso Premium",
  "settings.premiumPreviewBody": "Desbloqueie páginas guardadas sem limite, notas mais longas, exportação e mais liberdade para personalizar este espaço.",
  "settings.colorStyle": "Clima de cor",
  "settings.colorStyleBody": "Fique com o equilíbrio original, escolha uma atmosfera curada ou abra a camada avançada de cor.",
  "settings.colorStyleDefault": "Padrão",
  "settings.colorStylePresets": "Presets",
  "settings.colorStyleCustom": "Personalizado",
  "settings.colorStyleDefaultBody": "O design calmo original, preservado exatamente como foi pensado.",
  "settings.colorStylePresetsBody": "Combinações curadas com contraste silencioso e uma página mais atmosférica.",
  "settings.colorStyleCustomBody": "Controle avançado para fundo, papel e texto, com proteção de harmonia.",
  "settings.colorStylePreview": "Aparência atual",
  "settings.colorStyleLockedBody": "Estilos curados e controle avançado de cor estão disponíveis no Premium e no Lifelong.",
  "settings.colorStyleAdvancedTitle": "Controles avançados de cor",
  "settings.colorStyleAdvancedBody": "Ajuste separadamente fundo, papel e texto. O app mantém as combinações calmas e legíveis.",
  "settings.colorStylePresetTagRecommended": "Recomendado",
  "settings.colorStylePresetTagBalanced": "Equilibrado",
  "settings.colorStylePresetTagWarmCalm": "Quente e calmo",
  "settings.colorStylePresetTagReadable": "Mais legível",
  "settings.colorStylePresetTagQuiet": "Sereno",
  "settings.paperThemes": "Tons de papel",
  "settings.appBackground": "Fundo do app",
  "settings.appBackgroundBody": "Escolha o tom de base em que suas páginas repousam.",
  "settings.appBackgroundDefaultBody": "O branco mantém o app especialmente calmo e aberto.",
  "settings.appBackgroundPreview": "Tom atual do app",
  "settings.appBackgroundSurfaceLabel": "Por trás das suas páginas",
  "settings.appBackgroundReset": "Voltar ao branco",
  "settings.textColor": "Cor do texto",
  "settings.textColorBody": "Escolha se o texto permanece no tom original ou ganha uma cor mais pessoal.",
  "settings.textColorDefaultTitle": "Padrão",
  "settings.textColorDefaultBody": "Mantenha o ritmo editorial original do texto no app.",
  "settings.textColorCustomTitle": "Tom próprio",
  "settings.textColorCustomBody": "Modele um tom pessoal de leitura para os textos principais do app.",
  "settings.textColorPreview": "Tom atual do texto",
  "settings.textColorReset": "Voltar ao padrão",
  "settings.contrastGood": "Boa legibilidade",
  "settings.contrastLow": "Essa combinação de cores pode ficar difícil de ler.",
  "settings.contrastAdjusted": "Ajustado levemente para melhorar a leitura.",
  "settings.colorCode": "Código HEX",
  "settings.colorCodeHint": "Digite uma cor com calma ou continue pelos controles.",
  "settings.colorCodeInvalid": "Digite uma cor HEX válida como #E9E2D8.",
  "settings.customPaperTheme": "Tom de papel próprio",
  "settings.customPaperThemeBody": "Crie um tom de papel mais pessoal e leve-o para toda a experiência.",
  "settings.customPaperThemePickerBody": "Escolha uma cor de papel personalizada mais suave. O app mantém o tom contido e legível enquanto você ajusta.",
  "settings.customPaperThemePreview": "Tom atual do papel",
  "settings.noteBackground": "Fundo da nota",
  "settings.noteBackgroundBody": "Mantenha a nota silenciosa clara por padrão ou escolha um tom pessoal suave apenas para o campo de nota.",
  "settings.noteBackgroundPreview": "Tom atual da nota",
  "settings.noteBackgroundReset": "Voltar ao branco",
  "settings.customPaperRed": "Vermelho",
  "settings.customPaperGreen": "Verde",
  "settings.customPaperBlue": "Azul",
  "settings.customPaperReset": "Voltar aos tons predefinidos",
  "settings.appearanceConfirmTitle": "Aplicar este estilo?",
  "settings.appearanceConfirmMessageLead": "Você quer mudar para",
  "settings.appearanceConfirmApply": "Aplicar",
  "settings.typographyStyles": "Estilos tipográficos",
  "settings.pageStyles": "Estilos de página",
  "settings.current": "Atual",
  "settings.aboutTitle": "Sobre",
  "settings.aboutBody": "Um lugar quieto para uma página por dia, feito para desacelerar o suficiente e deixar a reflexão respirar.",
  "settings.aboutCreator": "Criado com cuidado como um pequeno espaço pessoal para atenção, calma e perspectiva sincera.",
  "settings.resetTitle": "Redefinir dados locais",
  "settings.resetBody": "Isso vai limpar onboarding, favoritas, escolhas do arquivo e preferências.",
  "settings.resetButton": "Redefinir dados locais",
  "settings.included": "Incluído",
  "settings.premium": "Premium",
  "archive.eyebrow": "Arquivo",
  "archive.title": "Um registro silencioso de páginas anteriores.",
  "archive.subtitle": "Volte às páginas anteriores com a mesma atmosfera suave da página de hoje.",
  "archive.allReflections": "Todas as reflexões",
  "archive.savedOnly": "Só guardadas",
  "archive.searchPlaceholder": "Buscar por sentimento, categoria ou trecho",
  "archive.premiumTitle": "O arquivo completo está no Premium",
  "archive.premiumMessage": "No Freemium, o arquivo permanece menor. O Premium libera busca, filtros e mais espaço ao redor das páginas que você decide guardar.",
  "archive.emptyTitle": "Ainda não há páginas assim",
  "archive.emptyMessage": "Tente uma categoria mais ampla, limpe a busca ou guarde algumas reflexões para formar um arquivo mais suave.",
  "archive.noMatchTitle": "Nada combina com esta vista",
  "archive.noMatchMessage": "Tente uma busca mais suave, outra categoria ou volte para todas as reflexões.",
  "favorites.eyebrow": "Guardadas",
  "favorites.title": "Páginas guardadas",
  "favorites.subtitle": "Uma pequena pilha pessoal de páginas que ficaram com você e pediram para ser guardadas.",
  "favorites.emptyTitle": "Ainda não há páginas guardadas",
  "favorites.emptyMessage": "Guarde uma página de hoje ou do arquivo e comece sua própria coleção.",
  "favorites.noMatchTitle": "Nada combina com a sua coleção",
  "favorites.noMatchMessage": "Tente outra palavra ou limpe a categoria para voltar às suas páginas guardadas.",
  "favorites.keepAction": "Guardar",
  "favorites.removeAction": "Não guardar mais",
  "favorites.deleteConfirmTitle": "Remover reflexão guardada?",
  "favorites.deleteConfirmMessage": "Isso a remove da sua coleção. As notas permanecem na página datada se ela ainda existir no arquivo.",
  "favorites.searchPlaceholder": "Buscar reflexões guardadas",
  "favorites.premiumTitle": "Uma coleção maior está no Premium",
  "favorites.premiumMessage": "No Freemium, a coleção permanece menor. O Premium libera páginas sem limite, notas mais longas, busca, exportação e coleções pessoais.",
  "favorites.collectionsUpgradeTitle": "Seus pensamentos merecem ordem",
  "favorites.collectionsUpgradeBody": "Crie coleções pessoais e guarde o que realmente importa.",
  "favorites.collectionsUpgradeAction": "Desbloquear coleções",
  "favorites.savedCountLinePrefix": "Você já guardou",
  "favorites.savedCountLineSuffix": "pensamentos",
  "collections.eyebrow": "Coleções",
  "collections.title": "Coleções pessoais",
  "collections.subtitle": "Dê às páginas que você quer preservar um lugar próprio, silencioso e pessoal.",
  "collections.emptyTitle": "Ainda não há coleções",
  "collections.emptyMessage": "Crie sua primeira coleção e dê um lugar às páginas que você quer manter por perto.",
  "collections.newAction": "Nova coleção",
  "collections.createTitle": "Criar coleção",
  "collections.createBody": "Dê um título à coleção e, se quiser, uma breve nota sobre o que vive nela.",
  "collections.nameLabel": "Título",
  "collections.descriptionLabel": "Descrição",
  "collections.saveAction": "Salvar coleção",
  "collections.addAction": "Adicionar à coleção",
  "collections.addToPersonalCollectionsAction": "Para coleções pessoais",
  "collections.addHint": "Escolha uma coleção para esta página ou crie uma nova.",
  "collections.addedTitle": "Adicionada",
  "collections.addedBody": "A reflexão agora faz parte da sua coleção.",
  "collections.renameAction": "Renomear coleção",
  "collections.deleteAction": "Excluir coleção",
  "collections.deleteConfirmTitle": "Excluir coleção?",
  "collections.deleteConfirmMessage": "A coleção desaparece, mas as reflexões continuam nas suas páginas guardadas.",
  "collections.countLabel": "reflexões guardadas",
  "collections.detailEmptyTitle": "Esta coleção ainda está silenciosa",
  "collections.detailEmptyMessage": "Adicione uma reflexão guardada para dar a esta coleção a sua primeira página.",
  "collections.removeAction": "Remover da coleção",
  "collections.removeConfirmTitle": "Remover reflexão?",
  "collections.removeConfirmMessage": "Isso a remove apenas desta coleção. Ela continua nas suas páginas guardadas.",
  "collections.lockedTitle": "Coleções pessoais vivem no Premium",
  "collections.lockedBody": "Com Premium e Lifelong, você pode organizar suas páginas guardadas em coleções pessoais.",
  "collections.heroTitle": "Sua biblioteca de pensamentos",
  "collections.heroBody": "Organize pensamentos que você quer preservar em coleções pessoais.",
  "collections.emptyHeroTitle": "Sua primeira coleção",
  "collections.emptyHeroBody": "Aqui você reúne páginas que devem permanecer. Crie sua primeira coleção e dê um lugar aos seus pensamentos.",
  "collections.pagesSingle": "página",
  "collections.pagesPlural": "páginas",
  "collections.lastUpdatedPrefix": "Adicionada por último",
  "collections.editBody": "Ajuste o título e, se quiser, uma breve nota que dê caráter a esta coleção.",
  "collections.addSheetTitle": "Adicionar à coleção",
  "collections.addSheetBody": "Escolha uma coleção pessoal para esta reflexão guardada ou comece uma nova.",
  "collections.addedNotice": "Adicionada à coleção",
  "list.saved": "Guardada",
  "membership.eyebrow": "Assinatura",
  "membership.title": "Faça deste espaço algo realmente seu.",
  "membership.subtitle": "O Freemium começa com leveza. Premium e Lifelong abrem mais espaço para guardar, organizar e tornar este lugar seu.",
  "membership.heroLine": "O que importa para você merece ter um lugar.\nCom Premium, este espaço se torna ainda mais seu.",
  "membership.premiumIncludedTitle": "O Premium desbloqueia",
  "membership.premiumCardLine": "Mais espaço. Mais profundidade.\nMais do que permanece.",
  "membership.premiumCardBody": "Pensamentos que importam não deveriam simplesmente desaparecer.\nFaça deste espaço algo ao qual você sempre possa voltar.",
  "membership.lifelongCardLine": "Uma vez. Para sempre.",
  "membership.lifelongCardBody": "Um espaço que pertence a você para sempre.",
  "membership.lifelongCardNote": "Decida uma vez.\nE tudo continua com você, sem renovação.",
  "membership.freemiumMiniTitle": "Freemium",
  "membership.freemiumMiniBody": "Um começo sereno.\nUma página de cada vez.",
  "membership.benefitKeepClose": "Guarde mais do que realmente importa para você",
  "membership.benefitWriteFreely": "Escreva sem sentir limite",
  "membership.benefitMoveMorePersonally": "Deixe este espaço mais com a sua cara",
  "membership.benefitSavePages": "Guarde páginas que você nunca quer perder",
  "membership.benefitCollections": "Coleções pessoais para seus pensamentos",
  "membership.benefitStyle": "Cores, tipografia e estilo do seu jeito",
  "membership.benefitUnlimited": "Seu espaço pessoal, sem limites",
  "membership.benefitNothingLost": "Tudo fica. Nada se perde",
  "membership.trialLineOne": "7 dias grátis para experimentar",
  "membership.trialLineTwo": "Cancele quando quiser",
  "membership.socialProof": "Muitos usuários já guardam aqui as páginas mais importantes.",
  "membership.valueGroupSpace": "Seu espaço cresce",
  "membership.valueGroupClarity": "Mais clareza",
  "membership.valueGroupExpression": "Mais expressão",
  "membership.valueSpaceOne": "Guarde mais do que você quer revisitar",
  "membership.valueSpaceTwo": "Deixe pensamentos importantes mais perto de você",
  "membership.valueClarityOne": "Encontre páginas guardadas com mais facilidade",
  "membership.valueClarityTwo": "Dê uma ordem mais serena ao que você guarda",
  "membership.valueExpressionOne": "Escreva sem sentir limite",
  "membership.valueExpressionTwo": "Deixe este espaço mais com a sua cara",
  "membership.unlockAction": "Desbloquear Premium",
  "membership.openMembership": "Abrir assinatura",
  "membership.lockedArchiveTitle": "Busca e filtros ficam no Premium",
  "membership.lockedArchiveBody": "O Freemium mantém o arquivo menor e mais quieto. O Premium libera busca, filtros e o registro completo por data.",
  "membership.lockedSavedTitle": "Uma coleção maior está no Premium",
  "membership.lockedSavedBody": "No Freemium, suas páginas guardadas permanecem em um número menor. O Premium libera páginas sem limite, busca e exportação.",
  "membership.stateTitle": "Seu plano atual",
  "membership.errorTitle": "Os detalhes da assinatura estão silenciosos por enquanto",
  "membership.errorBody": "Seu plano atual continua funcionando. Os detalhes da loja podem voltar quando a conexão estiver pronta novamente.",
  "membership.lockedFeatureFootnote": "Preparado em silêncio para o Premium.",
  "membership.lifelongBadge": "Apoiador",
  "membership.planFreemium": "Freemium",
  "membership.planPremium": "Premium",
  "membership.planLifelong": "Lifelong",
  "membership.choosePremium": "Começar Premium",
  "membership.chooseLifelong": "Desbloquear uma vez",
  "membership.switchToPremium": "Mudar para Premium",
  "membership.unlockLifelong": "Desbloquear uma vez",
  "membership.purchasePlaceholderTitle": "Fluxo de compra vem a seguir",
  "membership.purchasePlaceholderBody": "Esta seleção de plano já está pronta para faturamento pela loja mais tarde. Em desenvolvimento, o override local de assinatura pode ser usado no lugar.",
  "membership.purchaseSuccessTitle": "Desbloqueado",
  "membership.purchaseSuccessPremium": "O Premium foi ativado com sucesso.",
  "membership.purchaseSuccessLifelong": "O Lifelong foi ativado com sucesso.",
  "membership.purchaseErrorTitle": "Compra não concluída",
  "membership.purchaseErrorBody": "A assinatura não pôde ser atualizada agora.",
  "membership.restoreSuccessTitle": "Restaurado",
  "membership.restoreSuccessBody": "Suas compras foram verificadas.",
  "membership.restoreErrorTitle": "Não disponível",
  "membership.restoreErrorBody": "As compras não puderam ser restauradas agora.",
};

export const frenchMessages: Messages = {
  ...englishMessages,
  "tabs.today": "Aujourd'hui",
  "tabs.archive": "Archives",
  "tabs.favorites": "Favoris",
  "tabs.settings": "Réglages",
  "common.continue": "Continuer",
  "common.continueWithoutName": "Continuer sans nom",
  "common.notNow": "Pas maintenant",
  "common.allowNotifications": "Autoriser les notifications",
  "common.preparing": "Préparation...",
  "common.searchLanguage": "Rechercher une langue",
  "common.cancel": "Annuler",
  "common.reset": "Réinitialiser",
  "common.refresh": "Actualiser",
  "onboarding.arrivalBody": "Un lieu calme pour les pensées qui méritent de rester.",
  "onboarding.arrivalAction": "Commencer",
  "onboarding.welcomeTitle": "Prenez un moment.",
  "onboarding.welcomeBody": "Certaines pensées méritent plus qu'un simple passage.",
  "onboarding.welcomeHero": "Tout ce qui compte ne devrait pas disparaître.",
  "onboarding.welcomeLineOne": "Vos journées sont pleines.",
  "onboarding.welcomeLineTwo": "Vos pensées se perdent entre les deux.",
  "onboarding.welcomeLineThree": "Une page par jour.\nRien de plus.",
  "onboarding.languageTitle": "Choisissez votre langue",
  "onboarding.languageBody": "Vous pourrez la changer à tout moment.",
  "onboarding.languageSearchPlaceholder": "Rechercher une langue",
  "onboarding.nameTitle": "Comment pouvons-nous vous appeler ?",
  "onboarding.nameBody": "Cet espace peut devenir plus personnel.",
  "onboarding.namePlaceholder": "Votre nom",
  "onboarding.ackBody": "Cet espace peut vraiment devenir le vôtre.",
  "onboarding.ackCard": "Une page par jour. Assez calme pour remarquer ce qui reste près de vous.",
  "onboarding.preferenceTitle": "De quoi voulez-vous davantage ?",
  "onboarding.preferenceBody": "Choisissez jusqu'à deux choses vers lesquelles vous aimeriez vous orienter plus souvent.",
  "onboarding.preferenceHint": "Jusqu'à deux choix.",
  "onboarding.transitionTitle": "Commençons.",
  "onboarding.transitionBody": "Votre première page est déjà prête.",
  "onboarding.transitionAction": "Continuer",
  "onboarding.introTitle": "Votre première page d'aujourd'hui.",
  "onboarding.introBody": "Ouvrez-la quand vous serez prêt.",
  "onboarding.introAction": "Voir la première page",
  "onboarding.choiceTitle": "Faites de cet espace le vôtre.",
  "onboarding.choiceBody": "Gardez près de vous ce qui compte.\nFaçonnez cet espace comme il vous semble juste.",
  "onboarding.choiceFreeTitle": "Gratuit",
  "onboarding.choiceFreeBody": "Un début calme.\nUne page à la fois.",
  "onboarding.choiceFreeAction": "Continuer en gratuit",
  "onboarding.finishFreeAction": "Continuer en gratuit",
  "onboarding.choicePremiumTitle": "Premium",
  "onboarding.choicePremiumBody": "Les pensées qui comptent méritent une place.\nFaites de cet espace quelque chose qui vous appartient vraiment.",
  "onboarding.choicePremiumAction": "Commencer Premium",
  "onboarding.finishAction": "Ouvrir Daytri",
  "onboarding.notificationTimeTitle": "Choisissez l'heure exacte.",
  "onboarding.notificationTimeBody": "Votre page quotidienne peut vous rejoindre exactement quand cela vous convient.",
  "onboarding.ritualTimeTitle": "Quel est votre moment ?",
  "onboarding.ritualTimeBody": "Choisissez le moment de la journée qui s'accorde le mieux avec votre rythme.",
  "onboarding.ritualTimeHint": "On reste plus fidèle à ce qui trouve naturellement sa place dans la journée.",
  "onboarding.ritualTimeMorningTitle": "Matin (6-9)",
  "onboarding.ritualTimeMorningBody": "Commencez la journée avec clarté",
  "onboarding.ritualTimeMiddayTitle": "Milieu de journée (11-14)",
  "onboarding.ritualTimeMiddayBody": "Une courte remise au centre pendant la journée",
  "onboarding.ritualTimeEveningTitle": "Soir (18-21)",
  "onboarding.ritualTimeEveningBody": "Revenez sur votre journée",
  "onboarding.ritualTimeLateTitle": "Fin de soirée (21-23)",
  "onboarding.ritualTimeLateBody": "Une manière calme de clore la journée",
  "onboarding.ritualTimeCustomTitle": "Choisir votre propre heure",
  "onboarding.ritualTimeCustomBody": "Choisissez un moment qui épouse vraiment votre rythme",
  "onboarding.notificationPermissionTitle": "Laissez-la vous rejoindre doucement.",
  "onboarding.notificationPermissionBody": "Seulement à l'heure que vous choisissez.",
  "onboarding.membershipBenefitKeep": "Gardez les pages qui restent avec vous",
  "onboarding.membershipBenefitCollections": "Créez des collections personnelles",
  "onboarding.membershipBenefitStyle": "Façonnez couleurs, typographie et atmosphère",
  "onboarding.membershipBenefitNotes": "Gardez notes et pensées plus intentionnellement",
  "today.eyebrow": "Aujourd'hui",
  "today.title": "Aujourd'hui",
  "today.defaultSubtitle": "Une pensée, gardée tranquille pour la journée.",
  "today.keep": "Garder",
  "today.kept": "Gardée.",
  "today.share": "Partager",
  "today.shareDialogTitle": "Partager la carte de réflexion",
  "today.shareFallbackMessage": "Réflexion du jour",
  "today.shareUnavailableTitle": "Partage impossible",
  "today.shareUnavailableBody": "La carte de réflexion n'a pas pu être partagée sur cet appareil.",
  "today.helper": "Vous pouvez y revenir à tout moment.",
  "today.noteTitle": "Une note silencieuse",
  "today.notePlaceholder": "Vos pensées sur cette réflexion ...",
  "today.saveLimitTitle": "Une collection plus petite vit ici",
  "today.saveLimitBody": "Le mode gratuit garde jusqu'à 7 réflexions sauvegardées. Retirez-en une ou ouvrez Premium pour une collection personnelle plus vaste.",
  "today.noteLockedBody": "Le mode gratuit garde des notes pour les réflexions que vous choisissez de conserver. Premium ouvre des notes plus longues et plus d'espace autour de ce qui reste avec vous.",
  "today.noteLimitHint": "Le mode gratuit garde des notes plus courtes. Premium ouvre des notes de réflexion plus longues.",
  "today.followUpAction": "Approfondir la réflexion",
  "today.followUpLoading": "Une impulsion plus calme arrive ...",
  "today.followUpTitle": "Pistes supplémentaires",
  "today.followUpError": "Une autre piste n'a pas pu être préparée pour l'instant.",
  "today.followUpLimitBody": "Le suivi IA du jour est déjà utilisé aujourd'hui. Premium ouvre davantage d'espace pour d'autres pistes.",
  "today.swipeHint": "Faites glisser doucement la page pour traverser les jours conservés.",
  "today.tomorrowHint": "Demain apportera une nouvelle page.",
  "today.preparing": "Votre réflexion se prépare.",
  "today.notificationEntryLine": "Votre page du jour",
  "today.lateOpenTitle": "Votre page vous attend encore.",
  "today.lateOpenBody": "Prenez un moment calme avec la page d'aujourd'hui, lorsqu'elle vous rejoint.",
  "today.lateOpenPrimary": "Ouvrir la page du jour",
  "today.lateOpenSecondary": "Plus tard",
  "reflection.title": "Réflexion",
  "reflection.unavailable": "Réflexion indisponible.",
  "settings.eyebrow": "Réglages",
  "settings.title": "Préférences calmes",
  "settings.subtitle": "Tout ici reste d'abord local, avec de l'espace pour une personnalisation premium plus profonde plus tard.",
  "settings.standardSectionTitle": "Réglages par défaut",
  "settings.standardSectionSummary": "Heure du rappel, catégories, apparence et langue.",
  "settings.freemiumSectionSummary": "Choix inclus de papier, de texte et de page.",
  "settings.premiumSectionSummary": "Tons premium, typographie et mises en page plus riches.",
  "settings.plansSectionTitle": "Formules",
  "settings.plansSectionSummary": "Freemium, Premium et Lifelong.",
  "settings.notificationTime": "Heure du rappel",
  "settings.deliveryRitual": "Rituel d'envoi",
  "settings.deliveryRitualBody": "La façon dont cette page vous rejoint, avec le moins de bruit possible.",
  "settings.notificationsEnabled": "Notifications",
  "settings.notificationsEnabledBody": "Laisser l'invitation quotidienne active.",
  "settings.soundEnabled": "Son",
  "settings.soundEnabledBody": "Laisser le rappel arriver avec un son discret.",
  "settings.hapticsEnabled": "Retour tactile",
  "settings.hapticsEnabledBody": "Un léger contact quand la page s'ouvre.",
  "settings.silentMode": "Mode silencieux",
  "settings.silentModeBody": "Garder l'arrivée visible, mais sans son ni retour tactile.",
  "settings.preferredCategories": "Catégories préférées",
  "settings.language": "Langue de l'app",
  "settings.languageBody": "Définit la langue de l'interface.",
  "settings.languageCurrentHint": "Navigation, réglages, boutons, libellés et dates apparaissent dans cette langue.",
  "settings.languageSearchPlaceholder": "Rechercher la langue de l'app",
  "settings.quoteLanguages": "Langue des réflexions",
  "settings.quoteLanguagesBody": "Par défaut, votre page quotidienne suit la langue de l'app.",
  "settings.quoteLanguagesPremiumBody": "Choisissez une ou plusieurs langues pour vos réflexions, indépendamment de l'app.",
  "settings.quoteLanguagesLockedBody": "Une langue de réflexion indépendante s'ouvre dans Premium et Lifelong.",
  "settings.quoteLanguagesCurrentHintSameAsApp": "Les réflexions du jour, des archives et les pages sauvegardées suivent la langue de l'app.",
  "settings.quoteLanguagesCurrentHintCustom": "Les réflexions du jour, des archives et les pages sauvegardées utilisent cette langue.",
  "settings.quoteLanguagesFallbackBody": "Si une réflexion n'est pas encore disponible dans cette langue, elle revient discrètement à l'anglais.",
  "settings.quoteLanguagesSearchPlaceholder": "Rechercher une langue",
  "settings.quoteLanguagesSelectMultiple": "Choisissez une ou plusieurs langues pour vos réflexions.",
  "settings.quoteLanguagesSelectedLanguages": "Langues sélectionnées",
  "settings.quoteLanguagesSelectedTag": "Active",
  "settings.quoteLanguagesAppTag": "App",
  "settings.reflectionLanguageSameAsApp": "Comme l'app",
  "settings.reflectionLanguageCustom": "Langue personnalisée",
  "settings.reflectionLanguageFollowsApp": "Suit la langue de l'app",
  "settings.privateSettingsTitle": "Réglages privés",
  "settings.privateSettingsLockedBody": "Plus d'espace personnel autour de la langue, du fond, du papier, de la typographie et de l'export s'ouvre dans Premium et Lifelong.",
  "settings.privateSettingsLockedHint": "Plus d'espace personnel dans Premium.",
  "settings.privateSettingsUnlockAction": "Ouvrir avec Premium",
  "settings.groupAppearance": "Apparence",
  "settings.groupCollectionOrder": "Collection et ordre",
  "settings.groupLanguageContent": "Langue et contenu",
  "settings.groupCollectionSharing": "Collection et partage",
  "settings.groupPremium": "Mon abonnement",
  "settings.mySubscription": "Mon abonnement",
  "settings.exportAction": "Envoyer maintenant",
  "settings.exportSavedReflections": "Envoyer les réflexions gardées par e-mail",
  "settings.exportSavedReflectionsSubject": "Réflexions gardées",
  "settings.exportSavedReflectionsFallbackTitle": "Réflexions gardées",
  "settings.exportSavedReflectionsBody": "Envoyez vos pages gardées et vos notes ensemble dans un export calme, ou conservez-les comme journal PDF.",
  "settings.exportPdfAction": "Exporter en PDF",
  "settings.exportPdfFallbackTitle": "PDF des réflexions gardées",
  "settings.exportPdfFilePrefix": "journal-reflexions-gardees",
  "settings.exportCollectionTitle": "Réflexions gardées",
  "settings.exportCollectionSubtitle": "Une collection personnelle de réflexions et de notes",
  "settings.exportCollectionCount": "réflexions gardées",
  "settings.exportReflectionLabel": "Réflexion",
  "settings.exportCategoryLabel": "Catégorie",
  "settings.exportLanguageLabel": "Langue",
  "settings.exportSourceLabel": "Source",
  "settings.exportExportedOnLabel": "Exporté le",
  "settings.exportFilePrefix": "reflexions-gardees",
  "settings.exportEmailIntro": "Voici votre collection gardée de réflexions et de notes.",
  "settings.exportEmptyTitle": "Rien à exporter pour l'instant",
  "settings.exportEmptyMessage": "Gardez d'abord quelques réflexions, puis elles seront prêtes pour une sauvegarde paisible.",
  "settings.darkMode": "Mode sombre",
  "settings.darkModeBody": "Garder l'expérience douce et calme dans la pénombre aussi.",
  "settings.premiumTitle": "Personnalisation Premium",
  "settings.premiumBody": "Premium ouvre les parties plus calmes de l'app qui aident vos réflexions à rester proches.",
  "settings.premiumCollectionsTitle": "Votre bibliothèque de pensées",
  "settings.premiumCollectionsBody": "Organisez les réflexions qui comptent le plus. Créez votre propre collection à partir des moments que vous voulez garder près de vous.",
  "settings.subscriptionStatus": "Statut de l'abonnement",
  "settings.restorePurchases": "Restaurer les achats",
  "settings.manageSubscription": "Gérer l'abonnement",
  "settings.manageSubscriptionBody": "Gérez votre formule en douceur, sans perdre le rythme de votre page.",
  "settings.restoreSuccessTitle": "Achats restaurés",
  "settings.restoreSuccessBody": "Vos achats ont bien été restaurés.",
  "settings.restoreErrorTitle": "Restauration impossible",
  "settings.restoreErrorBody": "Les achats n'ont pas pu être restaurés pour l'instant.",
  "settings.upgradeAction": "Passer à Premium",
  "settings.premiumPreviewTitle": "Accès Premium",
  "settings.premiumPreviewBody": "Ouvrez l'archive complète, des pages gardées sans limite, l'export et davantage d'espace personnel.",
  "settings.colorStyle": "Style de couleur",
  "settings.colorStyleBody": "Choisissez l'atmosphère visuelle de votre page.",
  "settings.colorStyleDefault": "Style par défaut",
  "settings.colorStylePresets": "Styles préparés",
  "settings.colorStyleCustom": "Style personnel",
  "settings.colorStyleDefaultBody": "L'équilibre calme d'origine, sans réglages supplémentaires.",
  "settings.colorStyleCustomBody": "Ajustez le papier, le fond et la couleur du texte avec davantage de précision.",
  "settings.colorStylePreview": "Aperçu",
  "settings.colorStyleLockedBody": "Des réglages visuels plus profonds s'ouvrent dans Premium.",
  "settings.colorStyleAdvancedTitle": "Réglages fins",
  "settings.colorStyleAdvancedBody": "Accordez le ton du papier, du fond et du texte plus précisément.",
  "settings.colorStylePresetTagBalanced": "Équilibré",
  "settings.colorStylePresetTagQuiet": "Calme",
  "settings.colorStylePresetTagReadable": "Lisible",
  "settings.colorStylePresetTagRecommended": "Recommandé",
  "settings.colorStylePresetTagWarmCalm": "Chaleur douce",
  "settings.appBackground": "Fond de l'app",
  "settings.appBackgroundBody": "Choisissez le calme qui entoure vos pages.",
  "settings.appBackgroundDefaultBody": "Le fond par défaut garde l'espace lumineux et discret.",
  "settings.appBackgroundPreview": "Fond actuel",
  "settings.appBackgroundSurfaceLabel": "Surface de l'app",
  "settings.appBackgroundReset": "Revenir au fond par défaut",
  "settings.textColor": "Couleur du texte",
  "settings.textColorBody": "Gardez la lecture claire et paisible.",
  "settings.textColorDefaultTitle": "Texte par défaut",
  "settings.textColorCustomTitle": "Texte personnalisé",
  "settings.textColorCustomBody": "Adaptez le ton de lecture au papier que vous avez choisi.",
  "settings.textColorPreview": "Aperçu du texte",
  "settings.textColorReset": "Revenir au texte par défaut",
  "settings.contrastGood": "Bonne lisibilité",
  "settings.contrastLow": "Cette combinaison de couleurs pourrait devenir difficile à lire.",
  "settings.contrastAdjusted": "Légèrement ajusté pour améliorer la lecture.",
  "settings.colorCode": "Code HEX",
  "settings.colorCodeHint": "Entrez une couleur avec calme ou continuez avec les réglages.",
  "settings.colorCodeInvalid": "Entrez une couleur HEX valide comme #E9E2D8.",
  "settings.customPaperTheme": "Ton de papier personnel",
  "settings.customPaperThemeBody": "Créez un ton de papier plus personnel et laissez-le traverser l'expérience entière.",
  "settings.customPaperThemePickerBody": "Choisissez une couleur de papier plus douce. L'app garde la teinte contenue et lisible pendant vos ajustements.",
  "settings.customPaperThemePreview": "Ton actuel du papier",
  "settings.noteBackground": "Fond de la note",
  "settings.noteBackgroundBody": "Gardez la note claire par défaut ou choisissez une teinte personnelle douce seulement pour ce champ.",
  "settings.noteBackgroundPreview": "Ton actuel de la note",
  "settings.noteBackgroundReset": "Revenir au blanc",
  "settings.customPaperRed": "Rouge",
  "settings.customPaperGreen": "Vert",
  "settings.customPaperBlue": "Bleu",
  "settings.customPaperReset": "Revenir aux tons préparés",
  "settings.appearanceConfirmTitle": "Appliquer ce style ?",
  "settings.appearanceConfirmMessageLead": "Voulez-vous passer à",
  "settings.appearanceConfirmApply": "Appliquer",
  "settings.typographyStyles": "Styles typographiques",
  "settings.pageStyles": "Styles de page",
  "settings.current": "Actuel",
  "settings.aboutTitle": "À propos",
  "settings.aboutBody": "Un endroit calme pour une page par jour, conçu pour ralentir juste assez afin de laisser respirer la réflexion.",
  "settings.aboutCreator": "Créé avec soin comme un petit espace personnel d'attention, de calme et de perspective sincère.",
  "settings.resetTitle": "Réinitialiser les données locales",
  "settings.resetBody": "Cela effacera l'onboarding, les favoris, les choix d'archives et les préférences.",
  "settings.resetButton": "Réinitialiser les données locales",
  "settings.included": "Inclus",
  "settings.premium": "Premium",
  "archive.eyebrow": "Archives",
  "archive.title": "Une trace silencieuse des pages précédentes.",
  "archive.subtitle": "Revenez aux pages passées avec la même atmosphère douce que celle d'aujourd'hui.",
  "archive.allReflections": "Toutes les réflexions",
  "archive.savedOnly": "Sauvegardées seulement",
  "archive.searchPlaceholder": "Chercher par ressenti, catégorie ou phrase",
  "archive.premiumTitle": "Les archives complètes s'ouvrent dans Premium",
  "archive.premiumMessage": "En mode gratuit, les archives restent plus petites. Premium ouvre la recherche, les filtres et davantage d'espace autour des pages que vous choisissez de garder.",
  "archive.emptyTitle": "Il n'y a pas encore de pages ici",
  "archive.emptyMessage": "Essayez une catégorie plus large, effacez la recherche ou gardez quelques réflexions pour former des archives plus douces.",
  "archive.noMatchTitle": "Rien ne correspond à cette vue",
  "archive.noMatchMessage": "Essayez une recherche plus légère, une autre catégorie ou revenez à toutes les réflexions.",
  "favorites.eyebrow": "Conservées",
  "favorites.title": "Pages conservées",
  "favorites.subtitle": "Une petite pile personnelle de pages restées avec vous et qui ont demandé à être gardées.",
  "favorites.emptyTitle": "Aucune page conservée pour l'instant",
  "favorites.emptyMessage": "Gardez une page d'aujourd'hui ou des archives et commencez votre propre collection.",
  "favorites.noMatchTitle": "Rien ne correspond à votre collection",
  "favorites.noMatchMessage": "Essayez un autre mot ou retirez la catégorie pour revenir à vos pages gardées.",
  "favorites.keepAction": "Garder",
  "favorites.removeAction": "Ne plus garder",
  "favorites.deleteConfirmTitle": "Retirer cette page conservée ?",
  "favorites.deleteConfirmMessage": "Elle sera retirée de votre collection. Les notes restent liées à la page datée si elle vit encore dans les archives.",
  "favorites.searchPlaceholder": "Rechercher dans les pages conservées",
  "favorites.premiumTitle": "Une collection plus vaste s'ouvre dans Premium",
  "favorites.premiumMessage": "En mode gratuit, la collection reste plus petite. Premium ouvre des pages sans limite, des notes plus longues, la recherche, l'export et les collections personnelles.",
  "favorites.collectionsUpgradeTitle": "Vos pensées méritent une forme",
  "favorites.collectionsUpgradeBody": "Créez des collections personnelles et gardez ce qui compte vraiment.",
  "favorites.collectionsUpgradeAction": "Déverrouiller les collections",
  "favorites.savedCountLinePrefix": "Vous avez déjà gardé",
  "favorites.savedCountLineSuffix": "pensées",
  "collections.eyebrow": "Collections",
  "collections.title": "Collections personnelles",
  "collections.subtitle": "Offrez aux pages que vous voulez garder un lieu à elles, calme et personnel.",
  "collections.emptyTitle": "Aucune collection pour l'instant",
  "collections.emptyMessage": "Créez votre première collection et donnez une place aux pages que vous voulez garder près de vous.",
  "collections.newAction": "Nouvelle collection",
  "collections.createTitle": "Créer une collection",
  "collections.createBody": "Donnez un titre à votre collection et, si vous le souhaitez, une courte note sur ce qu'elle rassemble.",
  "collections.nameLabel": "Titre",
  "collections.descriptionLabel": "Description",
  "collections.saveAction": "Enregistrer la collection",
  "collections.addAction": "Ajouter à la collection",
  "collections.addToPersonalCollectionsAction": "Vers les collections personnelles",
  "collections.addHint": "Choisissez une collection pour cette page ou créez-en une nouvelle.",
  "collections.addedTitle": "Ajoutée",
  "collections.addedBody": "La réflexion fait maintenant partie de votre collection.",
  "collections.renameAction": "Renommer la collection",
  "collections.deleteAction": "Supprimer la collection",
  "collections.deleteConfirmTitle": "Supprimer la collection ?",
  "collections.deleteConfirmMessage": "La collection disparaît, mais les réflexions restent dans vos pages conservées.",
  "collections.countLabel": "réflexions conservées",
  "collections.detailEmptyTitle": "Cette collection est encore silencieuse",
  "collections.detailEmptyMessage": "Ajoutez une réflexion conservée pour offrir à cette collection sa première page.",
  "collections.removeAction": "Retirer de la collection",
  "collections.removeConfirmTitle": "Retirer cette réflexion ?",
  "collections.removeConfirmMessage": "Elle sera retirée seulement de cette collection. Elle reste dans vos pages conservées.",
  "collections.lockedTitle": "Les collections personnelles vivent dans Premium",
  "collections.lockedBody": "Avec Premium et Lifelong, vous pouvez organiser vos pages conservées en collections personnelles.",
  "collections.heroTitle": "Votre bibliothèque de pensées",
  "collections.heroBody": "Organisez les pensées que vous voulez garder dans des collections personnelles.",
  "collections.emptyHeroTitle": "Votre première collection",
  "collections.emptyHeroBody": "Ici, vous rassemblez les pages qui méritent de rester. Créez votre première collection et donnez une place à vos pensées.",
  "collections.pagesSingle": "page",
  "collections.pagesPlural": "pages",
  "collections.lastUpdatedPrefix": "Ajoutée en dernier",
  "collections.editBody": "Ajustez le titre et, si vous le souhaitez, une courte note qui donne un ton à cette collection.",
  "collections.addSheetTitle": "Ajouter à la collection",
  "collections.addSheetBody": "Choisissez une collection personnelle pour cette réflexion conservée ou commencez-en une nouvelle.",
  "collections.addedNotice": "Ajoutée à la collection",
  "list.saved": "Gardée",
  "membership.eyebrow": "Abonnement",
  "membership.title": "Faites vraiment de cet espace le vôtre.",
  "membership.subtitle": "Freemium commence avec douceur. Premium et Lifelong ouvrent davantage d'espace pour garder, organiser et faire réellement de cet endroit le vôtre.",
  "membership.heroLine": "Ce qui compte pour vous mérite une vraie place.\nAvec Premium, cet espace devient encore plus le vôtre.",
  "membership.premiumIncludedTitle": "Premium ouvre",
  "membership.premiumCardLine": "Plus d'espace. Plus de profondeur.\nPlus de ce qui demeure.",
  "membership.premiumCardBody": "Les pensées qui comptent ne devraient pas simplement disparaître.\nFaites de cet espace un lieu vers lequel revenir.",
  "membership.lifelongCardLine": "Une fois. Pour toujours.",
  "membership.lifelongCardBody": "Un espace qui vous appartient pour toujours.",
  "membership.lifelongCardNote": "Décider une fois.\nEt tout reste avec vous, sans renouvellement.",
  "membership.freemiumMiniTitle": "Freemium",
  "membership.freemiumMiniBody": "Un début calme.\nUne page à la fois.",
  "membership.benefitKeepClose": "Gardez davantage de ce qui compte pour vous",
  "membership.benefitWriteFreely": "Écrivez sans vous sentir limité",
  "membership.benefitMoveMorePersonally": "Façonnez cet espace plus à votre mesure",
  "membership.benefitSavePages": "Gardez les pages que vous ne voulez jamais perdre",
  "membership.benefitCollections": "Des collections personnelles pour vos pensées",
  "membership.benefitStyle": "Couleurs, typographie et style selon votre ressenti",
  "membership.benefitUnlimited": "Votre espace personnel, sans limite",
  "membership.benefitNothingLost": "Tout reste. Rien ne se perd",
  "membership.trialLineOne": "Essayer gratuitement pendant 7 jours",
  "membership.trialLineTwo": "Annulable à tout moment",
  "membership.socialProof": "Beaucoup d'utilisateurs y gardent déjà leurs pages les plus importantes.",
  "membership.valueGroupSpace": "Votre espace grandit",
  "membership.valueGroupClarity": "Plus de clarté",
  "membership.valueGroupExpression": "Plus d'expression",
  "membership.valueSpaceOne": "Gardez davantage de ce que vous voulez retrouver",
  "membership.valueSpaceTwo": "Laissez les pensées importantes rester près de vous",
  "membership.valueClarityOne": "Retrouvez plus facilement vos pages gardées",
  "membership.valueClarityTwo": "Donnez un ordre plus calme à ce que vous gardez",
  "membership.valueExpressionOne": "Écrivez sans vous sentir limité",
  "membership.valueExpressionTwo": "Façonnez cet espace davantage à votre mesure",
  "membership.unlockAction": "Déverrouiller Premium",
  "membership.openMembership": "Ouvrir l'abonnement",
  "membership.lockedArchiveTitle": "Recherche et filtres vivent dans Premium",
  "membership.lockedArchiveBody": "Le mode gratuit garde les archives plus petites et plus silencieuses. Premium ouvre la recherche, les filtres et l'historique complet par date.",
  "membership.lockedSavedTitle": "Une collection plus vaste s'ouvre dans Premium",
  "membership.lockedSavedBody": "En mode gratuit, vos pages conservées restent en nombre plus réduit. Premium ouvre des pages sans limite, la recherche et l'export.",
  "membership.stateTitle": "Votre formule actuelle",
  "membership.errorTitle": "Les détails de l'abonnement restent silencieux pour l'instant",
  "membership.errorBody": "Votre formule actuelle continue de fonctionner. Les détails de la boutique pourront revenir quand la connexion sera prête.",
  "membership.lockedFeatureFootnote": "Préparé en silence pour Premium.",
  "membership.lifelongBadge": "Soutien",
  "membership.planFreemium": "Freemium",
  "membership.planPremium": "Premium",
  "membership.planLifelong": "Lifelong",
  "membership.choosePremium": "Commencer Premium",
  "membership.chooseLifelong": "Déverrouiller une fois",
  "membership.switchToPremium": "Passer à Premium",
  "membership.unlockLifelong": "Déverrouiller une fois",
  "membership.purchasePlaceholderTitle": "Le flux d'achat vient ensuite",
  "membership.purchasePlaceholderBody": "Cette formule est déjà prête pour une facturation via la boutique plus tard. En développement, l'override local d'abonnement peut être utilisé à la place.",
  "membership.purchaseSuccessTitle": "Déverrouillé",
  "membership.purchaseSuccessPremium": "Premium a bien été activé.",
  "membership.purchaseSuccessLifelong": "Lifelong a bien été activé.",
  "membership.purchaseErrorTitle": "Achat non finalisé",
  "membership.purchaseErrorBody": "L'abonnement n'a pas pu être mis à jour pour l'instant.",
  "membership.restoreSuccessTitle": "Restauré",
  "membership.restoreSuccessBody": "Vos achats ont été vérifiés.",
  "membership.restoreErrorTitle": "Indisponible",
  "membership.restoreErrorBody": "Les achats n'ont pas pu être restaurés pour l'instant.",
};

export const spanishMessages: Messages = {
  ...englishMessages,
  "tabs.today": "Hoy",
  "tabs.archive": "Archivo",
  "tabs.favorites": "Guardadas",
  "tabs.settings": "Ajustes",
  "common.continue": "Continuar",
  "common.continueWithoutName": "Continuar sin nombre",
  "common.notNow": "Ahora no",
  "common.allowNotifications": "Permitir notificaciones",
  "common.preparing": "Preparando...",
  "common.searchLanguage": "Buscar idioma",
  "common.cancel": "Cancelar",
  "common.reset": "Restablecer",
  "common.refresh": "Actualizar",
  "onboarding.arrivalBody": "Un lugar sereno para los pensamientos que merecen quedarse.",
  "onboarding.arrivalAction": "Empezar",
  "onboarding.welcomeTitle": "Tómate un momento.",
  "onboarding.welcomeBody": "Hay pensamientos que merecen algo más que pasar de largo.",
  "onboarding.welcomeHero": "No todo lo que importa debería desaparecer.",
  "onboarding.welcomeLineOne": "Tus días están llenos.",
  "onboarding.welcomeLineTwo": "Tus pensamientos se pierden entre medias.",
  "onboarding.welcomeLineThree": "Una página al día.\nNada más.",
  "onboarding.languageTitle": "Elige tu idioma",
  "onboarding.languageBody": "Podrás cambiarlo cuando quieras.",
  "onboarding.languageSearchPlaceholder": "Buscar idioma",
  "onboarding.nameTitle": "¿Cómo te llamamos?",
  "onboarding.nameBody": "Este espacio puede sentirse más personal.",
  "onboarding.namePlaceholder": "Tu nombre",
  "onboarding.ackBody": "Este espacio puede sentirse realmente tuyo.",
  "onboarding.ackCard": "Una página al día. Lo bastante serena para notar lo que permanece contigo.",
  "onboarding.preferenceTitle": "¿De qué quieres más?",
  "onboarding.preferenceBody": "Elige hasta dos cosas hacia las que te gustaría orientarte más a menudo.",
  "onboarding.preferenceHint": "Elige hasta dos.",
  "onboarding.transitionTitle": "Empecemos.",
  "onboarding.transitionBody": "Tu primera página ya está lista.",
  "onboarding.transitionAction": "Continuar",
  "onboarding.introTitle": "Tu primera página de hoy.",
  "onboarding.introBody": "Ábrela cuando estés listo.",
  "onboarding.introAction": "Ver primera página",
  "onboarding.choiceTitle": "Haz de este espacio algo tuyo.",
  "onboarding.choiceBody": "Mantén cerca lo que te importa.\nDa forma a este espacio de la manera que se sienta adecuada para ti.",
  "onboarding.choiceFreeTitle": "Gratis",
  "onboarding.choiceFreeBody": "Un comienzo sereno.\nUna página cada vez.",
  "onboarding.choiceFreeAction": "Continuar con Gratis",
  "onboarding.finishFreeAction": "Continuar con Gratis",
  "onboarding.choicePremiumTitle": "Premium",
  "onboarding.choicePremiumBody": "Los pensamientos que importan merecen un lugar.\nHaz de este espacio algo que de verdad sientas tuyo.",
  "onboarding.choicePremiumAction": "Empezar Premium",
  "onboarding.finishAction": "Abrir Daytri",
  "onboarding.notificationTimeTitle": "Elige la hora exacta.",
  "onboarding.notificationTimeBody": "Tu página diaria puede llegar exactamente cuando mejor encaje.",
  "onboarding.ritualTimeTitle": "¿Cuál es tu momento?",
  "onboarding.ritualTimeBody": "Elige el momento del día que mejor acompañe tu ritmo.",
  "onboarding.ritualTimeHint": "Es más fácil ser constante cuando el momento encaja de verdad con tu día.",
  "onboarding.ritualTimeMorningTitle": "Mañana (6-9)",
  "onboarding.ritualTimeMorningBody": "Empieza el día con claridad",
  "onboarding.ritualTimeMiddayTitle": "Mediodía (11-14)",
  "onboarding.ritualTimeMiddayBody": "Un breve reinicio durante el día",
  "onboarding.ritualTimeEveningTitle": "Tarde (18-21)",
  "onboarding.ritualTimeEveningBody": "Reflexiona sobre tu día",
  "onboarding.ritualTimeLateTitle": "Última hora de la noche (21-23)",
  "onboarding.ritualTimeLateBody": "Una forma tranquila de cerrar el día",
  "onboarding.ritualTimeCustomTitle": "Elige tu propia hora",
  "onboarding.ritualTimeCustomBody": "Fija un momento que de verdad encaje con tu ritmo",
  "onboarding.notificationPermissionTitle": "Deja que llegue con suavidad.",
  "onboarding.notificationPermissionBody": "Solo a la hora que tú elijas.",
  "onboarding.membershipBenefitKeep": "Guarda las páginas que se quedan contigo",
  "onboarding.membershipBenefitCollections": "Crea colecciones personales",
  "onboarding.membershipBenefitStyle": "Da forma a colores, tipografía y atmósfera",
  "onboarding.membershipBenefitNotes": "Escribe notas y pensamientos con más intención",
  "today.eyebrow": "Hoy",
  "today.title": "Hoy",
  "today.defaultSubtitle": "Una pregunta, quieta durante el día.",
  "today.keep": "Guardar",
  "today.kept": "Guardada.",
  "today.share": "Compartir",
  "today.shareDialogTitle": "Compartir la tarjeta de reflexión",
  "today.shareFallbackMessage": "Reflexión diaria",
  "today.shareUnavailableTitle": "No se pudo compartir",
  "today.shareUnavailableBody": "La tarjeta de reflexión no pudo compartirse en este dispositivo.",
  "today.helper": "Puedes volver a ella en cualquier momento.",
  "today.noteTitle": "Una nota serena",
  "today.notePlaceholder": "Tus pensamientos sobre esta reflexión ...",
  "today.saveLimitTitle": "Aquí vive una colección más pequeña",
  "today.saveLimitBody": "El modo gratuito guarda hasta 7 reflexiones. Elimina una o abre Premium para una colección personal más amplia.",
  "today.noteLockedBody": "El modo gratuito guarda notas para las reflexiones que eliges conservar. Premium abre notas más largas y más espacio alrededor de lo que se queda contigo.",
  "today.noteLimitHint": "El modo gratuito guarda notas más breves. Premium abre notas de reflexión más largas.",
  "today.followUpAction": "Profundizar la reflexión",
  "today.followUpLoading": "Está llegando un impulso más sereno ...",
  "today.followUpTitle": "Nuevas pistas",
  "today.followUpError": "No se pudo preparar otra pista en este momento.",
  "today.followUpLimitBody": "El seguimiento diario con IA ya se usó hoy. Premium abre más espacio para nuevas pistas.",
  "today.swipeHint": "Desliza con suavidad por la página para recorrer los días guardados.",
  "today.tomorrowHint": "Mañana traerá una nueva página.",
  "today.preparing": "Tu reflexión se está preparando.",
  "today.notificationEntryLine": "Tu página de hoy",
  "today.lateOpenTitle": "Tu página sigue aquí.",
  "today.lateOpenBody": "Tómate un momento tranquilo con la página de hoy, cuando tenga sentido para ti.",
  "today.lateOpenPrimary": "Abrir la página de hoy",
  "today.lateOpenSecondary": "Más tarde",
  "reflection.title": "Reflexión",
  "reflection.unavailable": "Reflexión no disponible.",
  "settings.eyebrow": "Ajustes",
  "settings.title": "Preferencias serenas",
  "settings.subtitle": "Todo aquí permanece primero en local, con espacio para una personalización premium más profunda más adelante.",
  "settings.standardSectionTitle": "Ajustes por defecto",
  "settings.standardSectionSummary": "Hora del recordatorio, categorías, apariencia e idioma.",
  "settings.freemiumSectionSummary": "Opciones incluidas de papel, tipografía y página.",
  "settings.premiumSectionSummary": "Tonos premium, tipografía y composiciones más ricas.",
  "settings.plansSectionTitle": "Planes",
  "settings.plansSectionSummary": "Freemium, Premium y Lifelong.",
  "settings.notificationTime": "Hora del recordatorio",
  "settings.deliveryRitual": "Ritual de entrega",
  "settings.deliveryRitualBody": "La forma en que esta página te llega, con el menor ruido posible.",
  "settings.notificationsEnabled": "Notificaciones",
  "settings.notificationsEnabledBody": "Mantener activa la invitación diaria.",
  "settings.soundEnabled": "Sonido",
  "settings.soundEnabledBody": "Dejar que el recordatorio llegue con un sonido suave.",
  "settings.hapticsEnabled": "Háptica",
  "settings.hapticsEnabledBody": "Un toque sutil cuando la página se abre.",
  "settings.silentMode": "Modo silencioso",
  "settings.silentModeBody": "Mantener la entrega visible, pero sin sonido ni háptica.",
  "settings.preferredCategories": "Categorías preferidas",
  "settings.language": "Idioma de la app",
  "settings.languageBody": "Controla el idioma de la interfaz.",
  "settings.languageCurrentHint": "Navegación, ajustes, botones, etiquetas y fechas aparecen en este idioma.",
  "settings.languageSearchPlaceholder": "Buscar idioma de la app",
  "settings.quoteLanguages": "Idioma de las reflexiones",
  "settings.quoteLanguagesBody": "Por defecto, tu página diaria sigue el idioma de la app.",
  "settings.quoteLanguagesPremiumBody": "Elige uno o varios idiomas para tus reflexiones de forma independiente.",
  "settings.quoteLanguagesLockedBody": "Un idioma independiente para las reflexiones se abre en Premium y Lifelong.",
  "settings.quoteLanguagesCurrentHintSameAsApp": "Las reflexiones de hoy, del archivo y las guardadas se mueven con el idioma de la app.",
  "settings.quoteLanguagesCurrentHintCustom": "Las reflexiones de hoy, del archivo y las guardadas usan este idioma.",
  "settings.quoteLanguagesFallbackBody": "Si una reflexión todavía no está disponible en este idioma, vuelve en silencio al inglés.",
  "settings.quoteLanguagesSearchPlaceholder": "Buscar idioma",
  "settings.quoteLanguagesSelectMultiple": "Elige uno o más idiomas para tus reflexiones.",
  "settings.quoteLanguagesSelectedLanguages": "Idiomas seleccionados",
  "settings.quoteLanguagesSelectedTag": "Activo",
  "settings.quoteLanguagesAppTag": "App",
  "settings.reflectionLanguageSameAsApp": "Como la app",
  "settings.reflectionLanguageCustom": "Idioma propio",
  "settings.reflectionLanguageFollowsApp": "Sigue el idioma de la app",
  "settings.privateSettingsTitle": "Ajustes privados",
  "settings.privateSettingsLockedBody": "Más espacio personal alrededor del idioma, el fondo, el papel, la tipografía y la exportación se abre en Premium y Lifelong.",
  "settings.privateSettingsLockedHint": "Más espacio personal en Premium.",
  "settings.privateSettingsUnlockAction": "Abrir con Premium",
  "settings.groupAppearance": "Apariencia",
  "settings.groupCollectionOrder": "Colección y orden",
  "settings.groupLanguageContent": "Idioma y contenido",
  "settings.groupCollectionSharing": "Colección y compartir",
  "settings.groupPremium": "Mi suscripción",
  "settings.mySubscription": "Mi suscripción",
  "settings.exportAction": "Enviar ahora",
  "settings.exportSavedReflections": "Enviar reflexiones guardadas por correo",
  "settings.exportSavedReflectionsSubject": "Reflexiones guardadas",
  "settings.exportSavedReflectionsFallbackTitle": "Reflexiones guardadas",
  "settings.exportSavedReflectionsBody": "Envía juntas tus páginas guardadas y tus notas en una exportación serena, o consérvalas como un diario PDF.",
  "settings.exportPdfAction": "Exportar como PDF",
  "settings.exportPdfFallbackTitle": "PDF de reflexiones guardadas",
  "settings.exportPdfFilePrefix": "diario-reflexiones-guardadas",
  "settings.exportCollectionTitle": "Reflexiones guardadas",
  "settings.exportCollectionSubtitle": "Una colección personal de reflexiones y notas",
  "settings.exportCollectionCount": "reflexiones guardadas",
  "settings.exportReflectionLabel": "Reflexión",
  "settings.exportCategoryLabel": "Categoría",
  "settings.exportLanguageLabel": "Idioma",
  "settings.exportSourceLabel": "Fuente",
  "settings.exportExportedOnLabel": "Exportado el",
  "settings.exportFilePrefix": "reflexiones-guardadas",
  "settings.exportEmailIntro": "Aquí tienes tu colección guardada de reflexiones y notas.",
  "settings.exportEmptyTitle": "Todavía no hay nada para exportar",
  "settings.exportEmptyMessage": "Guarda primero algunas reflexiones y estarán listas para una copia serena.",
  "settings.darkMode": "Modo oscuro",
  "settings.darkModeBody": "Mantén la experiencia cálida y serena también con poca luz.",
  "settings.premiumTitle": "Personalización Premium",
  "settings.premiumBody": "Premium abre las capas más serenas de la app que ayudan a que tus reflexiones permanezcan cerca.",
  "settings.premiumCollectionsTitle": "Tu biblioteca de pensamientos",
  "settings.premiumCollectionsBody": "Ordena las reflexiones que más importan. Crea tu propia colección a partir de los momentos que quieres tener cerca.",
  "settings.subscriptionStatus": "Estado de la suscripción",
  "settings.restorePurchases": "Restaurar compras",
  "settings.manageSubscription": "Gestionar suscripción",
  "settings.manageSubscriptionBody": "Gestiona tu plan con calma, sin romper el ritmo de tu página.",
  "settings.restoreSuccessTitle": "Compras restauradas",
  "settings.restoreSuccessBody": "Tus compras se restauraron correctamente.",
  "settings.restoreErrorTitle": "No se pudo restaurar",
  "settings.restoreErrorBody": "Las compras no pudieron restaurarse por ahora.",
  "settings.upgradeAction": "Pasar a Premium",
  "settings.premiumPreviewTitle": "Acceso Premium",
  "settings.premiumPreviewBody": "Abre el archivo completo, páginas guardadas sin límite, exportación y más espacio personal.",
  "settings.colorStyle": "Estilo de color",
  "settings.colorStyleBody": "Elige la atmósfera visual de tu página.",
  "settings.colorStyleDefault": "Estilo por defecto",
  "settings.colorStylePresets": "Estilos preparados",
  "settings.colorStyleCustom": "Estilo personal",
  "settings.colorStyleDefaultBody": "El equilibrio sereno original, sin ajustes adicionales.",
  "settings.colorStyleCustomBody": "Ajusta el papel, el fondo y el color del texto con más precisión.",
  "settings.colorStylePreview": "Vista previa",
  "settings.colorStyleLockedBody": "Los ajustes visuales más profundos se abren en Premium.",
  "settings.colorStyleAdvancedTitle": "Ajustes finos",
  "settings.colorStyleAdvancedBody": "Afina el tono del papel, del fondo y del texto con más precisión.",
  "settings.colorStylePresetTagBalanced": "Equilibrado",
  "settings.colorStylePresetTagQuiet": "Sereno",
  "settings.colorStylePresetTagReadable": "Legible",
  "settings.colorStylePresetTagRecommended": "Recomendado",
  "settings.colorStylePresetTagWarmCalm": "Calidez suave",
  "settings.appBackground": "Fondo de la app",
  "settings.appBackgroundBody": "Elige la calma que rodea tus páginas.",
  "settings.appBackgroundDefaultBody": "El fondo por defecto mantiene el espacio claro y discreto.",
  "settings.appBackgroundPreview": "Fondo actual",
  "settings.appBackgroundSurfaceLabel": "Superficie de la app",
  "settings.appBackgroundReset": "Volver al fondo por defecto",
  "settings.textColor": "Color del texto",
  "settings.textColorBody": "Mantén la lectura clara y serena.",
  "settings.textColorDefaultTitle": "Texto por defecto",
  "settings.textColorCustomTitle": "Texto personalizado",
  "settings.textColorCustomBody": "Adapta el tono de lectura al papel que has elegido.",
  "settings.textColorPreview": "Vista previa del texto",
  "settings.textColorReset": "Volver al texto por defecto",
  "settings.contrastGood": "Buena legibilidad",
  "settings.contrastLow": "Esta combinación de colores podría resultar difícil de leer.",
  "settings.contrastAdjusted": "Se ajustó ligeramente para mejorar la lectura.",
  "settings.colorCode": "Código HEX",
  "settings.colorCodeHint": "Introduce un color con calma o sigue con los controles.",
  "settings.colorCodeInvalid": "Introduce un color HEX válido como #E9E2D8.",
  "settings.customPaperTheme": "Tono personal del papel",
  "settings.customPaperThemeBody": "Crea un tono de papel más personal y deja que acompañe toda la experiencia.",
  "settings.customPaperThemePickerBody": "Elige un color de papel más suave. La app mantiene el tono contenido y legible mientras ajustas.",
  "settings.customPaperThemePreview": "Tono actual del papel",
  "settings.noteBackground": "Fondo de la nota",
  "settings.noteBackgroundBody": "Mantén la nota clara por defecto o elige un tono personal suave solo para ese campo.",
  "settings.noteBackgroundPreview": "Tono actual de la nota",
  "settings.noteBackgroundReset": "Volver al blanco",
  "settings.customPaperRed": "Rojo",
  "settings.customPaperGreen": "Verde",
  "settings.customPaperBlue": "Azul",
  "settings.customPaperReset": "Volver a los tonos preparados",
  "settings.appearanceConfirmTitle": "¿Aplicar este estilo?",
  "settings.appearanceConfirmMessageLead": "¿Quieres cambiar a",
  "settings.appearanceConfirmApply": "Aplicar",
  "settings.typographyStyles": "Estilos tipográficos",
  "settings.pageStyles": "Estilos de página",
  "settings.current": "Actual",
  "settings.aboutTitle": "Acerca de",
  "settings.aboutBody": "Un lugar sereno para una página al día, pensado para bajar el ritmo lo suficiente y dejar respirar la reflexión.",
  "settings.aboutCreator": "Creado con cuidado como un pequeño espacio personal para la atención, la calma y una perspectiva sincera.",
  "settings.resetTitle": "Restablecer datos locales",
  "settings.resetBody": "Esto borrará el onboarding, los favoritos, las elecciones del archivo y las preferencias.",
  "settings.resetButton": "Restablecer datos locales",
  "settings.included": "Incluido",
  "settings.premium": "Premium",
  "archive.eyebrow": "Archivo",
  "archive.title": "Un registro silencioso de páginas anteriores.",
  "archive.subtitle": "Vuelve a las páginas pasadas con la misma atmósfera suave de la página de hoy.",
  "archive.allReflections": "Todas las reflexiones",
  "archive.savedOnly": "Solo guardadas",
  "archive.searchPlaceholder": "Buscar por sensación, categoría o frase",
  "archive.premiumTitle": "El archivo completo se abre en Premium",
  "archive.premiumMessage": "En modo gratuito, el archivo permanece más pequeño. Premium abre la búsqueda, los filtros y más espacio alrededor de las páginas que decides guardar.",
  "archive.emptyTitle": "Todavía no hay páginas aquí",
  "archive.emptyMessage": "Prueba con una categoría más amplia, borra la búsqueda o guarda algunas reflexiones para formar un archivo más suave.",
  "archive.noMatchTitle": "Nada encaja con esta vista",
  "archive.noMatchMessage": "Prueba una búsqueda más ligera, otra categoría o vuelve a todas las reflexiones.",
  "favorites.eyebrow": "Guardadas",
  "favorites.title": "Páginas guardadas",
  "favorites.subtitle": "Una pequeña pila personal de páginas que se quedaron contigo y pidieron permanecer.",
  "favorites.emptyTitle": "Todavía no hay páginas guardadas",
  "favorites.emptyMessage": "Guarda una página de hoy o del archivo y empieza tu propia colección.",
  "favorites.noMatchTitle": "Nada encaja con tu colección",
  "favorites.noMatchMessage": "Prueba otra palabra o limpia la categoría para volver a tus páginas guardadas.",
  "favorites.keepAction": "Guardar",
  "favorites.removeAction": "Dejar de guardar",
  "favorites.deleteConfirmTitle": "¿Quitar esta página guardada?",
  "favorites.deleteConfirmMessage": "Se eliminará de tu colección. Las notas permanecen en la página fechada si todavía vive en el archivo.",
  "favorites.searchPlaceholder": "Buscar en las páginas guardadas",
  "favorites.premiumTitle": "Una colección más amplia se abre en Premium",
  "favorites.premiumMessage": "En modo gratuito, la colección permanece más pequeña. Premium abre páginas ilimitadas, notas más largas, búsqueda, exportación y colecciones personales.",
  "favorites.collectionsUpgradeTitle": "Tus pensamientos merecen orden",
  "favorites.collectionsUpgradeBody": "Crea colecciones personales y guarda lo que de verdad importa.",
  "favorites.collectionsUpgradeAction": "Desbloquear colecciones",
  "favorites.savedCountLinePrefix": "Ya has guardado",
  "favorites.savedCountLineSuffix": "pensamientos",
  "collections.eyebrow": "Colecciones",
  "collections.title": "Colecciones personales",
  "collections.subtitle": "Da a las páginas que quieres conservar un lugar propio, sereno y personal.",
  "collections.emptyTitle": "Todavía no hay colecciones",
  "collections.emptyMessage": "Crea tu primera colección y da un lugar a las páginas que quieres mantener cerca.",
  "collections.newAction": "Nueva colección",
  "collections.createTitle": "Crear colección",
  "collections.createBody": "Ponle un título a tu colección y, si quieres, una breve nota sobre lo que vive dentro de ella.",
  "collections.nameLabel": "Título",
  "collections.descriptionLabel": "Descripción",
  "collections.saveAction": "Guardar colección",
  "collections.addAction": "Añadir a la colección",
  "collections.addToPersonalCollectionsAction": "A colecciones personales",
  "collections.addHint": "Elige una colección para esta página o crea una nueva.",
  "collections.addedTitle": "Añadida",
  "collections.addedBody": "La reflexión ahora forma parte de tu colección.",
  "collections.renameAction": "Renombrar colección",
  "collections.deleteAction": "Eliminar colección",
  "collections.deleteConfirmTitle": "¿Eliminar la colección?",
  "collections.deleteConfirmMessage": "La colección desaparece, pero las reflexiones continúan en tus páginas guardadas.",
  "collections.countLabel": "reflexiones guardadas",
  "collections.detailEmptyTitle": "Esta colección todavía está en silencio",
  "collections.detailEmptyMessage": "Añade una reflexión guardada para darle a esta colección su primera página.",
  "collections.removeAction": "Quitar de la colección",
  "collections.removeConfirmTitle": "¿Quitar esta reflexión?",
  "collections.removeConfirmMessage": "Solo se quitará de esta colección. Permanecerá en tus páginas guardadas.",
  "collections.lockedTitle": "Las colecciones personales viven en Premium",
  "collections.lockedBody": "Con Premium y Lifelong puedes organizar tus páginas guardadas en colecciones personales.",
  "collections.heroTitle": "Tu biblioteca de pensamientos",
  "collections.heroBody": "Organiza en colecciones personales los pensamientos que quieres conservar.",
  "collections.emptyHeroTitle": "Tu primera colección",
  "collections.emptyHeroBody": "Aquí reúnes las páginas que merecen quedarse. Crea tu primera colección y da un lugar a tus pensamientos.",
  "collections.pagesSingle": "página",
  "collections.pagesPlural": "páginas",
  "collections.lastUpdatedPrefix": "Añadida por última vez",
  "collections.editBody": "Ajusta el título y, si quieres, una breve nota que le dé carácter a esta colección.",
  "collections.addSheetTitle": "Añadir a la colección",
  "collections.addSheetBody": "Elige una colección personal para esta reflexión guardada o empieza una nueva.",
  "collections.addedNotice": "Añadida a la colección",
  "list.saved": "Guardada",
  "membership.eyebrow": "Suscripción",
  "membership.title": "Haz de este espacio algo verdaderamente tuyo.",
  "membership.subtitle": "Freemium empieza con ligereza. Premium y Lifelong abren más espacio para guardar, ordenar y hacer de este lugar algo verdaderamente tuyo.",
  "membership.heroLine": "Lo que te importa merece un lugar.\nCon Premium, este espacio se vuelve todavía más tuyo.",
  "membership.premiumIncludedTitle": "Premium desbloquea",
  "membership.premiumCardLine": "Más espacio. Más profundidad.\nMás de lo que permanece.",
  "membership.premiumCardBody": "Los pensamientos que importan no deberían desaparecer sin más.\nHaz de este espacio un lugar al que quieras volver.",
  "membership.lifelongCardLine": "Una vez. Para siempre.",
  "membership.lifelongCardBody": "Un espacio que te pertenece para siempre.",
  "membership.lifelongCardNote": "Decidir una vez.\nY que todo permanezca contigo, sin renovación.",
  "membership.freemiumMiniTitle": "Freemium",
  "membership.freemiumMiniBody": "Un comienzo sereno.\nUna página cada vez.",
  "membership.benefitKeepClose": "Guarda más de lo que de verdad te importa",
  "membership.benefitWriteFreely": "Escribe sin sentir un límite",
  "membership.benefitMoveMorePersonally": "Haz este espacio más tuyo",
  "membership.benefitSavePages": "Guarda páginas que nunca quieras perder",
  "membership.benefitCollections": "Colecciones personales para tus pensamientos",
  "membership.benefitStyle": "Colores, tipografía y estilo según tu sentir",
  "membership.benefitUnlimited": "Tu espacio personal, sin límites",
  "membership.benefitNothingLost": "Todo permanece. Nada se pierde",
  "membership.trialLineOne": "Prueba gratis durante 7 días",
  "membership.trialLineTwo": "Cancela cuando quieras",
  "membership.socialProof": "Muchos usuarios ya guardan aquí sus páginas más importantes.",
  "membership.valueGroupSpace": "Tu espacio crece",
  "membership.valueGroupClarity": "Más claridad",
  "membership.valueGroupExpression": "Más expresión",
  "membership.valueSpaceOne": "Guarda más de lo que quieres volver a mirar",
  "membership.valueSpaceTwo": "Deja más cerca los pensamientos importantes",
  "membership.valueClarityOne": "Encuentra con más facilidad tus páginas guardadas",
  "membership.valueClarityTwo": "Da un orden más sereno a lo que conservas",
  "membership.valueExpressionOne": "Escribe sin sentir un límite",
  "membership.valueExpressionTwo": "Haz este espacio más tuyo",
  "membership.unlockAction": "Desbloquear Premium",
  "membership.openMembership": "Abrir suscripción",
  "membership.lockedArchiveTitle": "La búsqueda y los filtros viven en Premium",
  "membership.lockedArchiveBody": "El modo gratuito mantiene el archivo más pequeño y silencioso. Premium abre la búsqueda, los filtros y el registro completo por fecha.",
  "membership.lockedSavedTitle": "Una colección mayor se abre en Premium",
  "membership.lockedSavedBody": "En modo gratuito, tus páginas guardadas se mantienen en un número menor. Premium abre páginas sin límite, búsqueda y exportación.",
  "membership.stateTitle": "Tu plan actual",
  "membership.errorTitle": "Los detalles de la suscripción permanecen en silencio por ahora",
  "membership.errorBody": "Tu plan actual sigue funcionando. Los detalles de la tienda podrán volver cuando la conexión esté lista otra vez.",
  "membership.lockedFeatureFootnote": "Preparado en silencio para Premium.",
  "membership.lifelongBadge": "Apoyo",
  "membership.planFreemium": "Freemium",
  "membership.planPremium": "Premium",
  "membership.planLifelong": "Lifelong",
  "membership.choosePremium": "Empezar Premium",
  "membership.chooseLifelong": "Desbloquear una vez",
  "membership.switchToPremium": "Cambiar a Premium",
  "membership.unlockLifelong": "Desbloquear una vez",
  "membership.purchasePlaceholderTitle": "El flujo de compra viene después",
  "membership.purchasePlaceholderBody": "Este plan ya está preparado para el cobro real de la tienda más adelante. En desarrollo, puede usarse en su lugar el override local de suscripción.",
  "membership.purchaseSuccessTitle": "Desbloqueado",
  "membership.purchaseSuccessPremium": "Premium se activó correctamente.",
  "membership.purchaseSuccessLifelong": "Lifelong se activó correctamente.",
  "membership.purchaseErrorTitle": "Compra no completada",
  "membership.purchaseErrorBody": "La suscripción no pudo actualizarse por ahora.",
  "membership.restoreSuccessTitle": "Restaurado",
  "membership.restoreSuccessBody": "Tus compras fueron verificadas.",
  "membership.restoreErrorTitle": "No disponible",
  "membership.restoreErrorBody": "Las compras no pudieron restaurarse por ahora.",
};

const translationMap: Record<string, Messages> = {
  en: englishMessages,
  de: germanMessages,
  fr: frenchMessages,
  es: spanishMessages,
  "pt-BR": brazilianPortugueseMessages,
};

const categoryLabels: Record<ReflectionCategory, Record<SupportedTranslationLanguage, string>> = {
  calm: { en: "Calm", de: "Ruhe", "pt-BR": "Calma", fr: "Calme", es: "Calma" },
  clarity: { en: "Clarity", de: "Klarheit", "pt-BR": "Clareza", fr: "Clarté", es: "Claridad" },
  discipline: { en: "Discipline", de: "Disziplin", "pt-BR": "Disciplina", fr: "Discipline", es: "Disciplina" },
  "self-respect": { en: "Self-respect", de: "Selbstachtung", "pt-BR": "Autorrespeito", fr: "Respect de soi", es: "Respeto propio" },
  purpose: { en: "Purpose", de: "Ausrichtung", "pt-BR": "Propósito", fr: "Élan", es: "Propósito" },
  relationships: { en: "Relationships", de: "Beziehungen", "pt-BR": "Relações", fr: "Relations", es: "Relaciones" },
  courage: { en: "Courage", de: "Mut", "pt-BR": "Coragem", fr: "Courage", es: "Coraje" },
  creativity: { en: "Creativity", de: "Kreativität", "pt-BR": "Criatividade", fr: "Créativité", es: "Creatividad" },
  healing: { en: "Healing", de: "Heilung", "pt-BR": "Cura", fr: "Guérison", es: "Sanación" },
  focus: { en: "Focus", de: "Fokus", "pt-BR": "Foco", fr: "Concentration", es: "Enfoque" },
};

const preferenceLabels: Record<
  OnboardingPreference,
  Record<SupportedTranslationLanguage, { title: string; body: string }>
> = {
  clarity: {
    en: { title: "Clarity", body: "A steadier sense of what matters." },
    de: { title: "Klarheit", body: "Ein ruhigeres Gefühl für das, was wirklich zählt." },
    "pt-BR": { title: "Clareza", body: "Uma percepção mais firme do que realmente importa." },
    fr: { title: "Clarté", body: "Une sensation plus stable de ce qui compte vraiment." },
    es: { title: "Claridad", body: "Una sensación más firme de lo que de verdad importa." },
  },
  calm: {
    en: { title: "Calm", body: "A softer inner pace to move within." },
    de: { title: "Ruhe", body: "Ein sanfteres inneres Tempo für den Tag." },
    "pt-BR": { title: "Calma", body: "Um ritmo interior mais suave para atravessar o dia." },
    fr: { title: "Calme", body: "Un rythme intérieur plus doux pour traverser la journée." },
    es: { title: "Calma", body: "Un ritmo interior más suave para atravesar el día." },
  },
  direction: {
    en: { title: "Direction", body: "A clearer feeling of where to lean." },
    de: { title: "Ausrichtung", body: "Ein klareres Gespür dafür, wohin du dich wenden willst." },
    "pt-BR": { title: "Direção", body: "Uma percepção mais nítida de para onde vale a pena se inclinar." },
    fr: { title: "Direction", body: "Une sensation plus claire de l'endroit vers lequel vous pencher." },
    es: { title: "Dirección", body: "Una sensación más clara de hacia dónde inclinarte." },
  },
  focus: {
    en: { title: "Focus", body: "More room for what deserves attention." },
    de: { title: "Fokus", body: "Mehr Raum für das, was deine Aufmerksamkeit verdient." },
    "pt-BR": { title: "Foco", body: "Mais espaço para o que merece a sua atenção." },
    fr: { title: "Concentration", body: "Plus d'espace pour ce qui mérite votre attention." },
    es: { title: "Enfoque", body: "Más espacio para lo que merece tu atención." },
  },
};

const toneLabels: Record<ReflectionTone, Record<SupportedTranslationLanguage, string>> = {
  gentle: { en: "Gentle", de: "Sanft", "pt-BR": "Gentil", fr: "Doux", es: "Suave" },
  "clear-eyed": { en: "Clear-eyed", de: "Klar", "pt-BR": "Lúcido", fr: "Lucide", es: "Lúcido" },
  steady: { en: "Steady", de: "Beständig", "pt-BR": "Constante", fr: "Stable", es: "Sereno" },
  curious: { en: "Curious", de: "Offen", "pt-BR": "Curioso", fr: "Curieux", es: "Curioso" },
  grounded: { en: "Grounded", de: "Geerdet", "pt-BR": "Aterrada", fr: "Ancré", es: "Arraigado" },
  expansive: { en: "Expansive", de: "Weit", "pt-BR": "Amplo", fr: "Ouvert", es: "Amplio" },
};

const sourceTypeLabels: Record<
  "manual" | "ai" | "original_reflection",
  Record<SupportedTranslationLanguage, string>
> = {
  manual: {
    en: "Manual Selection",
    de: "Manuell",
    "pt-BR": "Manual",
    fr: "Sélection manuelle",
    es: "Selección manual",
  },
  ai: {
    en: "AI Reflection",
    de: "KI-Impuls",
    "pt-BR": "Reflexão por IA",
    fr: "Réflexion IA",
    es: "Reflexión con IA",
  },
  original_reflection: {
    en: "AI Reflection",
    de: "KI-Impuls",
    "pt-BR": "Reflexão por IA",
    fr: "Réflexion IA",
    es: "Reflexión con IA",
  },
};

const paperThemeMeta: Record<
  PaperThemePresetId,
  Record<SupportedTranslationLanguage, { title: string; description: string }>
> = {
  "warm-ivory": {
    en: { title: "Warm Ivory", description: "A soft cream page with warm contrast." },
    de: { title: "Warmes Elfenbein", description: "Eine sanfte cremefarbene Seite mit warmem Kontrast." },
    "pt-BR": { title: "Marfim quente", description: "Uma página creme suave com contraste acolhedor." },
    fr: { title: "Ivoire chaud", description: "Une page crème douce avec un contraste chaleureux." },
    es: { title: "Marfil cálido", description: "Una página crema suave con un contraste cálido." },
  },
  "soft-beige": {
    en: { title: "Soft Beige", description: "A slightly deeper paper tone with gentle warmth." },
    de: { title: "Sanftes Beige", description: "Ein etwas tieferer Papierfarbton mit milder Wärme." },
    "pt-BR": { title: "Bege suave", description: "Um tom de papel um pouco mais profundo, com calor delicado." },
    fr: { title: "Beige doux", description: "Un ton de papier un peu plus profond, avec une chaleur douce." },
    es: { title: "Beige suave", description: "Un tono de papel algo más profundo, con una calidez suave." },
  },
  "stone-paper": {
    en: { title: "Stone Paper", description: "Muted mineral neutrals for a quieter look." },
    de: { title: "Steinpapier", description: "Gedämpfte mineralische Neutraltöne für einen stilleren Eindruck." },
    "pt-BR": { title: "Papel de pedra", description: "Neutros minerais suaves para uma presença mais silenciosa." },
    fr: { title: "Papier minéral", description: "Des neutres minéraux discrets pour une présence plus silencieuse." },
    es: { title: "Papel mineral", description: "Neutros minerales suaves para una presencia más silenciosa." },
  },
  "muted-sage": {
    en: { title: "Muted Sage", description: "A restrained green-gray tint with soft calm." },
    de: { title: "Gedämpftes Salbei", description: "Ein zurückhaltender grün-grauer Ton mit sanfter Ruhe." },
    "pt-BR": { title: "Sálvia suave", description: "Um tom verde-acinzentado contido, com calma macia." },
    fr: { title: "Sauge douce", description: "Une teinte vert-gris contenue, avec un calme feutré." },
    es: { title: "Salvia tenue", description: "Un matiz verde grisáceo contenido, con calma suave." },
  },
};

const appBackgroundMeta: Record<
  AppBackgroundPresetId,
  Record<SupportedTranslationLanguage, { title: string; description: string }>
> = {
  ivory: {
    en: { title: "Ivory", description: "A bright calm base with almost no tint." },
    de: { title: "Elfenbein", description: "Eine helle, ruhige Basis mit kaum sichtbarer Tönung." },
    "pt-BR": { title: "Marfim", description: "Uma base clara e calma, com quase nenhum matiz." },
    fr: { title: "Ivoire", description: "Une base claire et calme, presque sans teinte." },
    es: { title: "Marfil", description: "Una base clara y serena, con casi ningún matiz." },
  },
  "warm-paper": {
    en: { title: "Warm Paper", description: "A soft cream ground with a little more warmth." },
    de: { title: "Warmes Papier", description: "Ein sanfter cremefarbener Grundton mit etwas mehr Wärme." },
    "pt-BR": { title: "Papel quente", description: "Uma base creme suave com um pouco mais de calor." },
    fr: { title: "Papier chaud", description: "Une base crème douce avec un peu plus de chaleur." },
    es: { title: "Papel cálido", description: "Una base crema suave con un poco más de calidez." },
  },
  sand: {
    en: { title: "Sand", description: "A quiet beige foundation with gentle depth." },
    de: { title: "Sand", description: "Eine ruhige beige Grundlage mit sanfter Tiefe." },
    "pt-BR": { title: "Areia", description: "Uma base bege serena com profundidade suave." },
    fr: { title: "Sable", description: "Une base beige tranquille, avec une profondeur douce." },
    es: { title: "Arena", description: "Una base beige serena con profundidad suave." },
  },
  walnut: {
    en: { title: "Walnut", description: "A deeper walnut tone with richer presence." },
    de: { title: "Walnuss", description: "Ein tieferer Walnuss-Ton mit reicherer Präsenz." },
    "pt-BR": { title: "Nogueira", description: "Um tom de nogueira mais profundo, com presença mais rica." },
    fr: { title: "Noyer", description: "Un ton noyer plus profond, avec une présence plus riche." },
    es: { title: "Nogal", description: "Un tono nogal más profundo, con una presencia más rica." },
  },
  charcoal: {
    en: { title: "Charcoal", description: "A restrained charcoal field with soft contrast." },
    de: { title: "Anthrazit", description: "Ein zurückhaltendes anthrazitfarbenes Feld mit weichem Kontrast." },
    "pt-BR": { title: "Carvão", description: "Um campo de carvão contido, com contraste suave." },
    fr: { title: "Charbon", description: "Un fond charbon discret, avec un contraste doux." },
    es: { title: "Carbón", description: "Un campo carbón contenido, con contraste suave." },
  },
  "night-grey": {
    en: { title: "Night Grey", description: "A duskier grey with a quieter evening feel." },
    de: { title: "Nachtgrau", description: "Ein dunkleres Grau mit ruhiger Abendstimmung." },
    "pt-BR": { title: "Cinza noturno", description: "Um cinza mais crepuscular, com uma sensação noturna silenciosa." },
    fr: { title: "Gris nuit", description: "Un gris plus crépusculaire, avec une sensation du soir plus silencieuse." },
    es: { title: "Gris noche", description: "Un gris más crepuscular, con una sensación nocturna más serena." },
  },
};

const appearancePresetMeta: Record<
  AppearancePresetId,
  Record<SupportedTranslationLanguage, { title: string; description: string }>
> = {
  "classic-paper": {
    en: { title: "Classic Paper", description: "The original calm balance of paper, space, and restraint." },
    de: { title: "Classic Paper", description: "Das ursprüngliche ruhige Gleichgewicht aus Papier, Raum und Zurückhaltung." },
    "pt-BR": { title: "Papel clássico", description: "O equilíbrio original e sereno entre papel, espaço e contenção." },
    fr: { title: "Papier classique", description: "L'équilibre originel et serein entre papier, espace et retenue." },
    es: { title: "Papel clásico", description: "El equilibrio original y sereno entre papel, espacio y contención." },
  },
  "warm-ivory-style": {
    en: { title: "Warm Ivory", description: "A warm cream atmosphere with soft literary contrast." },
    de: { title: "Warmes Elfenbein", description: "Eine warme cremefarbene Stimmung mit sanft literarischem Kontrast." },
    "pt-BR": { title: "Marfim quente", description: "Uma atmosfera creme acolhedora, com contraste literário suave." },
    fr: { title: "Ivoire chaud", description: "Une atmosphère crème chaleureuse, avec un contraste littéraire adouci." },
    es: { title: "Marfil cálido", description: "Una atmósfera crema cálida, con un contraste literario suave." },
  },
  "stone-paper-style": {
    en: { title: "Stone Paper", description: "Mineral neutrals for a quieter, more architectural page." },
    de: { title: "Steinpapier", description: "Mineralische Neutraltöne für eine stillere, klarere Seitenwirkung." },
    "pt-BR": { title: "Papel de pedra", description: "Neutros minerais para uma página mais silenciosa e arquitetônica." },
    fr: { title: "Papier minéral", description: "Des neutres minéraux pour une page plus silencieuse et plus architecturée." },
    es: { title: "Papel mineral", description: "Neutros minerales para una página más silenciosa y más arquitectónica." },
  },
  "soft-rose": {
    en: { title: "Soft Rose", description: "A faint rose haze with softened editorial warmth." },
    de: { title: "Sanfte Rose", description: "Ein zarter Roseschleier mit gemilderter editorischer Wärme." },
    "pt-BR": { title: "Rosa suave", description: "Uma névoa rosada discreta, com calor editorial suavizado." },
    fr: { title: "Rose douce", description: "Un léger voile rosé, avec une chaleur éditoriale adoucie." },
    es: { title: "Rosa suave", description: "Una ligera neblina rosada, con una calidez editorial suavizada." },
  },
  "mist-grey": {
    en: { title: "Mist Grey", description: "A pale grey atmosphere with quiet clarity." },
    de: { title: "Nebelgrau", description: "Eine helle graue Stimmung mit stiller Klarheit." },
    "pt-BR": { title: "Cinza névoa", description: "Uma atmosfera cinza clara, com nitidez silenciosa." },
    fr: { title: "Gris brume", description: "Une atmosphère gris pâle, avec une clarté silencieuse." },
    es: { title: "Gris niebla", description: "Una atmósfera gris pálida, con una claridad serena." },
  },
  "midnight-ink": {
    en: { title: "Midnight Ink", description: "A duskier desk tone with softened paper lift." },
    de: { title: "Mitternachtstinte", description: "Ein dämmeriger Schreibtischton mit sanft gehobenem Papier." },
    "pt-BR": { title: "Tinta da meia-noite", description: "Um tom de mesa mais crepuscular, com o papel suavemente elevado." },
    fr: { title: "Encre de minuit", description: "Une tonalité de bureau plus nocturne, avec un papier relevé en douceur." },
    es: { title: "Tinta de medianoche", description: "Un tono de escritorio más crepuscular, con el papel suavemente elevado." },
  },
  "olive-note": {
    en: { title: "Olive Note", description: "A muted olive field with restrained paper calm." },
    de: { title: "Olivnotiz", description: "Ein gedämpfter Olivton mit zurückhalteter Papierrauhe." },
    "pt-BR": { title: "Nota oliva", description: "Um campo oliva contido, com calma de papel discreta." },
    fr: { title: "Note olive", description: "Un fond olive discret, avec un calme de papier retenu." },
    es: { title: "Nota oliva", description: "Un campo oliva contenido, con calma de papel discreta." },
  },
  "sand-journal": {
    en: { title: "Sand Journal", description: "A grounded beige rhythm with journal-like warmth." },
    de: { title: "Sand Journal", description: "Ein geerdeter beiger Rhythmus mit journalartiger Wärme." },
    "pt-BR": { title: "Jornal de areia", description: "Um ritmo bege mais assentado, com calor de diário." },
    fr: { title: "Journal sable", description: "Un rythme beige et posé, avec une chaleur de carnet." },
    es: { title: "Diario de arena", description: "Un ritmo beige más asentado, con calidez de diario." },
  },
  "quiet-blue": {
    en: { title: "Quiet Blue", description: "A softened blue-grey for cooler, reflective pages." },
    de: { title: "Stilles Blau", description: "Ein sanftes Blaugrau für kühlere, reflektierte Seiten." },
    "pt-BR": { title: "Azul sereno", description: "Um azul-acinzentado suave para páginas mais frias e reflexivas." },
    fr: { title: "Bleu calme", description: "Un bleu-gris adouci pour des pages plus fraîches et plus réfléchies." },
    es: { title: "Azul sereno", description: "Un azul grisáceo suavizado para páginas más frescas y reflexivas." },
  },
  "charcoal-paper": {
    en: { title: "Charcoal Paper", description: "A dark paper atmosphere with elegant off-white reading tone." },
    de: { title: "Anthrazitpapier", description: "Eine dunkle Papierstimmung mit elegantem gebrochenem Weiß als Leseton." },
    "pt-BR": { title: "Papel carvão", description: "Uma atmosfera de papel escuro com um tom de leitura off-white elegante." },
    fr: { title: "Papier charbon", description: "Une atmosphère de papier sombre, avec une lecture en blanc cassé élégant." },
    es: { title: "Papel carbón", description: "Una atmósfera de papel oscuro, con un tono de lectura marfil elegante." },
  },
};

const typographyMeta: Record<
  TypographyPresetId,
  Record<SupportedTranslationLanguage, { title: string; description: string; specimen: string }>
> = {
  "editorial-serif": {
    en: { title: "Editorial Serif", description: "Elegant serif-led contrast for the daily page.", specimen: "Quiet clarity" },
    de: { title: "Editorial Serif", description: "Eleganter, serifenbetonter Kontrast für die tägliche Seite.", specimen: "Stille Klarheit" },
    "pt-BR": { title: "Serifa editorial", description: "Um contraste elegante guiado por serifa para a página diária.", specimen: "Clareza serena" },
    fr: { title: "Serif éditorial", description: "Un contraste élégant guidé par la sérif pour la page du jour.", specimen: "Clarté calme" },
    es: { title: "Serifa editorial", description: "Un contraste elegante guiado por serif para la página diaria.", specimen: "Claridad serena" },
  },
  "quiet-sans": {
    en: { title: "Quiet Sans", description: "A cleaner low-noise rhythm for archive and settings.", specimen: "Steady attention" },
    de: { title: "Quiet Sans", description: "Ein klarerer, zurückhaltender Rhythmus für Archiv und Einstellungen.", specimen: "Ruhige Aufmerksamkeit" },
    "pt-BR": { title: "Sans serena", description: "Um ritmo mais limpo e discreto para arquivo e ajustes.", specimen: "Atenção constante" },
    fr: { title: "Sans discret", description: "Un rythme plus net et plus discret pour les archives et les réglages.", specimen: "Attention posée" },
    es: { title: "Sans sereno", description: "Un ritmo más limpio y discreto para el archivo y los ajustes.", specimen: "Atención serena" },
  },
  "subtle-typewriter": {
    en: { title: "Subtle Typewriter", description: "A restrained monospaced accent for future premium themes.", specimen: "A gentler pace" },
    de: { title: "Subtile Schreibmaschine", description: "Ein zurückhaltener Monospace-Akzent für spätere Premium-Themen.", specimen: "Ein sanfteres Tempo" },
    "pt-BR": { title: "Máquina sutil", description: "Um acento monoespaçado contido para futuros temas premium.", specimen: "Um ritmo mais suave" },
    fr: { title: "Machine discrète", description: "Une touche monospace retenue pour de futurs thèmes premium.", specimen: "Un rythme plus doux" },
    es: { title: "Máquina sutil", description: "Un acento monoespaciado contenido para futuros temas premium.", specimen: "Un ritmo más suave" },
  },
};

const pageStyleMeta: Record<
  PageStylePresetId,
  Record<SupportedTranslationLanguage, { title: string; description: string; mood: string }>
> = {
  "classic-tearoff": {
    en: { title: "Classic Tear-off", description: "A clean bound page with generous whitespace and a centered question.", mood: "Desk calendar" },
    de: { title: "Klassischer Abriss", description: "Eine klare gebundene Seite mit großzügigem Weißraum und zentrierter Frage.", mood: "Schreibtischkalender" },
    "pt-BR": { title: "Destacável clássico", description: "Uma página limpa, encadernada, com muito respiro e uma pergunta centralizada.", mood: "Calendário de mesa" },
    fr: { title: "Détachable classique", description: "Une page nette et reliée, avec beaucoup d'air et une question centrée.", mood: "Calendrier de bureau" },
    es: { title: "Desprendible clásico", description: "Una página limpia y encuadernada, con mucho respiro y una pregunta centrada.", mood: "Calendario de escritorio" },
  },
  "framed-editorial": {
    en: { title: "Framed Editorial", description: "A lighter rule-based page with a more journal-like composition.", mood: "Printed essay page" },
    de: { title: "Gerahmtes Editorial", description: "Eine leichtere, liniengeführte Seite mit stärker journalartiger Komposition.", mood: "Gedruckte Essaysseite" },
    "pt-BR": { title: "Editorial enquadrado", description: "Uma página mais leve, guiada por linhas, com composição próxima de um diário.", mood: "Página impressa" },
    fr: { title: "Éditorial encadré", description: "Une page plus légère, guidée par des lignes, avec une composition plus proche d'un journal.", mood: "Page imprimée" },
    es: { title: "Editorial enmarcado", description: "Una página más ligera, guiada por líneas, con una composición cercana a un diario.", mood: "Página impresa" },
  },
  "soft-ledger": {
    en: { title: "Soft Ledger", description: "A gentle structured page with understated date framing.", mood: "Paper record" },
    de: { title: "Sanftes Register", description: "Eine sanft strukturierte Seite mit zurückhaltender Datumsfassung.", mood: "Papierprotokoll" },
    "pt-BR": { title: "Registro suave", description: "Uma página suavemente estruturada, com moldura discreta para a data.", mood: "Registro em papel" },
    fr: { title: "Registre doux", description: "Une page doucement structurée, avec un cadre discret pour la date.", mood: "Registre papier" },
    es: { title: "Registro suave", description: "Una página suavemente estructurada, con un marco discreto para la fecha.", mood: "Registro en papel" },
  },
};

const subscriptionPlanMetaByLanguage: Record<
  "Freemium" | "Premium" | "Lifelong",
  Record<string, { summary: string; benefits: string[] }>
> = {
  Freemium: {
    en: {
      summary: "A quiet place to begin.",
      benefits: ["One daily reflection", "Local notes and favorites", "Included paper, type, and page styles"],
    },
    de: {
      summary: "Ein stiller Anfang.",
      benefits: ["Eine tägliche Reflexion", "Lokale Notizen und Favoriten", "Enthaltene Papier-, Schrift- und Seitenstile"],
    },
    "pt-BR": {
      summary: "Um começo silencioso.",
      benefits: ["Uma reflexão por dia", "Notas locais e favoritas", "Estilos incluídos de papel, tipografia e página"],
    },
    fr: {
      summary: "Un endroit calme pour commencer.",
      benefits: ["Une réflexion par jour", "Notes locales et pages conservées", "Styles de papier, de texte et de page inclus"],
    },
    es: {
      summary: "Un lugar sereno para empezar.",
      benefits: ["Una reflexión por día", "Notas locales y páginas guardadas", "Estilos incluidos de papel, tipografía y página"],
    },
    it: {
      summary: "Un luogo quieto da cui iniziare.",
      benefits: ["Una riflessione al giorno", "Note locali e pagine conservate", "Stili inclusi di carta, tipografia e pagina"],
    },
    pt: {
      summary: "Um lugar silencioso para começar.",
      benefits: ["Uma reflexão por dia", "Notas locais e páginas guardadas", "Estilos incluídos de papel, tipografia e página"],
    },
    nl: {
      summary: "Een rustige plek om te beginnen.",
      benefits: ["Eén reflectie per dag", "Lokale notities en bewaarde pagina's", "Inbegrepen papier-, typografie- en paginastijlen"],
    },
  },
  Premium: {
    en: {
      summary: "A quieter sense of ownership around what you keep.",
      benefits: [
        "Premium paper colors",
        "Premium font styles",
        "Premium page styles and layouts",
        "Unlimited archive",
        "Unlimited saved quotes",
        "Search and filter for archive and collected pages",
        "Separate reflection-language selection",
        "Multiple reflection languages at once",
        "Daily language rotation across your selected languages",
        "Weekly and monthly recap placeholders",
        "Annual 31 December backup reminder",
        "Email export of kept reflections and notes",
        "Future deeper personalization",
      ],
    },
    de: {
      summary: "Mehr Eigenständigkeit und mehr Raum um das, was du behältst.",
      benefits: [
        "Premium-Papierfarben",
        "Premium-Schriftstile",
        "Premium-Seitenstile und Layouts",
        "Unbegrenztes Archiv",
        "Unbegrenzt gesammelte Seiten",
        "Suche und Filter für Archiv und Sammlung",
        "Eigene Auswahl der Reflexionssprache",
        "Mehrere Reflexionssprachen gleichzeitig",
        "Täglicher Sprachwechsel zwischen deinen gewählten Sprachen",
        "Vorbereitete wöchentliche und monatliche Rückblicke",
        "Jährliche Erinnerung am 31.12. für Backup und Export",
        "E-Mail-Export von gesammelten Reflexionen und Notizen",
        "Spätere vertiefte Personalisierung",
      ],
    },
    "pt-BR": {
      summary: "Mais pertencimento e mais espaço ao redor do que você guarda.",
      benefits: [
        "Cores premium de papel",
        "Estilos premium de fonte",
        "Estilos e layouts premium de página",
        "Arquivo ilimitado",
        "Páginas guardadas ilimitadas",
        "Busca e filtros para arquivo e coleção",
        "Seleção separada do idioma das reflexões",
        "Vários idiomas de reflexão ao mesmo tempo",
        "Rotação diária entre os idiomas escolhidos",
        "Recapitulações semanais e mensais preparadas",
        "Lembrete anual em 31/12 para backup e exportação",
        "Exportação por e-mail das reflexões guardadas e notas",
        "Futura personalização mais profunda",
      ],
    },
    fr: {
      summary: "Une atmosphère plus personnelle, toujours retenue.",
      benefits: [
        "Couleurs de papier premium",
        "Styles de police premium",
        "Styles et mises en page premium",
        "Choix séparé de la langue des réflexions",
        "Plusieurs langues de réflexion à la fois",
        "Rotation quotidienne entre les langues choisies",
        "Rappel annuel le 31.12 pour sauvegarde et export",
        "Export par e-mail des réflexions conservées et des notes",
        "Personnalisation plus profonde à venir",
      ],
    },
    es: {
      summary: "Más atmósfera personal, todavía contenida.",
      benefits: [
        "Colores premium de papel",
        "Estilos premium de fuente",
        "Estilos y diseños premium de página",
        "Selección separada del idioma de las reflexiones",
        "Varias lenguas de reflexión a la vez",
        "Rotación diaria entre los idiomas elegidos",
        "Recordatorio anual el 31.12 para copia y exportación",
        "Exportación por correo de reflexiones guardadas y notas",
        "Personalización más profunda en el futuro",
      ],
    },
    it: {
      summary: "Più atmosfera personale, sempre con misura.",
      benefits: [
        "Colori premium della carta",
        "Stili premium di carattere",
        "Stili e layout premium di pagina",
        "Selezione separata della lingua delle riflessioni",
        "Più lingue di riflessione insieme",
        "Rotazione quotidiana tra le lingue scelte",
        "Promemoria annuale il 31.12 per backup ed esportazione",
        "Esportazione via e-mail di riflessioni conservate e note",
        "Una personalizzazione ancora più profonda in futuro",
      ],
    },
    pt: {
      summary: "Mais atmosfera pessoal, ainda contida.",
      benefits: [
        "Cores premium de papel",
        "Estilos premium de letra",
        "Estilos e layouts premium de página",
        "Seleção separada do idioma das reflexões",
        "Vários idiomas de reflexão ao mesmo tempo",
        "Rotação diária entre os idiomas escolhidos",
        "Lembrete anual em 31.12 para cópia e exportação",
        "Exportação por e-mail das reflexões guardadas e notas",
        "Personalização mais profunda no futuro",
      ],
    },
    nl: {
      summary: "Meer persoonlijke sfeer, nog altijd ingetogen.",
      benefits: [
        "Premium papierkleuren",
        "Premium letterstijlen",
        "Premium paginastijlen en lay-outs",
        "Aparte keuze voor de taal van reflecties",
        "Meerdere reflectietalen tegelijk",
        "Dagelijkse afwisseling tussen je gekozen talen",
        "Jaarlijkse herinnering op 31.12 voor back-up en export",
        "E-mailexport van bewaarde reflecties en notities",
        "Toekomstige diepere personalisatie",
      ],
    },
  },
  Lifelong: {
    en: {
      summary: "A single unlock for the full library of calm customization.",
      benefits: [
        "All Freemium and Premium features",
        "Permanent access to premium paper, type, and page customization",
        "Reflection-language rotation and export tools",
        "Future design expansions",
        "One-time access without renewal",
      ],
    },
    de: {
      summary: "Ein einmaliger Zugang zur ganzen Bibliothek stiller Gestaltung.",
      benefits: [
        "Alle Freemium- und Premium-Funktionen",
        "Dauerhafter Zugang zu Premium-Papier-, Schrift- und Seitenstilen",
        "Sprachrotation und Exportwerkzeuge für Reflexionen",
        "Zukünftige Design-Erweiterungen",
        "Einmaliger Zugang ohne Verlängerung",
      ],
    },
    "pt-BR": {
      summary: "Um único acesso para toda a biblioteca de personalização calma.",
      benefits: [
        "Todos os recursos de Freemium e Premium",
        "Acesso permanente a papel, tipografia e estilos de página premium",
        "Rotação de idiomas e ferramentas de exportação",
        "Futuras expansões de design",
        "Acesso único sem renovação",
      ],
    },
    fr: {
      summary: "Un accès unique à toute la bibliothèque de personnalisation apaisée.",
      benefits: [
        "Toutes les fonctionnalités Freemium et Premium",
        "Accès permanent aux styles premium de papier, de texte et de page",
        "Rotation des langues et outils d'export",
        "Extensions de design à venir",
        "Accès unique sans renouvellement",
      ],
    },
    es: {
      summary: "Un solo acceso para toda la biblioteca de personalización serena.",
      benefits: [
        "Todas las funciones de Freemium y Premium",
        "Acceso permanente a estilos premium de papel, tipografía y página",
        "Rotación de idiomas y herramientas de exportación",
        "Futuras ampliaciones de diseño",
        "Acceso único sin renovación",
      ],
    },
    it: {
      summary: "Un solo accesso all'intera biblioteca di personalizzazione calma.",
      benefits: [
        "Tutte le funzioni di Freemium e Premium",
        "Accesso permanente a carta, tipografia e stili pagina premium",
        "Rotazione delle lingue e strumenti di esportazione",
        "Espansioni di design future",
        "Accesso unico senza rinnovo",
      ],
    },
    pt: {
      summary: "Um único acesso a toda a biblioteca de personalização serena.",
      benefits: [
        "Todas as funcionalidades de Freemium e Premium",
        "Acesso permanente a estilos premium de papel, tipografia e página",
        "Rotação de idiomas e ferramentas de exportação",
        "Expansões futuras de design",
        "Acesso único sem renovação",
      ],
    },
    nl: {
      summary: "Eén ontgrendeling voor de volledige bibliotheek van rustige personalisatie.",
      benefits: [
        "Alle Freemium- en Premium-functies",
        "Blijvende toegang tot premium papier-, typografie- en paginastijlen",
        "Taalrotatie en exporthulpmiddelen",
        "Toekomstige designuitbreidingen",
        "Eenmalige toegang zonder verlenging",
      ],
    },
  },
};

const aboutMetaByLanguage: Record<
  string,
  { title: string; body: string; creator: string }
> = {
  en: {
    title: "About",
    body: "The idea for this app came from one simple thought:\nHow often do we truly take a moment to pause in the middle of everyday life?\n\nBetween work, study, and constant overstimulation, I kept noticing how valuable one clear impulse can be. A single sentence that gently lifts you out of the noise for a moment. No pressure. No distraction. Just one thought.\n\nThat was what I wanted to translate into a digital form:\nAn app that does not push, but accompanies.\nThat does not overload, but reduces.\nThat does not lecture, but invites reflection.\n\nThis calendar-reflection app grew from that intention: a small, carefully shaped space for more calm, clarity, and reflection in daily life.",
    creator: "— Samuel Triml",
  },
  de: {
    title: "Über",
    body: "Die Idee zu dieser App entstand aus einem einfachen Gedanken:\nWie oft nehmen wir uns im Alltag wirklich einen Moment Zeit, um innezuhalten?\n\nZwischen Arbeit, Studium und ständiger Reizüberflutung habe ich gemerkt, wie wertvoll ein kurzer, klarer Impuls sein kann – ein Satz, der dich für einen Moment aus dem Alltag herausholt. Kein Lärm, keine Ablenkung. Nur ein Gedanke.\n\nIch wollte genau das digital übersetzen:\nEine App, die sich nicht aufdrängt, sondern begleitet.\nDie nicht überlädt, sondern reduziert.\nDie nicht belehrt, sondern inspiriert.\n\nSo ist diese Kalenderspruch-App entstanden – als kleines, bewusst gestaltetes Produkt für mehr Ruhe, Klarheit und Reflexion im Alltag.",
    creator: "— Samuel Triml",
  },
  fr: {
    title: "À propos",
    body: "L'idée de cette application est née d'une pensée très simple :\nÀ quelle fréquence prenons-nous vraiment un moment pour nous arrêter au milieu du quotidien ?\n\nEntre le travail, les études et la surcharge permanente de stimuli, j'ai senti combien une impulsion brève et claire peut être précieuse. Une phrase qui vous tire doucement du bruit pendant un instant. Pas de pression. Pas de distraction. Juste une pensée.\n\nC'est précisément cela que je voulais traduire en numérique :\nUne application qui ne s'impose pas, mais accompagne.\nQui ne surcharge pas, mais allège.\nQui n'enseigne pas, mais inspire à réfléchir.\n\nCette application de calendrier réflexif est née de cette intention : un petit espace soigneusement conçu pour davantage de calme, de clarté et de réflexion au quotidien.",
    creator: "— Samuel Triml",
  },
  es: {
    title: "Acerca de",
    body: "La idea de esta aplicación nació de un pensamiento muy simple:\n¿Con qué frecuencia nos regalamos de verdad un momento para detenernos en medio de la vida cotidiana?\n\nEntre el trabajo, los estudios y la sobrecarga constante de estímulos, me di cuenta de lo valioso que puede ser un impulso breve y claro. Una frase que, por un momento, te saque del ruido diario. Sin presión. Sin distracción. Solo un pensamiento.\n\nEso era exactamente lo que quería traducir al formato digital:\nUna aplicación que no se impone, sino que acompaña.\nQue no sobrecarga, sino que reduce.\nQue no alecciona, sino que inspira.\n\nAsí nació esta aplicación de calendario reflexivo: como un pequeño espacio diseñado con intención para más calma, claridad y reflexión en la vida diaria.",
    creator: "— Samuel Triml",
  },
  it: {
    title: "Informazioni",
    body: "L'idea di questa app è nata da un pensiero molto semplice:\nQuanto spesso ci concediamo davvero un momento per fermarci nel mezzo della vita quotidiana?\n\nTra lavoro, studio e una continua sovrastimolazione, ho capito quanto possa essere prezioso un impulso breve e chiaro. Una frase capace di portarti fuori dal rumore per un attimo. Nessuna pressione. Nessuna distrazione. Solo un pensiero.\n\nEra proprio questo che volevo tradurre in forma digitale:\nUn'app che non si impone, ma accompagna.\nChe non sovraccarica, ma riduce.\nChe non istruisce, ma ispira.\n\nCosì è nata questa app di calendario riflessivo: come un piccolo spazio costruito con intenzione per offrire più calma, chiarezza e riflessione nella vita di ogni giorno.",
    creator: "— Samuel Triml",
  },
  pt: {
    title: "Sobre",
    body: "A ideia desta aplicação nasceu de um pensamento muito simples:\nCom que frequência tiramos realmente um momento para parar no meio do quotidiano?\n\nEntre trabalho, estudo e uma sobrecarga constante de estímulos, percebi o quanto um impulso breve e claro pode ser valioso. Uma frase que te afasta do ruído por um instante. Sem pressão. Sem distração. Apenas um pensamento.\n\nEra exatamente isso que eu queria traduzir para o digital:\nUma aplicação que não se impõe, mas acompanha.\nQue não sobrecarrega, mas reduz.\nQue não ensina de cima para baixo, mas inspira.\n\nFoi assim que esta aplicação de calendário reflexivo nasceu: como um pequeno espaço criado com intenção para mais calma, clareza e reflexão no dia a dia.",
    creator: "— Samuel Triml",
  },
  "pt-BR": {
    title: "Sobre",
    body: "A ideia deste app nasceu de um pensamento muito simples:\nCom que frequência a gente realmente reserva um momento para parar no meio do dia a dia?\n\nEntre trabalho, estudo e uma sobrecarga constante de estímulos, percebi como um impulso breve e claro pode ser valioso. Uma frase capaz de tirar você do ruído por um instante. Sem pressão. Sem distração. Apenas um pensamento.\n\nEra exatamente isso que eu queria traduzir para o digital:\nUm app que não se impõe, mas acompanha.\nQue não sobrecarrega, mas reduz.\nQue não ensina, mas inspira.\n\nFoi assim que este app de calendário reflexivo surgiu: como um pequeno espaço criado com intenção para mais calma, clareza e reflexão no cotidiano.",
    creator: "— Samuel Triml",
  },
  nl: {
    title: "Over",
    body: "Het idee voor deze app ontstond uit één eenvoudige gedachte:\nHoe vaak nemen we in het dagelijks leven echt een moment om stil te staan?\n\nTussen werk, studie en voortdurende prikkeloverload merkte ik hoe waardevol een korte, heldere impuls kan zijn. Eén zin die je even uit de drukte tilt. Geen druk. Geen afleiding. Alleen één gedachte.\n\nPrecies dat wilde ik digitaal vertalen:\nEen app die zich niet opdringt, maar begeleidt.\nDie niet overlaadt, maar reduceert.\nDie niet uitlegt, maar inspireert.\n\nZo is deze kalender-app voor reflectie ontstaan: als een kleine, bewust vormgegeven plek voor meer rust, helderheid en reflectie in het dagelijks leven.",
    creator: "— Samuel Triml",
  },
};

const membershipCategoryLabels: Record<MembershipFeatureCategoryId, Record<SupportedTranslationLanguage, string>> = {
  design: { en: "Design & Atmosphere", de: "Gestaltung & Atmosphäre", "pt-BR": "Design e atmosfera", fr: "Design et atmosphère", es: "Diseño y atmósfera" },
  archive: { en: "Archive & Collection", de: "Archiv & Sammlung", "pt-BR": "Arquivo e coleção", fr: "Archives et collection", es: "Archivo y colección" },
  languages: { en: "Languages & Personalization", de: "Sprachen & Personalisierung", "pt-BR": "Idiomas e personalização", fr: "Langues et personnalisation", es: "Idiomas y personalización" },
  ritual: { en: "Reflection & Ritual", de: "Reflexion & Ritual", "pt-BR": "Reflexão e ritual", fr: "Réflexion et rituel", es: "Reflexión y ritual" },
  export: { en: "Export & Ownership", de: "Export & Eigentum", "pt-BR": "Exportação e pertencimento", fr: "Export et maîtrise", es: "Exportación y control" },
};

const membershipCategoryDescriptions: Record<MembershipFeatureCategoryId, Record<SupportedTranslationLanguage, string>> = {
  design: {
    en: "A quieter visual atmosphere for the daily page.",
    de: "Eine stillere visuelle Atmosphäre für die tägliche Seite.",
    "pt-BR": "Uma atmosfera visual mais serena para a página diária.",
    fr: "Une atmosphère visuelle plus calme pour la page du jour.",
    es: "Una atmósfera visual más serena para la página diaria.",
  },
  archive: {
    en: "More room to keep, revisit, and organize what stayed with you.",
    de: "Mehr Raum, um zu behalten, wiederzufinden und zu ordnen, was bei dir geblieben ist.",
    "pt-BR": "Mais espaço para guardar, revisitar e organizar o que ficou com você.",
    fr: "Plus d'espace pour garder, retrouver et organiser ce qui est resté avec vous.",
    es: "Más espacio para guardar, volver y organizar lo que se quedó contigo.",
  },
  languages: {
    en: "A more personal relationship between app language and reflection language.",
    de: "Eine persönlichere Verbindung zwischen App-Sprache und Reflexionssprache.",
    "pt-BR": "Uma relação mais pessoal entre o idioma do app e o idioma das reflexões.",
    fr: "Une relation plus personnelle entre la langue de l'app et celle des réflexions.",
    es: "Una relación más personal entre el idioma de la app y el de las reflexiones.",
  },
  ritual: {
    en: "Gentle additions that deepen the daily habit without making it noisy.",
    de: "Sanfte Ergänzungen, die das tägliche Ritual vertiefen, ohne es laut zu machen.",
    "pt-BR": "Adições suaves que aprofundam o ritual diário sem torná-lo barulhento.",
    fr: "Des ajouts doux qui approfondissent l'habitude quotidienne sans la rendre bruyante.",
    es: "Añadidos suaves que profundizan el ritual diario sin volverlo ruidoso.",
  },
  export: {
    en: "More ownership over what you have kept and written.",
    de: "Mehr Eigentum an dem, was du behalten und geschrieben hast.",
    "pt-BR": "Mais autonomia sobre o que você guardou e escreveu.",
    fr: "Davantage de maîtrise sur ce que vous avez gardé et écrit.",
    es: "Más control sobre lo que has guardado y escrito.",
  },
};

const membershipFeatureLabels: Record<MembershipFeatureId, Record<SupportedTranslationLanguage, string>> = {
  "premium-paper-colors": { en: "Premium paper colors", de: "Premium-Papierfarben", "pt-BR": "Cores premium de papel", fr: "Couleurs premium du papier", es: "Colores premium de papel" },
  "premium-typography": { en: "Premium typography", de: "Premium-Typografie", "pt-BR": "Tipografia premium", fr: "Typographie premium", es: "Tipografía premium" },
  "premium-layouts": { en: "Premium page layouts", de: "Premium-Seitenlayouts", "pt-BR": "Layouts premium de página", fr: "Mises en page premium", es: "Diseños premium de página" },
  "unlimited-archive": { en: "Unlimited archive", de: "Unbegrenztes Archiv", "pt-BR": "Arquivo ilimitado", fr: "Archives illimitées", es: "Archivo ilimitado" },
  "unlimited-saved": { en: "Unlimited saved quotes", de: "Unbegrenzt gesammelte Seiten", "pt-BR": "Páginas guardadas ilimitadas", fr: "Pages conservées illimitées", es: "Páginas guardadas ilimitadas" },
  "extended-notes": { en: "Longer personal notes", de: "Längere persönliche Notizen", "pt-BR": "Notas pessoais mais longas", fr: "Notes personnelles plus longues", es: "Notas personales más largas" },
  "search-filter": { en: "Search and filter", de: "Suche und Filter", "pt-BR": "Busca e filtros", fr: "Recherche et filtres", es: "Búsqueda y filtros" },
  "advanced-saved-management": {
    en: "Advanced saved-reflection management",
    de: "Erweiterte Verwaltung gespeicherter Reflexionen",
    "pt-BR": "Gerenciamento avançado das reflexões guardadas",
    fr: "Gestion avancée des réflexions conservées",
    es: "Gestión avanzada de las reflexiones guardadas",
  },
  "personal-collections": { en: "Personal collections", de: "Persönliche Sammlungen", "pt-BR": "Coleções pessoais", fr: "Collections personnelles", es: "Colecciones personales" },
  "quote-language-choice": { en: "Free choice of reflection language", de: "Freie Wahl der Reflexionssprache", "pt-BR": "Escolha livre do idioma das reflexões", fr: "Choix libre de la langue des réflexions", es: "Elección libre del idioma de las reflexiones" },
  "multiple-quote-languages": {
    en: "Choose several reflection languages",
    de: "Mehrere Reflexionssprachen wählen",
    "pt-BR": "Escolher vários idiomas de reflexão",
    fr: "Choisir plusieurs langues de réflexion",
    es: "Elegir varios idiomas de reflexión",
  },
  "daily-language-rotation": { en: "Daily language rotation", de: "Tägliche Sprachrotation", "pt-BR": "Rotação diária de idiomas", fr: "Rotation quotidienne des langues", es: "Rotación diaria de idiomas" },
  "deeper-personalization": { en: "Deeper personalization", de: "Tiefere Personalisierung", "pt-BR": "Personalização mais profunda", fr: "Personnalisation plus profonde", es: "Personalización más profunda" },
  "reflection-prompts": { en: "Reflection prompts", de: "Reflexionsimpulse", "pt-BR": "Prompts de reflexão", fr: "Pistes de réflexion", es: "Pistas de reflexión" },
  "save-reason": { en: "Why did I save this?", de: "Warum habe ich das behalten?", "pt-BR": "Por que eu guardei isto?", fr: "Pourquoi ai-je gardé cela ?", es: "¿Por qué guardé esto?" },
  "weekly-recap": { en: "Weekly recap", de: "Wöchentlicher Rückblick", "pt-BR": "Resumo semanal", fr: "Récapitulatif hebdomadaire", es: "Resumen semanal" },
  "monthly-recap": { en: "Monthly recap", de: "Monatlicher Rückblick", "pt-BR": "Resumo mensal", fr: "Récapitulatif mensuel", es: "Resumen mensual" },
  "email-export": { en: "Email export", de: "E-Mail-Export", "pt-BR": "Exportação por e-mail", fr: "Export par e-mail", es: "Exportación por correo" },
  "pdf-export": { en: "PDF export", de: "PDF-Export", "pt-BR": "Exportação em PDF", fr: "Export PDF", es: "Exportación en PDF" },
  "year-end-reminder": { en: "31 December backup reminder", de: "31.12.-Backup-Erinnerung", "pt-BR": "Lembrete de backup em 31/12", fr: "Rappel de sauvegarde du 31 décembre", es: "Recordatorio de copia del 31 de diciembre" },
};

const membershipPlanNotes: Record<"Freemium" | "Premium" | "Lifelong", Record<SupportedTranslationLanguage, string>> = {
  Freemium: {
    en: "A complete daily page, with room to keep up to 7 reflections and shorter notes.",
    de: "Eine vollständige Tagesseite, mit Raum für bis zu 7 gespeicherte Reflexionen und kürzere Notizen.",
    "pt-BR": "Uma página diária completa, com espaço para guardar até 7 reflexões e notas mais curtas.",
    fr: "Une page quotidienne complète, avec de la place pour garder jusqu'à 7 réflexions et des notes plus courtes.",
    es: "Una página diaria completa, con espacio para guardar hasta 7 reflexiones y notas más breves.",
  },
  Premium: {
    en: "More beauty, more choice, and full ownership around what matters enough to keep.",
    de: "Mehr Schönheit, mehr Wahlfreiheit und voller persönlicher Raum um das, was wichtig genug ist, um es zu behalten.",
    "pt-BR": "Mais beleza, mais escolha e plena sensação de posse ao redor do que importa a ponto de ficar.",
    fr: "Plus de beauté, plus de choix et un plein sentiment d'appartenance autour de ce qui mérite de rester.",
    es: "Más belleza, más elección y una sensación plena de pertenencia alrededor de lo que merece quedarse.",
  },
  Lifelong: {
    en: "A lasting supporter plan for keeping the full library close, without renewal.",
    de: "Ein bleibender Supporter-Plan, um die volle Bibliothek ohne Verlängerung nah bei dir zu halten.",
    "pt-BR": "Um plano duradouro de apoio para manter a experiência completa por perto, sem renovação.",
    fr: "Une formule de soutien durable pour garder la bibliothèque complète près de vous, sans renouvellement.",
    es: "Un plan de apoyo duradero para mantener cerca la biblioteca completa, sin renovación.",
  },
};

const membershipStateBodies: Record<"Freemium" | "Premium" | "Lifelong", Record<SupportedTranslationLanguage, string>> = {
  Freemium: {
    en: "You still receive the full daily page, archive reading, up to 7 kept reflections, shorter notes, and the included visual atmosphere.",
    de: "Du erhältst weiterhin die vollständige tägliche Seite, lesbaren Archivzugang, bis zu 7 gespeicherte Reflexionen, kürzere Notizen und die enthaltene Gestaltung.",
    "pt-BR": "Você continua recebendo a página diária completa, leitura do arquivo, até 7 reflexões guardadas, notas mais curtas e a atmosfera visual incluída.",
    fr: "Vous recevez toujours la page quotidienne complète, l'accès aux archives, jusqu'à 7 réflexions gardées, des notes plus courtes et l'atmosphère visuelle incluse.",
    es: "Sigues recibiendo la página diaria completa, acceso al archivo, hasta 7 reflexiones guardadas, notas más breves y la atmósfera visual incluida.",
  },
  Premium: {
    en: "Premium opens unlimited kept reflections, longer notes, export, language freedom, and deeper visual personalization while keeping the ritual quiet.",
    de: "Premium öffnet unbegrenzt gespeicherte Reflexionen, längere Notizen, Export, Sprachfreiheit und tiefere visuelle Personalisierung und hält das Ritual dennoch ruhig.",
    "pt-BR": "O Premium abre reflexões guardadas ilimitadas, notas mais longas, exportação, liberdade de idiomas e personalização visual mais profunda, mantendo o ritual sereno.",
    fr: "Premium ouvre des réflexions conservées sans limite, des notes plus longues, l'export, une liberté de langue et une personnalisation visuelle plus profonde, tout en gardant le rituel calme.",
    es: "Premium abre reflexiones guardadas sin límite, notas más largas, exportación, libertad de idioma y una personalización visual más profunda, mientras mantiene el ritual sereno.",
  },
  Lifelong: {
    en: "Lifelong keeps every premium layer open as a lasting supporter plan, with the same full access and no renewal.",
    de: "Lifelong hält jede Premium-Ebene als bleibenden Supporter-Plan offen, mit demselben vollen Zugang und ohne Verlängerung.",
    "pt-BR": "Lifelong mantém toda a camada Premium aberta como um plano duradouro de apoio, com o mesmo acesso completo e sem renovação.",
    fr: "Lifelong garde ouverte chaque couche Premium comme une formule de soutien durable, avec le même accès complet et sans renouvellement.",
    es: "Lifelong mantiene abierta toda la capa Premium como un plan de apoyo duradero, con el mismo acceso completo y sin renovación.",
  },
};

function resolveTranslationSet(language: SupportedLanguage | null | undefined): Messages {
  const languagePrefix = language?.split("-")[0] ?? "en";
  return translationMap[language ?? ""] ?? translationMap[languagePrefix] ?? englishMessages;
}

function resolveTranslationLanguage(language: SupportedLanguage | null | undefined): SupportedTranslationLanguage {
  const languagePrefix = language?.split("-")[0] ?? "en";

  if (language === "de" || language === "pt-BR" || language === "fr" || language === "es") {
    return language;
  }

  if (languagePrefix === "de") {
    return "de";
  }

  if (languagePrefix === "pt") {
    return "pt-BR";
  }

  if (languagePrefix === "fr") {
    return "fr";
  }

  if (languagePrefix === "es") {
    return "es";
  }

  return "en";
}

function resolveSubscriptionPlanMeta(
  plan: "Freemium" | "Premium" | "Lifelong",
  language: SupportedLanguage | null | undefined,
) {
  const languagePrefix = language?.split("-")[0] ?? "en";
  return (
    subscriptionPlanMetaByLanguage[plan][language ?? ""] ??
    subscriptionPlanMetaByLanguage[plan][languagePrefix] ??
    subscriptionPlanMetaByLanguage[plan].en
  );
}

function resolveAboutMeta(language: SupportedLanguage | null | undefined) {
  const languagePrefix = language?.split("-")[0] ?? "en";
  const direct = aboutMetaByLanguage[language ?? ""] ?? aboutMetaByLanguage[languagePrefix];

  if (direct && direct.body.trim() && direct.creator.trim()) {
    return direct;
  }

  return aboutMetaByLanguage.en;
}

export function getCategoryLabel(category: ReflectionCategory, language: SupportedLanguage | null | undefined): string {
  return categoryLabels[category][resolveTranslationLanguage(language)];
}

export function getToneLabel(tone: ReflectionTone, language: SupportedLanguage | null | undefined): string {
  return toneLabels[tone][resolveTranslationLanguage(language)];
}

export function getSourceTypeLabel(
  sourceType: "manual" | "ai" | "original_reflection" = "ai",
  language: SupportedLanguage | null | undefined,
): string {
  return sourceTypeLabels[sourceType][resolveTranslationLanguage(language)];
}

export function getNotificationMessagePool(
  language: SupportedLanguage | null | undefined,
  segment: "morning" | "midday" | "evening",
): string[] {
  const resolvedLanguage = resolveTranslationLanguage(language);

  if (segment === "evening") {
    return resolvedLanguage === "de"
      ? [
          "Dein Tag verdient einen Moment.",
          "Bevor der Tag endet, nimm das mit.",
          "Ein Gedanke, um den Tag zu schließen.",
          "Deine Seite wartet.",
          "Werde kurz etwas stiller.",
        ]
      : resolvedLanguage === "pt-BR"
        ? [
            "Seu dia merece um instante.",
            "Antes que o dia termine, receba isto.",
            "Um pensamento para fechar o dia.",
            "Sua página está esperando.",
            "Desacelere por um instante.",
          ]
        : resolvedLanguage === "fr"
          ? [
              "Votre journée mérite un moment.",
              "Avant que la journée se termine, prenez ceci.",
              "Une pensée pour clore la journée.",
              "Votre page vous attend.",
              "Ralentissez un instant.",
            ]
          : resolvedLanguage === "es"
            ? [
                "Tu día merece un momento.",
                "Antes de que termine el día, toma esto.",
                "Un pensamiento para cerrar el día.",
                "Tu página te espera.",
                "Baja el ritmo un instante.",
              ]
            : [
          "Your day deserves a moment.",
          "Before the day ends, take this.",
          "One thought to close the day.",
          "Your page is waiting.",
          "Slow down for a second.",
            ];
  }

  return resolvedLanguage === "de"
    ? [
        "Deine Seite für heute ist bereit.",
        "Ein stiller Moment, bevor der Tag beginnt.",
        "Beginne den Tag mit einem Gedanken.",
        "Heute beginnt hier.",
        "Nimm dir einen Moment. Er gehört schon dir.",
      ]
    : resolvedLanguage === "pt-BR"
      ? [
          "Sua página de hoje está pronta.",
          "Um instante quieto antes de o dia começar.",
          "Comece o dia com um pensamento.",
          "Hoje começa aqui.",
          "Reserve um instante. Ele já é seu.",
        ]
      : resolvedLanguage === "fr"
        ? [
            "Votre page du jour est prête.",
            "Un moment calme avant que la journée ne commence.",
            "Commencez la journée avec une pensée.",
            "Aujourd'hui commence ici.",
            "Prenez un moment. Il est déjà à vous.",
          ]
        : resolvedLanguage === "es"
          ? [
              "Tu página de hoy está lista.",
              "Un momento sereno antes de que empiece el día.",
              "Empieza el día con un pensamiento.",
              "Hoy empieza aquí.",
              "Tómate un momento. Ya es tuyo.",
            ]
          : [
        "Your page for today is ready.",
        "A quiet moment before the day begins.",
        "Start your day with one thought.",
        "Today begins here.",
        "Take a moment. It is already yours.",
          ];
}

export function getFollowUpReminderTitle(
  language: SupportedLanguage | null | undefined,
  name?: string | null,
): string {
  const resolvedLanguage = resolveTranslationLanguage(language);

  return resolvedLanguage === "de"
    ? name?.trim()
      ? `Deine Seite ist noch da, ${name.trim()}.`
      : "Deine Seite ist noch da."
    : resolvedLanguage === "pt-BR"
      ? name?.trim()
        ? `Sua página ainda está aqui, ${name.trim()}.`
        : "Sua página ainda está aqui."
      : resolvedLanguage === "fr"
        ? name?.trim()
          ? `Votre page est encore là, ${name.trim()}.`
          : "Votre page est encore là."
        : resolvedLanguage === "es"
          ? name?.trim()
            ? `Tu página sigue aquí, ${name.trim()}.`
            : "Tu página sigue aquí."
      : name?.trim()
        ? `Your page is still here, ${name.trim()}.`
        : "Your page is still here.";
}

export function getFollowUpReminderBody(
  language: SupportedLanguage | null | undefined,
  kind: "first" | "final",
): string {
  const resolvedLanguage = resolveTranslationLanguage(language);

  if (kind === "first") {
    return resolvedLanguage === "de"
      ? "Die heutige Seite wartet noch auf dich."
      : resolvedLanguage === "pt-BR"
        ? "A página de hoje ainda está esperando por você."
        : resolvedLanguage === "fr"
          ? "La page d'aujourd'hui vous attend encore."
          : resolvedLanguage === "es"
            ? "La página de hoy todavía te espera."
        : "Today's page is still waiting for you.";
  }

  return resolvedLanguage === "de"
    ? "Deine Seite ist noch da, wenn du zu ihr zurückkehren möchtest."
    : resolvedLanguage === "pt-BR"
      ? "Sua página ainda está aqui, se você quiser voltar a ela."
      : resolvedLanguage === "fr"
        ? "Votre page est encore là, si vous souhaitez y revenir."
        : resolvedLanguage === "es"
          ? "Tu página sigue aquí, si quieres volver a ella."
      : "Your page is still here if you want to return to it.";
}

export function getAppStrings(language: SupportedLanguage | null | undefined) {
  const messages = resolveTranslationSet(language);
  const resolvedLanguage = resolveTranslationLanguage(language);
  const effectiveLanguage = resolvedLanguage;
  const aboutMeta = resolveAboutMeta(effectiveLanguage);
  const extendedLabels = {
    reflectionTitle:
      {
        en: "Reflection",
        de: "Reflexion",
        "pt-BR": "Reflexão",
        fr: "Réflexion",
        es: "Reflexión",
      }[effectiveLanguage] ??
      messages["reflection.title"],
  };
  const translate = (key: TranslationKey) => {
    const localizedValue = messages[key];
    if (localizedValue) {
      return localizedValue;
    }

    const fallbackValue = englishMessages[key] ?? germanMessages[key];
    if (__DEV__ && fallbackValue) {
      console.warn(`[i18n] Missing translation for "${key}" in ${effectiveLanguage}. Falling back to English.`);
    }
    return fallbackValue;
  };

  return {
    languageCode: language ?? "en",
    locale: resolveLocale(language),
    t: translate,
    categoryLabel: (category: ReflectionCategory) => getCategoryLabel(category, language),
    toneLabel: (tone: ReflectionTone) => getToneLabel(tone, language),
    sourceTypeLabel: (sourceType: "manual" | "ai" | "original_reflection" = "ai") =>
      getSourceTypeLabel(sourceType, language),
    reflectionTitle: () => extendedLabels.reflectionTitle,
    currentLabel: () => translate("settings.current"),
    planLabel: (plan: "Freemium" | "Premium" | "Lifelong") =>
      ({
        Freemium: translate("membership.planFreemium"),
        Premium: translate("membership.planPremium"),
        Lifelong: translate("membership.planLifelong"),
      })[plan],
    premiumLabel: () => translate("settings.premium"),
    aboutTitle: () => aboutMeta.title,
    aboutBody: () => aboutMeta.body,
    aboutCreator: () => aboutMeta.creator,
    appearancePresetMeta: (id: AppearancePresetId) => appearancePresetMeta[id][resolvedLanguage],
    appBackgroundMeta: (id: AppBackgroundPresetId) => appBackgroundMeta[id][resolvedLanguage],
    paperThemeMeta: (id: PaperThemePresetId) => paperThemeMeta[id][resolvedLanguage],
    typographyMeta: (id: TypographyPresetId) => typographyMeta[id][resolvedLanguage],
    pageStyleMeta: (id: PageStylePresetId) => pageStyleMeta[id][resolvedLanguage],
    subscriptionPlanMeta: (plan: "Freemium" | "Premium" | "Lifelong") => resolveSubscriptionPlanMeta(plan, effectiveLanguage),
    membershipFeatureCategoryLabel: (category: MembershipFeatureCategoryId) =>
      membershipCategoryLabels[category][resolvedLanguage],
    membershipFeatureCategoryDescription: (category: MembershipFeatureCategoryId) =>
      membershipCategoryDescriptions[category][resolvedLanguage],
    membershipFeatureLabel: (feature: MembershipFeatureId) => membershipFeatureLabels[feature][resolvedLanguage],
    membershipPlanNote: (plan: "Freemium" | "Premium" | "Lifelong") => membershipPlanNotes[plan][resolvedLanguage],
    membershipStateBody: (plan: "Freemium" | "Premium" | "Lifelong") => membershipStateBodies[plan][resolvedLanguage],
    preferenceLabel: (preference: OnboardingPreference) => preferenceLabels[preference][resolvedLanguage],
    acknowledgementTitle: (name?: string | null) =>
      resolvedLanguage === "de"
        ? name?.trim()
          ? `Schön, dass du da bist, ${name.trim()}.`
          : "Schön, dass du da bist."
        : resolvedLanguage === "pt-BR"
          ? name?.trim()
            ? `Que bom ter você aqui, ${name.trim()}.`
            : "Que bom ter você aqui."
          : resolvedLanguage === "fr"
            ? name?.trim()
              ? `Heureux de vous retrouver, ${name.trim()}.`
              : "Heureux de vous retrouver."
            : resolvedLanguage === "es"
              ? name?.trim()
                ? `Qué bueno tenerte aquí, ${name.trim()}.`
                : "Qué bueno tenerte aquí."
          : name?.trim()
            ? `Good to have you here, ${name.trim()}.`
            : "Good to have you here.",
    welcomeBack: (name?: string | null) =>
      resolvedLanguage === "de"
        ? name?.trim()
          ? `Willkommen, ${name.trim()}.`
          : messages["today.defaultSubtitle"]
        : resolvedLanguage === "pt-BR"
          ? name?.trim()
            ? `Bem-vindo, ${name.trim()}.`
            : messages["today.defaultSubtitle"]
          : resolvedLanguage === "fr"
            ? name?.trim()
              ? `Bienvenue, ${name.trim()}.`
              : messages["today.defaultSubtitle"]
            : resolvedLanguage === "es"
              ? name?.trim()
                ? `Bienvenido, ${name.trim()}.`
                : messages["today.defaultSubtitle"]
          : name?.trim()
            ? `Welcome, ${name.trim()}.`
            : messages["today.defaultSubtitle"],
    notificationReadyTitle: (name?: string | null) =>
      resolvedLanguage === "de"
        ? name?.trim()
          ? `Deine Seite ist bereit, ${name.trim()}.`
          : "Deine Seite ist bereit"
        : resolvedLanguage === "pt-BR"
          ? name?.trim()
            ? `Sua página está pronta, ${name.trim()}.`
            : "Sua página está pronta"
          : resolvedLanguage === "fr"
            ? name?.trim()
              ? `Votre page est prête, ${name.trim()}.`
              : "Votre page est prête"
            : resolvedLanguage === "es"
              ? name?.trim()
                ? `Tu página está lista, ${name.trim()}.`
                : "Tu página está lista"
          : name?.trim()
            ? `Your page is ready, ${name.trim()}.`
            : "Your page is ready",
    notificationReadyBody: () =>
      resolvedLanguage === "de"
        ? "Ein stiller Moment, wenn du ihn brauchst."
        : resolvedLanguage === "pt-BR"
          ? "Um momento silencioso, se você quiser."
          : resolvedLanguage === "fr"
            ? "Un moment calme, si vous en avez besoin."
            : resolvedLanguage === "es"
              ? "Un momento sereno, si lo necesitas."
          : "A quiet moment, if you need it.",
    notificationMessagePool: (segment: "morning" | "midday" | "evening") =>
      getNotificationMessagePool(language, segment),
    followUpReminderTitle: (name?: string | null) => getFollowUpReminderTitle(language, name),
    followUpReminderBody: (kind: "first" | "final") => getFollowUpReminderBody(language, kind),
    yearEndReminderTitle: (name?: string | null) =>
      resolvedLanguage === "de"
        ? name?.trim()
          ? `Deine Seiten sind bereit, ${name.trim()}.`
          : "Deine Seiten sind bereit"
        : resolvedLanguage === "pt-BR"
          ? name?.trim()
            ? `Suas páginas estão prontas, ${name.trim()}.`
            : "Suas páginas estão prontas"
          : resolvedLanguage === "fr"
            ? name?.trim()
              ? `Vos pages sont prêtes, ${name.trim()}.`
              : "Vos pages sont prêtes"
            : resolvedLanguage === "es"
              ? name?.trim()
                ? `Tus páginas están listas, ${name.trim()}.`
                : "Tus páginas están listas"
          : name?.trim()
            ? `Your pages are ready, ${name.trim()}.`
            : "Your pages are ready",
    yearEndReminderBody: () =>
      resolvedLanguage === "de"
        ? "Nimm dir heute einen ruhigen Moment, um deine gespeicherten Reflexionen zu sichern oder dir per E-Mail zu senden."
        : resolvedLanguage === "pt-BR"
          ? "Reserve um momento tranquilo hoje para fazer backup das suas reflexões guardadas ou enviá-las por e-mail."
          : resolvedLanguage === "fr"
            ? "Prenez aujourd'hui un moment calme pour sauvegarder vos réflexions conservées ou vous les envoyer par e-mail."
            : resolvedLanguage === "es"
              ? "Reserva hoy un momento sereno para hacer una copia de tus reflexiones guardadas o enviártelas por correo."
          : "Take a quiet moment today to back up your saved reflections or send them to yourself by email.",
    permissionScheduleBody: (timeLabel: string) =>
      resolvedLanguage === "de"
        ? `Deine tägliche Seite kann um ${timeLabel} auf dich warten.`
        : resolvedLanguage === "pt-BR"
          ? `Sua página diária pode esperar por você às ${timeLabel}.`
          : resolvedLanguage === "fr"
            ? `Votre page quotidienne peut vous attendre à ${timeLabel}.`
            : resolvedLanguage === "es"
              ? `Tu página diaria puede esperarte a las ${timeLabel}.`
          : `Your daily page can wait for you at ${timeLabel}.`,
    languageOptionLabel: (code: SupportedLanguage) => {
      const option = getLanguageOption(code);
      return option ? `${getOfficialLanguageDisplayLabel(code)} · ${option.code}` : code;
    },
  };
}

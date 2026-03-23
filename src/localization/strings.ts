import { getLanguageOption, resolveLocale } from "@/localization/languages";
import { MembershipFeatureCategoryId, MembershipFeatureId } from "@/constants/premiumFeatures";
import { PageStylePresetId, PaperThemePresetId, TypographyPresetId } from "@/theme/presets";
import {
  OnboardingPreference,
  ReflectionCategory,
  ReflectionTone,
  SupportedLanguage,
} from "@/types/reflection";

type TranslationKey =
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
  | "onboarding.welcomeTitle"
  | "onboarding.welcomeBody"
  | "onboarding.welcomeHero"
  | "onboarding.languageTitle"
  | "onboarding.languageBody"
  | "onboarding.languageSearchPlaceholder"
  | "onboarding.nameTitle"
  | "onboarding.nameBody"
  | "onboarding.namePlaceholder"
  | "onboarding.ackBody"
  | "onboarding.ackCard"
  | "onboarding.preferenceTitle"
  | "onboarding.transitionTitle"
  | "onboarding.transitionBody"
  | "onboarding.introTitle"
  | "onboarding.notificationTimeTitle"
  | "onboarding.notificationTimeBody"
  | "onboarding.notificationPermissionTitle"
  | "onboarding.notificationPermissionBody"
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
  | "today.future"
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
  | "settings.preferredCategories"
  | "settings.language"
  | "settings.languageBody"
  | "settings.quoteLanguages"
  | "settings.quoteLanguagesBody"
  | "settings.quoteLanguagesSearchPlaceholder"
  | "settings.quoteLanguagesSelectedTag"
  | "settings.quoteLanguagesAppTag"
  | "settings.privateSettingsTitle"
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
  | "settings.paperThemes"
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
  | "settings.devSectionTitle"
  | "settings.devSectionBody"
  | "settings.devResetOverride"
  | "settings.devOverrideActive"
  | "settings.devOverrideInactive"
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
  | "list.saved"
  | "membership.eyebrow"
  | "membership.title"
  | "membership.subtitle"
  | "membership.premiumIncludedTitle"
  | "membership.unlockAction"
  | "membership.openMembership"
  | "membership.devBody"
  | "membership.devReset"
  | "membership.lockedArchiveTitle"
  | "membership.lockedArchiveBody"
  | "membership.lockedSavedTitle"
  | "membership.lockedSavedBody"
  | "membership.placeholderWeeklyRecap"
  | "membership.placeholderMonthlyRecap"
  | "membership.placeholderCollections"
  | "membership.stateTitle"
  | "membership.devStateNote"
  | "membership.errorTitle"
  | "membership.errorBody"
  | "membership.lockedFeatureFootnote"
  | "membership.lifelongBadge"
  | "membership.liveNow"
  | "membership.preparedNext"
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
  | "membership.restoreErrorBody"
  | "membership.manageTitle"
  | "membership.manageBody"
  | "paywall.title"
  | "paywall.subtitle"
  | "paywall.monthly"
  | "paywall.yearly"
  | "paywall.benefitArchive"
  | "paywall.benefitThemes"
  | "paywall.benefitTypography"
  | "paywall.benefitPersonalization"
  | "paywall.openNative"
  | "paywall.restore"
  | "paywall.loading"
  | "paywall.error"
  | "paywall.notAvailable";

type Messages = Record<TranslationKey, string>;
type SupportedTranslationLanguage = "en" | "de" | "pt-BR";

const english: Messages = {
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
  "onboarding.welcomeTitle": "Take a moment.",
  "onboarding.welcomeBody": "This page is yours.",
  "onboarding.welcomeHero": "One reflection a day, held in a calm place you can return to quietly.",
  "onboarding.languageTitle": "Choose your language",
  "onboarding.languageBody": "You can change this anytime.",
  "onboarding.languageSearchPlaceholder": "Search language",
  "onboarding.nameTitle": "What is your name?",
  "onboarding.nameBody": "This stays with you.",
  "onboarding.namePlaceholder": "Your name",
  "onboarding.ackBody": "Let's begin.",
  "onboarding.ackCard": "A quiet daily page can hold more than a crowded feed ever will.",
  "onboarding.preferenceTitle": "What do you want more of?",
  "onboarding.transitionTitle": "We'll keep this in mind.",
  "onboarding.transitionBody": "Preparing today's page.",
  "onboarding.introTitle": "Stay with the page.\nLet the question open slowly.",
  "onboarding.notificationTimeTitle": "When should this page reach you?",
  "onboarding.notificationTimeBody": "A quiet moment, each day.",
  "onboarding.notificationPermissionTitle": "We'll remind you gently.",
  "onboarding.notificationPermissionBody": "A quiet moment, if you need it.",
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
  "today.future": "Reserved quietly for future paper styles and personalization.",
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
  "settings.preferredCategories": "Preferred categories",
  "settings.language": "Language",
  "settings.languageBody": "Choose how the app speaks to you.",
  "settings.quoteLanguages": "Reflection languages",
  "settings.quoteLanguagesBody": "Premium can rotate daily reflections across the languages you select here.",
  "settings.quoteLanguagesSearchPlaceholder": "Search language",
  "settings.quoteLanguagesSelectedTag": "Selected",
  "settings.quoteLanguagesAppTag": "App",
  "settings.privateSettingsTitle": "Private settings",
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
  "settings.premiumBody": "The theme system now supports future premium paper tones, font styles, and page styles without changing the app's calm visual language.",
  "settings.subscriptionStatus": "Subscription status",
  "settings.restorePurchases": "Restore Purchases",
  "settings.manageSubscription": "Manage Subscription",
  "settings.manageSubscriptionBody": "Subscription management requires store setup in a development or production build.",
  "settings.restoreSuccessTitle": "Restored",
  "settings.restoreSuccessBody": "Your purchases have been checked.",
  "settings.restoreErrorTitle": "Not available",
  "settings.restoreErrorBody": "Purchases could not be restored right now.",
  "settings.upgradeAction": "View Premium",
  "settings.premiumPreviewTitle": "Premium access",
  "settings.premiumPreviewBody": "Unlock the full archive, premium paper themes, refined typography, and future deeper personalization.",
  "settings.paperThemes": "Paper themes",
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
  "settings.devSectionTitle": "Test mode",
  "settings.devSectionBody": "Development-only override for checking Freemium and Premium states locally.",
  "settings.devResetOverride": "Use normal subscription logic",
  "settings.devOverrideActive": "Override active",
  "settings.devOverrideInactive": "No override",
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
  "archive.premiumMessage": "The free tier keeps a smaller recent archive. Premium opens the full dated library and future deeper reflection tools.",
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
  "favorites.premiumMessage": "Freemium keeps a smaller stack. Premium opens unlimited kept pages, search, export, and future collections.",
  "list.saved": "Kept",
  "membership.eyebrow": "Membership",
  "membership.title": "Membership",
  "membership.subtitle": "Freemium begins gently. Premium and Lifelong open more room for beauty, ownership, and reflection.",
  "membership.premiumIncludedTitle": "Premium unlocks",
  "membership.unlockAction": "Unlock Premium",
  "membership.openMembership": "Open membership",
  "membership.devBody": "Development-only override for checking Freemium, Premium, and Lifelong locally.",
  "membership.devReset": "Use normal membership logic",
  "membership.lockedArchiveTitle": "Search and filters live in Premium",
  "membership.lockedArchiveBody": "Freemium keeps the archive quieter and shorter. Premium opens search, filters, and the full dated record.",
  "membership.lockedSavedTitle": "A fuller collection lives in Premium",
  "membership.lockedSavedBody": "Freemium keeps a smaller saved stack. Premium opens unlimited kept pages, search, and export.",
  "membership.placeholderWeeklyRecap": "A weekly reflective recap is prepared as a future Premium ritual.",
  "membership.placeholderMonthlyRecap": "A monthly reflective recap is prepared as a future Premium ritual.",
  "membership.placeholderCollections": "Personal collections and folders are prepared as a future Premium layer.",
  "membership.stateTitle": "Your current plan",
  "membership.devStateNote": "A development override is shaping this view right now.",
  "membership.errorTitle": "Membership details are quiet for the moment",
  "membership.errorBody": "The current plan still works as expected. Store-based details can return when the connection is ready again.",
  "membership.lockedFeatureFootnote": "Prepared quietly for Premium.",
  "membership.lifelongBadge": "Supporter",
  "membership.liveNow": "Available now",
  "membership.preparedNext": "Prepared next",
  "membership.choosePremium": "Choose Premium",
  "membership.chooseLifelong": "Choose Lifelong",
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
  "membership.manageTitle": "Manage later",
  "membership.manageBody": "Subscription management will connect here when live store billing is active in this build.",
  "paywall.title": "A calmer premium layer",
  "paywall.subtitle": "Unlock the full archive, premium paper tones, refined typography, and future deeper personalization.",
  "paywall.monthly": "Monthly",
  "paywall.yearly": "Yearly",
  "paywall.benefitArchive": "Full archive access",
  "paywall.benefitThemes": "Premium paper themes",
  "paywall.benefitTypography": "Premium typography styles",
  "paywall.benefitPersonalization": "Future deeper personalization",
  "paywall.openNative": "Open paywall",
  "paywall.restore": "Restore Purchases",
  "paywall.loading": "Loading subscription options...",
  "paywall.error": "Subscription information is unavailable right now.",
  "paywall.notAvailable": "Offerings are not available yet. Add your RevenueCat keys and dashboard products to test purchases.",
};

const german: Messages = {
  ...english,
  "tabs.today": "Heute",
  "tabs.archive": "Archiv",
  "tabs.favorites": "Gesammelt",
  "tabs.settings": "Einstellungen",
  "common.continue": "Weiter",
  "common.continueWithoutName": "Ohne Namen fortfahren",
  "common.notNow": "Nicht jetzt",
  "common.allowNotifications": "Mitteilungen erlauben",
  "common.preparing": "Wird vorbereitet...",
  "common.searchLanguage": "Sprache suchen",
  "common.cancel": "Abbrechen",
  "common.reset": "Zurücksetzen",
  "common.refresh": "Aktualisieren",
  "onboarding.welcomeTitle": "Nimm dir einen Moment.",
  "onboarding.welcomeBody": "Diese Seite gehört dir.",
  "onboarding.welcomeHero": "Eine Reflexion am Tag, an einem ruhigen Ort, zu dem du leise zurückkehren kannst.",
  "onboarding.languageTitle": "Wähle deine Sprache",
  "onboarding.languageBody": "Du kannst das jederzeit ändern.",
  "onboarding.languageSearchPlaceholder": "Sprache suchen",
  "onboarding.nameTitle": "Wie heißt du?",
  "onboarding.nameBody": "Das bleibt bei dir.",
  "onboarding.namePlaceholder": "Dein Name",
  "onboarding.ackBody": "Lass uns beginnen.",
  "onboarding.ackCard": "Eine stille Seite pro Tag kann mehr tragen als ein überfüllter Strom von Eindrücken.",
  "onboarding.preferenceTitle": "Wovon möchtest du mehr?",
  "onboarding.transitionTitle": "Wir behalten das im Blick.",
  "onboarding.transitionBody": "Die heutige Seite wird vorbereitet.",
  "onboarding.introTitle": "Bleib bei der Seite.\nLass die Frage langsam aufgehen.",
  "onboarding.notificationTimeTitle": "Wann darf dich diese Seite erreichen?",
  "onboarding.notificationTimeBody": "Ein leiser Moment, jeden Tag.",
  "onboarding.notificationPermissionTitle": "Wir erinnern dich ganz sanft.",
  "onboarding.notificationPermissionBody": "Ein stiller Moment, wenn du ihn brauchst.",
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
  "today.followUpLoading": "Ein weiterer stiller Impuls kommt ...",
  "today.followUpTitle": "Vertiefende Impulse",
  "today.followUpError": "Ein vertiefender Impuls konnte gerade nicht vorbereitet werden.",
  "today.followUpLimitBody": "Der tägliche KI-Impuls ist heute bereits verwendet. Premium öffnet mehr Raum für weitere vertiefende Fragen.",
  "today.swipeHint": "Wische sanft über die Seite, um durch gespeicherte Tage zu gehen.",
  "today.tomorrowHint": "Morgen wartet eine neue Seite.",
  "today.preparing": "Deine Reflexion wird vorbereitet.",
  "today.future": "Still reserviert für spätere Papierstile und Personalisierung.",
  "reflection.title": "Reflexion",
  "reflection.unavailable": "Diese Reflexion ist nicht verfügbar.",
  "settings.eyebrow": "Einstellungen",
  "settings.title": "Leise Einstellungen",
  "settings.subtitle": "Alles hier bleibt lokal, mit Raum für spätere Premium-Personalisierung und eine mögliche entfernte Bereitstellung.",
  "settings.standardSectionTitle": "Standardeinstellungen",
  "settings.standardSectionSummary": "Erinnerungszeit, Kategorien, Erscheinung und Sprache.",
  "settings.freemiumSectionSummary": "Enthaltene Papier-, Schrift- und Seitenoptionen.",
  "settings.premiumSectionSummary": "Spätere Premium-Töne, Typografie und Seitenlayouts.",
  "settings.plansSectionTitle": "Abomodelle",
  "settings.plansSectionSummary": "Freemium, Premium und Lifelong.",
  "settings.notificationTime": "Erinnerungszeit",
  "settings.preferredCategories": "Bevorzugte Kategorien",
  "settings.language": "Sprache",
  "settings.languageBody": "Wähle, wie die App mit dir spricht.",
  "settings.quoteLanguages": "Sprachen der Reflexion",
  "settings.quoteLanguagesBody": "Premium kann tägliche Reflexionen zwischen den hier gewählten Sprachen wechseln.",
  "settings.quoteLanguagesSearchPlaceholder": "Sprache suchen",
  "settings.quoteLanguagesSelectedTag": "Aktiv",
  "settings.quoteLanguagesAppTag": "App",
  "settings.privateSettingsTitle": "Private Einstellungen",
  "settings.exportSavedReflections": "Gespeicherte Reflexionen per E-Mail senden",
  "settings.exportAction": "Jetzt senden",
  "settings.exportSavedReflectionsSubject": "Gespeicherte Reflexionen",
  "settings.exportSavedReflectionsFallbackTitle": "Gespeicherte Reflexionen",
  "settings.exportSavedReflectionsBody": "Sende deine behaltenen Reflexionen und Notizen gemeinsam als stillen Gesamtexport oder bewahre sie als PDF-Journal auf.",
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
  "settings.premiumBody": "Das Themesystem unterstützt bereits zukünftige Papierfarben, Schriftstile und Seitenstile, ohne die ruhige visuelle Sprache zu verändern.",
  "settings.subscriptionStatus": "Abostatus",
  "settings.restorePurchases": "Käufe wiederherstellen",
  "settings.manageSubscription": "Abo verwalten",
  "settings.manageSubscriptionBody": "Die Aboverwaltung benötigt Store-Setup in einem Development- oder Produktions-Build.",
  "settings.restoreSuccessTitle": "Wiederhergestellt",
  "settings.restoreSuccessBody": "Deine Käufe wurden überprüft.",
  "settings.restoreErrorTitle": "Nicht möglich",
  "settings.restoreErrorBody": "Käufe konnten gerade nicht wiederhergestellt werden.",
  "settings.upgradeAction": "Premium ansehen",
  "settings.premiumPreviewTitle": "Premium-Zugang",
  "settings.premiumPreviewBody": "Schalte unbegrenzt gespeicherte Reflexionen, längere Notizen, Export, Sprachfreiheit und spätere tiefere Personalisierung frei.",
  "settings.paperThemes": "Papierfarben",
  "settings.customPaperTheme": "Eigene Papierfarbe",
  "settings.customPaperThemeBody": "Forme einen stilleren persönlichen Papierklang und behalte ihn appweit bei.",
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
  "settings.aboutBody": "Ein stiller Ort für eine durchdachte Seite pro Tag, gestaltet, um das Tempo gerade genug zu verlangsamen und Raum für Reflexion zu lassen.",
  "settings.aboutCreator": "Mit Sorgfalt geschaffen als kleiner persönlicher Raum für Aufmerksamkeit, Ruhe und ehrliche Perspektive.",
  "settings.devSectionTitle": "Testmodus",
  "settings.devSectionBody": "Nur für Entwicklung: lokaler Override, um Freemium- und Premium-Zustände direkt zu prüfen.",
  "settings.devResetOverride": "Normale Abologik verwenden",
  "settings.devOverrideActive": "Override aktiv",
  "settings.devOverrideInactive": "Kein Override",
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
  "archive.premiumMessage": "Freemium hält das Archiv lesbar. Premium öffnet Suche, Filter und mehr persönliche Tiefe rund um die Seiten, die du behältst.",
  "archive.emptyTitle": "Noch keine passenden Seiten",
  "archive.emptyMessage": "Versuche eine weitere Kategorie, lösche die Suche oder behalte ein paar Reflexionen für ein weicheres Archiv.",
  "archive.noMatchTitle": "Nichts passt zu dieser Ansicht",
  "archive.noMatchMessage": "Versuche eine sanftere Suche, eine andere Kategorie oder kehre zu allen Reflexionen zurück.",
  "favorites.eyebrow": "Gesammelt",
  "favorites.title": "Behaltene Seiten",
  "favorites.subtitle": "Ein kleinerer persönlicher Stapel von Reflexionen, die nah genug geblieben sind, um sie zu behalten.",
  "favorites.emptyTitle": "Noch keine behaltenen Seiten",
  "favorites.emptyMessage": "Behalte eine Reflexion von heute oder aus dem Archiv, um eine ruhigere persönliche Sammlung zu beginnen.",
  "favorites.noMatchTitle": "Nichts passt zu deiner Sammlung",
  "favorites.noMatchMessage": "Versuche einen anderen Begriff oder entferne die Kategorie, um zu deinen behaltenen Seiten zurückzukehren.",
  "favorites.keepAction": "Behalten",
  "favorites.removeAction": "Nicht mehr behalten",
  "favorites.deleteConfirmTitle": "Gespeicherte Reflexion entfernen?",
  "favorites.deleteConfirmMessage": "Dadurch wird sie aus deiner Sammlung entfernt. Notizen bleiben an der datierten Seite erhalten, wenn sie noch im Archiv existiert.",
  "favorites.searchPlaceholder": "Gesammelte Reflexionen durchsuchen",
  "favorites.premiumTitle": "Eine größere Sammlung liegt in Premium",
  "favorites.premiumMessage": "Freemium hält bis zu 7 gespeicherte Seiten offen. Premium öffnet unbegrenzte Seiten, längere Notizen, Suche, Export und spätere Sammlungen.",
  "list.saved": "Behalten",
  "membership.eyebrow": "Mitgliedschaft",
  "membership.title": "Mitgliedschaft",
  "membership.subtitle": "Freemium beginnt bewusst schlicht. Premium und Lifelong öffnen mehr Raum für Schönheit, Eigenständigkeit und Reflexion.",
  "membership.premiumIncludedTitle": "Premium öffnet",
  "membership.unlockAction": "Premium freischalten",
  "membership.openMembership": "Mitgliedschaft öffnen",
  "membership.devBody": "Nur für Entwicklung: lokaler Override zum Prüfen von Freemium, Premium und Lifelong.",
  "membership.devReset": "Normale Mitgliedschaftslogik verwenden",
  "membership.lockedArchiveTitle": "Suche und Filter liegen in Premium",
  "membership.lockedArchiveBody": "Freemium hält das Archiv stiller und kürzer. Premium öffnet Suche, Filter und die vollständige datierte Spur.",
  "membership.lockedSavedTitle": "Eine größere Sammlung liegt in Premium",
  "membership.lockedSavedBody": "Freemium hält den gesammelten Stapel kleiner. Premium öffnet unbegrenzte Seiten, Suche und Export.",
  "membership.placeholderWeeklyRecap": "Ein wöchentlicher Rückblick ist als späteres Premium-Ritual vorbereitet.",
  "membership.placeholderMonthlyRecap": "Ein monatlicher Rückblick ist als späteres Premium-Ritual vorbereitet.",
  "membership.placeholderCollections": "Persönliche Sammlungen und Ordner sind als spätere Premium-Ebene vorbereitet.",
  "membership.stateTitle": "Dein aktueller Plan",
  "membership.devStateNote": "Ein Development-Override formt diese Ansicht gerade.",
  "membership.errorTitle": "Mitgliedschaftsdetails sind gerade still",
  "membership.errorBody": "Dein aktueller Plan funktioniert weiterhin. Store-basierte Details können zurückkehren, sobald die Verbindung wieder bereit ist.",
  "membership.lockedFeatureFootnote": "Still für Premium vorbereitet.",
  "membership.lifelongBadge": "Supporter",
  "membership.liveNow": "Jetzt verfügbar",
  "membership.preparedNext": "Als Nächstes vorbereitet",
  "membership.choosePremium": "Premium wählen",
  "membership.chooseLifelong": "Lifelong wählen",
  "membership.switchToPremium": "Zu Premium wechseln",
  "membership.unlockLifelong": "Einmalig freischalten",
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
  "membership.manageTitle": "Später",
  "membership.manageBody": "Die Aboverwaltung wird hier verbunden, sobald echtes Store-Billing in diesem Build aktiv ist.",
  "paywall.title": "Eine ruhigere Premium-Ebene",
  "paywall.subtitle": "Schalte das volle Archiv, Premium-Papiertöne, verfeinerte Typografie und spätere tiefere Personalisierung frei.",
  "paywall.monthly": "Monatlich",
  "paywall.yearly": "Jährlich",
  "paywall.benefitArchive": "Voller Archivzugang",
  "paywall.benefitThemes": "Premium-Papiertöne",
  "paywall.benefitTypography": "Premium-Schriftstile",
  "paywall.benefitPersonalization": "Spätere tiefere Personalisierung",
  "paywall.openNative": "Paywall öffnen",
  "paywall.restore": "Käufe wiederherstellen",
  "paywall.loading": "Abooptionen werden geladen...",
  "paywall.error": "Aboinformationen sind gerade nicht verfügbar.",
  "paywall.notAvailable": "Angebote sind noch nicht verfügbar. Füge deine RevenueCat-Schlüssel und Dashboard-Produkte hinzu, um Käufe zu testen.",
};

const brazilianPortuguese: Messages = {
  ...english,
  "tabs.today": "Hoje",
  "tabs.archive": "Arquivo",
  "tabs.favorites": "Guardadas",
  "tabs.settings": "Ajustes",
  "common.continue": "Continuar",
  "common.continueWithoutName": "Continuar sem nome",
  "common.notNow": "Agora não",
  "common.allowNotifications": "Permitir notificações",
  "common.preparing": "Preparando...",
  "common.searchLanguage": "Buscar idioma",
  "common.cancel": "Cancelar",
  "common.reset": "Redefinir",
  "common.refresh": "Atualizar",
  "onboarding.welcomeTitle": "Pare por um instante.",
  "onboarding.welcomeBody": "Esta página é sua.",
  "onboarding.welcomeHero": "Uma reflexão por dia, em um lugar calmo ao qual você pode voltar em silêncio.",
  "onboarding.languageTitle": "Escolha seu idioma",
  "onboarding.languageBody": "Você pode mudar isso quando quiser.",
  "onboarding.languageSearchPlaceholder": "Buscar idioma",
  "onboarding.nameTitle": "Qual é o seu nome?",
  "onboarding.nameBody": "Isso fica com você.",
  "onboarding.namePlaceholder": "Seu nome",
  "onboarding.ackBody": "Vamos começar.",
  "onboarding.ackCard": "Uma página silenciosa por dia pode acolher mais do que um fluxo lotado de estímulos.",
  "onboarding.preferenceTitle": "Do que você quer mais?",
  "onboarding.transitionTitle": "Vamos guardar isso com cuidado.",
  "onboarding.transitionBody": "Preparando a página de hoje.",
  "onboarding.introTitle": "Fique com a página.\nDeixe a pergunta se abrir devagar.",
  "onboarding.notificationTimeTitle": "Quando você gostaria de receber esta página?",
  "onboarding.notificationTimeBody": "Um momento quieto, a cada dia.",
  "onboarding.notificationPermissionTitle": "Vamos lembrar você com delicadeza.",
  "onboarding.notificationPermissionBody": "Um momento silencioso, se você quiser.",
  "today.eyebrow": "Hoje",
  "today.title": "Hoje",
  "today.defaultSubtitle": "Uma pergunta, guardada em silêncio para o dia.",
  "today.keep": "Guardar",
  "today.kept": "Guardada.",
  "today.share": "Compartilhar",
  "today.shareDialogTitle": "Compartilhar cartão da reflexão",
  "today.shareFallbackMessage": "Reflexão diária",
  "today.shareUnavailableTitle": "Não foi possível compartilhar",
  "today.shareUnavailableBody": "O cartão da reflexão não pôde ser compartilhado neste dispositivo.",
  "today.helper": "Você pode voltar a isso quando quiser.",
  "today.noteTitle": "Uma nota silenciosa",
  "today.notePlaceholder": "Seus pensamentos sobre esta reflexão ...",
  "today.saveLimitTitle": "Uma coleção menor vive aqui",
  "today.saveLimitBody": "No Freemium, você pode guardar até 7 reflexões. Remova uma ou abra o Premium para ter mais espaço pessoal.",
  "today.noteLockedBody": "No Freemium, as notas ficam disponíveis para as reflexões que você escolhe guardar. O Premium abre notas mais longas e mais espaço ao redor do que permanece com você.",
  "today.noteLimitHint": "No Freemium, as notas permanecem mais curtas. O Premium abre notas de reflexão mais longas.",
  "today.followUpAction": "Aprofundar impulso",
  "today.followUpLoading": "Um novo impulso silencioso está chegando ...",
  "today.followUpTitle": "Impulsos para aprofundar",
  "today.followUpError": "No momento, não foi possível preparar um novo impulso.",
  "today.followUpLimitBody": "O impulso diário com IA já foi usado hoje. O Premium abre mais espaço para novos impulsos.",
  "today.swipeHint": "Deslize com calma pela página para percorrer os dias guardados.",
  "today.tomorrowHint": "Amanhã traz uma nova página.",
  "today.preparing": "Sua reflexão está sendo preparada.",
  "today.future": "Reservado em silêncio para futuros estilos de papel e personalização.",
  "reflection.title": "Reflexão",
  "reflection.unavailable": "Esta reflexão não está disponível.",
  "settings.eyebrow": "Ajustes",
  "settings.title": "Preferências silenciosas",
  "settings.subtitle": "Tudo aqui continua local primeiro, com espaço para personalização premium e entrega remota no futuro.",
  "settings.standardSectionTitle": "Configurações padrão",
  "settings.standardSectionSummary": "Lembrete, categorias, aparência e idioma.",
  "settings.freemiumSectionSummary": "Opções incluídas de papel, tipografia e página.",
  "settings.premiumSectionSummary": "Futuros tons premium, tipografia e layouts de página.",
  "settings.plansSectionTitle": "Modelos de assinatura",
  "settings.plansSectionSummary": "Freemium, Premium e Lifelong.",
  "settings.notificationTime": "Horário do lembrete",
  "settings.preferredCategories": "Categorias preferidas",
  "settings.language": "Idioma",
  "settings.languageBody": "Escolha como o app fala com você.",
  "settings.quoteLanguages": "Idiomas das reflexões",
  "settings.quoteLanguagesBody": "No Premium, as reflexões diárias podem alternar entre os idiomas escolhidos aqui.",
  "settings.quoteLanguagesSearchPlaceholder": "Buscar idioma",
  "settings.quoteLanguagesSelectedTag": "Ativo",
  "settings.quoteLanguagesAppTag": "App",
  "settings.privateSettingsTitle": "Configurações privadas",
  "settings.exportSavedReflections": "Enviar reflexões salvas por e-mail",
  "settings.exportAction": "Enviar agora",
  "settings.exportSavedReflectionsSubject": "Reflexões salvas",
  "settings.exportSavedReflectionsFallbackTitle": "Reflexões salvas",
  "settings.exportSavedReflectionsBody": "Envie suas reflexões guardadas e anotações juntas em uma única exportação serena ou mantenha-as em um diário em PDF.",
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
  "settings.premiumBody": "O sistema de temas já oferece base para futuros tons de papel, estilos tipográficos e estilos de página sem perder a linguagem visual calma do app.",
  "settings.subscriptionStatus": "Status da assinatura",
  "settings.restorePurchases": "Restaurar compras",
  "settings.manageSubscription": "Gerenciar assinatura",
  "settings.manageSubscriptionBody": "O gerenciamento de assinatura exige configuração da loja em um build de desenvolvimento ou produção.",
  "settings.restoreSuccessTitle": "Restaurado",
  "settings.restoreSuccessBody": "Suas compras foram verificadas.",
  "settings.restoreErrorTitle": "Não foi possível",
  "settings.restoreErrorBody": "No momento, não foi possível restaurar as compras.",
  "settings.upgradeAction": "Premium ansehen",
  "settings.premiumPreviewTitle": "Acesso Premium",
  "settings.premiumPreviewBody": "Desbloqueie reflexões guardadas ilimitadas, notas mais longas, exportação, liberdade de idiomas e futuras camadas mais profundas de personalização.",
  "settings.paperThemes": "Tons de papel",
  "settings.customPaperTheme": "Tom de papel próprio",
  "settings.customPaperThemeBody": "Modele um tom de papel mais pessoal e silencioso e mantenha-o por todo o app.",
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
  "settings.aboutBody": "Um lugar silencioso para uma página refletida por dia, pensado para desacelerar o ritmo o suficiente para abrir espaço à reflexão.",
  "settings.aboutCreator": "Criado com cuidado como um pequeno espaço pessoal para atenção, calma e perspectiva honesta.",
  "settings.devSectionTitle": "Modo de teste",
  "settings.devSectionBody": "Somente para desenvolvimento: override local para verificar os estados Freemium e Premium.",
  "settings.devResetOverride": "Usar a lógica normal da assinatura",
  "settings.devOverrideActive": "Override ativo",
  "settings.devOverrideInactive": "Sem override",
  "settings.resetTitle": "Redefinir dados locais",
  "settings.resetBody": "Isso vai limpar onboarding, favoritas, escolhas do arquivo e preferências.",
  "settings.resetButton": "Redefinir dados locais",
  "settings.included": "Incluído",
  "settings.premium": "Premium",
  "archive.eyebrow": "Arquivo",
  "archive.title": "Um registro silencioso de páginas anteriores.",
  "archive.subtitle": "Explore reflexões datadas com a mesma atmosfera suave e tátil da página de hoje.",
  "archive.allReflections": "Todas as reflexões",
  "archive.savedOnly": "Só guardadas",
  "archive.searchPlaceholder": "Buscar por sentimento, categoria ou trecho",
  "archive.premiumTitle": "O arquivo completo está no Premium",
  "archive.premiumMessage": "O Freemium mantém o arquivo legível. O Premium libera busca, filtros e mais profundidade pessoal ao redor das páginas que você decide guardar.",
  "archive.emptyTitle": "Ainda não há páginas assim",
  "archive.emptyMessage": "Tente uma categoria mais ampla, limpe a busca ou guarde algumas reflexões para formar um arquivo mais suave.",
  "archive.noMatchTitle": "Nada combina com esta vista",
  "archive.noMatchMessage": "Tente uma busca mais suave, outra categoria ou volte para todas as reflexões.",
  "favorites.eyebrow": "Guardadas",
  "favorites.title": "Páginas guardadas",
  "favorites.subtitle": "Uma pilha menor e pessoal de reflexões que ficaram com você a ponto de serem guardadas.",
  "favorites.emptyTitle": "Ainda não há páginas guardadas",
  "favorites.emptyMessage": "Guarde uma reflexão de hoje ou do arquivo para começar uma coleção mais íntima.",
  "favorites.noMatchTitle": "Nada combina com a sua coleção",
  "favorites.noMatchMessage": "Tente outra palavra ou limpe a categoria para voltar às suas páginas guardadas.",
  "favorites.keepAction": "Guardar",
  "favorites.removeAction": "Não guardar mais",
  "favorites.deleteConfirmTitle": "Remover reflexão guardada?",
  "favorites.deleteConfirmMessage": "Isso a remove da sua coleção. As notas permanecem na página datada se ela ainda existir no arquivo.",
  "favorites.searchPlaceholder": "Buscar reflexões guardadas",
  "favorites.premiumTitle": "Uma coleção maior está no Premium",
  "favorites.premiumMessage": "O Freemium mantém até 7 páginas guardadas. O Premium libera páginas ilimitadas, notas mais longas, busca, exportação e futuras coleções.",
  "list.saved": "Guardada",
  "membership.eyebrow": "Assinatura",
  "membership.title": "Assinatura",
  "membership.subtitle": "O Freemium começa com suavidade. Premium e Lifelong abrem mais espaço para beleza, pertencimento e reflexão.",
  "membership.premiumIncludedTitle": "O Premium desbloqueia",
  "membership.unlockAction": "Desbloquear Premium",
  "membership.openMembership": "Abrir assinatura",
  "membership.devBody": "Override apenas para desenvolvimento, para testar Freemium, Premium e Lifelong localmente.",
  "membership.devReset": "Usar a lógica normal da assinatura",
  "membership.lockedArchiveTitle": "Busca e filtros ficam no Premium",
  "membership.lockedArchiveBody": "O Freemium mantém o arquivo menor e mais quieto. O Premium libera busca, filtros e o registro completo por data.",
  "membership.lockedSavedTitle": "Uma coleção maior está no Premium",
  "membership.lockedSavedBody": "O Freemium mantém uma pilha menor de guardadas. O Premium libera páginas ilimitadas, busca e exportação.",
  "membership.placeholderWeeklyRecap": "Uma recapitulação semanal está preparada como futuro ritual Premium.",
  "membership.placeholderMonthlyRecap": "Uma recapitulação mensal está preparada como futuro ritual Premium.",
  "membership.placeholderCollections": "Coleções e pastas pessoais estão preparadas como futura camada Premium.",
  "membership.stateTitle": "Seu plano atual",
  "membership.devStateNote": "Um override de desenvolvimento está moldando esta visualização agora.",
  "membership.errorTitle": "Os detalhes da assinatura estão silenciosos por enquanto",
  "membership.errorBody": "Seu plano atual continua funcionando. Os detalhes da loja podem voltar quando a conexão estiver pronta novamente.",
  "membership.lockedFeatureFootnote": "Preparado em silêncio para o Premium.",
  "membership.lifelongBadge": "Apoiador",
  "membership.liveNow": "Disponível agora",
  "membership.preparedNext": "Preparado para depois",
  "membership.choosePremium": "Escolher Premium",
  "membership.chooseLifelong": "Escolher Lifelong",
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
  "membership.manageTitle": "Depois",
  "membership.manageBody": "O gerenciamento da assinatura será conectado aqui quando o faturamento real da loja estiver ativo neste build.",
  "paywall.title": "Uma camada premium mais serena",
  "paywall.subtitle": "Desbloqueie o arquivo completo, tons premium de papel, tipografia refinada e futuras camadas de personalização.",
  "paywall.monthly": "Mensal",
  "paywall.yearly": "Anual",
  "paywall.benefitArchive": "Acesso ao arquivo completo",
  "paywall.benefitThemes": "Tons premium de papel",
  "paywall.benefitTypography": "Estilos premium de tipografia",
  "paywall.benefitPersonalization": "Futura personalização mais profunda",
  "paywall.openNative": "Abrir paywall",
  "paywall.restore": "Restaurar compras",
  "paywall.loading": "Carregando opções de assinatura...",
  "paywall.error": "As informações de assinatura não estão disponíveis agora.",
  "paywall.notAvailable": "As ofertas ainda não estão disponíveis. Adicione suas chaves do RevenueCat e produtos no painel para testar compras.",
};

const translationMap: Record<string, Messages> = {
  en: english,
  de: german,
  "pt-BR": brazilianPortuguese,
};

const categoryLabels: Record<ReflectionCategory, Record<SupportedTranslationLanguage, string>> = {
  calm: { en: "Calm", de: "Ruhe", "pt-BR": "Calma" },
  clarity: { en: "Clarity", de: "Klarheit", "pt-BR": "Clareza" },
  discipline: { en: "Discipline", de: "Disziplin", "pt-BR": "Disciplina" },
  "self-respect": { en: "Self-respect", de: "Selbstachtung", "pt-BR": "Autorrespeito" },
  purpose: { en: "Purpose", de: "Ausrichtung", "pt-BR": "Propósito" },
  relationships: { en: "Relationships", de: "Beziehungen", "pt-BR": "Relações" },
  courage: { en: "Courage", de: "Mut", "pt-BR": "Coragem" },
  creativity: { en: "Creativity", de: "Kreativität", "pt-BR": "Criatividade" },
  healing: { en: "Healing", de: "Heilung", "pt-BR": "Cura" },
  focus: { en: "Focus", de: "Fokus", "pt-BR": "Foco" },
};

const preferenceLabels: Record<
  OnboardingPreference,
  Record<SupportedTranslationLanguage, { title: string; body: string }>
> = {
  clarity: {
    en: { title: "Clarity", body: "A steadier sense of what matters." },
    de: { title: "Klarheit", body: "Ein ruhigeres Gefühl für das, was wirklich zählt." },
    "pt-BR": { title: "Clareza", body: "Uma percepção mais firme do que realmente importa." },
  },
  calm: {
    en: { title: "Calm", body: "A softer inner pace to move within." },
    de: { title: "Ruhe", body: "Ein sanfteres inneres Tempo für den Tag." },
    "pt-BR": { title: "Calma", body: "Um ritmo interior mais suave para atravessar o dia." },
  },
  direction: {
    en: { title: "Direction", body: "A clearer feeling of where to lean." },
    de: { title: "Ausrichtung", body: "Ein klareres Gespür dafür, wohin du dich wenden willst." },
    "pt-BR": { title: "Direção", body: "Uma percepção mais nítida de para onde vale a pena se inclinar." },
  },
  focus: {
    en: { title: "Focus", body: "More room for what deserves attention." },
    de: { title: "Fokus", body: "Mehr Raum für das, was deine Aufmerksamkeit verdient." },
    "pt-BR": { title: "Foco", body: "Mais espaço para o que merece a sua atenção." },
  },
};

const toneLabels: Record<ReflectionTone, Record<SupportedTranslationLanguage, string>> = {
  gentle: { en: "Gentle", de: "Sanft", "pt-BR": "Gentil" },
  "clear-eyed": { en: "Clear-eyed", de: "Klar", "pt-BR": "Lúcido" },
  steady: { en: "Steady", de: "Beständig", "pt-BR": "Constante" },
  curious: { en: "Curious", de: "Offen", "pt-BR": "Curioso" },
  grounded: { en: "Grounded", de: "Geerdet", "pt-BR": "Aterrada" },
  expansive: { en: "Expansive", de: "Weit", "pt-BR": "Amplo" },
};

const sourceTypeLabels: Record<
  "manual" | "ai" | "original_reflection",
  Record<SupportedTranslationLanguage, string>
> = {
  manual: {
    en: "Manual Selection",
    de: "Manuell",
    "pt-BR": "Manual",
  },
  ai: {
    en: "AI Reflection",
    de: "KI-Impuls",
    "pt-BR": "Reflexão por IA",
  },
  original_reflection: {
    en: "AI Reflection",
    de: "KI-Impuls",
    "pt-BR": "Reflexão por IA",
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
  },
  "soft-beige": {
    en: { title: "Soft Beige", description: "A slightly deeper paper tone with gentle warmth." },
    de: { title: "Sanftes Beige", description: "Ein etwas tieferer Papierfarbton mit milder Wärme." },
    "pt-BR": { title: "Bege suave", description: "Um tom de papel um pouco mais profundo, com calor delicado." },
  },
  "stone-paper": {
    en: { title: "Stone Paper", description: "Muted mineral neutrals for a quieter look." },
    de: { title: "Steinpapier", description: "Gedämpfte mineralische Neutraltöne für einen stilleren Eindruck." },
    "pt-BR": { title: "Papel de pedra", description: "Neutros minerais suaves para uma presença mais silenciosa." },
  },
  "muted-sage": {
    en: { title: "Muted Sage", description: "A restrained green-gray tint with soft calm." },
    de: { title: "Gedämpftes Salbei", description: "Ein zurückhaltender grün-grauer Ton mit sanfter Ruhe." },
    "pt-BR": { title: "Sálvia suave", description: "Um tom verde-acinzentado contido, com calma macia." },
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
  },
  "quiet-sans": {
    en: { title: "Quiet Sans", description: "A cleaner low-noise rhythm for archive and settings.", specimen: "Steady attention" },
    de: { title: "Quiet Sans", description: "Ein klarerer, zurückhaltender Rhythmus für Archiv und Einstellungen.", specimen: "Ruhige Aufmerksamkeit" },
    "pt-BR": { title: "Sans serena", description: "Um ritmo mais limpo e discreto para arquivo e ajustes.", specimen: "Atenção constante" },
  },
  "subtle-typewriter": {
    en: { title: "Subtle Typewriter", description: "A restrained monospaced accent for future premium themes.", specimen: "A gentler pace" },
    de: { title: "Subtile Schreibmaschine", description: "Ein zurückhaltener Monospace-Akzent für spätere Premium-Themen.", specimen: "Ein sanfteres Tempo" },
    "pt-BR": { title: "Máquina sutil", description: "Um acento monoespaçado contido para futuros temas premium.", specimen: "Um ritmo mais suave" },
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
  },
  "framed-editorial": {
    en: { title: "Framed Editorial", description: "A lighter rule-based page with a more journal-like composition.", mood: "Printed essay page" },
    de: { title: "Gerahmtes Editorial", description: "Eine leichtere, liniengeführte Seite mit stärker journalartiger Komposition.", mood: "Gedruckte Essaysseite" },
    "pt-BR": { title: "Editorial enquadrado", description: "Uma página mais leve, guiada por linhas, com composição próxima de um diário.", mood: "Página impressa" },
  },
  "soft-ledger": {
    en: { title: "Soft Ledger", description: "A gentle structured page with understated date framing.", mood: "Paper record" },
    de: { title: "Sanftes Register", description: "Eine sanft strukturierte Seite mit zurückhaltender Datumsfassung.", mood: "Papierprotokoll" },
    "pt-BR": { title: "Registro suave", description: "Uma página suavemente estruturada, com moldura discreta para a data.", mood: "Registro em papel" },
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
  design: { en: "Design & Atmosphere", de: "Gestaltung & Atmosphäre", "pt-BR": "Design e atmosfera" },
  archive: { en: "Archive & Collection", de: "Archiv & Sammlung", "pt-BR": "Arquivo e coleção" },
  languages: { en: "Languages & Personalization", de: "Sprachen & Personalisierung", "pt-BR": "Idiomas e personalização" },
  ritual: { en: "Reflection & Ritual", de: "Reflexion & Ritual", "pt-BR": "Reflexão e ritual" },
  export: { en: "Export & Ownership", de: "Export & Eigentum", "pt-BR": "Exportação e pertencimento" },
};

const membershipCategoryDescriptions: Record<MembershipFeatureCategoryId, Record<SupportedTranslationLanguage, string>> = {
  design: {
    en: "A quieter visual atmosphere for the daily page.",
    de: "Eine stillere visuelle Atmosphäre für die tägliche Seite.",
    "pt-BR": "Uma atmosfera visual mais serena para a página diária.",
  },
  archive: {
    en: "More room to keep, revisit, and organize what stayed with you.",
    de: "Mehr Raum, um zu behalten, wiederzufinden und zu ordnen, was bei dir geblieben ist.",
    "pt-BR": "Mais espaço para guardar, revisitar e organizar o que ficou com você.",
  },
  languages: {
    en: "A more personal relationship between app language and reflection language.",
    de: "Eine persönlichere Verbindung zwischen App-Sprache und Reflexionssprache.",
    "pt-BR": "Uma relação mais pessoal entre o idioma do app e o idioma das reflexões.",
  },
  ritual: {
    en: "Gentle additions that deepen the daily habit without making it noisy.",
    de: "Sanfte Ergänzungen, die das tägliche Ritual vertiefen, ohne es laut zu machen.",
    "pt-BR": "Adições suaves que aprofundam o ritual diário sem torná-lo barulhento.",
  },
  export: {
    en: "More ownership over what you have kept and written.",
    de: "Mehr Eigentum an dem, was du behalten und geschrieben hast.",
    "pt-BR": "Mais autonomia sobre o que você guardou e escreveu.",
  },
};

const membershipFeatureLabels: Record<MembershipFeatureId, Record<SupportedTranslationLanguage, string>> = {
  "premium-paper-colors": { en: "Premium paper colors", de: "Premium-Papierfarben", "pt-BR": "Cores premium de papel" },
  "premium-typography": { en: "Premium typography", de: "Premium-Typografie", "pt-BR": "Tipografia premium" },
  "premium-layouts": { en: "Premium page layouts", de: "Premium-Seitenlayouts", "pt-BR": "Layouts premium de página" },
  "unlimited-archive": { en: "Unlimited archive", de: "Unbegrenztes Archiv", "pt-BR": "Arquivo ilimitado" },
  "unlimited-saved": { en: "Unlimited saved quotes", de: "Unbegrenzt gesammelte Seiten", "pt-BR": "Páginas guardadas ilimitadas" },
  "extended-notes": { en: "Longer personal notes", de: "Längere persönliche Notizen", "pt-BR": "Notas pessoais mais longas" },
  "search-filter": { en: "Search and filter", de: "Suche und Filter", "pt-BR": "Busca e filtros" },
  "advanced-saved-management": {
    en: "Advanced saved-reflection management",
    de: "Erweiterte Verwaltung gespeicherter Reflexionen",
    "pt-BR": "Gerenciamento avançado das reflexões guardadas",
  },
  "personal-collections": { en: "Personal collections", de: "Persönliche Sammlungen", "pt-BR": "Coleções pessoais" },
  "quote-language-choice": { en: "Free choice of reflection language", de: "Freie Wahl der Reflexionssprache", "pt-BR": "Escolha livre do idioma das reflexões" },
  "multiple-quote-languages": { en: "Multiple reflection languages", de: "Mehrere Reflexionssprachen", "pt-BR": "Vários idiomas de reflexão" },
  "daily-language-rotation": { en: "Daily language rotation", de: "Tägliche Sprachrotation", "pt-BR": "Rotação diária de idiomas" },
  "deeper-personalization": { en: "Deeper personalization", de: "Tiefere Personalisierung", "pt-BR": "Personalização mais profunda" },
  "reflection-prompts": { en: "Reflection prompts", de: "Reflexionsimpulse", "pt-BR": "Prompts de reflexão" },
  "save-reason": { en: "Why did I save this?", de: "Warum habe ich das behalten?", "pt-BR": "Por que eu guardei isto?" },
  "weekly-recap": { en: "Weekly recap", de: "Wöchentlicher Rückblick", "pt-BR": "Resumo semanal" },
  "monthly-recap": { en: "Monthly recap", de: "Monatlicher Rückblick", "pt-BR": "Resumo mensal" },
  "email-export": { en: "Email export", de: "E-Mail-Export", "pt-BR": "Exportação por e-mail" },
  "pdf-export": { en: "PDF export", de: "PDF-Export", "pt-BR": "Exportação em PDF" },
  "year-end-reminder": { en: "31 December backup reminder", de: "31.12.-Backup-Erinnerung", "pt-BR": "Lembrete de backup em 31/12" },
};

const membershipPlanNotes: Record<"Freemium" | "Premium" | "Lifelong", Record<SupportedTranslationLanguage, string>> = {
  Freemium: {
    en: "A complete daily page, with room to keep up to 7 reflections and shorter notes.",
    de: "Eine vollständige Tagesseite, mit Raum für bis zu 7 gespeicherte Reflexionen und kürzere Notizen.",
    "pt-BR": "Uma página diária completa, com espaço para guardar até 7 reflexões e notas mais curtas.",
  },
  Premium: {
    en: "More beauty, more choice, and full ownership around what matters enough to keep.",
    de: "Mehr Schönheit, mehr Wahlfreiheit und voller persönlicher Raum um das, was wichtig genug ist, um es zu behalten.",
    "pt-BR": "Mais beleza, mais escolha e plena sensação de posse ao redor do que importa a ponto de ficar.",
  },
  Lifelong: {
    en: "A lasting supporter plan for keeping the full library close, without renewal.",
    de: "Ein bleibender Supporter-Plan, um die volle Bibliothek ohne Verlängerung nah bei dir zu halten.",
    "pt-BR": "Um plano duradouro de apoio para manter a experiência completa por perto, sem renovação.",
  },
};

const membershipStateBodies: Record<"Freemium" | "Premium" | "Lifelong", Record<SupportedTranslationLanguage, string>> = {
  Freemium: {
    en: "You still receive the full daily page, archive reading, up to 7 kept reflections, shorter notes, and the included visual atmosphere.",
    de: "Du erhältst weiterhin die vollständige tägliche Seite, lesbaren Archivzugang, bis zu 7 gespeicherte Reflexionen, kürzere Notizen und die enthaltene Gestaltung.",
    "pt-BR": "Você continua recebendo a página diária completa, leitura do arquivo, até 7 reflexões guardadas, notas mais curtas e a atmosfera visual incluída.",
  },
  Premium: {
    en: "Premium opens unlimited kept reflections, longer notes, export, language freedom, and deeper visual personalization while keeping the ritual quiet.",
    de: "Premium öffnet unbegrenzt gespeicherte Reflexionen, längere Notizen, Export, Sprachfreiheit und tiefere visuelle Personalisierung und hält das Ritual dennoch ruhig.",
    "pt-BR": "O Premium abre reflexões guardadas ilimitadas, notas mais longas, exportação, liberdade de idiomas e personalização visual mais profunda, mantendo o ritual sereno.",
  },
  Lifelong: {
    en: "Lifelong keeps every premium layer open as a lasting supporter plan, with the same full access and no renewal.",
    de: "Lifelong hält jede Premium-Ebene als bleibenden Supporter-Plan offen, mit demselben vollen Zugang und ohne Verlängerung.",
    "pt-BR": "Lifelong mantém toda a camada Premium aberta como um plano duradouro de apoio, com o mesmo acesso completo e sem renovação.",
  },
};

function resolveTranslationSet(language: SupportedLanguage | null | undefined): Messages {
  const languagePrefix = language?.split("-")[0] ?? "en";
  return translationMap[language ?? ""] ?? translationMap[languagePrefix] ?? english;
}

function resolveTranslationLanguage(language: SupportedLanguage | null | undefined): SupportedTranslationLanguage {
  const languagePrefix = language?.split("-")[0] ?? "en";

  if (language === "de" || language === "pt-BR") {
    return language;
  }

  if (languagePrefix === "de") {
    return "de";
  }

  if (languagePrefix === "pt") {
    return "pt-BR";
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
      }[effectiveLanguage] ??
      messages["reflection.title"],
  };

  return {
    languageCode: language ?? "en",
    locale: resolveLocale(language),
    t: (key: TranslationKey) => messages[key] ?? english[key] ?? german[key],
    categoryLabel: (category: ReflectionCategory) => categoryLabels[category][resolvedLanguage],
    toneLabel: (tone: ReflectionTone) => toneLabels[tone][resolvedLanguage],
    sourceTypeLabel: (sourceType: "manual" | "ai" | "original_reflection" = "ai") =>
      sourceTypeLabels[sourceType][resolvedLanguage],
    reflectionTitle: () => extendedLabels.reflectionTitle,
    currentLabel: () => messages["settings.current"],
    aboutTitle: () => aboutMeta.title,
    aboutBody: () => aboutMeta.body,
    aboutCreator: () => aboutMeta.creator,
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
          : name?.trim()
            ? `Your page is ready, ${name.trim()}.`
            : "Your page is ready",
    notificationReadyBody: () =>
      resolvedLanguage === "de"
        ? "Ein stiller Moment, wenn du ihn brauchst."
        : resolvedLanguage === "pt-BR"
          ? "Um momento silencioso, se você quiser."
          : "A quiet moment, if you need it.",
    yearEndReminderTitle: (name?: string | null) =>
      resolvedLanguage === "de"
        ? name?.trim()
          ? `Deine Seiten sind bereit, ${name.trim()}.`
          : "Deine Seiten sind bereit"
        : resolvedLanguage === "pt-BR"
          ? name?.trim()
            ? `Suas páginas estão prontas, ${name.trim()}.`
            : "Suas páginas estão prontas"
          : name?.trim()
            ? `Your pages are ready, ${name.trim()}.`
            : "Your pages are ready",
    yearEndReminderBody: () =>
      resolvedLanguage === "de"
        ? "Nimm dir heute einen ruhigen Moment, um deine gespeicherten Reflexionen zu sichern oder dir per E-Mail zu senden."
        : resolvedLanguage === "pt-BR"
          ? "Reserve um momento tranquilo hoje para fazer backup das suas reflexões guardadas ou enviá-las por e-mail."
          : "Take a quiet moment today to back up your saved reflections or send them to yourself by email.",
    permissionScheduleBody: (timeLabel: string) =>
      resolvedLanguage === "de"
        ? `Deine tägliche Seite kann um ${timeLabel} auf dich warten.`
        : resolvedLanguage === "pt-BR"
          ? `Sua página diária pode esperar por você às ${timeLabel}.`
          : `Your daily page can wait for you at ${timeLabel}.`,
    languageOptionLabel: (code: SupportedLanguage) => {
      const option = getLanguageOption(code);
      return option ? `${option.nativeName} · ${option.englishName}` : code;
    },
  };
}

import { PremiumPromptContext, PremiumPromptHistoryEntry, SupportedLanguage } from "@/types/reflection";

export interface PremiumPromptCopy {
  title: string;
  body: string;
  cta: string;
  secondary?: string;
}

const PROMPT_COPY: Record<"de" | "en", Record<PremiumPromptContext, PremiumPromptCopy>> = {
  de: {
    general: {
      title: "Mach diesen Raum wirklich zu deinem.",
      body: "Behalte Seiten, die dir wichtig sind. Gestalte deinen Raum persoenlicher und lass nichts verloren gehen.",
      cta: "Premium entdecken",
      secondary: "Spaeter",
    },
    save: {
      title: "Behalte, was dir wichtig ist.",
      body: "Mit Premium kannst du Seiten speichern, die dich begleiten sollen.",
      cta: "Premium ansehen",
      secondary: "Spaeter",
    },
    personalization: {
      title: "Gestalte deinen Raum.",
      body: "Farben, Schrift und Stil lassen sich mit Premium persoenlicher anfuehlen.",
      cta: "Premium oeffnen",
      secondary: "Spaeter",
    },
    collections: {
      title: "Gib deinen Gedanken einen Ort.",
      body: "Mit Premium kannst du Seiten sammeln und leichter wiederfinden.",
      cta: "Mehr erfahren",
      secondary: "Spaeter",
    },
    reengagement: {
      title: "Was bleibt, darf bleiben.",
      body: "Wenn dich eine Seite begleitet, kann Premium sie bei dir behalten.",
      cta: "Premium entdecken",
      secondary: "Spaeter",
    },
  },
  en: {
    general: {
      title: "Make this space truly yours.",
      body: "Keep pages that matter to you. Make the space more personal and let nothing get lost.",
      cta: "Explore premium",
      secondary: "Later",
    },
    save: {
      title: "Keep what matters.",
      body: "With Premium, you can save pages you want to return to.",
      cta: "See premium",
      secondary: "Later",
    },
    personalization: {
      title: "Shape your space.",
      body: "With Premium, colors, type, and style can feel more like yours.",
      cta: "Open premium",
      secondary: "Later",
    },
    collections: {
      title: "Give your thoughts a place.",
      body: "With Premium, you can collect pages and return to them more easily.",
      cta: "Learn more",
      secondary: "Later",
    },
    reengagement: {
      title: "What stays should stay.",
      body: "If a page stays with you, Premium can help you keep it.",
      cta: "Explore premium",
      secondary: "Later",
    },
  },
};

const PROMPT_COOLDOWNS: Record<PremiumPromptContext, { shownDays: number; dismissedDays: number }> = {
  general: { shownDays: 5, dismissedDays: 7 },
  save: { shownDays: 7, dismissedDays: 10 },
  collections: { shownDays: 5, dismissedDays: 10 },
  personalization: { shownDays: 5, dismissedDays: 10 },
  reengagement: { shownDays: 7, dismissedDays: 10 },
};

function resolvePromptLanguage(language: SupportedLanguage | null | undefined): "de" | "en" {
  return language === "de" ? "de" : "en";
}

function hasDaysSince(timestamp: string | null | undefined, days: number, now = Date.now()) {
  if (!timestamp) {
    return true;
  }

  const previous = new Date(timestamp).getTime();
  if (Number.isNaN(previous)) {
    return true;
  }

  return now - previous >= days * 24 * 60 * 60 * 1000;
}

export function getPremiumPromptCopy(
  context: PremiumPromptContext,
  language: SupportedLanguage | null | undefined,
): PremiumPromptCopy {
  const resolvedLanguage = resolvePromptLanguage(language);
  return PROMPT_COPY[resolvedLanguage][context];
}

export function shouldShowPremiumPrompt(options: {
  context: PremiumPromptContext;
  isPremium: boolean;
  hasCompletedOnboarding: boolean;
  historyEntry?: PremiumPromptHistoryEntry | null;
  now?: number;
}) {
  const { context, isPremium, hasCompletedOnboarding, historyEntry, now = Date.now() } = options;

  if (isPremium || !hasCompletedOnboarding) {
    return false;
  }

  const cooldown = PROMPT_COOLDOWNS[context];
  if (!cooldown) {
    return false;
  }

  if (!hasDaysSince(historyEntry?.lastDismissedAt, cooldown.dismissedDays, now)) {
    return false;
  }

  if (!hasDaysSince(historyEntry?.lastShownAt, cooldown.shownDays, now)) {
    return false;
  }

  return true;
}

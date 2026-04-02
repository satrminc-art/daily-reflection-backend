type SupportedPricingLanguage = "de" | "en" | "pt-BR" | "fr" | "es";

type PriceFallbacks = {
  monthly: string;
  yearly: string;
  lifetime: string;
};

const FORCE_FALLBACK_PRICES_FOR_SCREENSHOT = false;

const PRICE_FALLBACKS: Record<SupportedPricingLanguage, PriceFallbacks> = {
  de: {
    monthly: "€6,99 / Monat",
    yearly: "€59,99 / Jahr",
    lifetime: "Im App Store",
  },
  en: {
    monthly: "€6.99 / month",
    yearly: "€59.99 / year",
    lifetime: "In the App Store",
  },
  "pt-BR": {
    monthly: "€6,99 / mês",
    yearly: "€59,99 / ano",
    lifetime: "Na App Store",
  },
  fr: {
    monthly: "€6,99 / mois",
    yearly: "€59,99 / an",
    lifetime: "Dans l’App Store",
  },
  es: {
    monthly: "€6,99 / mes",
    yearly: "€59,99 / año",
    lifetime: "En el App Store",
  },
};

function resolvePricingLanguage(language?: string | null): SupportedPricingLanguage {
  if (language === "de" || language === "en" || language === "pt-BR" || language === "fr" || language === "es") {
    return language;
  }

  return "de";
}

export function getSubscriptionPriceFallbacks(language?: string | null): PriceFallbacks {
  return PRICE_FALLBACKS[resolvePricingLanguage(language)];
}

export function resolveSubscriptionDisplayPrice(args: {
  localizedPrice?: string | null;
  fallbackPrice: string;
}) {
  if (FORCE_FALLBACK_PRICES_FOR_SCREENSHOT) {
    return args.fallbackPrice;
  }

  const localizedPrice = args.localizedPrice?.trim();
  if (localizedPrice) {
    return localizedPrice;
  }

  return args.fallbackPrice;
}

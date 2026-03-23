import { SupportedLanguage } from "@/types/reflection";

export interface LanguageOption {
  code: SupportedLanguage;
  englishName: string;
  nativeName: string;
  locale: string;
}

export interface LanguageScreenCopy {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  continueLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", englishName: "English", nativeName: "English", locale: "en-US" },
  { code: "de", englishName: "German", nativeName: "Deutsch", locale: "de-DE" },
  { code: "fr", englishName: "French", nativeName: "Français", locale: "fr-FR" },
  { code: "es", englishName: "Spanish", nativeName: "Español", locale: "es-ES" },
  { code: "it", englishName: "Italian", nativeName: "Italiano", locale: "it-IT" },
  { code: "pt", englishName: "Portuguese", nativeName: "Português", locale: "pt-PT" },
  { code: "pt-BR", englishName: "Portuguese (Brazil)", nativeName: "Português (Brasil)", locale: "pt-BR" },
  { code: "nl", englishName: "Dutch", nativeName: "Nederlands", locale: "nl-NL" },
  { code: "sv", englishName: "Swedish", nativeName: "Svenska", locale: "sv-SE" },
  { code: "da", englishName: "Danish", nativeName: "Dansk", locale: "da-DK" },
  { code: "no", englishName: "Norwegian", nativeName: "Norsk", locale: "nb-NO" },
  { code: "fi", englishName: "Finnish", nativeName: "Suomi", locale: "fi-FI" },
  { code: "pl", englishName: "Polish", nativeName: "Polski", locale: "pl-PL" },
  { code: "cs", englishName: "Czech", nativeName: "Čeština", locale: "cs-CZ" },
  { code: "tr", englishName: "Turkish", nativeName: "Türkçe", locale: "tr-TR" },
  { code: "el", englishName: "Greek", nativeName: "Ellinika", locale: "el-GR" },
  { code: "ro", englishName: "Romanian", nativeName: "Romana", locale: "ro-RO" },
  { code: "hu", englishName: "Hungarian", nativeName: "Magyar", locale: "hu-HU" },
  { code: "uk", englishName: "Ukrainian", nativeName: "Ukrainska", locale: "uk-UA" },
  { code: "ru", englishName: "Russian", nativeName: "Russkiy", locale: "ru-RU" },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", locale: "ar-SA" },
  { code: "he", englishName: "Hebrew", nativeName: "עברית", locale: "he-IL" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", locale: "hi-IN" },
  { code: "th", englishName: "Thai", nativeName: "ไทย", locale: "th-TH" },
  { code: "vi", englishName: "Vietnamese", nativeName: "Tieng Viet", locale: "vi-VN" },
  { code: "id", englishName: "Indonesian", nativeName: "Bahasa Indonesia", locale: "id-ID" },
  { code: "ms", englishName: "Malay", nativeName: "Bahasa Melayu", locale: "ms-MY" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", locale: "ja-JP" },
  { code: "ko", englishName: "Korean", nativeName: "한국어", locale: "ko-KR" },
  { code: "zh", englishName: "Chinese", nativeName: "中文", locale: "zh-CN" },
  { code: "bn", englishName: "Bengali", nativeName: "বাংলা", locale: "bn-BD" },
];

export const QUOTE_LANGUAGE_OPTIONS: LanguageOption[] = LANGUAGE_OPTIONS;

const languageMap = new Map(LANGUAGE_OPTIONS.map((language) => [language.code, language]));

const languageScreenCopyMap: Record<string, LanguageScreenCopy> = {
  en: {
    title: "Choose your language",
    subtitle: "You can change this anytime.",
    searchPlaceholder: "Search language",
    continueLabel: "Continue",
  },
  de: {
    title: "Wähle deine Sprache",
    subtitle: "Du kannst das jederzeit ändern.",
    searchPlaceholder: "Sprache suchen",
    continueLabel: "Weiter",
  },
  fr: {
    title: "Choisissez votre langue",
    subtitle: "Vous pourrez la modifier à tout moment.",
    searchPlaceholder: "Rechercher une langue",
    continueLabel: "Continuer",
  },
  es: {
    title: "Elige tu idioma",
    subtitle: "Puedes cambiarlo en cualquier momento.",
    searchPlaceholder: "Buscar idioma",
    continueLabel: "Continuar",
  },
  it: {
    title: "Scegli la tua lingua",
    subtitle: "Puoi cambiarla in qualsiasi momento.",
    searchPlaceholder: "Cerca una lingua",
    continueLabel: "Continua",
  },
  pt: {
    title: "Escolha seu idioma",
    subtitle: "Você pode mudar isso quando quiser.",
    searchPlaceholder: "Buscar idioma",
    continueLabel: "Continuar",
  },
  "pt-BR": {
    title: "Escolha seu idioma",
    subtitle: "Você pode mudar isso quando quiser.",
    searchPlaceholder: "Buscar idioma",
    continueLabel: "Continuar",
  },
  nl: {
    title: "Kies je taal",
    subtitle: "Je kunt dit altijd wijzigen.",
    searchPlaceholder: "Zoek taal",
    continueLabel: "Doorgaan",
  },
  sv: {
    title: "Välj språk",
    subtitle: "Du kan ändra detta när som helst.",
    searchPlaceholder: "Sök språk",
    continueLabel: "Fortsätt",
  },
  da: {
    title: "Vælg dit sprog",
    subtitle: "Du kan ændre det når som helst.",
    searchPlaceholder: "Søg sprog",
    continueLabel: "Fortsæt",
  },
  no: {
    title: "Velg språk",
    subtitle: "Du kan endre dette når som helst.",
    searchPlaceholder: "Søk språk",
    continueLabel: "Fortsett",
  },
  fi: {
    title: "Valitse kieli",
    subtitle: "Voit vaihtaa sen milloin tahansa.",
    searchPlaceholder: "Etsi kieli",
    continueLabel: "Jatka",
  },
  pl: {
    title: "Wybierz język",
    subtitle: "Możesz to zmienić w każdej chwili.",
    searchPlaceholder: "Szukaj języka",
    continueLabel: "Dalej",
  },
  cs: {
    title: "Vyberte si jazyk",
    subtitle: "Kdykoli to můžete změnit.",
    searchPlaceholder: "Hledat jazyk",
    continueLabel: "Pokračovat",
  },
  tr: {
    title: "Dilinizi seçin",
    subtitle: "Bunu istediğiniz zaman değiştirebilirsiniz.",
    searchPlaceholder: "Dil ara",
    continueLabel: "Devam et",
  },
  el: {
    title: "Επιλέξτε γλώσσα",
    subtitle: "Μπορείτε να το αλλάξετε οποιαδήποτε στιγμή.",
    searchPlaceholder: "Αναζήτηση γλώσσας",
    continueLabel: "Συνέχεια",
  },
  ro: {
    title: "Alege limba",
    subtitle: "O poți schimba oricând.",
    searchPlaceholder: "Caută limba",
    continueLabel: "Continuă",
  },
  hu: {
    title: "Válassz nyelvet",
    subtitle: "Ezt bármikor megváltoztathatod.",
    searchPlaceholder: "Nyelv keresése",
    continueLabel: "Tovább",
  },
  uk: {
    title: "Оберіть мову",
    subtitle: "Ви зможете змінити це будь-коли.",
    searchPlaceholder: "Пошук мови",
    continueLabel: "Продовжити",
  },
  ru: {
    title: "Выберите язык",
    subtitle: "Вы сможете изменить его в любое время.",
    searchPlaceholder: "Поиск языка",
    continueLabel: "Продолжить",
  },
  ar: {
    title: "اختر لغتك",
    subtitle: "يمكنك تغيير ذلك في أي وقت.",
    searchPlaceholder: "ابحث عن لغة",
    continueLabel: "متابعة",
  },
  he: {
    title: "בחרו את השפה שלכם",
    subtitle: "אפשר לשנות זאת בכל עת.",
    searchPlaceholder: "חיפוש שפה",
    continueLabel: "המשך",
  },
  hi: {
    title: "अपनी भाषा चुनें",
    subtitle: "आप इसे कभी भी बदल सकते हैं।",
    searchPlaceholder: "भाषा खोजें",
    continueLabel: "जारी रखें",
  },
  th: {
    title: "เลือกภาษาของคุณ",
    subtitle: "คุณเปลี่ยนได้ทุกเมื่อ",
    searchPlaceholder: "ค้นหาภาษา",
    continueLabel: "ต่อไป",
  },
  vi: {
    title: "Chọn ngôn ngữ của bạn",
    subtitle: "Bạn có thể thay đổi bất cứ lúc nào.",
    searchPlaceholder: "Tìm ngôn ngữ",
    continueLabel: "Tiếp tục",
  },
  id: {
    title: "Pilih bahasa Anda",
    subtitle: "Anda dapat mengubahnya kapan saja.",
    searchPlaceholder: "Cari bahasa",
    continueLabel: "Lanjutkan",
  },
  ms: {
    title: "Pilih bahasa anda",
    subtitle: "Anda boleh menukarnya pada bila-bila masa.",
    searchPlaceholder: "Cari bahasa",
    continueLabel: "Teruskan",
  },
  ja: {
    title: "言語を選択してください",
    subtitle: "あとからいつでも変更できます。",
    searchPlaceholder: "言語を検索",
    continueLabel: "続ける",
  },
  ko: {
    title: "언어를 선택하세요",
    subtitle: "언제든지 변경할 수 있습니다.",
    searchPlaceholder: "언어 검색",
    continueLabel: "계속",
  },
  zh: {
    title: "选择你的语言",
    subtitle: "你可以随时更改。",
    searchPlaceholder: "搜索语言",
    continueLabel: "继续",
  },
  bn: {
    title: "আপনার ভাষা নির্বাচন করুন",
    subtitle: "আপনি যেকোনো সময় এটি পরিবর্তন করতে পারবেন।",
    searchPlaceholder: "ভাষা খুঁজুন",
    continueLabel: "চালিয়ে যান",
  },
};

export function getLanguageOption(code: SupportedLanguage | null | undefined): LanguageOption | null {
  if (!code) {
    return null;
  }

  return languageMap.get(code) ?? null;
}

export function resolveLocale(code: SupportedLanguage | null | undefined): string {
  return getLanguageOption(code)?.locale ?? "en-US";
}

export function getLanguageScreenCopy(code: SupportedLanguage | null | undefined): LanguageScreenCopy {
  if (!code) {
    return languageScreenCopyMap.en;
  }

  return languageScreenCopyMap[code] ?? languageScreenCopyMap.en;
}

export function filterLanguageOptions(
  query: string,
  options: readonly LanguageOption[] = LANGUAGE_OPTIONS,
): LanguageOption[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [...options];
  }

  return options.filter((language) =>
    [language.nativeName, language.englishName, language.code].some((value) =>
      value.toLowerCase().includes(normalized),
    ),
  );
}

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { AdaptiveTimePicker } from "@/components/AdaptiveTimePicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { OnboardingOptionCard } from "@/components/onboarding/OnboardingOptionCard";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import {
  triggerSoftConfirmationHaptic,
  triggerSoftSelectionHaptic,
} from "@/services/hapticsService";
import { requestNotificationPermission } from "@/services/notificationService";
import {
  filterLanguageOptions,
  getLanguageDirection,
  getOfficialLanguageDisplayLabel,
  getSupportedAppLanguages,
  sanitizeAppLanguageForSubscription,
} from "@/localization/languages";
import { OnboardingStackParamList, RootStackParamList } from "@/navigation/types";
import { NotificationPreference, OnboardingPreference, SupportedLanguage } from "@/types/reflection";
import { formatTimeLabel } from "@/utils/date";
import { palette } from "@/utils/theme";

type RootProps = NativeStackScreenProps<RootStackParamList, "OnboardingFlow">;
type StepProps<T extends keyof OnboardingStackParamList> = NativeStackScreenProps<OnboardingStackParamList, T>;

type ReminderPresetOption = "morning" | "midday" | "evening" | "late" | "custom";
type NotificationDecision = "pending" | "granted" | "skipped" | "denied";

type OnboardingFlowValue = {
  preferredLanguage: SupportedLanguage | null;
  setPreferredLanguage: React.Dispatch<React.SetStateAction<SupportedLanguage | null>>;
  userName: string;
  setUserName: React.Dispatch<React.SetStateAction<string>>;
  trimmedName: string | null;
  userPreferences: OnboardingPreference[];
  togglePreference: (preference: OnboardingPreference) => void;
  reminderPreset: ReminderPresetOption;
  selectReminderPreset: (preset: ReminderPresetOption) => void;
  selectedReminderDate: Date;
  setSelectedReminderDate: React.Dispatch<React.SetStateAction<Date>>;
  localizedTimeLabel: string;
  notificationDecision: NotificationDecision;
  setNotificationDecision: React.Dispatch<React.SetStateAction<NotificationDecision>>;
  finalizeSetup: () => Promise<void>;
};

const OnboardingFlowContext = createContext<OnboardingFlowValue | undefined>(undefined);
const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const WELCOME_WORDS = ["Willkommen.", "Welcome.", "Bem-vindo.", "Bienvenido.", "Bienvenue."];
const REMINDER_PRESET_TIMES: Record<Exclude<ReminderPresetOption, "custom">, NotificationPreference> = {
  morning: { hour: 8, minute: 30 },
  midday: { hour: 13, minute: 0 },
  evening: { hour: 19, minute: 30 },
  late: { hour: 21, minute: 30 },
};

function useOnboardingFlow() {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error("useOnboardingFlow must be used within OnboardingFlowContext");
  }
  return context;
}

function StepScreen({
  scroll = false,
  children,
}: {
  scroll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ScreenContainer scroll={scroll} contentContainerStyle={styles.screenContent}>
      <View style={styles.animatedContainer}>{children}</View>
    </ScreenContainer>
  );
}

function WelcomeScreen({ navigation }: StepProps<"Welcome">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <StepScreen>
      <OnboardingScaffold
        title=""
        align="center"
        contentStyle={styles.arrivalContent}
        bodyStyle={styles.arrivalBody}
        footer={
          <PrimaryButton
            label={t("onboarding.arrivalAction")}
            onPress={() => {
              triggerSoftSelectionHaptic();
              navigation.navigate("Language");
            }}
          />
        }
      >
        <View style={styles.welcomeStack}>
          {WELCOME_WORDS.map((word, index) => (
            <Text
              key={word}
              style={[
                styles.welcomeWord,
                index === 1 && styles.welcomeWordFocused,
                {
                  color: index === 1 ? colors.primaryText : colors.secondaryText,
                  fontFamily: typography.display,
                  opacity: index === 1 ? 1 : 0.72,
                },
              ]}
            >
              {word}
            </Text>
          ))}
        </View>
        <View style={[styles.arrivalRule, { backgroundColor: colors.accent }]} />
        <Text style={[styles.arrivalBodyText, { color: colors.secondaryText, fontFamily: typography.body }]}>
          {t("onboarding.arrivalBody")}
        </Text>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function LanguageScreen({ navigation }: StepProps<"Language">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, setPreferredLanguage } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredLanguages = useMemo(
    () => filterLanguageOptions(searchQuery, getSupportedAppLanguages("Freemium")),
    [searchQuery],
  );

  return (
    <StepScreen scroll>
      <OnboardingScaffold
        title={t("onboarding.languageTitle")}
        subtitle={t("onboarding.languageBody")}
        align="top"
        footer={
          <PrimaryButton
            label={t("common.continue")}
            onPress={() => {
              triggerSoftSelectionHaptic();
              navigation.navigate("Name");
            }}
            disabled={!preferredLanguage}
          />
        }
      >
        <View style={[styles.searchCard, { backgroundColor: colors.elevatedSurface, borderColor: colors.borderStrong }]}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("onboarding.languageSearchPlaceholder")}
            placeholderTextColor={colors.tertiaryText}
            style={[
              styles.searchInput,
              {
                color: colors.primaryText,
                borderColor: colors.borderStrong,
                fontFamily: typography.body,
                backgroundColor: colors.inputSurface,
              },
            ]}
          />
        </View>
        <FlatList
          data={filteredLanguages}
          keyExtractor={(item) => item.code}
          scrollEnabled={false}
          contentContainerStyle={styles.languageList}
          renderItem={({ item: language }) => (
            <OnboardingOptionCard
              label={getOfficialLanguageDisplayLabel(language.code)}
              supportingText={language.code}
              selected={preferredLanguage === language.code}
              onPress={() => {
                triggerSoftSelectionHaptic();
                setPreferredLanguage(language.code);
              }}
              labelDirection={getLanguageDirection(language.code)}
            />
          )}
        />
      </OnboardingScaffold>
    </StepScreen>
  );
}

function NameScreen({ navigation }: StepProps<"Name">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage } = useOnboardingFlow();
  const { userName, setUserName, trimmedName } = useOnboardingFlow();
  const { t, acknowledgementTitle } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <StepScreen scroll>
      <OnboardingScaffold
        title={t("onboarding.nameTitle")}
        subtitle={t("onboarding.nameBody")}
        align="center"
        footer={
          <>
            <PrimaryButton
              label={t("common.continue")}
              onPress={() => {
                triggerSoftSelectionHaptic();
                navigation.navigate("Intent");
              }}
            />
            <PrimaryButton
              label={t("common.continueWithoutName")}
              onPress={() => {
                triggerSoftSelectionHaptic();
                setUserName("");
                navigation.navigate("Intent");
              }}
              variant="ghost"
            />
          </>
        }
      >
        <View style={[styles.inputCard, { backgroundColor: colors.elevatedSurface, borderColor: colors.borderStrong }]}>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder={t("onboarding.namePlaceholder")}
            placeholderTextColor={colors.tertiaryText}
            style={[
              styles.input,
              {
                color: colors.primaryText,
                borderColor: colors.borderStrong,
                fontFamily: typography.body,
                backgroundColor: colors.inputSurface,
              },
            ]}
            selectionColor={colors.accent}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => navigation.navigate("Intent")}
            maxLength={40}
          />
        </View>
        {trimmedName ? (
          <View style={[styles.centeredCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.centeredCardText, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {acknowledgementTitle(trimmedName)}
            </Text>
          </View>
        ) : null}
      </OnboardingScaffold>
    </StepScreen>
  );
}

function IntentScreen({ navigation }: StepProps<"Intent">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, userPreferences, togglePreference } = useOnboardingFlow();
  const { t, preferenceLabel } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <StepScreen>
      <OnboardingScaffold
        title={t("onboarding.preferenceTitle")}
        subtitle={t("onboarding.preferenceBody")}
        align="top"
        footer={
          <PrimaryButton
            label={t("common.continue")}
            onPress={() => {
              triggerSoftSelectionHaptic();
              navigation.navigate("Moment");
            }}
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
        <Text style={[styles.preferenceHint, { color: colors.secondaryText, fontFamily: typography.body }]}>
          {t("onboarding.preferenceHint")}
        </Text>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function MomentScreen({ navigation }: StepProps<"Moment">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, reminderPreset, selectReminderPreset } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <StepScreen>
      <OnboardingScaffold
        title={t("onboarding.ritualTimeTitle")}
        subtitle={t("onboarding.ritualTimeBody")}
        align="top"
        contentStyle={styles.ritualWindowContent}
        bodyStyle={styles.ritualWindowBody}
        footerStyle={styles.ritualWindowFooter}
        footer={
          <PrimaryButton
            label={t("common.continue")}
            onPress={() => {
              triggerSoftSelectionHaptic();
              navigation.navigate("ExactTime");
            }}
          />
        }
      >
        {([
          ["morning", t("onboarding.ritualTimeMorningTitle"), t("onboarding.ritualTimeMorningBody")],
          ["midday", t("onboarding.ritualTimeMiddayTitle"), t("onboarding.ritualTimeMiddayBody")],
          ["evening", t("onboarding.ritualTimeEveningTitle"), t("onboarding.ritualTimeEveningBody")],
          ["late", t("onboarding.ritualTimeLateTitle"), t("onboarding.ritualTimeLateBody")],
          ["custom", t("onboarding.ritualTimeCustomTitle"), t("onboarding.ritualTimeCustomBody")],
        ] as const).map(([presetId, label, supportingText]) => (
          <OnboardingOptionCard
            key={presetId}
            label={label}
            supportingText={supportingText}
            selected={reminderPreset === presetId}
            onPress={() => selectReminderPreset(presetId)}
            compact
          />
        ))}
        <Text style={[styles.ritualHint, { color: colors.secondaryText, fontFamily: typography.body }]}>
          {t("onboarding.ritualTimeHint")}
        </Text>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function ExactTimeScreen({ navigation }: StepProps<"ExactTime">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, reminderPreset, selectedReminderDate, setSelectedReminderDate, localizedTimeLabel } =
    useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <StepScreen>
      <OnboardingScaffold
        title={t("onboarding.notificationTimeTitle")}
        subtitle={t("onboarding.notificationTimeBody")}
        align="center"
        contentStyle={styles.exactTimeContent}
        footer={
          <PrimaryButton
            label={t("common.continue")}
            onPress={() => {
              triggerSoftSelectionHaptic();
              navigation.navigate("Notifications");
            }}
          />
        }
      >
        <View style={[styles.timeSummaryCard, { backgroundColor: colors.surface, borderColor: colors.borderStrong }]}>
          <Text style={[styles.timeSummaryEyebrow, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
            {t(
              reminderPreset === "morning"
                ? "onboarding.ritualTimeMorningTitle"
                : reminderPreset === "midday"
                  ? "onboarding.ritualTimeMiddayTitle"
                  : reminderPreset === "evening"
                    ? "onboarding.ritualTimeEveningTitle"
                    : reminderPreset === "late"
                      ? "onboarding.ritualTimeLateTitle"
                      : "onboarding.ritualTimeCustomTitle",
            )}
          </Text>
          <Text style={[styles.timeSummaryValue, { color: colors.primaryText, fontFamily: typography.display }]}>
            {localizedTimeLabel}
          </Text>
        </View>
        <View style={[styles.timePickerCard, { backgroundColor: colors.elevatedSurface, borderColor: colors.borderStrong }]}>
          <AdaptiveTimePicker value={selectedReminderDate} onChange={setSelectedReminderDate} />
        </View>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function NotificationsScreen({ navigation }: StepProps<"Notifications">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, localizedTimeLabel, setNotificationDecision } = useOnboardingFlow();
  const { t, permissionScheduleBody } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  async function handleDecision(allow: boolean) {
    triggerSoftSelectionHaptic();

    if (!allow) {
      setNotificationDecision("skipped");
      navigation.navigate("StartReady");
      return;
    }

    const granted = await requestNotificationPermission();
    setNotificationDecision(granted ? "granted" : "denied");
    navigation.navigate("StartReady");
  }

  return (
    <StepScreen>
      <OnboardingScaffold
        title={t("onboarding.notificationPermissionTitle")}
        subtitle={permissionScheduleBody(localizedTimeLabel)}
        align="center"
        contentStyle={styles.permissionContent}
        footer={
          <>
            <PrimaryButton
              label={t("common.allowNotifications")}
              onPress={() => {
                void handleDecision(true);
              }}
            />
            <PrimaryButton label={t("common.notNow")} onPress={() => void handleDecision(false)} variant="ghost" />
          </>
        }
      >
        <View style={[styles.permissionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.permissionTime, { color: colors.primaryText, fontFamily: typography.display }]}>
            {localizedTimeLabel}
          </Text>
          <Text style={[styles.permissionBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("onboarding.notificationPermissionBody")}
          </Text>
        </View>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function StartReadyScreen() {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, finalizeSetup } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];

  return (
    <StepScreen>
      <OnboardingScaffold
        title={t("onboarding.transitionTitle")}
        subtitle={t("onboarding.transitionBody")}
        align="center"
        footer={
          <PrimaryButton
            label={t("onboarding.transitionAction")}
            onPress={() => {
              void finalizeSetup();
            }}
          />
        }
      >
        <View style={styles.transitionWrap}>
          <View style={[styles.transitionRule, { backgroundColor: colors.accent }]} />
        </View>
      </OnboardingScaffold>
    </StepScreen>
  );
}

export function OnboardingScreen({ navigation }: RootProps) {
  const {
    colorScheme,
    appState,
    completeOnboarding,
    markTodayIntroOverlaySeen,
    updateNotificationDeliveryPreferences,
    updateNotificationTime,
  } = useAppContext();
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage | null>(
    sanitizeAppLanguageForSubscription(appState.preferredLanguage ?? "en", "Freemium"),
  );
  const [userName, setUserName] = useState(appState.userName ?? "");
  const [userPreferences, setUserPreferences] = useState<OnboardingPreference[]>(appState.userPreferences);
  const [reminderPreset, setReminderPreset] = useState<ReminderPresetOption>(
    appState.preferences.reminderPreset ?? "morning",
  );
  const [selectedReminderDate, setSelectedReminderDate] = useState(() => {
    const value = new Date();
    value.setHours(appState.preferences.notificationTime.hour, appState.preferences.notificationTime.minute, 0, 0);
    return value;
  });
  const [notificationDecision, setNotificationDecision] = useState<NotificationDecision>("pending");
  const { locale } = useAppStrings(preferredLanguage);

  const trimmedName = userName.trim() || null;
  const colors = palette[colorScheme];

  function togglePreference(preference: OnboardingPreference) {
    triggerSoftSelectionHaptic();
    setUserPreferences((current) =>
      current.includes(preference)
        ? current.filter((item) => item !== preference)
        : current.length >= 2
          ? current
          : [...current, preference],
    );
  }

  function selectReminderPreset(nextPreset: ReminderPresetOption) {
    triggerSoftSelectionHaptic();
    setReminderPreset(nextPreset);

    if (nextPreset !== "custom") {
      const nextValue = new Date(selectedReminderDate);
      nextValue.setHours(REMINDER_PRESET_TIMES[nextPreset].hour, REMINDER_PRESET_TIMES[nextPreset].minute, 0, 0);
      setSelectedReminderDate(nextValue);
    }
  }

  const localizedTimeLabel = useMemo(
    () => formatTimeLabel(selectedReminderDate.getHours(), selectedReminderDate.getMinutes(), locale),
    [locale, selectedReminderDate],
  );

  async function finalizeSetup() {
    try {
      triggerSoftConfirmationHaptic();

      const selectedReminderTime = {
        hour: selectedReminderDate.getHours(),
        minute: selectedReminderDate.getMinutes(),
      };

      await completeOnboarding({
        preferredLanguage,
        userName: trimmedName,
        userPreferences,
        reminderTime: selectedReminderTime,
        reminderPreset: reminderPreset === "custom" ? "custom" : reminderPreset,
      });
      await markTodayIntroOverlaySeen();

      if (notificationDecision === "granted") {
        await updateNotificationTime(selectedReminderTime, {
          requestPermission: false,
          notificationContent: {
            language: preferredLanguage,
            userName: trimmedName,
          },
        });
      } else {
        await updateNotificationDeliveryPreferences({ notificationsEnabled: false });
      }

      navigation.replace("ReflectionPreview");
    } catch (error) {
      console.warn("Unable to complete onboarding", error);
    }
  }

  const contextValue = useMemo<OnboardingFlowValue>(
    () => ({
      preferredLanguage,
      setPreferredLanguage,
      userName,
      setUserName,
      trimmedName,
      userPreferences,
      togglePreference,
      reminderPreset,
      selectReminderPreset,
      selectedReminderDate,
      setSelectedReminderDate,
      localizedTimeLabel,
      notificationDecision,
      setNotificationDecision,
      finalizeSetup,
    }),
    [
      localizedTimeLabel,
      notificationDecision,
      preferredLanguage,
      reminderPreset,
      selectedReminderDate,
      trimmedName,
      userName,
      userPreferences,
    ],
  );

  return (
    <OnboardingFlowContext.Provider value={contextValue}>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="Intent" component={IntentScreen} />
        <Stack.Screen name="Moment" component={MomentScreen} />
        <Stack.Screen name="ExactTime" component={ExactTimeScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="StartReady" component={StartReadyScreen} />
      </Stack.Navigator>
    </OnboardingFlowContext.Provider>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: "center",
    paddingVertical: 12,
  },
  animatedContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  arrivalContent: {
    paddingTop: 10,
  },
  arrivalBody: {
    gap: 18,
    alignItems: "center",
  },
  welcomeStack: {
    width: "100%",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
  },
  welcomeWord: {
    fontSize: 25,
    lineHeight: 31,
    letterSpacing: -0.35,
    textAlign: "center",
  },
  welcomeWordFocused: {
    fontSize: 33,
    lineHeight: 39,
    letterSpacing: -0.6,
  },
  arrivalRule: {
    width: 48,
    height: 2,
    borderRadius: 999,
    opacity: 0.78,
  },
  arrivalBodyText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 308,
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
    paddingTop: 4,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 18,
  },
  centeredCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  centeredCardText: {
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
  },
  preferenceHint: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    paddingTop: 2,
  },
  ritualWindowContent: {
    paddingTop: 4,
  },
  ritualWindowBody: {
    gap: 8,
  },
  ritualWindowFooter: {
    marginTop: 14,
    gap: 10,
  },
  ritualHint: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingTop: 2,
    paddingHorizontal: 6,
  },
  exactTimeContent: {
    paddingTop: 6,
  },
  timeSummaryCard: {
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 6,
    alignItems: "center",
  },
  timeSummaryEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  timeSummaryValue: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center",
  },
  timePickerCard: {
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  permissionContent: {
    paddingTop: 6,
  },
  permissionCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 8,
    alignItems: "center",
  },
  permissionTime: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
  },
  permissionBody: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  transitionWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  transitionRule: {
    width: 56,
    height: 2,
    borderRadius: 999,
    opacity: 0.75,
  },
});

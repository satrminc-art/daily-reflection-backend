import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, TextInput, View } from "react-native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdaptiveTimePicker } from "@/components/AdaptiveTimePicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { OnboardingBackButton } from "@/components/onboarding/OnboardingBackButton";
import { AnimatedDivider } from "@/components/onboarding/AnimatedDivider";
import { AnimatedReveal } from "@/components/onboarding/AnimatedReveal";
import { OnboardingOptionCard } from "@/components/onboarding/OnboardingOptionCard";
import { OnboardingScaffold } from "@/components/onboarding/OnboardingScaffold";
import { QuietAssemblyLoader } from "@/components/onboarding/QuietAssemblyLoader";
import { StaggeredRevealText } from "@/components/onboarding/StaggeredRevealText";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import {
  triggerSoftConfirmationHaptic,
  triggerSoftSelectionHaptic,
} from "@/services/hapticsService";
import { trackAppEvent } from "@/services/analytics";
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
type StorySceneTone = "welcome" | "entry" | "problem" | "pivot" | "resolution";
type StoryAtmosphereVariant = "default" | "quiet";

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
  openFirstPagePreview: () => void;
};

const OnboardingFlowContext = createContext<OnboardingFlowValue | undefined>(undefined);
const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const REMINDER_PRESET_TIMES: Record<Exclude<ReminderPresetOption, "custom">, NotificationPreference> = {
  morning: { hour: 8, minute: 30 },
  midday: { hour: 13, minute: 0 },
  evening: { hour: 19, minute: 30 },
  late: { hour: 21, minute: 30 },
};
const PREPARING_SEQUENCE_TOTAL_MS = 16000;
const PREPARING_STATUS_OFFSETS_MS = [1200, 4200, 7600, 11200, 14400] as const;
const PREPARING_SUMMARY_OFFSETS_MS = [2600, 5000, 7600, 10200] as const;

function getNarrativeBeats(text: string) {
  return text
    .split("\n\n")
    .flatMap((block) => block.split("\n"))
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function useOnboardingFlow() {
  const context = useContext(OnboardingFlowContext);
  if (!context) {
    throw new Error("useOnboardingFlow must be used within OnboardingFlowContext");
  }
  return context;
}

function StepScreen({
  scroll = false,
  showBack = false,
  onBack,
  children,
}: {
  scroll?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 640,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <ScreenContainer
      scroll={scroll}
      contentContainerStyle={scroll ? styles.scrollScreenContent : styles.screenContent}
      overlay={showBack && onBack ? <OnboardingBackButton onPress={onBack} /> : undefined}
    >
      <Animated.View
        style={[
          scroll ? styles.scrollAnimatedContainer : styles.animatedContainer,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        {children}
      </Animated.View>
    </ScreenContainer>
  );
}

function StoryAtmosphere({
  tone,
  variant = "default",
}: {
  tone: StorySceneTone;
  variant?: StoryAtmosphereVariant;
}) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const floatY = useRef(new Animated.Value(0)).current;
  const secondaryFloat = useRef(new Animated.Value(0)).current;
  const hazeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(hazeOpacity, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const primaryLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const secondaryLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(secondaryFloat, {
          toValue: 1,
          duration: 6800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(secondaryFloat, {
          toValue: 0,
          duration: 6800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    primaryLoop.start();
    secondaryLoop.start();

    return () => {
      primaryLoop.stop();
      secondaryLoop.stop();
    };
  }, [floatY, hazeOpacity, secondaryFloat]);

  const primaryTranslateY = floatY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tone === "problem" ? 12 : 8],
  });
  const secondaryTranslateY = secondaryFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tone === "pivot" ? -10 : -6],
  });
  const hazeTranslateY = hazeOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return (
    <View pointerEvents="none" style={styles.storyAtmosphere}>
      <Animated.View
        style={[
          styles.storyHaze,
          styles.storyHazePrimary,
          {
            backgroundColor: colors.paperTint,
            opacity: hazeOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, variant === "quiet" ? 0.22 : tone === "welcome" ? 0.42 : 0.3],
            }),
            transform: [
              { translateY: hazeTranslateY },
              { scale: variant === "quiet" ? 0.96 : tone === "resolution" ? 1.06 : 1 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.storyPanel,
          styles.storyPanelPrimary,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: variant === "quiet" ? 0.14 : tone === "problem" ? 0.38 : 0.3,
            transform: [
              { translateY: primaryTranslateY },
              { rotate: variant === "quiet" ? "-1deg" : tone === "entry" ? "-5deg" : "-3deg" },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.storyPanel,
          styles.storyPanelSecondary,
          {
            backgroundColor: colors.elevatedSurface,
            borderColor: colors.borderStrong,
            opacity: variant === "quiet" ? 0.08 : tone === "pivot" ? 0.5 : 0.4,
            transform: [
              { translateY: secondaryTranslateY },
              { rotate: variant === "quiet" ? "1deg" : tone === "resolution" ? "5deg" : "3deg" },
            ],
          },
        ]}
      />
    </View>
  );
}

function StoryScreen({
  title,
  bodySegments,
  actionLabel,
  onPress,
  tone = "entry",
  showBack = false,
  onBack,
  atmosphereVariant = "default",
  contentStyle,
  titleStyle,
  titleWrapStyle,
  narrativeStyle,
  bodyContainerStyle,
  textStyle,
  buttonStyle,
  dividerWidth = 62,
  accentStyle,
}: {
  title: string;
  bodySegments: string[];
  actionLabel: string;
  onPress: () => void;
  tone?: StorySceneTone;
  showBack?: boolean;
  onBack?: () => void;
  atmosphereVariant?: StoryAtmosphereVariant;
  contentStyle?: object;
  titleStyle?: object;
  titleWrapStyle?: object;
  narrativeStyle?: object;
  bodyContainerStyle?: object;
  textStyle?: object;
  buttonStyle?: object;
  dividerWidth?: number;
  accentStyle?: object;
}) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const titleLines = title.split("\n");

  return (
    <StepScreen showBack={showBack} onBack={onBack}>
      <View style={styles.storyScene}>
        <StoryAtmosphere tone={tone} variant={atmosphereVariant} />
        <OnboardingScaffold
        title={
          <View style={[styles.storyTitleWrap, titleWrapStyle]}>
            <StaggeredRevealText
              lines={titleLines}
              lineHeight={44}
              startDelay={tone === "pivot" ? 120 : 80}
              stagger={tone === "pivot" ? 210 : 170}
              duration={tone === "pivot" ? 720 : 640}
              textStyle={[
                styles.storyTitle,
                tone === "problem" ? styles.storyTitleTight : null,
                titleStyle,
                {
                  color: colors.primaryText,
                  fontFamily: typography.display,
                },
              ]}
            />
          </View>
        }
          align="center"
          contentStyle={[styles.storyContent, contentStyle]}
          bodyStyle={styles.storyBody}
          disableBodyReveal
          footerRevealDelay={(tone === "pivot" ? 1160 : 980) + bodySegments.length * 220}
          footer={<PrimaryButton label={actionLabel} onPress={onPress} style={buttonStyle} />}
        >
          <View style={[styles.storyNarrative, narrativeStyle]}>
          <AnimatedDivider delay={tone === "welcome" ? 360 : 430} width={dividerWidth} style={styles.storyDivider} />
          <View style={[styles.storyBody, bodyContainerStyle]}>
            {bodySegments.map((segment, index) => (
              <AnimatedReveal
                key={`${segment}-${index}`}
                delay={(tone === "problem" ? 560 : tone === "pivot" ? 700 : 500) + index * (tone === "pivot" ? 320 : 270)}
                duration={tone === "pivot" ? 640 : 580}
                distance={14}
              >
                <StaggeredRevealText
                  lines={segment.split("\n")}
                  lineHeight={index === 0 && tone === "resolution" ? 29 : 27}
                  startDelay={0}
                  stagger={110}
                  duration={420}
                  textStyle={[
                    styles.storyText,
                    index === 0 && tone === "resolution" ? styles.storyLeadText : null,
                    textStyle,
                    {
                      color: colors.secondaryText,
                      fontFamily: typography.body,
                    },
                  ]}
                />
              </AnimatedReveal>
            ))}
          </View>
        </View>
          <View style={styles.storyAccentWrap}>
            <AnimatedReveal delay={(tone === "pivot" ? 920 : 760) + bodySegments.length * 220} duration={520} distance={10}>
              <View style={[styles.storyAccent, accentStyle, { backgroundColor: colors.accent }]} />
            </AnimatedReveal>
          </View>
        </OnboardingScaffold>
      </View>
    </StepScreen>
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
      <View style={styles.storyScene}>
        <StoryAtmosphere tone="welcome" />
        <OnboardingScaffold
          title={
            <View style={styles.storyTitleWrap}>
              <StaggeredRevealText
                lines={[t("onboarding.welcome.title")]}
                lineHeight={44}
                startDelay={110}
                stagger={170}
                duration={680}
                textStyle={[
                  styles.storyTitle,
                  {
                    color: colors.primaryText,
                    fontFamily: typography.display,
                  },
                ]}
              />
            </View>
          }
          subtitle={
            <StaggeredRevealText
              lines={[t("onboarding.welcome.subtitle")]}
              lineHeight={27}
              startDelay={360}
              stagger={120}
              duration={560}
              textStyle={[
                styles.storyText,
                {
                  color: colors.secondaryText,
                  fontFamily: typography.body,
                },
              ]}
            />
          }
          align="center"
          contentStyle={styles.storyContent}
          bodyStyle={styles.storyBody}
          footerRevealDelay={900}
          footer={
            <PrimaryButton
              label={t("onboarding.welcome.cta")}
              onPress={() => {
                triggerSoftSelectionHaptic();
                navigation.navigate("EmotionalEntry");
              }}
            />
          }
        >
          <View style={styles.storyAccentWrap}>
            <AnimatedDivider delay={300} width={62} style={styles.storyDivider} />
            <AnimatedReveal delay={430} duration={520} distance={10}>
              <View style={[styles.storyAccent, { backgroundColor: colors.accent }]} />
            </AnimatedReveal>
          </View>
        </OnboardingScaffold>
      </View>
    </StepScreen>
  );
}

function EmotionalEntryScreen({ navigation }: StepProps<"EmotionalEntry">) {
  const { preferredLanguage } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);

  return (
    <StoryScreen
      title={t("onboarding.entry.title")}
      bodySegments={t("onboarding.entry.text").split("\n")}
      actionLabel={t("onboarding.entry.cta")}
      tone="entry"
      onPress={() => {
        triggerSoftSelectionHaptic();
        navigation.navigate("Problem");
      }}
    />
  );
}

function ProblemScreen({ navigation }: StepProps<"Problem">) {
  const { preferredLanguage } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const beats = useMemo(() => getNarrativeBeats(t("onboarding.problem.text")), [t]);

  return (
    <StoryScreen
      title={t("onboarding.problem.title")}
      bodySegments={beats}
      actionLabel={t("onboarding.problem.cta")}
      tone="problem"
      atmosphereVariant="quiet"
      contentStyle={styles.focusedStoryContent}
      titleWrapStyle={styles.focusedTitleWrap}
      titleStyle={styles.focusedProblemTitle}
      narrativeStyle={styles.focusedNarrative}
      bodyContainerStyle={styles.focusedBodyPanel}
      textStyle={styles.focusedStoryText}
      buttonStyle={styles.focusedButton}
      dividerWidth={80}
      accentStyle={styles.focusedAccent}
      showBack
      onBack={() => navigation.goBack()}
      onPress={() => {
        triggerSoftSelectionHaptic();
        navigation.navigate("DeeperTruth");
      }}
    />
  );
}

function DeeperTruthScreen({ navigation }: StepProps<"DeeperTruth">) {
  const { preferredLanguage } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const beats = useMemo(() => getNarrativeBeats(t("onboarding.deeperTruth.text")), [t]);

  return (
    <StoryScreen
      title={t("onboarding.deeperTruth.title")}
      bodySegments={beats}
      actionLabel={t("onboarding.deeperTruth.cta")}
      tone="pivot"
      atmosphereVariant="quiet"
      contentStyle={styles.focusedStoryContent}
      titleWrapStyle={styles.focusedTitleWrap}
      titleStyle={styles.focusedPivotTitle}
      narrativeStyle={styles.focusedNarrative}
      bodyContainerStyle={styles.focusedBodyPanel}
      textStyle={styles.focusedStoryText}
      buttonStyle={styles.focusedButton}
      dividerWidth={72}
      accentStyle={styles.focusedAccent}
      showBack
      onBack={() => navigation.goBack()}
      onPress={() => {
        triggerSoftSelectionHaptic();
        navigation.navigate("Solution");
      }}
    />
  );
}

function SolutionScreen({ navigation }: StepProps<"Solution">) {
  const { preferredLanguage } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const beats = useMemo(() => getNarrativeBeats(t("onboarding.solution.text")), [t]);

  return (
    <StoryScreen
      title={t("onboarding.solution.title")}
      bodySegments={beats}
      actionLabel={t("onboarding.solution.cta")}
      tone="resolution"
      showBack
      onBack={() => navigation.goBack()}
      onPress={() => {
        triggerSoftSelectionHaptic();
        navigation.navigate("Language");
      }}
    />
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
    <StepScreen scroll showBack onBack={() => navigation.goBack()}>
      <OnboardingScaffold
        title={t("onboarding.language.title")}
        subtitle={t("onboarding.language.subtitle")}
        align="top"
        contentStyle={styles.selectionContent}
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
        <AnimatedReveal delay={180} duration={520} distance={12}>
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
        </AnimatedReveal>
        <View style={styles.languageList}>
          {filteredLanguages.map((language, index) => (
            <AnimatedReveal key={language.code} delay={280 + index * 90} duration={500} distance={12}>
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
            </AnimatedReveal>
          ))}
        </View>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function NameScreen({ navigation }: StepProps<"Name">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, userName, setUserName } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <StepScreen scroll showBack onBack={() => navigation.goBack()}>
      <OnboardingScaffold
        title={t("onboarding.nameInput.title")}
        subtitle={t("onboarding.nameInput.subtitle")}
        align="center"
        contentStyle={styles.nameContent}
        footer={
          <>
            <PrimaryButton
              label={t("onboarding.nameInput.cta")}
              onPress={() => {
                triggerSoftSelectionHaptic();
                navigation.navigate("NameConfirmation");
              }}
            />
            <PrimaryButton
              label={t("common.continueWithoutName")}
              onPress={() => {
                triggerSoftSelectionHaptic();
                setUserName("");
                navigation.navigate("NameConfirmation");
              }}
              variant="ghost"
            />
          </>
        }
      >
        <AnimatedReveal delay={220} duration={560} distance={12}>
          <View style={[styles.inputCard, { backgroundColor: colors.elevatedSurface, borderColor: colors.borderStrong }]}>
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder={t("onboarding.nameInput.placeholder")}
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
              onSubmitEditing={() => navigation.navigate("NameConfirmation")}
              maxLength={40}
            />
          </View>
        </AnimatedReveal>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function NameConfirmationScreen({ navigation }: StepProps<"NameConfirmation">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, trimmedName } = useOnboardingFlow();
  const { t, acknowledgementTitle } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <StepScreen showBack onBack={() => navigation.goBack()}>
      <OnboardingScaffold
        title={acknowledgementTitle(trimmedName)}
        subtitle={t("onboarding.nameConfirm.subtitle")}
        align="center"
        bodyStyle={styles.nameConfirmationBody}
        footer={
          <PrimaryButton
            label={t("onboarding.nameConfirm.cta")}
            onPress={() => {
              triggerSoftSelectionHaptic();
              navigation.navigate("Intent");
            }}
          />
        }
      >
        <AnimatedDivider delay={260} width={52} style={styles.storyDivider} />
        <AnimatedReveal delay={420} duration={560} distance={14}>
          <View style={[styles.centeredCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.centeredCardText, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("onboarding.ackCard")}
            </Text>
          </View>
        </AnimatedReveal>
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
    <StepScreen scroll showBack onBack={() => navigation.goBack()}>
      <OnboardingScaffold
        title={t("onboarding.intent.title")}
        subtitle={t("onboarding.intent.subtitle")}
        align="top"
        contentStyle={styles.selectionContent}
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
        {(["clarity", "calm", "direction", "focus"] as OnboardingPreference[]).map((preference, index) => {
          const localizedPreference = preferenceLabel(preference);
          return (
            <AnimatedReveal key={preference} delay={220 + index * 110} duration={500} distance={12}>
              <OnboardingOptionCard
                label={localizedPreference.title}
                supportingText={localizedPreference.body}
                selected={userPreferences.includes(preference)}
                onPress={() => togglePreference(preference)}
              />
            </AnimatedReveal>
          );
        })}
        <AnimatedReveal delay={720} duration={480} distance={12}>
          <Text style={[styles.preferenceHint, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("onboarding.intent.helper")}
          </Text>
        </AnimatedReveal>
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
    <StepScreen scroll showBack onBack={() => navigation.goBack()}>
      <OnboardingScaffold
        title={t("onboarding.moment.title")}
        subtitle={t("onboarding.moment.subtitle")}
        align="top"
        contentStyle={[styles.selectionContent, styles.ritualWindowContent]}
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
        ] as const).map(([presetId, label, supportingText], index) => (
          <AnimatedReveal key={presetId} delay={220 + index * 100} duration={500} distance={12}>
            <OnboardingOptionCard
              label={label}
              supportingText={supportingText}
              selected={reminderPreset === presetId}
              onPress={() => selectReminderPreset(presetId)}
              compact
            />
          </AnimatedReveal>
        ))}
        <AnimatedReveal delay={780} duration={480} distance={12}>
          <Text style={[styles.ritualHint, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("onboarding.intent.helper")}
          </Text>
        </AnimatedReveal>
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
    <StepScreen scroll showBack onBack={() => navigation.goBack()}>
      <OnboardingScaffold
        title={t("onboarding.time.title")}
        subtitle={t("onboarding.time.subtitle")}
        align="center"
        contentStyle={[styles.selectionContent, styles.exactTimeContent]}
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
        <AnimatedReveal delay={220} duration={520} distance={12}>
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
        </AnimatedReveal>
        <AnimatedReveal delay={380} duration={560} distance={14}>
          <View style={[styles.timePickerCard, { backgroundColor: colors.elevatedSurface, borderColor: colors.borderStrong }]}>
            <AdaptiveTimePicker value={selectedReminderDate} onChange={setSelectedReminderDate} />
          </View>
        </AnimatedReveal>
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
      trackAppEvent("notification_permission_denied", { source: "onboarding_pre_permission" });
      setNotificationDecision("skipped");
      navigation.navigate("PreparingSpace");
      return;
    }

    const granted = await requestNotificationPermission();
    trackAppEvent(granted ? "notification_permission_allowed" : "notification_permission_denied", {
      source: "onboarding_os_prompt",
    });
    setNotificationDecision(granted ? "granted" : "denied");
    navigation.navigate("PreparingSpace");
  }

  return (
    <StepScreen scroll showBack onBack={() => navigation.goBack()}>
      <OnboardingScaffold
        title={t("onboarding.notification.title")}
        subtitle={t("onboarding.notification.text")}
        align="center"
        contentStyle={[styles.selectionContent, styles.permissionContent]}
        footer={
          <>
            <PrimaryButton
              label={t("onboarding.notification.allow")}
              onPress={() => {
                void handleDecision(true);
              }}
            />
            <PrimaryButton label={t("onboarding.notification.skip")} onPress={() => void handleDecision(false)} variant="ghost" />
          </>
        }
      >
        <AnimatedDivider delay={260} width={50} style={styles.storyDivider} />
        <AnimatedReveal delay={400} duration={560} distance={14}>
          <View style={[styles.permissionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.permissionTime, { color: colors.primaryText, fontFamily: typography.display }]}>
              {localizedTimeLabel}
            </Text>
            <Text style={[styles.permissionBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {permissionScheduleBody(localizedTimeLabel)}
            </Text>
          </View>
        </AnimatedReveal>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function PreparingSpaceScreen({ navigation }: StepProps<"PreparingSpace">) {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, trimmedName, userPreferences, localizedTimeLabel, finalizeSetup } = useOnboardingFlow();
  const { t, languageOptionLabel, preferenceLabel } = useAppStrings(preferredLanguage);
  const colors = palette[colorScheme];
  const typography = useTypography();
  const insets = useSafeAreaInsets();
  const hasStartedRef = useRef(false);
  const [visibleSummaryCount, setVisibleSummaryCount] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [progress, setProgress] = useState(0);

  const preferenceSummary = useMemo(
    () => userPreferences.map((preference) => preferenceLabel(preference).title).join(", "),
    [preferenceLabel, userPreferences],
  );
  const summaryItems = useMemo(
    () =>
      [
        trimmedName
          ? {
              label: t("onboarding.preparingSummaryName"),
              value: trimmedName,
            }
          : null,
        {
          label: t("onboarding.preparingSummaryFocus"),
          value: preferenceSummary,
        },
        {
          label: t("onboarding.preparingSummaryTime"),
          value: localizedTimeLabel,
        },
        {
          label: t("onboarding.preparingSummaryLanguage"),
          value: preferredLanguage ? languageOptionLabel(preferredLanguage) : "English",
        },
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [languageOptionLabel, localizedTimeLabel, preferenceSummary, preferredLanguage, t, trimmedName],
  );
  const statusMessages = useMemo(
    () => [
      t("onboarding.preparing.statusShape"),
      t("onboarding.preparing.statusQuietPlace"),
      t("onboarding.preparing.statusAligned"),
      t("onboarding.preparing.statusFirstPage"),
      t("onboarding.preparing.statusAlmost"),
    ],
    [t],
  );

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    let isMounted = true;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    let progressInterval: ReturnType<typeof setInterval> | null = null;

    async function prepare() {
      const startedAt = Date.now();

      progressInterval = setInterval(() => {
        if (!isMounted) {
          return;
        }

        const elapsed = Date.now() - startedAt;
        setProgress(Math.min(elapsed / PREPARING_SEQUENCE_TOTAL_MS, 1));
      }, 180);

      PREPARING_SUMMARY_OFFSETS_MS.forEach((offset, index) => {
        timeouts.push(
          setTimeout(() => {
            if (isMounted) {
              setVisibleSummaryCount(index + 1);
            }
          }, offset),
        );
      });

      PREPARING_STATUS_OFFSETS_MS.forEach((offset, index) => {
        timeouts.push(
          setTimeout(() => {
            if (isMounted) {
              setStatusIndex(index);
            }
          }, offset),
        );
      });

      await Promise.all([finalizeSetup(), new Promise((resolve) => setTimeout(resolve, PREPARING_SEQUENCE_TOTAL_MS))]);

      if (isMounted) {
        setProgress(1);
        setIsCompleting(true);
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (isMounted) {
        navigation.replace("FirstPageReady");
      }
    }

    void prepare();

    return () => {
      isMounted = false;
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      timeouts.forEach(clearTimeout);
    };
  }, [finalizeSetup, navigation]);

  return (
    <StepScreen>
      <OnboardingScaffold
        title={t("onboarding.preparing.title")}
        subtitle={t("onboarding.preparing.subtitle")}
        align="center"
        contentStyle={[styles.preparingContent, { paddingTop: Math.max(40, insets.top + 24) }]}
        bodyStyle={styles.preparingBody}
      >
        <QuietAssemblyLoader
          eyebrow={t("onboarding.preparingReceiptLabel")}
          summaryItems={summaryItems}
          visibleSummaryCount={visibleSummaryCount}
          statusText={statusMessages[statusIndex]}
          isCompleting={isCompleting}
          progress={progress}
        />
        <View style={styles.preparingCopyWrap}>
          <Text
            style={[
              styles.preparingCopy,
              { color: isCompleting ? colors.primaryText : colors.secondaryText, fontFamily: typography.body },
            ]}
          >
            {t("onboarding.preparing.text")}
          </Text>
        </View>
      </OnboardingScaffold>
    </StepScreen>
  );
}

function FirstPageReadyScreen() {
  const { colorScheme } = useAppContext();
  const { preferredLanguage, openFirstPagePreview } = useOnboardingFlow();
  const { t } = useAppStrings(preferredLanguage);

  return (
    <StepScreen>
      <OnboardingScaffold
        title={t("onboarding.firstPageIntro.title")}
        subtitle={t("onboarding.firstPageIntro.subtitle")}
        align="center"
        contentStyle={styles.storyContent}
        bodyStyle={styles.storyBody}
        footer={<PrimaryButton label={t("onboarding.firstPageIntro.cta")} onPress={openFirstPagePreview} />}
      >
        <View style={styles.storyAccentWrap}>
          <View style={[styles.storyAccent, { backgroundColor: palette[colorScheme].accent }]} />
        </View>
      </OnboardingScaffold>
    </StepScreen>
  );
}

export function OnboardingScreen({ navigation }: RootProps) {
  const {
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
  const [userPreferences, setUserPreferences] = useState<OnboardingPreference[]>(
    appState.userPreferences.length ? appState.userPreferences : [],
  );
  const [reminderPreset, setReminderPreset] = useState<ReminderPresetOption>(
    appState.preferences.reminderPreset ?? "evening",
  );
  const [selectedReminderDate, setSelectedReminderDate] = useState(() => {
    const value = new Date();
    value.setHours(appState.preferences.notificationTime.hour, appState.preferences.notificationTime.minute, 0, 0);
    return value;
  });
  const [notificationDecision, setNotificationDecision] = useState<NotificationDecision>("pending");
  const finalizedRef = useRef(false);
  const { locale } = useAppStrings(preferredLanguage);

  const trimmedName = userName.trim() || null;
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
    if (finalizedRef.current) {
      return;
    }

    try {
      finalizedRef.current = true;
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
    } catch (error) {
      finalizedRef.current = false;
      console.warn("Unable to complete onboarding", error);
    }
  }

  function openFirstPagePreview() {
    navigation.replace("ReflectionPreview");
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
      openFirstPagePreview,
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
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="EmotionalEntry" component={EmotionalEntryScreen} />
        <Stack.Screen name="Problem" component={ProblemScreen} />
        <Stack.Screen name="DeeperTruth" component={DeeperTruthScreen} />
        <Stack.Screen name="Solution" component={SolutionScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="NameConfirmation" component={NameConfirmationScreen} />
        <Stack.Screen name="Intent" component={IntentScreen} />
        <Stack.Screen name="Moment" component={MomentScreen} />
        <Stack.Screen name="ExactTime" component={ExactTimeScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="PreparingSpace" component={PreparingSpaceScreen} />
        <Stack.Screen name="FirstPageReady" component={FirstPageReadyScreen} />
      </Stack.Navigator>
      </OnboardingFlowContext.Provider>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: "center",
    paddingVertical: 24,
  },
  scrollScreenContent: {
    justifyContent: "flex-start",
    paddingVertical: 12,
  },
  animatedContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  scrollAnimatedContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  storyScene: {
    flex: 1,
    justifyContent: "center",
  },
  storyAtmosphere: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  storyHaze: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
  },
  storyHazePrimary: {
    top: 72,
  },
  storyPanel: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: 34,
  },
  storyPanelPrimary: {
    width: 190,
    height: 142,
    top: 124,
    left: 24,
  },
  storyPanelSecondary: {
    width: 164,
    height: 118,
    bottom: 138,
    right: 28,
  },
  storyContent: {
    paddingTop: 44,
  },
  focusedStoryContent: {
    paddingTop: 18,
  },
  storyTitleWrap: {
    width: "100%",
    alignItems: "center",
    gap: 4,
  },
  focusedTitleWrap: {
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 34,
    lineHeight: 44,
    letterSpacing: -0.75,
    textAlign: "center",
    maxWidth: 308,
  },
  storyTitleTight: {
    maxWidth: 292,
  },
  storyNarrative: {
    alignItems: "center",
    gap: 18,
  },
  focusedNarrative: {
    gap: 16,
  },
  storyDivider: {
    marginTop: 4,
  },
  storyBody: {
    gap: 12,
    alignItems: "center",
  },
  focusedBodyPanel: {
    width: "100%",
    maxWidth: 324,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderRadius: 26,
    backgroundColor: "rgba(255, 252, 247, 0.66)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(118, 97, 77, 0.12)",
    gap: 14,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 27,
    textAlign: "center",
    maxWidth: 304,
  },
  focusedStoryText: {
    fontSize: 15,
    lineHeight: 25,
    maxWidth: 272,
  },
  focusedProblemTitle: {
    fontSize: 33,
    lineHeight: 41,
    maxWidth: 240,
    letterSpacing: -0.9,
  },
  focusedPivotTitle: {
    fontSize: 33,
    lineHeight: 41,
    maxWidth: 244,
    letterSpacing: -0.9,
  },
  storyLeadText: {
    fontSize: 18,
    lineHeight: 29,
  },
  storyAccentWrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 104,
    paddingTop: 10,
  },
  storyAccent: {
    width: 58,
    height: 2,
    borderRadius: 999,
    opacity: 0.62,
  },
  focusedAccent: {
    width: 74,
    opacity: 0.48,
  },
  focusedButton: {
    minWidth: 220,
    alignSelf: "center",
  },
  searchCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
  },
  selectionContent: {
    paddingTop: 12,
  },
  nameContent: {
    paddingTop: 24,
  },
  searchInput: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    fontSize: 16,
  },
  languageList: {
    gap: 14,
    paddingTop: 14,
  },
  inputCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
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
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  centeredCardText: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center",
  },
  nameConfirmationBody: {
    gap: 18,
  },
  preferenceHint: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    paddingTop: 10,
    paddingHorizontal: 18,
  },
  ritualWindowContent: {
    paddingTop: 2,
  },
  ritualWindowBody: {
    gap: 12,
  },
  ritualWindowFooter: {
    marginTop: 22,
    gap: 14,
  },
  ritualHint: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    paddingTop: 12,
    paddingHorizontal: 18,
  },
  exactTimeContent: {
    paddingTop: 18,
  },
  timeSummaryCard: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
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
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
  permissionContent: {
    paddingTop: 18,
  },
  permissionCard: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 28,
    gap: 14,
    alignItems: "center",
  },
  permissionTime: {
    fontSize: 28,
    lineHeight: 34,
    textAlign: "center",
  },
  permissionBody: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
  preparingContent: {
    paddingTop: 28,
  },
  preparingBody: {
    gap: 28,
    alignItems: "center",
  },
  preparingIndicatorWrap: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  preparingPaperStack: {
    position: "absolute",
    top: 80,
    alignItems: "center",
    justifyContent: "center",
    width: 220,
    height: 160,
  },
  preparingPaperLayer: {
    position: "absolute",
    width: 152,
    height: 112,
    borderRadius: 28,
    borderWidth: 1,
  },
  preparingPaperRear: {
    opacity: 0.46,
  },
  preparingPaperFront: {
    opacity: 0.72,
  },
  preparingOuterRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
  },
  preparingInnerRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  preparingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.82,
  },
  preparingCard: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 0,
  },
  preparingCardEyebrow: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  preparingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    paddingVertical: 12,
  },
  preparingRowPlaceholder: {
    minHeight: 46,
    opacity: 0.22,
  },
  preparingLabel: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  preparingValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "right",
  },
  preparingCopyWrap: {
    paddingHorizontal: 14,
    maxWidth: 332,
    alignItems: "center",
    gap: 12,
  },
  preparingProgressRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  preparingProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  preparingStatus: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
  preparingCopy: {
    fontSize: 15,
    lineHeight: 25,
    textAlign: "center",
  },
});

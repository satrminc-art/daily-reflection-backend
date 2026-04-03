import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import {
  Alert,
  Animated,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CalendarCard } from "@/components/CalendarCard";
import { EditorialHeader } from "@/components/EditorialHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ReflectionNoteCard } from "@/components/ReflectionNoteCard";
import { SecondaryButton } from "@/components/SecondaryButton";
import { UpgradeCard } from "@/components/premium/UpgradeCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import {
  triggerDailyEntryHaptic,
  triggerSoftConfirmationHaptic,
  triggerSoftSelectionHaptic,
} from "@/services/hapticsService";
import { getPremiumPromptCopy, shouldShowPremiumPrompt } from "@/services/premiumPromptService";
import { getReflectionEntryById, resolveReflectionTexts } from "@/services/reflectionService";
import { shareViewAsImage } from "@/services/shareService";
import { formatLongDate, getLocalISODate } from "@/utils/date";
import { canSaveAdditionalReflection } from "@/utils/membershipHelpers";
import { getEffectiveReflectionLanguages } from "@/utils/reflection";
import { palette } from "@/utils/theme";

type TodayOverlayStep = "late-open" | "upgrade-invite" | null;

export function TodayScreen() {
  const {
    appState,
    todayReady,
    colorScheme,
    todaysReflection,
    toggleFavorite,
    favorites,
    availableDates,
    getReflectionForDate,
    markActiveReflectionViewed,
    deferActiveReflectionForToday,
    markFreemiumUpgradePromptSeen,
    markPremiumPromptDismissed,
    markPremiumPromptOpened,
    markPremiumPromptShown,
  } = useAppContext();
  const navigation = useNavigation<any>();
  const membership = useMembership();
  const { locale, t, welcomeBack } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const shareRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [visibleDate, setVisibleDate] = useState<string | null>(todaysReflection?.date ?? null);
  const [overlayStep, setOverlayStep] = useState<TodayOverlayStep>(null);
  const [upgradeCardDismissed, setUpgradeCardDismissed] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const entryRevealOpacity = useRef(new Animated.Value(0)).current;
  const [notificationEntryTargetDateKey, setNotificationEntryTargetDateKey] = useState<string | null>(null);
  const [notificationEntrySegment, setNotificationEntrySegment] = useState<"morning" | "midday" | "evening">("morning");
  const [notificationEntryVisible, setNotificationEntryVisible] = useState(false);
  const hapticsEnabled = appState.preferences.hapticsEnabled && !appState.preferences.silentMode;

  useEffect(() => {
    if (todaysReflection?.date) {
      setVisibleDate(todaysReflection.date);
    }
  }, [todaysReflection?.date]);

  useFocusEffect(
    useCallback(() => {
      if (todaysReflection?.date) {
        setVisibleDate(todaysReflection.date);
      }
    }, [todaysReflection?.date]),
  );

  useEffect(() => {
    if (!appState.hasCompletedOnboarding || !appState.hasSeenTodayIntroOverlay || appState.viewedDates.length === 0) {
      return;
    }

    if (overlayStep) {
      return;
    }

    const activeDateKey = appState.activeReflectionDateKey;
    const isLateOpenCandidate =
      activeDateKey === todaysReflection?.date &&
      activeDateKey === getLocalISODate() &&
      !appState.activeReflectionViewedAtByDate[activeDateKey] &&
      !appState.lateOpenDeferredDates.includes(activeDateKey);

    if (isLateOpenCandidate) {
      setOverlayStep("late-open");
      return;
    }

    if (overlayStep === "late-open") {
      setOverlayStep(null);
    }
  }, [
    appState.activeReflectionDateKey,
    appState.activeReflectionViewedAtByDate,
    appState.hasCompletedOnboarding,
    appState.hasSeenTodayIntroOverlay,
    appState.lateOpenDeferredDates,
    appState.viewedDates.length,
    overlayStep,
    todaysReflection?.date,
  ]);

  useEffect(() => {
    function handleNotificationResponse(response: Notifications.NotificationResponse | null) {
      if (!response) {
        return;
      }

      const data = response.notification.request.content.data as
        | { source?: string; dateKey?: string; segment?: "morning" | "midday" | "evening" }
        | undefined;

      if (!data?.source?.startsWith("daily-reflection")) {
        return;
      }

      setNotificationEntryTargetDateKey(data.dateKey ?? appState.activeReflectionDateKey ?? getLocalISODate());
      setNotificationEntrySegment(data.segment ?? "morning");
      void Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
    }

    Notifications.getLastNotificationResponseAsync()
      .then(handleNotificationResponse)
      .catch(() => undefined);

    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    return () => {
      subscription.remove();
    };
  }, [appState.activeReflectionDateKey]);

  const timelineDates = useMemo(() => {
    return availableDates.length ? availableDates : todaysReflection?.date ? [todaysReflection.date] : [];
  }, [availableDates, todaysReflection?.date]);

  const currentDate = visibleDate ?? todaysReflection?.date ?? null;
  const currentReflection = currentDate ? getReflectionForDate(currentDate) : todaysReflection;
  const effectiveReflectionLanguages = useMemo(
    () =>
      getEffectiveReflectionLanguages({
        appLanguage: appState.preferredLanguage,
        reflectionLanguageMode: appState.reflectionLanguageMode,
        reflectionLanguage: appState.reflectionLanguage,
        reflectionLanguages: appState.reflectionLanguages,
        subscriptionModel: appState.subscriptionModel,
      }),
    [
      appState.preferredLanguage,
      appState.reflectionLanguage,
      appState.reflectionLanguageMode,
      appState.reflectionLanguages,
      appState.subscriptionModel,
    ],
  );
  const currentReflectionEntry = currentReflection ? getReflectionEntryById(currentReflection.id) : null;
  const reflectionTextOptions = useMemo(
    () => (currentReflectionEntry ? resolveReflectionTexts(currentReflectionEntry, effectiveReflectionLanguages) : []),
    [currentReflectionEntry, effectiveReflectionLanguages],
  );
  const selectedReflectionLanguage =
    (currentReflection?.date ? appState.quoteLanguageSelections[currentReflection.date] : null) ??
    reflectionTextOptions[0]?.requestedLanguage ??
    effectiveReflectionLanguages[0] ??
    "en";
  const activeReflectionTextOption =
    reflectionTextOptions.find((option) => option.requestedLanguage === selectedReflectionLanguage) ?? reflectionTextOptions[0] ?? null;
  const currentIndex = currentDate ? timelineDates.indexOf(currentDate) : -1;
  const canGoNewer = currentIndex > 0;
  const canGoOlder = currentIndex >= 0 && currentIndex < timelineDates.length - 1;
  const reengagementPrompt = useMemo(() => getPremiumPromptCopy("reengagement", appState.preferredLanguage), [appState.preferredLanguage]);
  const savePrompt = useMemo(() => getPremiumPromptCopy("save", appState.preferredLanguage), [appState.preferredLanguage]);
  const shouldShowReengagementPrompt =
    membership.currentPlanLabel === "Freemium" &&
    overlayStep === null &&
    !upgradeCardDismissed &&
    appState.hasSeenPostReflectionPremiumInvite &&
    appState.viewedDates.length >= 3 &&
    shouldShowPremiumPrompt({
      context: "reengagement",
      isPremium: false,
      hasCompletedOnboarding: appState.hasCompletedOnboarding,
      historyEntry: appState.premiumPromptHistory.reengagement,
    });

  useEffect(() => {
    if (!shouldShowReengagementPrompt) {
      return;
    }

    void markPremiumPromptShown("reengagement");
  }, [markPremiumPromptShown, shouldShowReengagementPrompt]);

  useEffect(() => {
    if (!currentReflection?.date || !notificationEntryTargetDateKey) {
      return;
    }

    if (currentReflection.date !== notificationEntryTargetDateKey) {
      return;
    }

    setNotificationEntryVisible(true);
    entryRevealOpacity.setValue(0);
    triggerDailyEntryHaptic(notificationEntrySegment, hapticsEnabled);

    Animated.sequence([
      Animated.delay(180),
      Animated.timing(entryRevealOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.delay(260),
      Animated.timing(entryRevealOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotificationEntryVisible(false);
      setNotificationEntryTargetDateKey(null);
      void markActiveReflectionViewed();
    });
  }, [
    currentReflection?.date,
    entryRevealOpacity,
    hapticsEnabled,
    markActiveReflectionViewed,
    notificationEntrySegment,
    notificationEntryTargetDateKey,
  ]);

  useEffect(() => {
    if (!currentReflection?.date) {
      return;
    }

    if (overlayStep !== null || notificationEntryVisible || notificationEntryTargetDateKey === currentReflection.date) {
      return;
    }

    if (appState.lateOpenDeferredDates.includes(currentReflection.date)) {
      return;
    }

    if (appState.activeReflectionViewedAtByDate[currentReflection.date]) {
      return;
    }

    void markActiveReflectionViewed();
  }, [
    currentReflection?.date,
    appState.activeReflectionViewedAtByDate,
    appState.lateOpenDeferredDates,
    markActiveReflectionViewed,
    notificationEntryTargetDateKey,
    notificationEntryVisible,
    overlayStep,
  ]);

  useEffect(() => {
    if (!timelineDates.length) {
      return;
    }

    if (!currentDate || !timelineDates.includes(currentDate)) {
      setVisibleDate(timelineDates[0]);
    }
  }, [currentDate, timelineDates]);

  function settleCard() {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
        speed: 16,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function transitionToDate(nextDate: string, direction: "older" | "newer") {
    const exitTo = direction === "older" ? -96 : 96;
    const entryFrom = direction === "older" ? 92 : -92;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: exitTo,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.55,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisibleDate(nextDate);
      translateX.setValue(entryFrom);
      opacity.setValue(0.55);
      settleCard();
    });
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 18,
        onPanResponderMove: (_, gestureState) => {
          translateX.setValue(gestureState.dx * 0.16);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -70 && canGoOlder && currentIndex >= 0) {
            transitionToDate(timelineDates[currentIndex + 1], "older");
            return;
          }

          if (gestureState.dx > 70 && canGoNewer && currentIndex >= 0) {
            transitionToDate(timelineDates[currentIndex - 1], "newer");
            return;
          }

          settleCard();
        },
        onPanResponderTerminate: settleCard,
      }),
    [canGoNewer, canGoOlder, currentIndex, timelineDates, translateX, opacity],
  );

  if (!todayReady) {
    return (
      <ScreenContainer scroll>
        <EditorialHeader title={t("today.title")} subtitle={t("today.preparing")} />
        <View style={[styles.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.placeholderLineShort, { backgroundColor: colors.border }]} />
          <View style={[styles.placeholderLineLong, { backgroundColor: colors.border }]} />
          <View style={[styles.placeholderLineMedium, { backgroundColor: colors.border }]} />
        </View>
      </ScreenContainer>
    );
  }

  if (!currentReflection) {
    return (
      <ScreenContainer scroll>
        <EditorialHeader title={t("today.title")} subtitle={t("today.preparing")} />
      </ScreenContainer>
    );
  }

  const activeReflection = currentReflection;

  async function handleShare() {
    try {
      setIsSharing(true);
      await shareViewAsImage(shareRef, {
        dialogTitle: t("today.shareDialogTitle"),
        message: t("today.shareFallbackMessage"),
      });
    } catch {
      Alert.alert(t("today.shareUnavailableTitle"), t("today.shareUnavailableBody"));
    } finally {
      setIsSharing(false);
    }
  }

  async function handleLateOpenContinue() {
    triggerSoftConfirmationHaptic(hapticsEnabled);
    await markActiveReflectionViewed();
    setOverlayStep(null);
  }

  async function handleLateOpenLater() {
    triggerSoftSelectionHaptic(hapticsEnabled);
    await deferActiveReflectionForToday();
    setOverlayStep(null);
  }

  async function handleToggleFavorite() {
    const canSave = canSaveAdditionalReflection(
      membership.effectiveEntitlement,
      favorites.length,
      activeReflection.isFavorite,
    );

    if (!canSave) {
      Alert.alert(t("today.saveLimitTitle"), t("today.saveLimitBody"));
      return;
    }

    await toggleFavorite(activeReflection.id, activeReflection.date);

    if (
      membership.currentPlanLabel === "Freemium" &&
      !activeReflection.isFavorite &&
      !appState.hasSeenPostReflectionPremiumInvite &&
      shouldShowPremiumPrompt({
        context: "save",
        isPremium: false,
        hasCompletedOnboarding: appState.hasCompletedOnboarding,
        historyEntry: appState.premiumPromptHistory.save,
      })
    ) {
      await markPremiumPromptShown("save");
      setOverlayStep("upgrade-invite");
    }
  }

  async function handleUpgradeInviteDismiss() {
    triggerSoftSelectionHaptic(hapticsEnabled);
    await markFreemiumUpgradePromptSeen({ postReflection: true });
    await markPremiumPromptDismissed("save");
    setOverlayStep(null);
  }

  async function handleUpgradeInviteOpen() {
    triggerSoftConfirmationHaptic(hapticsEnabled);
    await markFreemiumUpgradePromptSeen({ postReflection: true });
    await markPremiumPromptOpened("save");
    setOverlayStep(null);
    navigation.navigate("Membership");
  }

  async function handleGentleUpgradeOpen() {
    triggerSoftSelectionHaptic(hapticsEnabled);
    await markFreemiumUpgradePromptSeen();
    await markPremiumPromptOpened("reengagement");
    setUpgradeCardDismissed(true);
    navigation.navigate("Membership");
  }

  async function handleGentleUpgradeDismiss() {
    triggerSoftSelectionHaptic(hapticsEnabled);
    await markFreemiumUpgradePromptSeen();
    await markPremiumPromptDismissed("reengagement");
    setUpgradeCardDismissed(true);
  }

  return (
    <ScreenContainer scroll>
      <EditorialHeader
        title={t("today.title")}
        subtitle={welcomeBack(appState.userName)}
      />

      <View style={styles.pageStage}>
        <View style={[styles.pageShadowBack, { backgroundColor: colors.accentSoft, borderColor: colors.border }]} />
        <View style={[styles.pageShadowMid, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]} />
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.pageFront,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
        >
          <CalendarCard
            ref={shareRef}
            reflection={currentReflection}
            reflectionText={activeReflectionTextOption?.text ?? currentReflection.text}
            showSourceType={false}
            metadataSeparator="·"
          />
          {notificationEntryVisible ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.entryReveal,
                {
                  opacity: entryRevealOpacity,
                  backgroundColor: colors.overlayBackdrop,
                },
              ]}
            >
              <Text style={[styles.entryRevealText, { color: colors.primaryText, fontFamily: typography.display }]}>
                {t("today.notificationEntryLine")}
              </Text>
            </Animated.View>
          ) : null}
        </Animated.View>
      </View>

      <View style={styles.captionRow}>
        <Text style={[styles.captionDate, { color: colors.secondaryText }]}>
          {formatLongDate(currentReflection.date, locale)}
        </Text>
        <Text style={[styles.captionHint, { color: colors.tertiaryText }]}>
          {canGoNewer || canGoOlder
            ? t("today.swipeHint")
            : t("today.tomorrowHint")}
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          label={activeReflection.isFavorite ? t("today.kept") : t("today.keep")}
          onPress={() => {
            handleToggleFavorite().catch((error) => {
              console.warn("Failed to update kept reflection", error);
            });
          }}
          style={styles.actionButtonPrimary}
        />
        <SecondaryButton
          label={isSharing ? t("common.preparing") : t("today.share")}
          onPress={handleShare}
          variant="soft"
          style={styles.actionButtonSecondary}
          disabled={isSharing}
        />
      </View>

      <Text style={[styles.helperText, { color: colors.tertiaryText }]}>{t("today.helper")}</Text>

      {shouldShowReengagementPrompt ? (
        <UpgradeCard
          title={reengagementPrompt.title}
          body={reengagementPrompt.body}
          actionLabel={reengagementPrompt.cta}
          secondaryLabel={reengagementPrompt.secondary}
          onPress={() => void handleGentleUpgradeOpen()}
          onSecondaryPress={() => void handleGentleUpgradeDismiss()}
        />
      ) : null}

      <ReflectionNoteCard
        date={activeReflection.date}
        reflectionId={activeReflection.id}
        isSaved={activeReflection.isFavorite}
        reflectionText={activeReflectionTextOption?.text ?? activeReflection.text}
        reflectionLanguage={activeReflectionTextOption?.requestedLanguage ?? selectedReflectionLanguage}
      />

      <Modal visible={overlayStep !== null} transparent animationType="fade" statusBarTranslucent>
        <View style={[styles.overlayBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <View
            style={[
              styles.overlayCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                shadowColor: colors.shadow,
              },
            ]}
          >
            <View style={[styles.overlayBinding, { backgroundColor: colors.binding }]} />

            {overlayStep === "late-open" ? (
              <>
                <Text style={[styles.overlayEyebrow, { color: colors.accent }]}>{t("today.eyebrow")}</Text>
                <Text style={[styles.overlayTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                  {t("today.lateOpenTitle")}
                </Text>
                <Text style={[styles.overlayBody, { color: colors.secondaryText }]}>
                  {t("today.lateOpenBody")}
                </Text>
                <View style={styles.overlayFooter}>
                  <PrimaryButton label={t("today.lateOpenPrimary")} onPress={handleLateOpenContinue} />
                  <SecondaryButton
                    label={t("today.lateOpenSecondary")}
                    onPress={handleLateOpenLater}
                    variant="text"
                  />
                </View>
              </>
            ) : overlayStep === "upgrade-invite" ? (
              <>
                <Text style={[styles.overlayEyebrow, { color: colors.accent }]}>{t("membership.planPremium")}</Text>
                <Text style={[styles.overlayTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                  {savePrompt.title}
                </Text>
                <Text style={[styles.overlayBody, { color: colors.secondaryText }]}>
                  {savePrompt.body}
                </Text>
                <View style={styles.overlayFooter}>
                  <PrimaryButton label={savePrompt.cta} onPress={() => void handleUpgradeInviteOpen()} />
                  <SecondaryButton
                    label={savePrompt.secondary ?? t("common.notNow")}
                    onPress={() => void handleUpgradeInviteDismiss()}
                    variant="text"
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageStage: {
    marginBottom: 20,
    paddingTop: 10,
    paddingBottom: 18,
  },
  pageShadowBack: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 34,
    bottom: 0,
    borderWidth: 1,
    borderRadius: 32,
    opacity: 0.7,
  },
  pageShadowMid: {
    position: "absolute",
    left: 9,
    right: 9,
    top: 18,
    bottom: 8,
    borderWidth: 1,
    borderRadius: 32,
    opacity: 0.85,
  },
  pageFront: {
    position: "relative",
  },
  entryReveal: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    paddingHorizontal: 28,
  },
  entryRevealText: {
    fontSize: 26,
    lineHeight: 33,
    textAlign: "center",
    letterSpacing: -0.35,
  },
  captionRow: {
    gap: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  captionDate: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  captionHint: {
    fontSize: 13,
    width: "100%",
    textAlign: "center",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
    width: "100%",
    alignSelf: "center",
    maxWidth: 348,
  },
  actionButtonPrimary: {
    minWidth: 136,
    flexGrow: 1.08,
    flexBasis: 0,
    maxWidth: 196,
  },
  actionButtonSecondary: {
    minWidth: 128,
    flexGrow: 0.92,
    flexBasis: 0,
    maxWidth: 172,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 22,
  },
  upgradeCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
    marginBottom: 18,
  },
  upgradeTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  upgradeBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  upgradeActions: {
    gap: 10,
    marginTop: 4,
  },
  overlayBackdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  overlayCard: {
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 22,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
  },
  overlayBinding: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  overlayEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 12,
  },
  overlayTitle: {
    fontSize: 31,
    lineHeight: 39,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  overlayBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 12,
  },
  overlayFooter: {
    marginTop: 24,
    gap: 12,
  },
  placeholderCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    gap: 12,
  },
  placeholderLineShort: {
    width: "36%",
    height: 10,
    borderRadius: 999,
    opacity: 0.55,
  },
  placeholderLineLong: {
    width: "92%",
    height: 14,
    borderRadius: 999,
    opacity: 0.45,
  },
  placeholderLineMedium: {
    width: "74%",
    height: 14,
    borderRadius: 999,
    opacity: 0.4,
  },
});

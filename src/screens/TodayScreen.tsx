import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { AdaptiveTimePicker } from "@/components/AdaptiveTimePicker";
import { CalendarCard } from "@/components/CalendarCard";
import { EditorialHeader } from "@/components/EditorialHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ReflectionNoteCard } from "@/components/ReflectionNoteCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { shareViewAsImage } from "@/services/shareService";
import { formatLongDate, formatTimeLabel } from "@/utils/date";
import { canSaveAdditionalReflection } from "@/utils/membershipHelpers";
import { palette } from "@/utils/theme";

type TodayOverlayStep = "intro" | "notification-time" | "notification-permission" | null;

export function TodayScreen() {
  const {
    appState,
    colorScheme,
    todaysReflection,
    toggleFavorite,
    favorites,
    availableDates,
    getReflectionForDate,
    markTodayIntroOverlaySeen,
    updateNotificationTime,
  } = useAppContext();
  const membership = useMembership();
  const { locale, t, notificationReadyBody, notificationReadyTitle, permissionScheduleBody, welcomeBack } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const shareRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isSchedulingNotification, setIsSchedulingNotification] = useState(false);
  const [visibleDate, setVisibleDate] = useState<string | null>(todaysReflection?.date ?? null);
  const [overlayStep, setOverlayStep] = useState<TodayOverlayStep>(null);
  const [notificationDate, setNotificationDate] = useState(() => {
    const value = new Date();
    value.setHours(appState.preferences.notificationTime.hour, appState.preferences.notificationTime.minute, 0, 0);
    return value;
  });
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

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
    setNotificationDate((current) => {
      const next = new Date(current);
      next.setHours(appState.preferences.notificationTime.hour, appState.preferences.notificationTime.minute, 0, 0);
      return next;
    });
  }, [appState.preferences.notificationTime.hour, appState.preferences.notificationTime.minute]);

  useEffect(() => {
    if (appState.hasCompletedOnboarding && !appState.hasSeenTodayIntroOverlay) {
      setOverlayStep("intro");
    }
  }, [appState.hasCompletedOnboarding, appState.hasSeenTodayIntroOverlay]);

  const timelineDates = useMemo(() => {
    return availableDates.length ? availableDates : todaysReflection?.date ? [todaysReflection.date] : [];
  }, [availableDates, todaysReflection?.date]);

  const currentDate = visibleDate ?? todaysReflection?.date ?? null;
  const currentReflection = currentDate ? getReflectionForDate(currentDate) : todaysReflection;
  const currentIndex = currentDate ? timelineDates.indexOf(currentDate) : -1;
  const canGoNewer = currentIndex > 0;
  const canGoOlder = currentIndex >= 0 && currentIndex < timelineDates.length - 1;

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

  async function handleIntroContinue() {
    await markTodayIntroOverlaySeen();
    setOverlayStep("notification-time");
  }

  async function handleNotificationTimeContinue() {
    await updateNotificationTime(
      {
        hour: notificationDate.getHours(),
        minute: notificationDate.getMinutes(),
      },
      { schedule: false },
    );
    setOverlayStep("notification-permission");
  }

  async function handleAllowNotifications() {
    try {
      setIsSchedulingNotification(true);
      await updateNotificationTime(
        {
          hour: notificationDate.getHours(),
          minute: notificationDate.getMinutes(),
        },
        {
          requestPermission: true,
          notificationContent: {
            title: notificationReadyTitle(appState.userName),
            body: notificationReadyBody(),
          },
        },
      );
    } finally {
      setIsSchedulingNotification(false);
      setOverlayStep(null);
    }
  }

  async function handleSkipNotifications() {
    await updateNotificationTime(
      {
        hour: notificationDate.getHours(),
        minute: notificationDate.getMinutes(),
      },
      { schedule: false },
    );
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
          <CalendarCard ref={shareRef} reflection={currentReflection} />
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
          variant="secondary"
          style={styles.actionButton}
        />
        <PrimaryButton
          label={isSharing ? t("common.preparing") : t("today.share")}
          onPress={handleShare}
          variant="ghost"
          style={styles.actionButton}
          disabled={isSharing}
        />
      </View>

      <Text style={[styles.helperText, { color: colors.tertiaryText }]}>{t("today.helper")}</Text>

      <ReflectionNoteCard date={activeReflection.date} reflectionId={activeReflection.id} isSaved={activeReflection.isFavorite} />

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

            {overlayStep === "intro" ? (
              <>
                    <Text style={[styles.overlayTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                  {t("onboarding.introTitle")}
                </Text>
                <View style={styles.overlayFooter}>
                  <PrimaryButton label={t("common.continue")} onPress={handleIntroContinue} />
                </View>
              </>
            ) : null}

            {overlayStep === "notification-time" ? (
              <>
                <Text style={[styles.overlayEyebrow, { color: colors.accent }]}>{t("settings.notificationTime")}</Text>
                <Text style={[styles.overlayTitle, { color: colors.primaryText }]}>{t("onboarding.notificationTimeTitle")}</Text>
                <Text style={[styles.overlayBody, { color: colors.secondaryText }]}>{t("onboarding.notificationTimeBody")}</Text>
                <View style={[styles.timeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.timeLabel, { color: colors.secondaryText }]}>
                    {formatTimeLabel(notificationDate.getHours(), notificationDate.getMinutes(), locale)}
                  </Text>
                  <AdaptiveTimePicker value={notificationDate} onChange={setNotificationDate} />
                </View>
                <View style={styles.overlayFooter}>
                  <PrimaryButton label={t("common.continue")} onPress={handleNotificationTimeContinue} />
                </View>
              </>
            ) : null}

            {overlayStep === "notification-permission" ? (
              <>
                <Text style={[styles.overlayEyebrow, { color: colors.accent }]}>{t("tabs.today")}</Text>
                <Text style={[styles.overlayTitle, { color: colors.primaryText }]}>{t("onboarding.notificationPermissionTitle")}</Text>
                <Text style={[styles.overlayBody, { color: colors.secondaryText }]}>
                  {permissionScheduleBody(formatTimeLabel(notificationDate.getHours(), notificationDate.getMinutes(), locale))}
                </Text>
                <View style={styles.overlayFooter}>
                  <PrimaryButton
                    label={isSchedulingNotification ? t("common.preparing") : t("common.allowNotifications")}
                    onPress={handleAllowNotifications}
                    disabled={isSchedulingNotification}
                  />
                  <PrimaryButton label={t("common.notNow")} onPress={handleSkipNotifications} variant="ghost" />
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
  captionRow: {
    gap: 8,
    marginBottom: 24,
    alignItems: "center",
  },
  captionDate: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: Platform.OS === "android" ? 1.1 : 1.4,
  },
  captionHint: {
    fontSize: 13,
    maxWidth: 260,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    minWidth: 112,
    width: "auto",
  },
  helperText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 22,
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
    letterSpacing: Platform.OS === "android" ? -0.22 : -0.4,
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
  timeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
    marginTop: 20,
  },
  timeLabel: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
});

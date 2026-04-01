import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { fetchReflectionFollowUp, ReflectionFollowUpError } from "@/services/followUpService";
import { getQuietNoteColor } from "@/theme/paperColor";
import { resolvePageStyleSystem } from "@/theme/pageStyle";
import { StoredReflectionFollowUp } from "@/types/ai";
import { getNoteMaxLengthForEntitlement } from "@/utils/membershipHelpers";
import { SupportedLanguage } from "@/types/reflection";
import { palette } from "@/utils/theme";

interface Props {
  date: string;
  reflectionId: string;
  isSaved: boolean;
  reflectionText: string;
  reflectionLanguage: SupportedLanguage;
}

type FollowUpUiState = "idle" | "loading" | "success" | "empty" | "error";

const FOLLOW_UP_PANEL_STATES: FollowUpUiState[] = ["loading", "success", "empty", "error"];

function DeepenImpulseSuccessCard({
  followUp,
  colors,
  typography,
}: {
  followUp: StoredReflectionFollowUp;
  colors: (typeof palette)[keyof typeof palette];
  typography: ReturnType<typeof useTypography>;
}) {
  const { t } = useAppStrings();
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    titleOpacity.setValue(0);
    titleTranslateY.setValue(8);
    textOpacity.setValue(0);
    textTranslateY.setValue(12);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 460,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [followUp.generatedAt, followUp.text, textOpacity, textTranslateY, titleOpacity, titleTranslateY]);

  return (
    <View style={[styles.followUpCard, { borderColor: colors.border, backgroundColor: colors.paperRaised }]}>
      <Animated.Text
        style={[
          styles.followUpTitle,
          {
            color: colors.secondaryText,
            fontFamily: typography.meta,
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        {t("today.followUpTitle")}
      </Animated.Text>
      <Animated.Text
        style={[
          styles.followUpPrompt,
          {
            color: colors.primaryText,
            fontFamily: typography.body,
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        {followUp.text}
      </Animated.Text>
    </View>
  );
}

export function ReflectionNoteCard({ date, reflectionId, isSaved, reflectionText, reflectionLanguage }: Props) {
  const {
    colorScheme,
    appState,
    getReflectionForDate,
    getReflectionNote,
    getReflectionFollowUp,
    updateReflectionNote,
    updateReflectionFollowUp,
    personalization,
  } = useAppContext();
  const { t } = useAppStrings();
  const membership = useMembership();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const pageStyle = resolvePageStyleSystem(personalization.pageStyle.id);
  const isDarkMode = colorScheme === "dark";
  const reflection = getReflectionForDate(date);
  const noteBackgroundColor = membership.hasFeature("premium-paper-colors")
    ? getQuietNoteColor(appState.preferences.noteBackgroundColor, "#FFFFFF")
    : "#FFFFFF";
  const persistedNote = getReflectionNote(date, reflectionId);
  const persistedFollowUp = getReflectionFollowUp(date, reflectionId);
  const [draft, setDraft] = useState(persistedNote);
  const [followUp, setFollowUp] = useState(persistedFollowUp);
  const [followUpState, setFollowUpState] = useState<FollowUpUiState>(
    persistedFollowUp?.text.trim() ? "success" : "idle",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestDraftRef = useRef(persistedNote);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const followUpPanelOpacity = useRef(new Animated.Value(persistedFollowUp?.text.trim() ? 1 : 0)).current;
  const followUpPanelTranslateY = useRef(new Animated.Value(persistedFollowUp?.text.trim() ? 0 : 10)).current;
  const loadingPulse = useRef(new Animated.Value(0.45)).current;
  const canEditNote = membership.hasFeature("extended-notes") || isSaved;
  const noteMaxLength = getNoteMaxLengthForEntitlement(membership.effectiveEntitlement);
  const helperText = !canEditNote ? t("today.noteLockedBody") : !membership.hasFeature("extended-notes") ? t("today.noteLimitHint") : null;
  const resolvedNoteInputBackground = isDarkMode
    ? "#2a2a2a"
    : canEditNote
      ? noteBackgroundColor
      : colors.paperMuted;
  const resolvedNoteInputTextColor = isDarkMode ? "#EAE3DA" : colors.primaryText;
  const resolvedNotePlaceholderColor = isDarkMode ? "#8a8a8a" : colors.tertiaryText;
  const resolvedNoteInputBorder = isDarkMode ? "rgba(255,255,255,0.08)" : colors.border;
  const darkNoteInputDepthStyle = isDarkMode
    ? {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.16,
        shadowRadius: 2,
        elevation: 1,
      }
    : null;

  useEffect(() => {
    setDraft(persistedNote);
    latestDraftRef.current = persistedNote;
  }, [persistedNote, date, reflectionId]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setFollowUp(persistedFollowUp);
    setErrorMessage(null);
    setFollowUpState(persistedFollowUp?.text.trim() ? "success" : "idle");
  }, [persistedFollowUp, date, reflectionId]);

  useEffect(() => {
    const shouldShowPanel = FOLLOW_UP_PANEL_STATES.includes(followUpState);

    Animated.parallel([
      Animated.timing(followUpPanelOpacity, {
        toValue: shouldShowPanel ? 1 : 0,
        duration: shouldShowPanel ? 460 : 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(followUpPanelTranslateY, {
        toValue: shouldShowPanel ? 0 : 10,
        duration: shouldShowPanel ? 520 : 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [followUpPanelOpacity, followUpPanelTranslateY, followUpState]);

  useEffect(() => {
    if (followUpState !== "loading") {
      loadingPulse.stopAnimation();
      loadingPulse.setValue(0.45);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(loadingPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(loadingPulse, {
          toValue: 0.45,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [followUpState, loadingPulse]);

  async function persistNote(nextValue: string) {
    latestDraftRef.current = nextValue;
    await updateReflectionNote(date, reflectionId, nextValue);
  }

  useEffect(() => {
    if (!canEditNote || draft === persistedNote) {
      return;
    }

    if (pendingSaveRef.current) {
      clearTimeout(pendingSaveRef.current);
    }

    pendingSaveRef.current = setTimeout(() => {
      persistNote(draft).catch((error) => {
        console.warn("Failed to save reflection note", error);
      });
      pendingSaveRef.current = null;
    }, 500);

    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
        pendingSaveRef.current = null;
      }
    };
  }, [canEditNote, draft, persistedNote, date, reflectionId]);

  useEffect(() => {
    return () => {
      if (pendingSaveRef.current) {
        clearTimeout(pendingSaveRef.current);
      }

      if (canEditNote && latestDraftRef.current !== persistedNote) {
        updateReflectionNote(date, reflectionId, latestDraftRef.current).catch((error) => {
          console.warn("Failed to flush reflection note", error);
        });
      }
    };
  }, [canEditNote, date, persistedNote, reflectionId, updateReflectionNote]);

  async function handleGenerateFollowUp() {
    const trimmedNote = latestDraftRef.current.trim();
    if (!trimmedNote || isGenerating) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsGenerating(true);
    setErrorMessage(null);
    setFollowUpState("loading");

    if (__DEV__) {
      console.info("[followUp] ui:start", {
        reflectionId,
        date,
        noteLength: trimmedNote.length,
      });
    }

    try {
      const result = await fetchReflectionFollowUp({
        reflectionId,
        reflectionText,
        userNote: trimmedNote,
        category: reflection.category,
        appLanguage: appState.preferredLanguage ?? "en",
        reflectionLanguage,
        entitlement: membership.effectiveEntitlement,
        userId: appState.localUserId,
      });

      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        return;
      }

      if (!result.text.trim()) {
        setFollowUpState("empty");
        setErrorMessage(t("today.followUpEmpty"));
        return;
      }

      const nextFollowUp = {
        ...result,
        reflectionId,
        date,
      } as const;

      setFollowUp(nextFollowUp);
      setFollowUpState("success");
      await updateReflectionFollowUp(date, reflectionId, nextFollowUp);

      if (__DEV__) {
        console.info("[followUp] ui:success", {
          reflectionId,
          date,
          textLength: result.text.length,
          model: result.model,
        });
      }
    } catch (error) {
      if (!isMountedRef.current || requestIdRef.current !== requestId) {
        return;
      }

      setFollowUpState(
        error instanceof ReflectionFollowUpError && error.code === "empty_response" ? "empty" : "error",
      );

      if (__DEV__) {
        console.warn("[followUp] ui:error", error);
      }

      if (error instanceof ReflectionFollowUpError && error.code === "daily_limit_reached") {
        setErrorMessage(t("today.followUpLimitBody"));
      } else if (error instanceof ReflectionFollowUpError && error.code === "empty_response") {
        setErrorMessage(t("today.followUpEmpty"));
      } else {
        setErrorMessage(t("today.followUpError"));
      }
    } finally {
      if (isMountedRef.current && requestIdRef.current === requestId) {
        setIsGenerating(false);
      }
    }
  }

  const followUpButtonDisabled = !latestDraftRef.current.trim() || isGenerating;
  const shouldShowFollowUpPanel = FOLLOW_UP_PANEL_STATES.includes(followUpState);
  const loadingLabel = t("today.followUpLoading");
  const followUpHelper = t("today.followUpHelper");
  const retryLabel = t("today.followUpRetry");
  const followUpButtonLabel = isGenerating ? loadingLabel : t("today.followUpAction");
  const loadingLineStyle = useMemo(
    () => ({
      opacity: loadingPulse,
      transform: [
        {
          scaleX: loadingPulse.interpolate({
            inputRange: [0.45, 1],
            outputRange: [0.94, 1.04],
          }),
        },
      ],
    }),
    [loadingPulse],
  );

  return (
    <View
      style={[
        styles.noteCard,
        pageStyle.noteVariant === "editorial" ? styles.noteCardEditorial : null,
        pageStyle.noteVariant === "ledger" ? styles.noteCardLedger : null,
        { backgroundColor: colors.paperSurface, borderColor: colors.border },
      ]}
    >
      <Text
        style={[
          styles.noteTitle,
          pageStyle.noteVariant === "editorial" ? styles.noteTitleEditorial : null,
          pageStyle.noteVariant === "ledger" ? styles.noteTitleLedger : null,
          { color: colors.secondaryText, fontFamily: typography.meta },
        ]}
      >
        {t("today.noteTitle")}
      </Text>
      <TextInput
        value={draft}
        onChangeText={(nextValue) => {
          latestDraftRef.current = nextValue;
          if (errorMessage) {
            setErrorMessage(null);
          }
          if (followUpState === "error" || followUpState === "empty") {
            setFollowUpState(followUp?.text.trim() ? "success" : "idle");
          }
          setDraft(nextValue);
        }}
        onBlur={() => {
          if (!canEditNote) {
            return;
          }
          persistNote(latestDraftRef.current).catch((error) => {
            console.warn("Failed to save reflection note", error);
          });
        }}
        placeholder={t("today.notePlaceholder")}
        placeholderTextColor={resolvedNotePlaceholderColor}
        multiline
        editable={canEditNote}
        maxLength={noteMaxLength}
        textAlignVertical="top"
        selectionColor={colors.accent}
        style={[
          styles.noteInput,
          pageStyle.noteVariant === "editorial" ? styles.noteInputEditorial : null,
          pageStyle.noteVariant === "ledger" ? styles.noteInputLedger : null,
          {
            color: resolvedNoteInputTextColor,
            borderColor: resolvedNoteInputBorder,
            backgroundColor: resolvedNoteInputBackground,
            fontFamily: typography.body,
          },
          darkNoteInputDepthStyle,
        ]}
      />
      {helperText ? (
        <Text style={[styles.noteHint, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
          {helperText}
        </Text>
      ) : null}
      <View style={styles.followUpWrap}>
        <View style={styles.followUpActionColumn}>
          <Pressable
            accessibilityRole="button"
            onPress={handleGenerateFollowUp}
            disabled={followUpButtonDisabled}
            style={({ pressed }) => [
              styles.followUpButton,
              {
                borderColor: colors.border,
                backgroundColor: followUpButtonDisabled ? colors.paperMuted : colors.paperRaised,
                opacity: pressed && !followUpButtonDisabled ? 0.86 : 1,
                transform: [{ scale: pressed && !followUpButtonDisabled ? 0.985 : 1 }],
              },
            ]}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={colors.secondaryText} style={styles.followUpButtonSpinner} />
            ) : null}
            <Text
              style={[
                styles.followUpButtonText,
                {
                  color: followUpButtonDisabled ? colors.tertiaryText : colors.primaryText,
                  fontFamily: typography.action,
                },
              ]}
            >
              {followUpButtonLabel}
            </Text>
          </Pressable>

          {!shouldShowFollowUpPanel && latestDraftRef.current.trim() ? (
            <Text style={[styles.followUpHelper, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
              {followUpHelper}
            </Text>
          ) : null}
        </View>

        {shouldShowFollowUpPanel ? (
          <Animated.View
            style={[
              styles.followUpPanel,
              {
                opacity: followUpPanelOpacity,
                transform: [{ translateY: followUpPanelTranslateY }],
              },
            ]}
          >
            {followUpState === "loading" ? (
              <View style={[styles.followUpCard, { borderColor: colors.border, backgroundColor: colors.paperRaised }]}>
                <Text style={[styles.followUpTitle, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                  {t("today.followUpTitle")}
                </Text>
                <Text style={[styles.noteHint, styles.followUpLoadingText, { color: colors.primaryText, fontFamily: typography.body }]}>
                  {loadingLabel}
                </Text>
                <Animated.View
                  style={[
                    styles.followUpLoadingLine,
                    loadingLineStyle,
                    { backgroundColor: isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(78, 65, 56, 0.12)" },
                  ]}
                />
              </View>
            ) : null}

            {(followUpState === "error" || followUpState === "empty") && errorMessage ? (
              <View style={[styles.followUpCard, styles.followUpFeedbackCard, { borderColor: colors.border, backgroundColor: colors.paperRaised }]}>
                <Text style={[styles.followUpTitle, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                  {t("today.followUpTitle")}
                </Text>
                <Text style={[styles.noteHint, styles.followUpFeedbackText, { color: colors.primaryText, fontFamily: typography.body }]}>
                  {errorMessage}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleGenerateFollowUp}
                  disabled={isGenerating}
                  style={({ pressed }) => [
                    styles.followUpRetryButton,
                    {
                      opacity: pressed && !isGenerating ? 0.82 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.followUpRetryText,
                      {
                        color: colors.secondaryText,
                        fontFamily: typography.action,
                      },
                    ]}
                  >
                    {retryLabel}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {followUpState === "success" && followUp?.text.trim() ? (
              <DeepenImpulseSuccessCard followUp={followUp} colors={colors} typography={typography} />
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noteCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  noteCardEditorial: {
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  noteCardLedger: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  noteTitleEditorial: {
    paddingBottom: 8,
  },
  noteTitleLedger: {
    paddingHorizontal: 2,
  },
  noteInput: {
    minHeight: 132,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 13,
    lineHeight: 22,
  },
  noteInputEditorial: {
    borderRadius: 18,
    minHeight: 144,
  },
  noteInputLedger: {
    borderRadius: 18,
    minHeight: 128,
  },
  noteHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  followUpWrap: {
    gap: 12,
  },
  followUpActionColumn: {
    gap: 8,
  },
  followUpButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  followUpButtonSpinner: {
    marginRight: 8,
  },
  followUpButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  followUpHelper: {
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 280,
  },
  followUpPanel: {
    gap: 10,
  },
  followUpCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  followUpTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  followUpPrompt: {
    fontSize: 14,
    lineHeight: 22,
  },
  followUpLoadingText: {
    maxWidth: 260,
  },
  followUpLoadingLine: {
    width: 96,
    height: 3,
    borderRadius: 999,
  },
  followUpFeedbackCard: {
    gap: 12,
  },
  followUpFeedbackText: {
    maxWidth: 280,
  },
  followUpRetryButton: {
    alignSelf: "flex-start",
    paddingVertical: 2,
  },
  followUpRetryText: {
    fontSize: 12,
    lineHeight: 18,
  },
});

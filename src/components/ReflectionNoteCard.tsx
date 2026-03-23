import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { fetchReflectionFollowUp, ReflectionFollowUpError } from "@/services/followUpService";
import { getQuietNoteColor } from "@/theme/paperColor";
import { resolvePageStyleSystem } from "@/theme/pageStyle";
import { getNoteMaxLengthForEntitlement } from "@/utils/membershipHelpers";
import { palette } from "@/utils/theme";

interface Props {
  date: string;
  reflectionId: string;
  isSaved: boolean;
}

export function ReflectionNoteCard({ date, reflectionId, isSaved }: Props) {
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
  const reflection = getReflectionForDate(date);
  const noteBackgroundColor = membership.hasFeature("premium-paper-colors")
    ? getQuietNoteColor(appState.preferences.noteBackgroundColor, "#FFFFFF")
    : "#FFFFFF";
  const persistedNote = getReflectionNote(date, reflectionId);
  const persistedFollowUp = getReflectionFollowUp(date, reflectionId);
  const [draft, setDraft] = useState(persistedNote);
  const [followUp, setFollowUp] = useState(persistedFollowUp);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestDraftRef = useRef(persistedNote);
  const pendingSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canEditNote = membership.hasFeature("extended-notes") || isSaved;
  const noteMaxLength = getNoteMaxLengthForEntitlement(membership.effectiveEntitlement);
  const helperText = !canEditNote ? t("today.noteLockedBody") : !membership.hasFeature("extended-notes") ? t("today.noteLimitHint") : null;

  useEffect(() => {
    setDraft(persistedNote);
    latestDraftRef.current = persistedNote;
  }, [persistedNote, date, reflectionId]);

  useEffect(() => {
    setFollowUp(persistedFollowUp);
    setErrorMessage(null);
  }, [persistedFollowUp, date, reflectionId]);

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

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await fetchReflectionFollowUp({
        reflectionId,
        reflectionText: reflection.text,
        userNote: trimmedNote,
        category: reflection.category,
        appLanguage: appState.preferredLanguage ?? "en",
        reflectionLanguage: appState.quoteLanguageSelections[date] ?? appState.preferredLanguage ?? "en",
        entitlement: membership.effectiveEntitlement,
      });

      const nextFollowUp = {
        ...result,
        reflectionId,
        date,
      } as const;

      setFollowUp(nextFollowUp);
      await updateReflectionFollowUp(date, reflectionId, nextFollowUp);
    } catch (error) {
      if (error instanceof ReflectionFollowUpError && error.code === "daily_limit_reached") {
        setErrorMessage(t("today.followUpLimitBody"));
      } else {
        setErrorMessage(t("today.followUpError"));
      }
    } finally {
      setIsGenerating(false);
    }
  }

  const followUpButtonDisabled = !latestDraftRef.current.trim() || isGenerating;

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
        placeholderTextColor={colors.tertiaryText}
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
            color: colors.primaryText,
            borderColor: colors.border,
            backgroundColor: canEditNote ? noteBackgroundColor : colors.paperMuted,
            fontFamily: typography.body,
          },
        ]}
      />
      {helperText ? (
        <Text style={[styles.noteHint, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
          {helperText}
        </Text>
      ) : null}
      <View style={styles.followUpWrap}>
        <Pressable
          accessibilityRole="button"
          onPress={handleGenerateFollowUp}
          disabled={followUpButtonDisabled}
          style={[
            styles.followUpButton,
            {
              borderColor: colors.border,
              backgroundColor: followUpButtonDisabled ? colors.paperMuted : colors.paperRaised,
            },
          ]}
        >
          <Text
            style={[
              styles.followUpButtonText,
              {
                color: followUpButtonDisabled ? colors.tertiaryText : colors.primaryText,
                fontFamily: typography.action,
              },
            ]}
          >
            {isGenerating ? t("today.followUpLoading") : t("today.followUpAction")}
          </Text>
        </Pressable>

        {errorMessage ? (
          <Text style={[styles.noteHint, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
            {errorMessage}
          </Text>
        ) : null}

        {followUp?.prompts.length ? (
          <View style={[styles.followUpCard, { borderColor: colors.border, backgroundColor: colors.paperRaised }]}>
            <Text style={[styles.followUpTitle, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {t("today.followUpTitle")}
            </Text>
            {followUp.prompts.map((prompt, index) => (
              <Text
                key={`${followUp.generatedAt}-${index}`}
                style={[styles.followUpPrompt, { color: colors.primaryText, fontFamily: typography.body }]}
              >
                {prompt}
              </Text>
            ))}
          </View>
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
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 13,
    lineHeight: 22,
  },
  noteInputEditorial: {
    borderRadius: 14,
    minHeight: 144,
  },
  noteInputLedger: {
    borderRadius: 14,
    minHeight: 128,
  },
  noteHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  followUpWrap: {
    gap: 10,
  },
  followUpButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignSelf: "flex-start",
  },
  followUpButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
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
});

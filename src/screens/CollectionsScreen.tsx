import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EditorialHeader } from "@/components/EditorialHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { UpgradeCard } from "@/components/premium/UpgradeCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { resolveLocale } from "@/localization/languages";
import { RootStackParamList } from "@/navigation/types";
import { getPremiumPromptCopy } from "@/services/premiumPromptService";
import { formatRelativeDaysFromNow } from "@/utils/date";
import { palette } from "@/utils/theme";

type Props = {
  route: RouteProp<RootStackParamList, "Collections">;
};

export function CollectionsScreen({ route }: Props) {
  const navigation = useNavigation<any>();
  const membership = useMembership();
  const { appState, colorScheme, collections, createCollection, addReflectionToCollection, markPremiumPromptOpened } = useAppContext();
  const { t } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const insets = useSafeAreaInsets();
  const locale = resolveLocale(appState.preferredLanguage);
  const collectionsPrompt = useMemo(() => getPremiumPromptCopy("collections", appState.preferredLanguage), [appState.preferredLanguage]);
  const hasCollections = membership.hasFeature("personal-collections");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const reflectionToAdd = useMemo(() => {
    if (!route.params?.date || !route.params?.reflectionId) {
      return null;
    }

    return {
      date: route.params.date,
      reflectionId: route.params.reflectionId,
    };
  }, [route.params?.date, route.params?.reflectionId]);
  const hasExistingCollections = collections.length > 0;

  useEffect(() => {
    if (!confirmationNotice) {
      return;
    }

    const timer = setTimeout(() => setConfirmationNotice(null), 1400);
    return () => clearTimeout(timer);
  }, [confirmationNotice]);

  function collectionPageLabel(count: number) {
    return `${count} ${count === 1 ? t("collections.pagesSingle") : t("collections.pagesPlural")}`;
  }

  function collectionUpdatedLabel(updatedAt: string) {
    const { days, label } = formatRelativeDaysFromNow(updatedAt, locale);
    if (days === 0) {
      return t("collections.lastUpdatedPrefix");
    }
    return `${t("collections.lastUpdatedPrefix")} ${label}`;
  }

  function resetComposer() {
    setDraftTitle("");
    setDraftDescription("");
    setIsComposerOpen(false);
  }

  async function completeAddAndClose() {
    setConfirmationNotice(t("collections.addedNotice"));
    setTimeout(() => {
      navigation.goBack();
    }, 520);
  }

  async function handleCreateCollection() {
    const title = draftTitle.trim();
    if (!title) {
      return;
    }

    const collectionId = await createCollection({
      title,
      description: draftDescription.trim() || null,
    });

    if (reflectionToAdd) {
      await addReflectionToCollection(collectionId, reflectionToAdd.date, reflectionToAdd.reflectionId);
      resetComposer();
      await completeAddAndClose();
      return;
    }

    resetComposer();
    navigation.navigate("CollectionDetail", { collectionId });
  }

  async function handleSelectCollection(collectionId: string) {
    if (!reflectionToAdd) {
      navigation.navigate("CollectionDetail", { collectionId });
      return;
    }

    await addReflectionToCollection(collectionId, reflectionToAdd.date, reflectionToAdd.reflectionId);
    await completeAddAndClose();
  }

  const heroCard = (
    <View
      style={[
        styles.heroCard,
        {
          backgroundColor: colors.paperRaised,
          borderColor: colors.borderStrong,
          shadowColor: colors.shadowStrong,
        },
      ]}
    >
      <View style={[styles.heroRule, { backgroundColor: colors.accent }]} />
      <Text style={[styles.heroEyebrow, { color: colors.accent, fontFamily: typography.meta }]}>
        {t("collections.title")}
      </Text>
      <Text style={[styles.heroTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
        {t("collections.heroTitle")}
      </Text>
      <Text style={[styles.heroBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
        {t("collections.heroBody")}
      </Text>
      <View style={styles.heroPreview}>
        <View style={[styles.heroBackground, { backgroundColor: colors.appBackground }]}>
          <View style={[styles.heroPaper, { backgroundColor: colors.paperSurface, borderColor: colors.border }]}>
            <View style={styles.heroLines}>
              <View style={[styles.heroLineLong, { backgroundColor: colors.primaryText }]} />
              <View style={[styles.heroLineShort, { backgroundColor: colors.secondaryText }]} />
              <View style={[styles.heroLineMedium, { backgroundColor: colors.tertiaryText }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer scroll>
      <EditorialHeader
        eyebrow={t("collections.eyebrow")}
        title={reflectionToAdd ? t("collections.addSheetTitle") : t("collections.heroTitle")}
        subtitle={reflectionToAdd ? t("collections.addSheetBody") : t("collections.heroBody")}
      />

      {!hasCollections ? (
        <UpgradeCard
          title={collectionsPrompt.title}
          body={collectionsPrompt.body}
          actionLabel={collectionsPrompt.cta}
          onPress={() => {
            void markPremiumPromptOpened("collections");
            navigation.navigate("Membership");
          }}
        />
      ) : (
        <>
          {hasExistingCollections ? (
            <View style={styles.collectionSection}>
              <View style={styles.collectionHeader}>
                <View style={styles.collectionHeaderCopy}>
                  <Text style={[styles.sectionEyebrow, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
                    {t("collections.title")}
                  </Text>
                  <Text
                    style={[
                      styles.collectionHeaderTitle,
                      { color: colors.primaryText, fontFamily: typography.display },
                    ]}
                  >
                    {t("collections.heroTitle")}
                  </Text>
                  <Text
                    style={[
                      styles.collectionHeaderBody,
                      { color: colors.secondaryText, fontFamily: typography.body },
                    ]}
                  >
                    {t("collections.heroBody")}
                  </Text>
                </View>
                <PrimaryButton
                  label={t("collections.newAction")}
                  onPress={() => setIsComposerOpen(true)}
                  variant={reflectionToAdd ? "primary" : "secondary"}
                  style={styles.collectionHeaderButton}
                />
              </View>
              <View style={styles.collectionStack}>
                {collections.map((collection) => (
                  <Pressable
                    key={collection.id}
                    onPress={() => {
                      handleSelectCollection(collection.id).catch((error) => {
                        console.warn("Failed to select collection", error);
                      });
                    }}
                    style={({ pressed }) => [
                      styles.card,
                      {
                        backgroundColor: colors.paperSurface,
                        borderColor: colors.border,
                        shadowColor: colors.shadow,
                      },
                      pressed && styles.cardPressed,
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardCopy}>
                        <Text style={[styles.cardEyebrow, { color: colors.accent, fontFamily: typography.meta }]}>
                          {collectionPageLabel(collection.reflectionCount)}
                        </Text>
                        <Text style={[styles.cardTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                          {collection.title}
                        </Text>
                        {collection.description ? (
                          <Text
                            style={[styles.cardDescription, { color: colors.secondaryText, fontFamily: typography.body }]}
                          >
                            {collection.description}
                          </Text>
                        ) : null}
                      </View>
                      <Text style={[styles.cardChevron, { color: colors.accent, fontFamily: typography.meta }]}>›</Text>
                    </View>
                    <View style={styles.cardMetaRow}>
                      <Text
                        style={[styles.cardMetaSecondary, { color: colors.tertiaryText, fontFamily: typography.meta }]}
                      >
                        {collectionUpdatedLabel(collection.updatedAt)}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <>
              {!reflectionToAdd ? heroCard : null}

              <View
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: colors.paperRaised,
                    borderColor: colors.borderStrong,
                  },
                ]}
              >
                <View style={[styles.heroRule, { backgroundColor: colors.accent }]} />
                <Text style={[styles.sectionEyebrow, { color: colors.accent, fontFamily: typography.meta }]}>
                  {t("collections.title")}
                </Text>
                <Text style={[styles.emptyTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                  {t("collections.emptyHeroTitle")}
                </Text>
                <Text style={[styles.emptyBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
                  {t("collections.emptyHeroBody")}
                </Text>
                <PrimaryButton
                  label={t("collections.newAction")}
                  onPress={() => setIsComposerOpen(true)}
                  variant="secondary"
                />
              </View>
            </>
          )}
        </>
      )}

      {confirmationNotice ? (
        <View
          pointerEvents="none"
          style={[
            styles.notice,
            {
              bottom: Math.max(insets.bottom + 20, 32),
              backgroundColor: colors.paperRaised,
              borderColor: colors.borderStrong,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={[styles.noticeText, { color: colors.primaryText, fontFamily: typography.action }]}>
            {confirmationNotice}
          </Text>
        </View>
      ) : null}

      <Modal visible={isComposerOpen} transparent animationType="slide" onRequestClose={resetComposer}>
        <View style={[styles.sheetBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: "height" })}
            style={styles.sheetKeyboard}
          >
            <View
              style={[
                styles.sheet,
                {
                  paddingBottom: Math.max(insets.bottom + 18, 24),
                  backgroundColor: colors.card,
                  borderColor: colors.borderStrong,
                  shadowColor: colors.shadowStrong,
                },
              ]}
            >
              <View style={[styles.sheetHandle, { backgroundColor: colors.borderStrong }]} />
              <Text style={[styles.sheetTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                {t("collections.createTitle")}
              </Text>
              <Text style={[styles.sheetBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
                {t("collections.createBody")}
              </Text>

              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.fieldStack}>
                  <Text style={[styles.fieldLabel, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                    {t("collections.nameLabel")}
                  </Text>
                  <TextInput
                    value={draftTitle}
                    onChangeText={setDraftTitle}
                    placeholder={t("collections.nameLabel")}
                    placeholderTextColor={colors.tertiaryText}
                    selectionColor={colors.accent}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputSurface,
                        borderColor: colors.border,
                        color: colors.primaryText,
                        fontFamily: typography.body,
                      },
                    ]}
                  />
                </View>
                <View style={styles.fieldStack}>
                  <Text style={[styles.fieldLabel, { color: colors.secondaryText, fontFamily: typography.meta }]}>
                    {t("collections.descriptionLabel")}
                  </Text>
                  <TextInput
                    value={draftDescription}
                    onChangeText={setDraftDescription}
                    placeholder={t("collections.descriptionLabel")}
                    placeholderTextColor={colors.tertiaryText}
                    selectionColor={colors.accent}
                    multiline
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: colors.inputSurface,
                        borderColor: colors.border,
                        color: colors.primaryText,
                        fontFamily: typography.body,
                      },
                    ]}
                  />
                </View>
              </ScrollView>

              <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
                <SecondaryButton label={t("common.cancel")} onPress={resetComposer} variant="text" style={styles.footerButton} />
                <PrimaryButton
                  label={t("collections.saveAction")}
                  onPress={() => {
                    handleCreateCollection().catch((error) => {
                      console.warn("Failed to create collection", error);
                    });
                  }}
                  disabled={!draftTitle.trim()}
                  style={styles.footerButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    marginBottom: 18,
    gap: 10,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    elevation: 3,
  },
  heroRule: {
    width: 56,
    height: 2,
    borderRadius: 999,
    opacity: 0.7,
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 520,
  },
  heroPreview: {
    marginTop: 6,
  },
  heroBackground: {
    borderRadius: 24,
    padding: 18,
  },
  heroPaper: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  heroLines: {
    gap: 8,
  },
  heroLineLong: {
    height: 4,
    width: "72%",
    borderRadius: 999,
    opacity: 0.22,
  },
  heroLineShort: {
    height: 4,
    width: "44%",
    borderRadius: 999,
    opacity: 0.18,
  },
  heroLineMedium: {
    height: 4,
    width: "58%",
    borderRadius: 999,
    opacity: 0.14,
  },
  sectionEyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  collectionSection: {
    gap: 16,
  },
  collectionHeader: {
    gap: 14,
  },
  collectionHeaderCopy: {
    gap: 8,
  },
  collectionHeaderTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  collectionHeaderBody: {
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 560,
  },
  collectionHeaderButton: {
    alignSelf: "stretch",
  },
  collectionStack: {
    gap: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ translateY: 1 }],
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardCopy: {
    flex: 1,
    gap: 7,
  },
  cardEyebrow: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 25,
    lineHeight: 31,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  cardChevron: {
    fontSize: 26,
    lineHeight: 28,
    paddingTop: 2,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  cardMetaSecondary: {
    fontSize: 11,
    letterSpacing: 0.45,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 24,
    gap: 14,
    marginTop: 4,
  },
  emptyTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 4,
  },
  notice: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  noticeText: {
    textAlign: "center",
    fontSize: 14,
    letterSpacing: 0.2,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetKeyboard: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    maxHeight: "88%",
    gap: 14,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 999,
    opacity: 0.6,
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  sheetBody: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 2,
  },
  sheetScroll: {
    maxHeight: 320,
  },
  sheetScrollContent: {
    gap: 16,
    paddingBottom: 12,
  },
  fieldStack: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  sheetFooter: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
  },
});

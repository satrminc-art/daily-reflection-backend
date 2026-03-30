import React, { useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EditorialHeader } from "@/components/EditorialHeader";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PremiumGateCard } from "@/components/premium/PremiumGateCard";
import { ReflectionListItem } from "@/components/ReflectionListItem";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { resolveLocale } from "@/localization/languages";
import { RootStackParamList } from "@/navigation/types";
import { formatRelativeDaysFromNow } from "@/utils/date";
import { palette } from "@/utils/theme";

type Props = {
  route: RouteProp<RootStackParamList, "CollectionDetail">;
};

export function CollectionDetailScreen({ route }: Props) {
  const navigation = useNavigation<any>();
  const membership = useMembership();
  const {
    appState,
    colorScheme,
    getCollectionById,
    getCollectionReflections,
    renameCollection,
    deleteCollection,
    removeReflectionFromCollection,
  } = useAppContext();
  const { t } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const insets = useSafeAreaInsets();
  const locale = resolveLocale(appState.preferredLanguage);
  const collection = getCollectionById(route.params.collectionId);
  const reflections = useMemo(
    () => getCollectionReflections(route.params.collectionId),
    [getCollectionReflections, route.params.collectionId],
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(collection?.title ?? "");
  const [draftDescription, setDraftDescription] = useState(collection?.description ?? "");

  useLayoutEffect(() => {
    if (collection?.title) {
      navigation.setOptions({ title: collection.title });
    }
  }, [collection?.title, navigation]);

  if (!membership.hasFeature("personal-collections")) {
    return (
      <ScreenContainer scroll>
        <PremiumGateCard
          title={t("collections.lockedTitle")}
          message={t("collections.lockedBody")}
          actionLabel={t("settings.upgradeAction")}
          onPress={() => navigation.navigate("Membership")}
        />
      </ScreenContainer>
    );
  }

  if (!collection) {
    return (
      <ScreenContainer scroll>
        <EmptyState
          title={t("reflection.unavailable")}
          message={t("collections.detailEmptyMessage")}
        />
        <PrimaryButton
          label={t("collections.title")}
          onPress={() => navigation.navigate("Collections")}
          variant="secondary"
          style={styles.missingAction}
        />
      </ScreenContainer>
    );
  }

  const activeCollection = collection;
  const updatedMeta = formatRelativeDaysFromNow(activeCollection.updatedAt, locale);
  const reflectionMeta = `${reflections.length} ${reflections.length === 1 ? t("collections.pagesSingle") : t("collections.pagesPlural")}`;
  const updatedLabel =
    updatedMeta.days === 0
      ? t("collections.lastUpdatedPrefix")
      : `${t("collections.lastUpdatedPrefix")} ${updatedMeta.label}`;

  async function handleRenameCollection() {
    await renameCollection(activeCollection.id, {
      title: draftTitle,
      description: draftDescription,
    });
    setIsEditOpen(false);
  }

  async function handleDeleteCollection() {
    await deleteCollection(activeCollection.id);
    navigation.goBack();
  }

  return (
    <ScreenContainer scroll>
      <EditorialHeader
        eyebrow={t("collections.eyebrow")}
        title={activeCollection.title}
        subtitle={activeCollection.description || t("collections.heroBody")}
      />

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
        <View style={styles.metaRow}>
          <Text style={[styles.metaTag, { color: colors.accent, fontFamily: typography.meta }]}>{reflectionMeta}</Text>
          <Text style={[styles.metaSubtle, { color: colors.tertiaryText, fontFamily: typography.meta }]}>{updatedLabel}</Text>
        </View>
        {activeCollection.description ? (
          <Text style={[styles.heroBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {activeCollection.description}
          </Text>
        ) : null}
        <View style={styles.actionRow}>
          <PrimaryButton
            label={t("collections.renameAction")}
            onPress={() => {
              setDraftTitle(activeCollection.title);
              setDraftDescription(activeCollection.description ?? "");
              setIsEditOpen(true);
            }}
            variant="secondary"
            style={styles.actionButton}
          />
          <PrimaryButton
            label={t("collections.deleteAction")}
            onPress={() => {
              Alert.alert(t("collections.deleteConfirmTitle"), t("collections.deleteConfirmMessage"), [
                { text: t("common.cancel"), style: "cancel" },
                {
                  text: t("collections.deleteAction"),
                  style: "destructive",
                  onPress: () => {
                    handleDeleteCollection().catch((error) => {
                      console.warn("Failed to delete collection", error);
                    });
                  },
                },
              ]);
            }}
            variant="ghost"
            style={styles.actionButton}
          />
        </View>
      </View>

      {reflections.length ? (
        <View style={styles.reflectionSection}>
          <Text style={[styles.sectionEyebrow, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
            {t("collections.heroTitle")}
          </Text>
          <View style={styles.reflectionStack}>
          {reflections.map((reflection) => (
            <ReflectionListItem
              key={`${reflection.date}-${reflection.id}`}
              reflection={reflection}
              onPress={() =>
                navigation.navigate("ReflectionDetail", {
                  reflectionId: reflection.id,
                  date: reflection.date,
                })
              }
              secondaryActionLabel={t("collections.removeAction")}
              onSecondaryAction={() => {
                Alert.alert(t("collections.removeConfirmTitle"), t("collections.removeConfirmMessage"), [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("collections.removeAction"),
                    style: "destructive",
                    onPress: () => {
                      removeReflectionFromCollection(activeCollection.id, reflection.date, reflection.id).catch((error) => {
                        console.warn("Failed to remove reflection from collection", error);
                      });
                    },
                  },
                ]);
              }}
            />
          ))}
          </View>
        </View>
      ) : (
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
          <Text style={[styles.emptyTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
            {t("collections.detailEmptyTitle")}
          </Text>
          <Text style={[styles.emptyBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("collections.detailEmptyMessage")}
          </Text>
        </View>
      )}

      <Modal visible={isEditOpen} transparent animationType="slide" onRequestClose={() => setIsEditOpen(false)}>
        <View style={[styles.sheetBackdrop, { backgroundColor: colors.overlayBackdrop }]}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
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
                {t("collections.renameAction")}
              </Text>
              <Text style={[styles.sheetBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
                {t("collections.editBody")}
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
                <PrimaryButton label={t("common.cancel")} onPress={() => setIsEditOpen(false)} variant="ghost" style={styles.footerButton} />
                <PrimaryButton
                  label={t("collections.saveAction")}
                  onPress={() => {
                    handleRenameCollection().catch((error) => {
                      console.warn("Failed to rename collection", error);
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
    gap: 14,
    marginBottom: 18,
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
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  metaTag: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  metaSubtle: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  sectionEyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  reflectionSection: {
    gap: 12,
  },
  missingAction: {
    marginTop: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  reflectionStack: {
    gap: 12,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 23,
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

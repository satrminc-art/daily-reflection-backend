import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { resolvePageStyleSystem } from "@/theme/pageStyle";
import { ReflectionItem } from "@/types/reflection";
import { formatLongDate } from "@/utils/date";
import { palette } from "@/utils/theme";

interface Props {
  reflection: ReflectionItem;
  onPress: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function ReflectionListItem({ reflection, onPress, secondaryActionLabel, onSecondaryAction }: Props) {
  const { colorScheme, personalization } = useAppContext();
  const { locale, t, categoryLabel, sourceTypeLabel, toneLabel } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const pageStyle = resolvePageStyleSystem(personalization.pageStyle.id);

  function renderClassicLayout() {
    return (
      <>
        <View style={styles.topRow}>
          <Text style={[styles.date, { color: colors.secondaryText, fontFamily: typography.meta }]}>
            {formatLongDate(reflection.date, locale)}
          </Text>
          <View style={styles.topMeta}>
            {reflection.isFavorite ? (
              <Text style={[styles.favorite, { color: colors.accent, fontFamily: typography.meta }]}>{t("list.saved")}</Text>
            ) : null}
            <Text style={[styles.category, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
              {categoryLabel(reflection.category)}
            </Text>
          </View>
        </View>
        <Text style={[styles.question, { color: colors.primaryText, fontFamily: typography.display }]} numberOfLines={3}>
          {reflection.text}
        </Text>
        <Text style={[styles.meta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
          {toneLabel(reflection.tone)} · {sourceTypeLabel(reflection.sourceType)}
        </Text>
      </>
    );
  }

  function renderEditorialLayout() {
    return (
      <>
        <View style={[styles.editorialRule, { backgroundColor: colors.borderStrong }]} />
        <View style={styles.editorialTopRow}>
          <Text style={[styles.editorialDate, { color: colors.accent, fontFamily: typography.meta }]}>
            {formatLongDate(reflection.date, locale)}
          </Text>
          {reflection.isFavorite ? (
            <Text style={[styles.editorialSaved, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {t("list.saved")}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.editorialQuestion, { color: colors.primaryText, fontFamily: typography.display }]} numberOfLines={4}>
          {reflection.text}
        </Text>
        <View style={styles.editorialFooter}>
          <Text style={[styles.editorialMeta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
            {categoryLabel(reflection.category)}
          </Text>
          <Text style={[styles.editorialMeta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
            {toneLabel(reflection.tone)} · {sourceTypeLabel(reflection.sourceType)}
          </Text>
        </View>
      </>
    );
  }

  function renderLedgerLayout() {
    return (
      <>
        <View style={[styles.ledgerHeader, { borderBottomColor: colors.border }]}>
          <View style={[styles.ledgerDateBadge, { backgroundColor: colors.paperRaised, borderColor: colors.border }]}>
            <Text style={[styles.ledgerDateText, { color: colors.accent, fontFamily: typography.meta }]}>
              {formatLongDate(reflection.date, locale)}
            </Text>
          </View>
          <View style={styles.ledgerHeaderMeta}>
            <Text style={[styles.ledgerLabel, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {categoryLabel(reflection.category)}
            </Text>
            <Text style={[styles.ledgerLabel, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {reflection.isFavorite ? t("list.saved") : toneLabel(reflection.tone)}
            </Text>
          </View>
        </View>
        <View style={[styles.ledgerQuestionPanel, { borderColor: colors.borderStrong, backgroundColor: colors.paperRaised }]}>
          <View style={[styles.ledgerRuleBar, { backgroundColor: colors.accentSoft }]} />
          <Text style={[styles.ledgerQuestion, { color: colors.primaryText, fontFamily: typography.display }]} numberOfLines={4}>
            {reflection.text}
          </Text>
        </View>
        <View style={styles.ledgerFooter}>
          <Text style={[styles.ledgerMeta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
            {toneLabel(reflection.tone)}
          </Text>
          <Text style={[styles.ledgerMeta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
            {sourceTypeLabel(reflection.sourceType)}
          </Text>
        </View>
      </>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      android_ripple={
        Platform.OS === "android"
          ? {
              color: colors.accentSoft,
              borderless: false,
            }
          : undefined
      }
      hitSlop={4}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.paperSurface,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        pageStyle.compactVariant === "editorial" ? styles.editorialCard : null,
        pageStyle.compactVariant === "ledger" ? styles.ledgerCard : null,
        pressed ? styles.cardPressed : null,
      ]}
    >
      {pageStyle.compactVariant === "classic" ? renderClassicLayout() : null}
      {pageStyle.compactVariant === "editorial" ? renderEditorialLayout() : null}
      {pageStyle.compactVariant === "ledger" ? renderLedgerLayout() : null}

      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onSecondaryAction();
          }}
          hitSlop={4}
          style={styles.secondaryAction}
        >
          <Text style={[styles.secondaryActionLabel, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
            {secondaryActionLabel}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.94,
  },
  editorialCard: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  ledgerCard: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  topMeta: {
    flexShrink: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: 4,
  },
  date: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  favorite: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  category: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  question: {
    fontSize: 21,
    lineHeight: 30,
    fontWeight: "500",
    letterSpacing: -0.25,
  },
  meta: {
    fontSize: 13,
    textTransform: "capitalize",
  },
  editorialRule: {
    height: 1,
    marginBottom: 4,
  },
  editorialTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  editorialDate: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  editorialSaved: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    flexShrink: 1,
    textAlign: "right",
  },
  editorialQuestion: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "500",
    letterSpacing: -0.35,
    textAlign: "left",
  },
  editorialFooter: {
    gap: 6,
    paddingTop: 8,
  },
  editorialMeta: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  ledgerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  ledgerDateBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ledgerDateText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  ledgerHeaderMeta: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    gap: 4,
  },
  ledgerLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  ledgerQuestionPanel: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "stretch",
  },
  ledgerRuleBar: {
    width: 12,
  },
  ledgerQuestion: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "500",
    letterSpacing: -0.3,
    textAlign: "left",
  },
  ledgerFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    paddingTop: 4,
  },
  ledgerMeta: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  secondaryAction: {
    alignSelf: "flex-start",
    paddingTop: 2,
  },
  secondaryActionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});

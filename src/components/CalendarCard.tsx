import React, { forwardRef } from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { resolvePageStyleSystem } from "@/theme/pageStyle";
import { ReflectionItem } from "@/types/reflection";
import { formatCalendarDate } from "@/utils/date";
import { palette } from "@/utils/theme";

interface Props {
  reflection: ReflectionItem;
}

export const CalendarCard = forwardRef<View, Props>(({ reflection }, ref) => {
  const { colorScheme, personalization } = useAppContext();
  const { locale, categoryLabel, sourceTypeLabel, toneLabel } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const formatted = formatCalendarDate(reflection.date, locale);
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const pageStyle = resolvePageStyleSystem(personalization.pageStyle.id);

  const questionSizeByVariant = {
    classic: isCompact ? 34 : 40,
    editorial: isCompact ? 31 : 36,
    ledger: isCompact ? 29 : 33,
  } as const;
  const questionLineHeightByVariant = {
    classic: isCompact ? 50 : 58,
    editorial: isCompact ? 46 : 52,
    ledger: isCompact ? 42 : 48,
  } as const;
  const daySize = isCompact ? 98 : 114;
  const dayTextSize = isCompact ? 56 : 64;
  const dayLineHeight = isCompact ? 60 : 68;

  const commonQuestionStyle = {
    color: colors.primaryText,
    fontSize: questionSizeByVariant[pageStyle.fullVariant],
    lineHeight: questionLineHeightByVariant[pageStyle.fullVariant],
    fontFamily: typography.display,
    letterSpacing: Platform.OS === "android" ? -0.3 : -0.6,
  } as const;

  function renderClassicLayout() {
    const cardMinHeight = isCompact ? 500 : 570;
    const questionMaxWidth = isCompact ? 250 : 286;

    return (
      <>
        <View style={[styles.paperInset, { borderColor: colors.accentSoft }]} />
        <View style={[styles.perforation, { borderBottomColor: colors.border }]} />
        <View style={[styles.dateStrip, { borderBottomColor: colors.border }]}>
          <View style={styles.dateCopy}>
            <Text style={[styles.calendarLabel, { color: colors.accent, fontFamily: typography.meta }]}>
              {formatted.monthLabel}
            </Text>
            <Text style={[styles.weekday, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {formatted.weekdayLabel}
            </Text>
          </View>
          <View
            style={[
              styles.dayBadge,
              {
                borderColor: colors.borderStrong,
                backgroundColor: colors.paperRaised,
                minWidth: daySize,
                minHeight: daySize,
              },
            ]}
          >
            <Text
              style={[
                styles.dayNumber,
                {
                  color: colors.primaryText,
                  fontSize: dayTextSize,
                  lineHeight: dayLineHeight,
                  fontFamily: typography.display,
                },
              ]}
            >
              {formatted.dayNumber}
            </Text>
          </View>
        </View>
        <View style={[styles.questionWrap, { minHeight: cardMinHeight }]}>
          <Text
            style={[
              styles.question,
              commonQuestionStyle,
              {
                textAlign: "center",
                maxWidth: questionMaxWidth,
                fontWeight: "500",
              },
            ]}
          >
            {reflection.text}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.meta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {categoryLabel(reflection.category)}
            </Text>
            <Text style={[styles.metaDivider, { color: colors.border, fontFamily: typography.meta }]}>/</Text>
            <Text style={[styles.meta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {toneLabel(reflection.tone)}
            </Text>
            <Text style={[styles.metaDivider, { color: colors.border, fontFamily: typography.meta }]}>/</Text>
            <Text style={[styles.meta, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {sourceTypeLabel(reflection.sourceType)}
            </Text>
          </View>
        </View>
      </>
    );
  }

  function renderEditorialLayout() {
    return (
      <>
        <View style={[styles.editorialInset, { borderColor: colors.accentSoft }]} />
        <View style={[styles.editorialRuleTop, { backgroundColor: colors.borderStrong }]} />
        <View style={styles.editorialHeader}>
          <View
            style={[
              styles.editorialDatePanel,
              {
                backgroundColor: colors.paperRaised,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.calendarLabel, { color: colors.accent, fontFamily: typography.meta }]}>
              {formatted.monthLabel}
            </Text>
            <Text
              style={[
                styles.editorialDayNumber,
                {
                  color: colors.primaryText,
                  fontFamily: typography.display,
                },
              ]}
            >
              {formatted.dayNumber}
            </Text>
            <Text style={[styles.weekday, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {formatted.weekdayLabel}
            </Text>
          </View>
          <View style={styles.editorialHeaderCopy}>
            <Text style={[styles.editorialMetaLine, { color: colors.accent, fontFamily: typography.meta }]}>
              {categoryLabel(reflection.category)}
            </Text>
            <Text style={[styles.editorialMetaSubline, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {toneLabel(reflection.tone)} · {sourceTypeLabel(reflection.sourceType)}
            </Text>
          </View>
        </View>
        <View style={styles.editorialQuestionWrap}>
          <Text
            style={[
              styles.editorialQuestion,
              commonQuestionStyle,
              {
                textAlign: "left",
                fontWeight: "500",
              },
            ]}
          >
            {reflection.text}
          </Text>
        </View>
        <View style={[styles.editorialFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.editorialFooterLine, { color: colors.secondaryText, fontFamily: typography.meta }]}>
            {formatted.weekdayLabel}
          </Text>
          <Text style={[styles.editorialFooterLine, { color: colors.secondaryText, fontFamily: typography.meta }]}>
            {formatted.monthLabel} {formatted.dayNumber}
          </Text>
        </View>
      </>
    );
  }

  function renderLedgerLayout() {
    return (
      <>
        <View style={[styles.ledgerInset, { borderColor: colors.border }]} />
        <View style={styles.ledgerHeader}>
          <View
            style={[
              styles.ledgerDateCell,
              {
                backgroundColor: colors.paperRaised,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.ledgerCellLabel, { color: colors.accent, fontFamily: typography.meta }]}>
              {formatted.monthLabel}
            </Text>
            <Text style={[styles.ledgerDayNumber, { color: colors.primaryText, fontFamily: typography.display }]}>
              {formatted.dayNumber}
            </Text>
          </View>
          <View
            style={[
              styles.ledgerMetaCell,
              {
                backgroundColor: colors.paperRaised,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.ledgerCellLabel, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {formatted.weekdayLabel}
            </Text>
            <Text style={[styles.ledgerCellValue, { color: colors.primaryText, fontFamily: typography.body }]}>
              {categoryLabel(reflection.category)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.ledgerQuestionPanel,
            {
              borderColor: colors.borderStrong,
              backgroundColor: colors.paperRaised,
            },
          ]}
        >
          <View style={[styles.ledgerQuestionRule, { backgroundColor: colors.accentSoft }]} />
          <View style={styles.ledgerQuestionCopy}>
            <Text
              style={[
                styles.ledgerQuestion,
                commonQuestionStyle,
                {
                  textAlign: "left",
                  fontWeight: "500",
                },
              ]}
            >
              {reflection.text}
            </Text>
          </View>
        </View>
        <View style={[styles.ledgerMetaGrid, { borderTopColor: colors.border }]}>
          <View style={styles.ledgerGridCell}>
            <Text style={[styles.ledgerGridText, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {toneLabel(reflection.tone)}
            </Text>
          </View>
          <View style={styles.ledgerGridCell}>
            <Text style={[styles.ledgerGridText, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {sourceTypeLabel(reflection.sourceType)}
            </Text>
          </View>
          <View style={styles.ledgerGridCell}>
            <Text style={[styles.ledgerGridText, { color: colors.secondaryText, fontFamily: typography.meta }]}>
              {formatted.weekdayLabel}
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.cardShadow,
        {
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View
        style={[
          styles.cardBody,
          {
            backgroundColor: colors.paperSurface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.binding, { backgroundColor: colors.binding }]} />
        <View style={[styles.paperGlow, { backgroundColor: colors.paperGlow }]} />
        {pageStyle.fullVariant === "classic" ? renderClassicLayout() : null}
        {pageStyle.fullVariant === "editorial" ? renderEditorialLayout() : null}
        {pageStyle.fullVariant === "ledger" ? renderLedgerLayout() : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardShadow: {
    borderRadius: 32,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 8,
    position: "relative",
  },
  cardBody: {
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 560,
  },
  binding: {
    height: 18,
  },
  paperGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  paperInset: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 28,
    bottom: 10,
    borderWidth: 1,
    borderRadius: 24,
    opacity: 0.4,
  },
  perforation: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    marginHorizontal: 18,
  },
  dateStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 24,
    paddingBottom: 26,
  },
  dateCopy: {
    gap: 8,
    alignItems: "flex-start",
  },
  calendarLabel: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  weekday: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  dayBadge: {
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: {
    fontWeight: "600",
  },
  questionWrap: {
    paddingHorizontal: 34,
    paddingTop: 42,
    paddingBottom: 56,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 22,
  },
  question: {
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  meta: {
    fontSize: 11,
    textTransform: "capitalize",
    letterSpacing: 1.4,
  },
  metaDivider: {
    fontSize: 12,
  },
  editorialInset: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 30,
    bottom: 12,
    borderWidth: 1,
    borderRadius: 18,
    opacity: 0.35,
  },
  editorialRuleTop: {
    height: 1,
    marginHorizontal: 22,
    marginTop: 18,
  },
  editorialHeader: {
    flexDirection: "row",
    gap: 18,
    paddingHorizontal: 28,
    paddingTop: 22,
    alignItems: "flex-start",
  },
  editorialDatePanel: {
    width: 92,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  editorialHeaderCopy: {
    flex: 1,
    gap: 10,
    paddingTop: 8,
    alignItems: "flex-start",
  },
  editorialDayNumber: {
    fontSize: 44,
    lineHeight: 46,
    fontWeight: "600",
  },
  editorialMetaLine: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  editorialMetaSubline: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  editorialQuestionWrap: {
    paddingHorizontal: 30,
    paddingTop: 34,
    paddingBottom: 40,
    minHeight: 420,
  },
  editorialQuestion: {
    maxWidth: 320,
  },
  editorialFooter: {
    marginHorizontal: 28,
    marginBottom: 26,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
  },
  editorialFooterLine: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  ledgerInset: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 28,
    bottom: 10,
    borderWidth: 1,
    borderRadius: 22,
    opacity: 0.28,
  },
  ledgerHeader: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  ledgerDateCell: {
    width: 104,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 8,
    alignItems: "flex-start",
  },
  ledgerMetaCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    justifyContent: "center",
  },
  ledgerCellLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  ledgerDayNumber: {
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "600",
  },
  ledgerCellValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "500",
  },
  ledgerQuestionPanel: {
    marginTop: 20,
    marginHorizontal: 24,
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    minHeight: 280,
    flexDirection: "row",
  },
  ledgerQuestionRule: {
    width: 16,
  },
  ledgerQuestionCopy: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
  },
  ledgerQuestion: {
    maxWidth: 320,
  },
  ledgerMetaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
    borderTopWidth: 1,
    marginTop: 18,
  },
  ledgerGridCell: {
    flex: 1,
  },
  ledgerGridText: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
});

import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import type { PageStylePresetId } from "@/theme/presets";
import { resolvePageStyleSystem } from "@/theme/pageStyle";
import { palette } from "@/utils/theme";

interface Props {
  pageStyleId: PageStylePresetId;
}

export function PageStylePreview({ pageStyleId }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const pageStyle = resolvePageStyleSystem(pageStyleId);

  return (
    <View style={[styles.frame, { backgroundColor: colors.paperSurface, borderColor: colors.border }]}>
      {pageStyle.fullVariant === "classic" ? (
        <>
          <View style={[styles.classicHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.classicCopy}>
              <View style={[styles.lineShort, { backgroundColor: colors.accent }]} />
              <View style={[styles.lineTiny, { backgroundColor: colors.tertiaryText }]} />
            </View>
            <View style={[styles.classicBadge, { backgroundColor: colors.paperRaised, borderColor: colors.borderStrong }]} />
          </View>
          <View style={styles.classicBody}>
            <View style={[styles.classicQuestion, { backgroundColor: colors.primaryText }]} />
            <View style={[styles.classicQuestionShort, { backgroundColor: colors.primaryText }]} />
            <View style={styles.classicFooter}>
              <View style={[styles.lineTiny, { backgroundColor: colors.secondaryText }]} />
              <View style={[styles.dot, { backgroundColor: colors.borderStrong }]} />
              <View style={[styles.lineTiny, { backgroundColor: colors.secondaryText }]} />
            </View>
          </View>
        </>
      ) : null}

      {pageStyle.fullVariant === "editorial" ? (
        <>
          <View style={[styles.editorialTopRule, { backgroundColor: colors.borderStrong }]} />
          <View style={styles.editorialHeader}>
            <View style={[styles.editorialDateBlock, { backgroundColor: colors.paperRaised, borderColor: colors.border }]} />
            <View style={styles.editorialCopy}>
              <View style={[styles.lineShort, { backgroundColor: colors.accent }]} />
              <View style={[styles.lineTiny, { backgroundColor: colors.secondaryText }]} />
            </View>
          </View>
          <View style={styles.editorialBody}>
            <View style={[styles.lineLong, { backgroundColor: colors.primaryText }]} />
            <View style={[styles.lineLong, { backgroundColor: colors.primaryText }]} />
            <View style={[styles.lineMedium, { backgroundColor: colors.primaryText }]} />
          </View>
          <View style={[styles.editorialBottomRule, { backgroundColor: colors.border }]} />
        </>
      ) : null}

      {pageStyle.fullVariant === "ledger" ? (
        <>
          <View style={[styles.ledgerHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.ledgerCellWide, { backgroundColor: colors.paperRaised, borderColor: colors.border }]} />
            <View style={[styles.ledgerCell, { backgroundColor: colors.paperRaised, borderColor: colors.border }]} />
          </View>
          <View style={[styles.ledgerEntry, { borderColor: colors.borderStrong }]}>
            <View style={[styles.ledgerRule, { backgroundColor: colors.accentSoft }]} />
            <View style={styles.ledgerCopy}>
              <View style={[styles.lineLong, { backgroundColor: colors.primaryText }]} />
              <View style={[styles.lineMedium, { backgroundColor: colors.primaryText }]} />
            </View>
          </View>
          <View style={[styles.ledgerMetaRow, { borderTopColor: colors.border }]}>
            <View style={[styles.lineTiny, { backgroundColor: colors.secondaryText }]} />
            <View style={[styles.lineTiny, { backgroundColor: colors.secondaryText }]} />
            <View style={[styles.lineTiny, { backgroundColor: colors.secondaryText }]} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 124,
    overflow: "hidden",
    gap: 10,
  },
  lineLong: {
    height: 4,
    width: "100%",
    borderRadius: 999,
  },
  lineMedium: {
    height: 4,
    width: "74%",
    borderRadius: 999,
  },
  lineShort: {
    height: 4,
    width: 44,
    borderRadius: 999,
  },
  lineTiny: {
    height: 3,
    width: 28,
    borderRadius: 999,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  classicHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  classicCopy: {
    gap: 6,
  },
  classicBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
  },
  classicBody: {
    alignItems: "center",
    gap: 10,
    paddingTop: 8,
  },
  classicQuestion: {
    width: "82%",
    height: 5,
    borderRadius: 999,
  },
  classicQuestionShort: {
    width: "56%",
    height: 5,
    borderRadius: 999,
  },
  classicFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  editorialTopRule: {
    height: 1,
    opacity: 0.9,
  },
  editorialHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  editorialDateBlock: {
    width: 34,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
  },
  editorialCopy: {
    flex: 1,
    gap: 7,
    paddingTop: 3,
  },
  editorialBody: {
    gap: 10,
    paddingTop: 4,
  },
  editorialBottomRule: {
    height: 1,
    marginTop: 4,
  },
  ledgerHeader: {
    flexDirection: "row",
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  ledgerCellWide: {
    flex: 1,
    height: 22,
    borderRadius: 10,
    borderWidth: 1,
  },
  ledgerCell: {
    width: 42,
    height: 22,
    borderRadius: 10,
    borderWidth: 1,
  },
  ledgerEntry: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 50,
  },
  ledgerRule: {
    width: 12,
  },
  ledgerCopy: {
    flex: 1,
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  ledgerMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
  },
});

import React, { useMemo, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CategoryChip } from "@/components/CategoryChip";
import { EditorialHeader } from "@/components/EditorialHeader";
import { EmptyState } from "@/components/EmptyState";
import { UpgradeCard } from "@/components/premium/UpgradeCard";
import { ReflectionListItem } from "@/components/ReflectionListItem";
import { ScreenContainer } from "@/components/ScreenContainer";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useAppContext } from "@/context/AppContext";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { getPremiumPromptCopy } from "@/services/premiumPromptService";
import { FREE_ARCHIVE_LIMIT } from "@/utils/membershipHelpers";
import { ReflectionCategory } from "@/types/reflection";
import { palette } from "@/utils/theme";

type ArchiveFilter = "all" | "saved";

export function ArchiveScreen() {
  const { colorScheme, archive, appState, markPremiumPromptOpened } = useAppContext();
  const membership = useMembership();
  const { t } = useAppStrings();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ReflectionCategory | null>(null);
  const [filter, setFilter] = useState<ArchiveFilter>("all");
  const collectionsPrompt = useMemo(
    () => getPremiumPromptCopy("collections", appState.preferredLanguage),
    [appState.preferredLanguage],
  );

  const filteredArchive = useMemo(() => {
    return archive.filter((item) => {
      const queryMatch = query
        ? item.text.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        : true;
      const categoryMatch = selectedCategory ? item.category === selectedCategory : true;
      const savedMatch = filter === "saved" ? item.isFavorite : true;
      return queryMatch && categoryMatch && savedMatch;
    });
  }, [archive, filter, query, selectedCategory]);

  const hasFullArchiveAccess = membership.hasFeature("unlimited-archive");
  const hasArchiveSearch = membership.hasFeature("search-filter");
  const visibleArchive = hasFullArchiveAccess ? filteredArchive : filteredArchive.slice(0, FREE_ARCHIVE_LIMIT);
  const isArchiveTrimmed = !hasFullArchiveAccess && filteredArchive.length > FREE_ARCHIVE_LIMIT;
  const hasFiltersApplied = Boolean(query.trim()) || Boolean(selectedCategory) || filter === "saved";

  return (
    <ScreenContainer scroll>
      <EditorialHeader
        eyebrow={t("archive.eyebrow")}
        title={t("archive.title")}
        subtitle={t("archive.subtitle")}
      />

      {hasArchiveSearch ? (
        <>
          <SegmentedControl
            options={[
              { label: t("archive.allReflections"), value: "all" },
              { label: t("archive.savedOnly"), value: "saved" },
            ]}
            value={filter}
            onChange={setFilter}
          />

          <TextInput
            placeholder={t("archive.searchPlaceholder")}
            placeholderTextColor={colors.tertiaryText}
            value={query}
            onChangeText={setQuery}
            style={[
              styles.search,
              {
                backgroundColor: colors.inputSurface,
                color: colors.primaryText,
                borderColor: colors.borderStrong,
                fontFamily: typography.body,
              },
            ]}
          />

          <View style={styles.filters}>
            {REFLECTION_CATEGORIES.map((category) => (
              <CategoryChip
                key={category}
                category={category}
                selected={selectedCategory === category}
                onPress={() => setSelectedCategory((current) => (current === category ? null : category))}
              />
            ))}
          </View>
        </>
      ) : (
        <UpgradeCard
          title={collectionsPrompt.title}
          body={collectionsPrompt.body}
          actionLabel={collectionsPrompt.cta}
          onPress={() => {
            void markPremiumPromptOpened("collections");
            navigation.navigate("Membership");
          }}
        />
      )}

      {visibleArchive.length ? (
        visibleArchive.map((reflection) => (
          <ReflectionListItem
            key={`${reflection.date}-${reflection.id}`}
            reflection={reflection}
            onPress={() =>
              navigation.navigate("ReflectionDetail", {
                reflectionId: reflection.id,
                date: reflection.date,
              })
            }
          />
        ))
      ) : (
        <EmptyState
          title={hasFiltersApplied && hasArchiveSearch ? t("archive.noMatchTitle") : t("archive.emptyTitle")}
          message={hasFiltersApplied && hasArchiveSearch ? t("archive.noMatchMessage") : t("archive.emptyMessage")}
        />
      )}

      {isArchiveTrimmed ? (
        <UpgradeCard
          title={collectionsPrompt.title}
          body={collectionsPrompt.body}
          actionLabel={collectionsPrompt.cta}
          onPress={() => {
            void markPremiumPromptOpened("collections");
            navigation.navigate("Membership");
          }}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  search: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginTop: 14,
    marginBottom: 14,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
});

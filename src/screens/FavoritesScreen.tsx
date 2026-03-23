import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CategoryChip } from "@/components/CategoryChip";
import { EditorialHeader } from "@/components/EditorialHeader";
import { EmptyState } from "@/components/EmptyState";
import { PremiumGateCard } from "@/components/premium/PremiumGateCard";
import { ReflectionListItem } from "@/components/ReflectionListItem";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppContext } from "@/context/AppContext";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { FREE_SAVED_LIMIT } from "@/utils/membershipHelpers";
import { ReflectionCategory } from "@/types/reflection";
import { palette } from "@/utils/theme";

export function FavoritesScreen() {
  const { colorScheme, favorites, toggleFavorite } = useAppContext();
  const { t } = useAppStrings();
  const membership = useMembership();
  const navigation = useNavigation<any>();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ReflectionCategory | null>(null);
  const filteredFavorites = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return favorites.filter((reflection) => {
      const matchesQuery = normalized ? reflection.text.toLowerCase().includes(normalized) : true;
      const matchesCategory = selectedCategory ? reflection.category === selectedCategory : true;
      return matchesQuery && matchesCategory;
    });
  }, [favorites, query, selectedCategory]);
  const hasFullSavedAccess = membership.hasFeature("unlimited-saved");
  const hasSavedSearch = membership.hasFeature("search-filter");
  const hasAdvancedSavedManagement = membership.hasFeature("advanced-saved-management");
  const visibleFavorites = hasFullSavedAccess ? filteredFavorites : filteredFavorites.slice(0, FREE_SAVED_LIMIT);
  const isTrimmed = !hasFullSavedAccess && filteredFavorites.length > FREE_SAVED_LIMIT;
  const hasFiltersApplied = Boolean(query.trim()) || Boolean(selectedCategory);

  return (
    <ScreenContainer scroll>
      <EditorialHeader
        eyebrow={t("favorites.eyebrow")}
        title={t("favorites.title")}
        subtitle={t("favorites.subtitle")}
      />

      {hasSavedSearch ? (
        <>
          <TextInput
            placeholder={t("favorites.searchPlaceholder")}
            placeholderTextColor={colors.tertiaryText}
            value={query}
            onChangeText={setQuery}
            style={[
              styles.search,
              {
                backgroundColor: colors.surface,
                color: colors.primaryText,
                borderColor: colors.border,
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
        <PremiumGateCard
          title={t("membership.lockedSavedTitle")}
          message={t("membership.lockedSavedBody")}
          actionLabel={t("settings.upgradeAction")}
          onPress={() => navigation.navigate("Membership")}
        />
      )}

      {visibleFavorites.length ? (
        visibleFavorites.map((reflection) => (
          <ReflectionListItem
            key={`${reflection.date}-${reflection.id}`}
            reflection={reflection}
            onPress={() =>
              navigation.navigate("ReflectionDetail", {
                reflectionId: reflection.id,
                date: reflection.date,
              })
            }
            secondaryActionLabel={hasAdvancedSavedManagement ? t("favorites.removeAction") : undefined}
            onSecondaryAction={
              hasAdvancedSavedManagement
                ? () =>
                    Alert.alert(t("favorites.deleteConfirmTitle"), t("favorites.deleteConfirmMessage"), [
                      { text: t("common.cancel"), style: "cancel" },
                      {
                        text: t("favorites.removeAction"),
                        style: "destructive",
                        onPress: () => {
                          toggleFavorite(reflection.id, reflection.date).catch((error) => {
                            console.warn("Failed to remove kept reflection", error);
                          });
                        },
                      },
                    ])
                : undefined
            }
          />
        ))
      ) : (
        <EmptyState
          title={hasFiltersApplied && hasSavedSearch ? t("favorites.noMatchTitle") : t("favorites.emptyTitle")}
          message={hasFiltersApplied && hasSavedSearch ? t("favorites.noMatchMessage") : t("favorites.emptyMessage")}
        />
      )}

      {isTrimmed ? (
        <PremiumGateCard
          title={t("favorites.premiumTitle")}
          message={t("favorites.premiumMessage")}
          actionLabel={t("settings.upgradeAction")}
          onPress={() => navigation.navigate("Membership")}
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
    marginBottom: 16,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
});

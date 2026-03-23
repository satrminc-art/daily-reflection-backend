import React from "react";
import { RouteProp } from "@react-navigation/native";
import { Alert, StyleSheet, Text, View } from "react-native";
import { CalendarCard } from "@/components/CalendarCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ReflectionNoteCard } from "@/components/ReflectionNoteCard";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useTypography } from "@/hooks/useTypography";
import { RootStackParamList } from "@/navigation/AppNavigator";
import { formatLongDate } from "@/utils/date";
import { canSaveAdditionalReflection } from "@/utils/membershipHelpers";
import { palette } from "@/utils/theme";

type Props = {
  route: RouteProp<RootStackParamList, "ReflectionDetail">;
};

export function ReflectionDetailScreen({ route }: Props) {
  const { colorScheme, favorites, getReflectionForDate, toggleFavorite } = useAppContext();
  const { locale, t, reflectionTitle } = useAppStrings();
  const membership = useMembership();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const reflection = getReflectionForDate(route.params.date);

  if (!reflection) {
    return (
      <ScreenContainer scroll>
        <Text style={{ color: colors.primaryText }}>{t("reflection.unavailable")}</Text>
      </ScreenContainer>
    );
  }

  async function handleToggleFavorite() {
    const canSave = canSaveAdditionalReflection(
      membership.effectiveEntitlement,
      favorites.length,
      reflection.isFavorite,
    );

    if (!canSave) {
      Alert.alert(t("today.saveLimitTitle"), t("today.saveLimitBody"));
      return;
    }

    await toggleFavorite(reflection.id, reflection.date);
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.headerBlock}>
        <Text style={[styles.date, { color: colors.secondaryText }]}>{formatLongDate(reflection.date, locale)}</Text>
        <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{reflectionTitle()}</Text>
      </View>
      <CalendarCard reflection={reflection} />
      <View style={styles.noteWrap}>
        <ReflectionNoteCard date={reflection.date} reflectionId={reflection.id} isSaved={reflection.isFavorite} />
      </View>
      <PrimaryButton
        label={reflection.isFavorite ? t("favorites.removeAction") : t("favorites.keepAction")}
        onPress={() => {
          handleToggleFavorite().catch((error) => {
            console.warn("Failed to update kept reflection", error);
          });
        }}
        variant={reflection.isFavorite ? "secondary" : "primary"}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    marginBottom: 18,
    gap: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "600",
  },
  button: {
    marginTop: 18,
  },
  noteWrap: {
    marginTop: 18,
  },
});

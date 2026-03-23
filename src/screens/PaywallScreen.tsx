import React from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useSubscription } from "@/hooks/useSubscription";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { isRevenueCatPaywallAvailable, presentRevenueCatPaywall } from "@/services/purchases";
import { palette } from "@/utils/theme";
import { useAppContext } from "@/context/AppContext";
import { getPackageDisplayLabel } from "@/utils/subscriptionHelpers";

export function PaywallScreen() {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const { t } = useAppStrings();
  const typography = useTypography();
  const {
    configured,
    error,
    loading,
    monthlyPackage,
    yearlyPackage,
    purchasePackage,
    refreshSubscriptionStatus,
    restorePurchases,
  } = useSubscription();

  async function handlePurchase(pkg: typeof monthlyPackage) {
    if (!pkg) {
      return;
    }

    try {
      await purchasePackage(pkg);
    } catch (purchaseError) {
      Alert.alert(t("paywall.error"), purchaseError instanceof Error ? purchaseError.message : t("paywall.error"));
    }
  }

  async function handleRestore() {
    try {
      await restorePurchases();
    } catch (restoreError) {
      Alert.alert(t("paywall.error"), restoreError instanceof Error ? restoreError.message : t("paywall.error"));
    }
  }

  const benefits = [
    t("paywall.benefitArchive"),
    t("paywall.benefitThemes"),
    t("paywall.benefitTypography"),
    t("paywall.benefitPersonalization"),
  ];
  const canPresentNativePaywall = configured && isRevenueCatPaywallAvailable();

  async function handlePresentNativePaywall() {
    try {
      const didUnlock = await presentRevenueCatPaywall();

      if (didUnlock) {
        await refreshSubscriptionStatus();
      }
    } catch (paywallError) {
      Alert.alert(t("paywall.error"), paywallError instanceof Error ? paywallError.message : t("paywall.error"));
    }
  }

  return (
    <ScreenContainer scroll>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{t("paywall.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{t("paywall.subtitle")}</Text>
      </View>

      <View style={styles.benefits}>
        {benefits.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <View style={[styles.dot, { backgroundColor: colors.accentSoft, borderColor: colors.border }]} />
            <Text style={[styles.benefitText, { color: colors.secondaryText }]}>{benefit}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={colors.primaryText} />
          <Text style={[styles.stateText, { color: colors.secondaryText }]}>{t("paywall.loading")}</Text>
        </View>
      ) : null}

      {!loading && (error || !configured || (!monthlyPackage && !yearlyPackage)) ? (
        <View style={[styles.stateCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.stateTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
            {t("paywall.error")}
          </Text>
          <Text style={[styles.stateText, { color: colors.secondaryText }]}>
            {error ?? t("paywall.notAvailable")}
          </Text>
          <PrimaryButton label={t("common.reset")} onPress={refreshSubscriptionStatus} variant="secondary" />
        </View>
      ) : null}

      {!loading && configured && (monthlyPackage || yearlyPackage) ? (
        <View style={styles.packages}>
          {canPresentNativePaywall ? (
            <PrimaryButton
              label={t("paywall.openNative")}
              onPress={handlePresentNativePaywall}
              variant="secondary"
            />
          ) : null}
          {monthlyPackage ? (
            <PrimaryButton
              label={`${t("paywall.monthly")} · ${getPackageDisplayLabel(monthlyPackage)}`}
              onPress={() => handlePurchase(monthlyPackage)}
            />
          ) : null}
          {yearlyPackage ? (
            <PrimaryButton
              label={`${t("paywall.yearly")} · ${getPackageDisplayLabel(yearlyPackage)}`}
              onPress={() => handlePurchase(yearlyPackage)}
              variant="secondary"
            />
          ) : null}
        </View>
      ) : null}

      <PrimaryButton label={t("paywall.restore")} onPress={handleRestore} variant="ghost" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 10,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  benefits: {
    gap: 12,
    marginBottom: 22,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 6,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  packages: {
    gap: 12,
    marginBottom: 14,
  },
  stateCard: {
    gap: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderRadius: 24,
    borderWidth: 1,
  },
  stateTitle: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: "center",
  },
  stateText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
});

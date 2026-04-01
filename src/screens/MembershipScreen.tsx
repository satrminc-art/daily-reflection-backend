import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlanBadge } from "@/components/membership/PlanBadge";
import { AnimatedReveal } from "@/components/onboarding/AnimatedReveal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { __DEV_OVERRIDE_ENABLED__ } from "@/config/devFlags";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useSubscription } from "@/hooks/useSubscription";
import { useTypography } from "@/hooks/useTypography";
import { RootStackParamList } from "@/navigation/types";
import { trackAppEvent } from "@/services/analytics";
import { findLifelongPackage, getCurrentOffering } from "@/services/purchases";
import { PurchaseTarget } from "@/types/membership";
import type { PurchasesPackage } from "@/types/purchases";
import { palette } from "@/utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Membership">;
type PremiumBillingPlan = "monthly" | "yearly";

type PremiumPlanOption = {
  id: PremiumBillingPlan;
  title: string;
  note: string;
  price: string | null;
  package: PurchasesPackage | null;
  recommended?: boolean;
};

function formatPlanPrice(price: string | null, suffix: string | null) {
  if (!price) {
    return null;
  }

  return suffix ? `${price} ${suffix}` : price;
}

export function MembershipScreen({ navigation }: Props) {
  const { appState, colorScheme, markInitialPremiumOfferSeen } = useAppContext();
  const { t, currentLabel } = useAppStrings();
  const membership = useMembership();
  const subscription = useSubscription();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const [offeringLoaded, setOfferingLoaded] = useState(false);
  const [fallbackLifelongPackage, setFallbackLifelongPackage] = useState<PurchasesPackage | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<PurchaseTarget | null>(null);
  const [selectedPremiumPlan, setSelectedPremiumPlan] = useState<PremiumBillingPlan>("yearly");

  useEffect(() => {
    let mounted = true;

    async function loadOffering() {
      try {
        const offering = subscription.offering ?? (await getCurrentOffering());

        if (!mounted) {
          return;
        }

        setFallbackLifelongPackage(offering ? findLifelongPackage(offering) : null);
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to load membership offering", error);
        }
      } finally {
        if (mounted) {
          setOfferingLoaded(true);
        }
      }
    }

    void loadOffering();

    return () => {
      mounted = false;
    };
  }, [subscription.offering]);

  const isLaunchOffer = !appState.hasSeenInitialPremiumOffer;
  const currentPlan = membership.currentPlanLabel;
  const isPremium = currentPlan === "Premium";
  const isLifelong = currentPlan === "Lifelong";
  const monthlyPackage = subscription.monthlyPackage;
  const yearlyPackage = subscription.yearlyPackage;
  const lifelongPackage = fallbackLifelongPackage;

  useEffect(() => {
    if (yearlyPackage) {
      setSelectedPremiumPlan("yearly");
      return;
    }

    if (monthlyPackage) {
      setSelectedPremiumPlan("monthly");
    }
  }, [monthlyPackage, yearlyPackage]);

  useEffect(() => {
    trackAppEvent("paywall_seen", {
      launchOffer: isLaunchOffer,
      currentPlan,
    });
  }, [currentPlan, isLaunchOffer]);

  const premiumBenefits = [
    isLaunchOffer ? t("onboarding.paywall.features.keep") : t("membership.benefitSavePages"),
    isLaunchOffer ? t("onboarding.paywall.features.return") : t("membership.benefitCollections"),
    isLaunchOffer ? t("onboarding.paywall.features.personal") : t("membership.benefitStyle"),
    isLaunchOffer ? t("onboarding.paywall.features.nothingLost") : t("membership.benefitNothingLost"),
  ];

  const premiumPlanOptions = useMemo<PremiumPlanOption[]>(
    () => [
      {
        id: "monthly",
        title: t("membership.planMonthly"),
        note: t("membership.planMonthlyNote"),
        price: formatPlanPrice(monthlyPackage?.product.priceString ?? null, t("membership.priceSuffixMonthly")),
        package: monthlyPackage,
      },
      {
        id: "yearly",
        title: t("membership.planYearly"),
        note: t("membership.planYearlyNote"),
        price: formatPlanPrice(yearlyPackage?.product.priceString ?? null, t("membership.priceSuffixYearly")),
        package: yearlyPackage,
        recommended: true,
      },
    ],
    [monthlyPackage, t, yearlyPackage],
  );

  const selectedPremiumOption =
    premiumPlanOptions.find((option) => option.id === selectedPremiumPlan) ??
    premiumPlanOptions.find((option) => option.package) ??
    premiumPlanOptions[0];

  const hasPremiumStoreOption = premiumPlanOptions.some((option) => Boolean(option.package));
  const hasAnyStorePlan = hasPremiumStoreOption || Boolean(lifelongPackage);
  const selectedPremiumPackage = selectedPremiumOption?.package ?? null;

  const premiumButtonLabel = useMemo(() => {
    if (purchaseLoading === "premium") {
      return t("common.preparing");
    }
    if (isLifelong) {
      return t("membership.includedWithLifelong");
    }
    if (isPremium) {
      return t("membership.currentPlanCta");
    }
    return isLaunchOffer ? t("onboarding.paywall.cta") : t("membership.choosePremium");
  }, [isLaunchOffer, isLifelong, isPremium, purchaseLoading, t]);

  const lifelongButtonLabel = useMemo(() => {
    if (purchaseLoading === "lifelong") {
      return t("common.preparing");
    }
    if (isLifelong) {
      return t("membership.currentPlanCta");
    }
    return t("membership.chooseLifelong");
  }, [isLifelong, purchaseLoading, t]);

  async function finishLaunchFlow() {
    if (!isLaunchOffer) {
      return;
    }

    await markInitialPremiumOfferSeen();
    navigation.reset({
      index: 0,
      routes: [{ name: "Today" }],
    });
  }

  async function handlePremiumSelection() {
    try {
      setPurchaseLoading("premium");
      trackAppEvent("purchase_started", {
        targetPlan: "premium",
        billingPlan: selectedPremiumPlan,
      });

      if (selectedPremiumPackage) {
        await subscription.purchasePackage(selectedPremiumPackage);
      } else {
        await membership.selectPlan("premium");
      }

      await subscription.refreshSubscriptionStatus();
      trackAppEvent("purchase_completed", {
        targetPlan: "premium",
        billingPlan: selectedPremiumPlan,
      });
      Alert.alert(t("membership.purchaseSuccessTitle"), t("membership.purchaseSuccessPremium"));
      await finishLaunchFlow();
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert(t("membership.purchaseErrorTitle"), t("membership.purchaseErrorBody"));
      }
    } finally {
      setPurchaseLoading(null);
    }
  }

  async function handleLifelongSelection() {
    try {
      setPurchaseLoading("lifelong");
      trackAppEvent("purchase_started", {
        targetPlan: "lifelong",
      });

      if (lifelongPackage) {
        await subscription.purchasePackage(lifelongPackage);
      } else {
        await membership.selectPlan("lifelong");
      }

      await subscription.refreshSubscriptionStatus();
      trackAppEvent("purchase_completed", {
        targetPlan: "lifelong",
      });
      Alert.alert(t("membership.purchaseSuccessTitle"), t("membership.purchaseSuccessLifelong"));
      await finishLaunchFlow();
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert(t("membership.purchaseErrorTitle"), t("membership.purchaseErrorBody"));
      }
    } finally {
      setPurchaseLoading(null);
    }
  }

  async function handleRestore() {
    try {
      await membership.restoreMembership();
      Alert.alert(t("membership.restoreSuccessTitle"), t("membership.restoreSuccessBody"));
      await finishLaunchFlow();
    } catch (error) {
      Alert.alert(t("membership.restoreErrorTitle"), t("membership.restoreErrorBody"));
    }
  }

  async function handleContinueFree() {
    trackAppEvent("continue_free", { launchOffer: isLaunchOffer });
    if (isLaunchOffer) {
      await finishLaunchFlow();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Today");
  }

  const premiumDisabled =
    purchaseLoading !== null || isPremium || isLifelong || (!selectedPremiumPackage && !__DEV_OVERRIDE_ENABLED__);
  const lifelongDisabled = purchaseLoading !== null || isLifelong || (!lifelongPackage && !__DEV_OVERRIDE_ENABLED__);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} bounces={false}>
        <AnimatedReveal delay={40} distance={10}>
          <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.accent, fontFamily: typography.meta }]}>
            {t("membership.eyebrow")}
          </Text>
          <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>
            {isLaunchOffer ? t("onboarding.paywall.title") : t("membership.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {isLaunchOffer ? t("onboarding.paywall.subtitle") : t("membership.subtitle")}
          </Text>
          <Text style={[styles.heroLine, { color: colors.primaryText, fontFamily: typography.body }]}>
            {isLaunchOffer ? t("brand.quietPlace") : t("membership.heroLine")}
          </Text>
          </View>
        </AnimatedReveal>

        {(!offeringLoaded || subscription.loading) && (
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.primaryText} />
          </View>
        )}

        <AnimatedReveal delay={160} duration={420} distance={14}>
          <View
            style={[
              styles.premiumCard,
              {
                backgroundColor: colorScheme === "dark" ? colors.paperRaised : "#F7F7F5",
                borderColor: colors.borderStrong,
                shadowColor: colors.shadowStrong,
              },
            ]}
          >
          <View style={[styles.cardRule, { backgroundColor: colorScheme === "dark" ? colors.accent : "#AE8F72" }]} />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.accent, fontFamily: typography.meta }]}>
              {t("membership.planPremium")}
            </Text>
            {isPremium ? <PlanBadge label={currentLabel()} /> : null}
          </View>

          <Text style={[styles.cardTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
            {isLaunchOffer ? t("onboarding.paywall.premiumTitle") : t("membership.premiumCardLine")}
          </Text>
          <Text style={[styles.cardBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {isLaunchOffer ? t("onboarding.paywall.premiumSubtitle") : t("membership.premiumCardBody")}
          </Text>

          <Text style={[styles.valueIntro, { color: colors.primaryText, fontFamily: typography.body }]}>
            {t("membership.valueIntro")}
          </Text>

          <View style={styles.benefitsList}>
            {premiumBenefits.map((benefit) => (
              <View key={benefit} style={styles.benefitRow}>
                <Text style={[styles.bullet, { color: colors.accent }]}>•</Text>
                <Text style={[styles.benefitText, { color: colors.primaryText, fontFamily: typography.body }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.anchorText, { color: colors.primaryText, fontFamily: typography.body }]}>
            {t("membership.anchorStay")}
          </Text>

          <View style={styles.planSelectionWrap}>
            {premiumPlanOptions.map((option) => {
              const selected = option.id === selectedPremiumPlan;

              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedPremiumPlan(option.id)}
                  style={[
                    styles.planOption,
                    {
                      backgroundColor: selected ? colors.surface : colors.card,
                      borderColor: selected ? colors.borderStrong : colors.border,
                    },
                  ]}
                >
                  <View style={styles.planOptionTopRow}>
                    <Text style={[styles.planOptionTitle, { color: colors.primaryText, fontFamily: typography.action }]}>
                      {option.title}
                    </Text>
                    {option.recommended ? <PlanBadge label={t("membership.bestValue")} subtle /> : null}
                  </View>
                  <Text style={[styles.planOptionPrice, { color: colors.primaryText, fontFamily: typography.action }]}>
                    {option.price ?? "—"}
                  </Text>
                  <Text style={[styles.planOptionNote, { color: colors.secondaryText, fontFamily: typography.body }]}>
                    {option.note}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.microcopyWrap}>
            <Text style={[styles.microcopyPrimary, { color: colors.primaryText, fontFamily: typography.body }]}>
              {t("membership.trialLineOne")}
            </Text>
            <Text style={[styles.microcopySecondary, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("membership.trialLineTwo")}
            </Text>
            <Text style={[styles.microcopySecondary, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("membership.premiumTrustNote")}
            </Text>
            <Text style={[styles.microcopySecondary, { color: colors.tertiaryText, fontFamily: typography.body }]}>
              {t("membership.subscriptionRenewalNote")}
            </Text>
          </View>

          <PrimaryButton label={premiumButtonLabel} onPress={() => void handlePremiumSelection()} disabled={premiumDisabled} style={styles.primaryButton} />
          </View>
        </AnimatedReveal>

        <AnimatedReveal delay={280} duration={420} distance={16}>
          <View style={[styles.lifelongCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.lifelongLabelWrap}>
              <Text style={[styles.lifelongTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
                {t("membership.planLifelong")}
              </Text>
              <PlanBadge label={t("membership.lifelongBadge")} subtle />
            </View>
            {isLifelong ? <PlanBadge label={currentLabel()} /> : null}
          </View>

          <Text style={[styles.lifelongSubtitle, { color: colors.primaryText, fontFamily: typography.display }]}>
            {isLaunchOffer ? t("onboarding.paywall.lifetime") : t("membership.lifelongCardLine")}
          </Text>
          <Text style={[styles.lifelongBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {isLaunchOffer ? t("onboarding.paywall.lifetimeSub") : t("membership.lifelongCardBody")}
          </Text>
          <Text style={[styles.lifelongNote, { color: colors.tertiaryText, fontFamily: typography.body }]}>
            {t("membership.lifelongCardNote")}
          </Text>

          <Text style={[styles.lifelongPrice, { color: colors.primaryText, fontFamily: typography.action }]}>
            {formatPlanPrice(lifelongPackage?.product.priceString ?? null, t("membership.priceSuffixLifetime")) ?? "—"}
          </Text>
          <Text style={[styles.lifelongFootnote, { color: colors.tertiaryText, fontFamily: typography.body }]}>
            {t("membership.oneTimePurchaseNote")}
          </Text>

          <PrimaryButton
            label={lifelongButtonLabel}
            onPress={() => {
              void handleLifelongSelection();
            }}
            disabled={lifelongDisabled}
            variant="secondary"
            style={styles.secondaryButton}
          />
          </View>
        </AnimatedReveal>

        {!hasAnyStorePlan && offeringLoaded ? (
          <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.errorTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
              {t("membership.errorTitle")}
            </Text>
            <Text style={[styles.errorBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("membership.storeUnavailableNote")}
            </Text>
          </View>
        ) : null}

        <AnimatedReveal delay={380} duration={380} distance={18}>
          <View style={[styles.freeCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.freeLabel, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
            {t("membership.freemiumMiniTitle")}
          </Text>
          <Text style={[styles.freeBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("membership.freemiumMiniBody")}
          </Text>
          <Text style={[styles.freeTrustText, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("membership.freeTrustNote")}
          </Text>
          <PrimaryButton
            label={isLaunchOffer ? t("onboarding.paywall.free") : t("membership.freeAction")}
            variant="ghost"
            onPress={() => {
              void handleContinueFree();
            }}
            style={styles.freeButton}
          />
          <Pressable onPress={() => void handleRestore()} hitSlop={8} style={styles.restoreWrap}>
            <Text style={[styles.restoreText, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {isLaunchOffer ? t("onboarding.paywall.restore") : t("settings.restorePurchases")}
            </Text>
          </Pressable>
          </View>
        </AnimatedReveal>

        {subscription.error && hasAnyStorePlan ? (
          <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.errorTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
              {t("membership.errorTitle")}
            </Text>
            <Text style={[styles.errorBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("membership.errorBody")}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
  },
  header: {
    gap: 10,
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.3,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  heroLine: {
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 324,
  },
  loadingCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  premiumCard: {
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 22,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  cardRule: {
    width: 52,
    height: 2,
    borderRadius: 999,
    marginBottom: 16,
    opacity: 0.78,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "600",
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  valueIntro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 9,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bullet: {
    fontSize: 19,
    lineHeight: 22,
    marginTop: -1,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  anchorText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  planSelectionWrap: {
    gap: 10,
    marginBottom: 16,
  },
  planOption: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 4,
  },
  planOptionTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  planOptionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
  },
  planOptionPrice: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
  },
  planOptionNote: {
    fontSize: 13,
    lineHeight: 18,
  },
  microcopyWrap: {
    gap: 3,
    marginBottom: 14,
  },
  microcopyPrimary: {
    fontSize: 13,
    lineHeight: 18,
  },
  microcopySecondary: {
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    alignSelf: "stretch",
  },
  lifelongCard: {
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 19,
    marginBottom: 14,
  },
  lifelongLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  lifelongTitle: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "600",
  },
  lifelongSubtitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "600",
    marginBottom: 6,
  },
  lifelongBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  lifelongNote: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  lifelongPrice: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  lifelongFootnote: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  secondaryButton: {
    alignSelf: "stretch",
  },
  freeCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 14,
  },
  freeLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  freeBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  freeTrustText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  freeButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
    minHeight: 44,
  },
  restoreWrap: {
    alignSelf: "flex-start",
    paddingTop: 6,
    paddingBottom: 2,
  },
  restoreText: {
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: "underline",
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 8,
  },
  errorTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});

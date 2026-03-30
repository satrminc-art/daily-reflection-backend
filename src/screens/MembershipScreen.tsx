import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { PlanBadge } from "@/components/membership/PlanBadge";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useSubscription } from "@/hooks/useSubscription";
import { useTypography } from "@/hooks/useTypography";
import { RootStackParamList } from "@/navigation/types";
import { findLifelongPackage, findPremiumPackage, getCurrentOffering } from "@/services/purchases";
import { PurchaseTarget } from "@/types/membership";
import type { PurchasesPackage } from "@/types/purchases";
import { palette } from "@/utils/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Membership">;

export function MembershipScreen({ navigation }: Props) {
  const { appState, colorScheme, markInitialPremiumOfferSeen } = useAppContext();
  const { t, currentLabel } = useAppStrings();
  const membership = useMembership();
  const subscription = useSubscription();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const [premiumPackage, setPremiumPackage] = useState<PurchasesPackage | null>(null);
  const [lifelongPackage, setLifelongPackage] = useState<PurchasesPackage | null>(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<PurchaseTarget | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadOffering() {
      try {
        setScreenLoading(true);
        const offering = await getCurrentOffering();

        if (!mounted) {
          return;
        }

        setPremiumPackage(offering ? findPremiumPackage(offering) : null);
        setLifelongPackage(offering ? findLifelongPackage(offering) : null);
      } catch (error) {
        if (__DEV__) {
          console.warn("Failed to load membership offering", error);
        }
      } finally {
        if (mounted) {
          setScreenLoading(false);
        }
      }
    }

    void loadOffering();

    return () => {
      mounted = false;
    };
  }, []);

  const isLaunchOffer = !appState.hasSeenInitialPremiumOffer;
  const currentPlan = membership.currentPlanLabel;
  const isFreemium = currentPlan === "Freemium";
  const isPremium = currentPlan === "Premium";
  const isLifelong = currentPlan === "Lifelong";
  const yearlyPremiumPackage = subscription.yearlyPackage ?? premiumPackage;
  const premiumPrice = yearlyPremiumPackage?.product.priceString ?? premiumPackage?.product.priceString ?? null;
  const lifelongPrice = lifelongPackage?.product.priceString ?? null;

  const premiumBenefits = [
    t("membership.benefitSavePages"),
    t("membership.benefitCollections"),
    t("membership.benefitStyle"),
    t("membership.benefitUnlimited"),
    t("membership.benefitNothingLost"),
  ];

  const premiumButtonLabel = useMemo(() => {
    if (purchaseLoading === "premium") {
      return t("common.preparing");
    }
    if (isPremium) {
      return t("membership.currentPlanCta");
    }
    if (isLifelong) {
      return t("membership.includedWithLifelong");
    }
    return t("membership.choosePremium");
  }, [isLifelong, isPremium, purchaseLoading, t]);

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

  async function handlePlanSelection(targetPlan: PurchaseTarget) {
    try {
      setPurchaseLoading(targetPlan);
      await membership.selectPlan(targetPlan);
      Alert.alert(
        t("membership.purchaseSuccessTitle"),
        targetPlan === "premium"
          ? t("membership.purchaseSuccessPremium")
          : t("membership.purchaseSuccessLifelong"),
      );
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

  const premiumDisabled = purchaseLoading !== null || isPremium || isLifelong;
  const lifelongDisabled = purchaseLoading !== null || isLifelong;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBackground }]}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.accent, fontFamily: typography.meta }]}>
            {t("membership.eyebrow")}
          </Text>
          <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>
            {t("membership.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("membership.heroLine")}
          </Text>
        </View>

        {(screenLoading || membership.loading) && (
          <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ActivityIndicator color={colors.primaryText} />
          </View>
        )}

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
            {t("membership.premiumCardLine")}
          </Text>
          <Text style={[styles.cardBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("membership.premiumCardBody")}
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

          {premiumPrice ? (
            <View style={styles.priceWrap}>
              {subscription.yearlyPackage ? <PlanBadge label={t("membership.bestValue")} subtle /> : null}
              <Text style={[styles.priceText, { color: colors.primaryText, fontFamily: typography.action }]}>
                {premiumPrice}
              </Text>
            </View>
          ) : null}

          <View style={styles.microcopyWrap}>
            <Text style={[styles.microcopyPrimary, { color: colors.primaryText, fontFamily: typography.body }]}>
              {t("membership.trialLineOne")}
            </Text>
            <Text style={[styles.microcopySecondary, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("membership.trialLineTwo")}
            </Text>
          </View>

          <PrimaryButton
            label={premiumButtonLabel}
            onPress={() => {
              void handlePlanSelection("premium");
            }}
            disabled={premiumDisabled}
            style={styles.primaryButton}
          />
        </View>

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
            {t("membership.lifelongCardLine")}
          </Text>
          <Text style={[styles.lifelongBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("membership.lifelongCardBody")}
          </Text>

          {lifelongPrice ? (
            <Text style={[styles.lifelongPrice, { color: colors.primaryText, fontFamily: typography.action }]}>
              {lifelongPrice}
            </Text>
          ) : null}

          <PrimaryButton
            label={lifelongButtonLabel}
            onPress={() => {
              void handlePlanSelection("lifelong");
            }}
            disabled={lifelongDisabled}
            variant="secondary"
            style={styles.secondaryButton}
          />
        </View>

        <View style={[styles.freeCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Text style={[styles.freeLabel, { color: colors.tertiaryText, fontFamily: typography.meta }]}>
            {t("membership.freemiumMiniTitle")}
          </Text>
          <Text style={[styles.freeBody, { color: colors.secondaryText, fontFamily: typography.body }]}>
            {t("membership.freemiumMiniBody")}
          </Text>
          <PrimaryButton
            label={t("membership.freeAction")}
            variant="ghost"
            onPress={() => {
              void handleContinueFree();
            }}
            style={styles.freeButton}
          />
          <Pressable onPress={() => void handleRestore()} hitSlop={8} style={styles.restoreWrap}>
            <Text style={[styles.restoreText, { color: colors.secondaryText, fontFamily: typography.body }]}>
              {t("settings.restorePurchases")}
            </Text>
          </Pressable>
        </View>

        {subscription.error ? (
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
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    gap: 8,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 332,
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
    paddingVertical: 20,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  cardRule: {
    width: 52,
    height: 2,
    borderRadius: 999,
    marginBottom: 14,
    opacity: 0.78,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
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
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  benefitsList: {
    gap: 8,
    marginBottom: 14,
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
    lineHeight: 18,
    marginBottom: 6,
  },
  priceWrap: {
    gap: 8,
    marginBottom: 6,
    alignItems: "flex-start",
  },
  priceText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
  },
  microcopyWrap: {
    gap: 2,
    marginBottom: 12,
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
    paddingVertical: 17,
    marginBottom: 12,
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
    marginBottom: 10,
  },
  lifelongPrice: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600",
    marginBottom: 12,
  },
  secondaryButton: {
    alignSelf: "flex-start",
  },
  freeCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
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
    marginBottom: 10,
  },
  freeButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
    minHeight: 44,
  },
  restoreWrap: {
    alignSelf: "flex-start",
    paddingTop: 4,
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

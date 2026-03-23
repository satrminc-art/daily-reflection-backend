import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MembershipCard } from "@/components/membership/MembershipCard";
import { PlanBadge } from "@/components/membership/PlanBadge";
import { PremiumFeatureList } from "@/components/membership/PremiumFeatureList";
import { ScreenContainer } from "@/components/ScreenContainer";
import { MEMBERSHIP_FEATURE_CATEGORIES, MEMBERSHIP_FEATURES } from "@/constants/premiumFeatures";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useMembership } from "@/hooks/useMembership";
import { useSubscription } from "@/hooks/useSubscription";
import { useTypography } from "@/hooks/useTypography";
import { PurchaseTarget } from "@/types/membership";
import type { PurchasesPackage } from "@/types/purchases";
import { findLifelongPackage, findPremiumPackage, getCurrentOffering } from "@/services/purchases";
import { palette } from "@/utils/theme";

export function MembershipScreen() {
  const navigation = useNavigation<any>();
  const { colorScheme } = useAppContext();
  const {
    t,
    subscriptionPlanMeta,
    currentLabel,
    membershipFeatureCategoryDescription,
    membershipPlanNote,
    membershipStateBody,
    } = useAppStrings();
  const membership = useMembership();
  const subscription = useSubscription();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const [premiumPackage, setPremiumPackage] = useState<PurchasesPackage | null>(null);
  const [lifelongPackage, setLifelongPackage] = useState<PurchasesPackage | null>(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<PurchaseTarget | null>(null);

  const groupedFeatures = useMemo(
    () =>
      MEMBERSHIP_FEATURE_CATEGORIES.map((category) => ({
        category,
        features: MEMBERSHIP_FEATURES.filter((feature) => feature.category === category && feature.premiumOnly),
      })),
    [],
  );

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

    loadOffering().catch((error) => {
      if (__DEV__) {
        console.warn("Failed to prepare membership screen", error);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const premiumPriceText = premiumPackage?.product.priceString;
  const lifelongPriceText = lifelongPackage?.product.priceString;

  async function handlePlanSelection(targetPlan: PurchaseTarget) {
    try {
      setPurchaseLoading(targetPlan);
      await membership.selectPlan(targetPlan);
      Alert.alert(
        t("membership.purchaseSuccessTitle"),
        targetPlan === "premium" ? t("membership.purchaseSuccessPremium") : t("membership.purchaseSuccessLifelong"),
      );
    } catch (error: any) {
      if (!error?.userCancelled) {
        Alert.alert(t("membership.purchaseErrorTitle"), t("membership.purchaseErrorBody"));
      }
    } finally {
      setPurchaseLoading(null);
    }
  }

  function getPlanAction(plan: "Freemium" | "Premium" | "Lifelong") {
    if (membership.currentPlanLabel === "Freemium") {
      if (plan === "Premium") {
        return {
          label: purchaseLoading === "premium" ? t("common.preparing") : t("membership.choosePremium"),
          onPress: () => {
            handlePlanSelection("premium").catch((error) => {
              console.warn("Failed to select Premium plan", error);
            });
          },
        };
      }

      if (plan === "Lifelong") {
        return {
          label: purchaseLoading === "lifelong" ? t("common.preparing") : t("membership.chooseLifelong"),
          onPress: () => {
            handlePlanSelection("lifelong").catch((error) => {
              console.warn("Failed to select Lifelong plan", error);
            });
          },
        };
      }
    }

    if (membership.currentPlanLabel === "Premium" && plan === "Lifelong") {
      return {
        label: purchaseLoading === "lifelong" ? t("common.preparing") : t("membership.unlockLifelong"),
        onPress: () => {
          handlePlanSelection("lifelong").catch((error) => {
            console.warn("Failed to select Lifelong plan", error);
          });
        },
      };
    }

    return null;
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>{t("membership.eyebrow")}</Text>
        <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{t("membership.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{t("membership.subtitle")}</Text>
      </View>

      <View style={styles.cardStack}>
        {(["Freemium", "Premium", "Lifelong"] as const).map((plan) => (
          (() => {
            const planAction = getPlanAction(plan);

            return (
              <MembershipCard
                key={plan}
                plan={plan}
                summary={subscriptionPlanMeta(plan).summary}
                note={membershipPlanNote(plan)}
                priceText={plan === "Premium" ? premiumPriceText : plan === "Lifelong" ? lifelongPriceText : undefined}
                planBadge={plan === "Lifelong" ? t("membership.lifelongBadge") : undefined}
                active={membership.currentPlanLabel === plan}
                activeLabel={currentLabel()}
                actionLabel={planAction?.label}
                onActionPress={planAction?.onPress}
                actionDisabled={purchaseLoading !== null}
              />
            );
          })()
        ))}
      </View>

      {(screenLoading || membership.loading) && (
        <View style={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.primaryText} />
        </View>
      )}

      <View style={[styles.stateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.stateHeader}>
          <Text style={[styles.stateTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
            {t("membership.stateTitle")}
          </Text>
          <PlanBadge label={membership.currentPlanLabel} subtle={!membership.hasPremiumAccess} />
        </View>
        <Text style={[styles.stateBody, { color: colors.secondaryText }]}>
          {membershipStateBody(membership.currentPlanLabel)}
        </Text>
        {membership.isUsingDevOverride ? (
          <Text style={[styles.stateNote, { color: colors.tertiaryText }]}>{t("membership.devStateNote")}</Text>
        ) : null}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
            {t("membership.premiumIncludedTitle")}
          </Text>
          {membership.hasPremiumAccess ? <PlanBadge label={membership.currentPlanLabel} /> : null}
        </View>

        <View style={styles.featureGroups}>
          {groupedFeatures.map(({ category, features }) => (
            <View key={category} style={styles.groupWrap}>
              <Text style={[styles.groupDescription, { color: colors.tertiaryText }]}>
                {membershipFeatureCategoryDescription(category)}
              </Text>
              <PremiumFeatureList category={category} features={features} />
            </View>
          ))}
        </View>
      </View>

      {subscription.error && !membership.isUsingDevOverride ? (
        <View style={[styles.errorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.errorTitle, { color: colors.primaryText, fontFamily: typography.display }]}>
            {t("membership.errorTitle")}
          </Text>
          <Text style={[styles.errorBody, { color: colors.secondaryText }]}>{t("membership.errorBody")}</Text>
        </View>
      ) : null}

      <View style={styles.footerActions}>
        <Pressable
          onPress={() => {
            membership.restoreMembership()
              .then(() => {
                Alert.alert(t("membership.restoreSuccessTitle"), t("membership.restoreSuccessBody"));
              })
              .catch(() => {
                Alert.alert(t("membership.restoreErrorTitle"), t("membership.restoreErrorBody"));
              });
          }}
          style={styles.footerLinkWrap}
        >
          <Text style={[styles.footerLink, { color: colors.secondaryText }]}>{t("paywall.restore")}</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            Alert.alert(t("membership.manageTitle"), t("settings.manageSubscriptionBody"));
          }}
          style={styles.footerLinkWrap}
        >
          <Text style={[styles.footerLink, { color: colors.secondaryText }]}>{t("settings.manageSubscription")}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 340,
  },
  cardStack: {
    gap: 10,
    marginBottom: 18,
  },
  loadingCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
    marginBottom: 18,
  },
  stateCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 8,
    marginBottom: 18,
  },
  stateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  stateTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },
  stateBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  stateNote: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
  },
  featureGroups: {
    gap: 16,
  },
  groupWrap: {
    gap: 8,
  },
  groupDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 8,
    marginBottom: 18,
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
  footerActions: {
    paddingBottom: 20,
    gap: 2,
  },
  footerLinkWrap: {
    paddingVertical: 8,
  },
  footerLink: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
});

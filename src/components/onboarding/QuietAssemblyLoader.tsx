import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { AnimatedDivider } from "@/components/onboarding/AnimatedDivider";
import { AnimatedReveal } from "@/components/onboarding/AnimatedReveal";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

export const QUIET_ASSEMBLY_OUTER_ROTATION_MS = 12000;
export const QUIET_ASSEMBLY_INNER_PULSE_MS = 3000;
export const QUIET_ASSEMBLY_CENTER_PULSE_MS = 2600;
export const QUIET_ASSEMBLY_PROGRESS_SETTLE_MS = 1400;

type SummaryItem = {
  label: string;
  value: string;
};

interface Props {
  eyebrow: string;
  summaryItems: SummaryItem[];
  visibleSummaryCount: number;
  statusText: string;
  isCompleting: boolean;
  progress: number;
}

export function QuietAssemblyLoader({
  eyebrow,
  summaryItems,
  visibleSummaryCount,
  statusText,
  isCompleting,
  progress,
}: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const orbitRotation = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  const innerScale = useRef(new Animated.Value(0.985)).current;
  const innerOpacity = useRef(new Animated.Value(0.55)).current;
  const centerScale = useRef(new Animated.Value(0.88)).current;
  const centerOpacity = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(14)).current;
  const paperDrift = useRef(new Animated.Value(0)).current;
  const loaderSettle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cardIntro = Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 780,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const innerLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(innerScale, {
            toValue: 1.035,
            duration: QUIET_ASSEMBLY_INNER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(innerOpacity, {
            toValue: 0.82,
            duration: QUIET_ASSEMBLY_INNER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(innerScale, {
            toValue: 0.985,
            duration: QUIET_ASSEMBLY_INNER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(innerOpacity, {
            toValue: 0.55,
            duration: QUIET_ASSEMBLY_INNER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const centerLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(centerScale, {
            toValue: 1.08,
            duration: QUIET_ASSEMBLY_CENTER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(centerOpacity, {
            toValue: 1,
            duration: QUIET_ASSEMBLY_CENTER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(centerScale, {
            toValue: 0.88,
            duration: QUIET_ASSEMBLY_CENTER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(centerOpacity, {
            toValue: 0.7,
            duration: QUIET_ASSEMBLY_CENTER_PULSE_MS / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    const paperLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(paperDrift, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(paperDrift, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const orbitLoop = Animated.loop(
      Animated.timing(orbitRotation, {
        toValue: 1,
        duration: QUIET_ASSEMBLY_OUTER_ROTATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    cardIntro.start();
    orbitLoop.start();
    innerLoop.start();
    centerLoop.start();
    paperLoop.start();

    return () => {
      cardIntro.stop();
      orbitLoop.stop();
      innerLoop.stop();
      centerLoop.stop();
      paperLoop.stop();
    };
  }, [
    cardOpacity,
    cardTranslateY,
    centerOpacity,
    centerScale,
    innerOpacity,
    innerScale,
    orbitRotation,
    paperDrift,
    progressValue,
    loaderSettle,
  ]);

  useEffect(() => {
    Animated.timing(progressValue, {
      toValue: Math.max(0.1, Math.min(progress, 1)),
      duration: 520,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, progressValue]);

  useEffect(() => {
    Animated.timing(loaderSettle, {
      toValue: isCompleting ? 1 : 0,
      duration: QUIET_ASSEMBLY_PROGRESS_SETTLE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isCompleting, loaderSettle]);

  const orbitRotate = orbitRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const progressSweepRotate = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "32deg"],
  });
  const rightProgressRotate = progressValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "180deg", "180deg"],
  });
  const leftProgressRotate = progressValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "0deg", "180deg"],
  });
  const rearTranslate = paperDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 4],
  });
  const frontTranslate = paperDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [3, -3],
  });
  const loaderScale = loaderSettle.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.985],
  });
  const loaderOpacity = loaderSettle.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });
  const visibleItems = useMemo(() => summaryItems.slice(0, visibleSummaryCount), [summaryItems, visibleSummaryCount]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.loaderWrap, { opacity: loaderOpacity, transform: [{ scale: loaderScale }] }]}>
        <Animated.View
          style={[
            styles.paperLayer,
            styles.paperRear,
            {
              backgroundColor: colors.paperTint,
              borderColor: colors.border,
              transform: [{ translateY: rearTranslate }, { rotate: "-6deg" }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.paperLayer,
            styles.paperFront,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderStrong,
              transform: [{ translateY: frontTranslate }, { rotate: "5deg" }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.outerRingTrack,
            {
              borderColor: colors.border,
              backgroundColor: colors.paperTint,
              transform: [{ rotate: orbitRotate }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.progressHalfWrap,
            styles.progressHalfRightWrap,
          ]}
        >
          <Animated.View
            style={[
              styles.outerRingProgress,
              styles.outerRingRight,
              {
                borderColor: colors.accent,
                transform: [{ rotate: orbitRotate }, { rotate: rightProgressRotate }, { rotate: progressSweepRotate }],
              },
            ]}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.progressHalfWrap,
            styles.progressHalfLeftWrap,
          ]}
        >
          <Animated.View
            style={[
              styles.outerRingProgress,
              styles.outerRingLeft,
              {
                borderColor: colors.accent,
                transform: [{ rotate: orbitRotate }, { rotate: leftProgressRotate }, { rotate: progressSweepRotate }],
              },
            ]}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.innerRing,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: innerOpacity,
              transform: [{ scale: innerScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.centerDot,
              {
                backgroundColor: colors.accent,
                opacity: centerOpacity,
                transform: [{ scale: centerScale }],
              },
            ]}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.borderStrong,
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
        <AnimatedReveal delay={220} duration={640} distance={10}>
          <View style={styles.headerWrap}>
            <Text style={[styles.eyebrow, { color: colors.accent, fontFamily: typography.meta }]}>{eyebrow}</Text>
            <AnimatedDivider delay={160} width={58} style={styles.headerDivider} />
          </View>
        </AnimatedReveal>
        {summaryItems.map((item, index) =>
          index < visibleItems.length ? (
            <AnimatedReveal key={item.label} delay={0} duration={520} distance={10}>
              <View
                style={[
                  styles.row,
                  index > 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.label, { color: colors.tertiaryText, fontFamily: typography.meta }]}>{item.label}</Text>
                <Text style={[styles.value, { color: colors.primaryText, fontFamily: typography.body }]}>{item.value}</Text>
              </View>
            </AnimatedReveal>
          ) : (
            <View
              key={item.label}
              style={[
                styles.row,
                styles.rowPlaceholder,
                index > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: colors.border,
                },
              ]}
            />
          ),
        )}
      </Animated.View>

      <View style={styles.statusWrap}>
        <AnimatedReveal key={statusText} delay={0} duration={760} distance={10}>
          <Text style={[styles.status, { color: isCompleting ? colors.primaryText : colors.secondaryText, fontFamily: typography.body }]}>
            {statusText}
          </Text>
        </AnimatedReveal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    gap: 28,
  },
  loaderWrap: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  paperLayer: {
    position: "absolute",
    width: 156,
    height: 114,
    borderRadius: 30,
    borderWidth: 1,
  },
  paperRear: {
    opacity: 0.42,
  },
  paperFront: {
    opacity: 0.74,
  },
  outerRingTrack: {
    position: "absolute",
    width: 134,
    height: 134,
    borderRadius: 67,
    borderWidth: 2,
  },
  progressHalfWrap: {
    position: "absolute",
    width: 67,
    height: 134,
    overflow: "hidden",
    top: 8,
  },
  progressHalfRightWrap: {
    left: 75,
  },
  progressHalfLeftWrap: {
    left: 8,
  },
  outerRingProgress: {
    position: "absolute",
    width: 134,
    height: 134,
    borderRadius: 67,
    borderWidth: 3,
  },
  outerRingRight: {
    left: -67,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
  },
  outerRingLeft: {
    left: 0,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  innerRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerWrap: {
    gap: 10,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  headerDivider: {
    alignSelf: "flex-start",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    paddingVertical: 12,
  },
  rowPlaceholder: {
    minHeight: 50,
    opacity: 0.18,
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  value: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "right",
  },
  statusWrap: {
    minHeight: 54,
    width: "100%",
    maxWidth: 332,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  status: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
  },
});

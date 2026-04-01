import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { AnimatedReveal } from "@/components/onboarding/AnimatedReveal";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  stepLabel?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  align?: "center" | "top";
  headerAlign?: "center" | "left";
  contentStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  footerRevealDelay?: number;
  disableBodyReveal?: boolean;
}

export function OnboardingScaffold({
  stepLabel,
  title,
  subtitle,
  children,
  footer,
  align = "center",
  headerAlign = "center",
  contentStyle,
  bodyStyle,
  footerStyle,
  footerRevealDelay = 560,
  disableBodyReveal = false,
}: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const isHeaderCentered = headerAlign === "center";

  return (
    <View style={[styles.stage, align === "top" ? styles.stageTop : styles.stageCentered]}>
      <View style={[styles.content, contentStyle]}>
        {stepLabel ? <Text style={[styles.stepLabel, { color: colors.accent }]}>{stepLabel}</Text> : null}
        <View style={[styles.header, isHeaderCentered ? styles.headerCentered : styles.headerLeft]}>
          <AnimatedReveal delay={80} duration={520} distance={12}>
            {typeof title === "string" ? (
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.primaryText,
                    fontFamily: typography.display,
                    textAlign: isHeaderCentered ? "center" : "left",
                  },
                ]}
              >
                {title}
              </Text>
            ) : (
              title
            )}
          </AnimatedReveal>
          {subtitle ? (
            <AnimatedReveal delay={240} duration={560} distance={14}>
              {typeof subtitle === "string" ? (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: colors.secondaryText,
                      textAlign: isHeaderCentered ? "center" : "left",
                      paddingHorizontal: isHeaderCentered ? 8 : 0,
                    },
                  ]}
                >
                  {subtitle}
                </Text>
              ) : (
                subtitle
              )}
            </AnimatedReveal>
          ) : null}
        </View>
        {disableBodyReveal ? (
          <View style={[styles.body, bodyStyle]}>{children}</View>
        ) : (
          <AnimatedReveal delay={390} duration={480} distance={16} style={[styles.body, bodyStyle]}>
            {children}
          </AnimatedReveal>
        )}
        {footer ? (
          <AnimatedReveal delay={footerRevealDelay} duration={460} distance={18} style={[styles.footer, footerStyle]}>
            {footer}
          </AnimatedReveal>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    paddingVertical: 24,
  },
  stageCentered: {
    justifyContent: "center",
  },
  stageTop: {
    justifyContent: "flex-start",
  },
  content: {
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: "100%",
    maxWidth: 460,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 18,
  },
  header: {
    gap: 12,
    marginBottom: 40,
    width: "100%",
  },
  headerCentered: {
    alignItems: "center",
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: 34,
    lineHeight: 43,
    letterSpacing: -0.75,
    maxWidth: 312,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 27,
    width: "100%",
    maxWidth: 320,
  },
  body: {
    gap: 16,
    width: "100%",
  },
  footer: {
    marginTop: 36,
    gap: 14,
  },
});

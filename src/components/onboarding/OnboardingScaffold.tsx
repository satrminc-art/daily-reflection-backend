import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  stepLabel?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  align?: "center" | "top";
  headerAlign?: "center" | "left";
  contentStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
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
          {subtitle ? (
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
          ) : null}
        </View>
        <View style={[styles.body, bodyStyle]}>{children}</View>
        {footer ? <View style={[styles.footer, footerStyle]}>{footer}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    paddingVertical: 20,
  },
  stageCentered: {
    justifyContent: "center",
  },
  stageTop: {
    justifyContent: "flex-start",
  },
  content: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    width: "100%",
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
    gap: 10,
    marginBottom: 24,
    width: "100%",
  },
  headerCentered: {
    alignItems: "center",
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: 35,
    lineHeight: 43,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    width: "100%",
  },
  body: {
    gap: 12,
    width: "100%",
  },
  footer: {
    marginTop: 20,
    gap: 10,
  },
});

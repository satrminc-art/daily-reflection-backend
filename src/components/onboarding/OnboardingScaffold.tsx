import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  stepLabel?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function OnboardingScaffold({ stepLabel, title, subtitle, children, footer }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  return (
    <View style={styles.stage}>
      <View style={styles.content}>
        {stepLabel ? <Text style={[styles.stepLabel, { color: colors.accent }]}>{stepLabel}</Text> : null}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 36,
  },
  content: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 22,
  },
  header: {
    gap: 10,
    alignItems: "center",
    marginBottom: 34,
  },
  title: {
    fontSize: 34,
    lineHeight: 42,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 280,
  },
  body: {
    gap: 14,
    width: "100%",
  },
  footer: {
    marginTop: 28,
    gap: 12,
  },
});

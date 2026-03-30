import React from "react";
import { Animated, Easing, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

type AccordionSectionVariant = "standard" | "private" | "premium" | "about" | "dev";

interface Props {
  title: string;
  summary?: string;
  expanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
  variant?: AccordionSectionVariant;
  style?: StyleProp<ViewStyle>;
}

export function AccordionSection({
  title,
  summary,
  expanded,
  onPress,
  children,
  variant = "standard",
  style,
}: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const progress = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const isLightMode = colorScheme === "light";
  const isPremiumVariant = variant === "premium";
  const closedSurfaceColor = (() => {
    if (!isLightMode) {
      if (variant === "premium") {
        return colors.surface;
      }
      if (variant === "private") {
        return colors.surfaceMuted;
      }
      return colors.surface;
    }

    if (variant === "premium") {
      return "#F0E6DA";
    }
    if (variant === "private") {
      return "#EEE5DB";
    }
    if (variant === "about" || variant === "dev") {
      return "#EFEAE3";
    }
    return "#EFE9E1";
  })();
  const openSurfaceColor = (() => {
    if (!isLightMode) {
      return colors.elevatedSurface;
    }

    if (variant === "premium") {
      return "#F2E9DE";
    }
    if (variant === "private") {
      return "#F2ECE4";
    }
    if (variant === "about" || variant === "dev") {
      return "#F1ECE6";
    }
    return "#F2ECE4";
  })();
  const closedBorderColor = (() => {
    if (!isLightMode) {
      return isPremiumVariant ? colors.border : colors.border;
    }
    if (variant === "premium") {
      return "rgba(160, 124, 91, 0.16)";
    }
    if (variant === "private") {
      return "rgba(140, 108, 79, 0.15)";
    }
    return "rgba(120, 90, 60, 0.15)";
  })();
  const openBorderColor = (() => {
    if (!isLightMode) {
      return isPremiumVariant ? colors.borderStrong : colors.borderStrong;
    }
    if (variant === "premium") {
      return "rgba(160, 124, 91, 0.24)";
    }
    if (variant === "private") {
      return "rgba(140, 108, 79, 0.22)";
    }
    return "rgba(120, 90, 60, 0.2)";
  })();
  const titleColor = isPremiumVariant && !isLightMode ? colors.accent : colors.primaryText;
  const secondaryColor = colors.secondaryText;
  const closedShadowOpacity = 0;
  const openShadowOpacity = variant === "premium" ? 0.05 : 0.04;
  const closedShadowRadius = 0;
  const openShadowRadius = variant === "premium" ? 16 : 12;
  const titleStyle = isPremiumVariant ? styles.titlePremium : variant === "private" ? styles.titlePrivate : styles.title;
  const headerStyle = isPremiumVariant ? styles.headerPremium : styles.header;
  const bodyStyle = isPremiumVariant ? styles.bodyPremium : styles.body;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: expanded ? 1 : 0,
      duration: 240,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [expanded, progress]);

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [closedSurfaceColor, openSurfaceColor],
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [closedBorderColor, openBorderColor],
  });
  const shadowOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [closedShadowOpacity, openShadowOpacity],
  });
  const shadowRadius = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [closedShadowRadius, openShadowRadius],
  });

  return (
    <Animated.View
      style={[
        styles.shell,
        style,
        {
          backgroundColor,
          borderColor,
          shadowColor: colors.shadow,
          shadowOpacity,
          shadowRadius,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={({ pressed }) => [headerStyle, pressed && styles.pressed]}
      >
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <View style={styles.arrowWrap}>
              <Animated.Text
                style={[
                  styles.arrow,
                  {
                    color: secondaryColor,
                    transform: [{ rotate }],
                  },
                ]}
              >
                ›
              </Animated.Text>
            </View>
            <Text style={[titleStyle, { color: titleColor, fontFamily: typography.display }]}>{title}</Text>
          </View>
          {expanded && summary ? <Text style={[styles.summary, { color: secondaryColor }]}>{summary}</Text> : null}
        </View>
      </Pressable>

      {expanded ? <View style={bodyStyle}>{children}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  header: {
    minHeight: 84,
    paddingVertical: 18,
  },
  headerPremium: {
    minHeight: 92,
    paddingVertical: 20,
  },
  pressed: {
    opacity: 0.86,
  },
  copy: {
    gap: 8,
    width: "100%",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  arrowWrap: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  arrow: {
    fontSize: 13,
    lineHeight: 13,
    marginTop: 0.5,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "500",
    letterSpacing: 0.35,
  },
  titlePrivate: {
    flex: 1,
    minWidth: 0,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "500",
    letterSpacing: 0.4,
  },
  titlePremium: {
    flex: 1,
    minWidth: 0,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "600",
    letterSpacing: 0.45,
  },
  summary: {
    fontSize: 14,
    lineHeight: 23,
  },
  body: {
    paddingBottom: 24,
    gap: 24,
  },
  bodyPremium: {
    paddingBottom: 28,
    gap: 26,
  },
});

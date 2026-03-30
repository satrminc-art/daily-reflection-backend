import React from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  expanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

export function SettingsAccordionItem({ title, expanded, onPress, children }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const progress = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const isLightMode = colorScheme === "light";
  const closedSurfaceColor = isLightMode ? "#EFE9E1" : "transparent";
  const openSurfaceColor = isLightMode ? "#F2ECE4" : colors.elevatedSurface;
  const closedBorderColor = isLightMode ? "rgba(120, 90, 60, 0.15)" : colors.border;
  const openBorderColor = isLightMode ? "rgba(120, 90, 60, 0.2)" : colors.borderStrong;
  const titleColor = colors.primaryText;
  const chevronColor = isLightMode ? "#A07C5B" : colors.secondaryText;

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
    outputRange: [0, 0.04],
  });
  const shadowRadius = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  return (
    <Animated.View
      style={[
        styles.shell,
        {
          borderColor,
          backgroundColor,
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
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: titleColor, fontFamily: typography.display }]}>
            {title}
          </Text>
          <View style={styles.chevronWrap}>
            <Animated.Text
              style={[
                styles.chevron,
                {
                  color: chevronColor,
                  transform: [{ rotate }],
                },
              ]}
            >
              ›
            </Animated.Text>
          </View>
        </View>
      </Pressable>

      {expanded ? <View style={styles.body}>{children}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderRadius: 18,
    paddingTop: 4,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
  },
  header: {
    minHeight: 58,
    justifyContent: "center",
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.86,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
  chevron: {
    fontSize: 13,
    lineHeight: 13,
  },
  chevronWrap: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
  },
  body: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 18,
    gap: 16,
  },
});

import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  summary?: string;
  expanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}

export function AccordionSection({ title, summary, expanded, onPress, children }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const rotation = React.useRef(new Animated.Value(expanded ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View style={styles.shell}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Animated.Text
              style={[
                styles.arrow,
                {
                  color: colors.secondaryText,
                  transform: [{ rotate }],
                },
              ]}
            >
              ›
            </Animated.Text>
            <Text style={[styles.title, { color: colors.primaryText, fontFamily: typography.display }]}>{title}</Text>
          </View>
          {expanded && summary ? <Text style={[styles.summary, { color: colors.secondaryText }]}>{summary}</Text> : null}
        </View>
      </Pressable>

      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
  },
  header: {
    minHeight: 70,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.86,
  },
  copy: {
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrow: {
    fontSize: 14,
    lineHeight: 14,
    marginTop: 1,
  },
  title: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "500",
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    paddingBottom: 18,
    gap: 18,
  },
});

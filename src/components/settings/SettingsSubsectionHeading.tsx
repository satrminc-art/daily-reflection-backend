import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  title: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

export function SettingsSubsectionHeading({ title, value, onPress, danger = false }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();

  const content = (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View
          style={[
            styles.bullet,
            {
              backgroundColor: danger ? colors.danger : colors.accentSoft,
              borderColor: danger ? colors.danger : colors.border,
            },
          ]}
        />
        <Text
          style={[
            styles.title,
            { color: danger ? colors.danger : colors.primaryText, fontFamily: typography.display },
          ]}
        >
          {title}
        </Text>
      </View>
      {value ? <Text style={[styles.value, { color: colors.secondaryText }]}>{value}</Text> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pressed: {
    opacity: 0.86,
  },
  titleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
    opacity: 0.95,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
  },
});

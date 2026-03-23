import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppContext } from "@/context/AppContext";
import { palette } from "@/utils/theme";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

export function AdaptiveTimePicker({ value, onChange }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];

  return (
    <View style={styles.container}>
      <DateTimePicker
        mode="time"
        display={Platform.select({ ios: "spinner", android: "default" })}
        value={value}
        onChange={(_, nextDate) => {
          if (nextDate) {
            onChange(nextDate);
          }
        }}
        style={Platform.OS === "ios" ? styles.iosPicker : undefined}
        themeVariant={Platform.OS === "ios" ? colorScheme : undefined}
        textColor={Platform.OS === "ios" ? colors.primaryText : undefined}
        accentColor={colors.accent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    alignItems: "center",
    minHeight: 48,
  },
  iosPicker: {
    alignSelf: "center",
  },
});

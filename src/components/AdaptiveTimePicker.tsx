import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  androidActionLabels?: {
    cancel: string;
    apply: string;
  };
}

export function AdaptiveTimePicker({ value, onChange, androidActionLabels }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const [draftValue, setDraftValue] = useState(value);
  const pickerDisplay = Platform.select({
    ios: "spinner" as const,
    android: "spinner" as const,
    default: "default" as const,
  });
  const usesAndroidConfirmation = Platform.OS === "android" && !!androidActionLabels;
  const hasPendingChange =
    draftValue.getHours() !== value.getHours() || draftValue.getMinutes() !== value.getMinutes();

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  return (
    <View
      style={[
        styles.container,
        Platform.OS === "android"
          ? {
              backgroundColor: colors.elevatedSurface,
              borderColor: colors.borderStrong,
            }
          : null,
      ]}
    >
      <DateTimePicker
        mode="time"
        display={pickerDisplay}
        value={usesAndroidConfirmation ? draftValue : value}
        onChange={(event, nextDate) => {
          if (Platform.OS === "android" && event.type === "dismissed") {
            setDraftValue(value);
            return;
          }

          if (nextDate) {
            if (usesAndroidConfirmation) {
              setDraftValue(nextDate);
            } else {
              onChange(nextDate);
            }
          }
        }}
        style={Platform.OS === "ios" ? styles.iosPicker : styles.androidPicker}
        themeVariant={Platform.OS === "ios" ? colorScheme : undefined}
        textColor={colors.primaryText}
        accentColor={colors.accent}
      />
      {usesAndroidConfirmation && androidActionLabels ? (
        <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setDraftValue(value)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={[styles.actionText, { color: colors.secondaryText, fontFamily: typography.action }]}>
              {androidActionLabels.cancel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!hasPendingChange}
            onPress={() => onChange(draftValue)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonPrimary,
              !hasPendingChange && styles.actionButtonDisabled,
              pressed && hasPendingChange && styles.actionButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.actionText,
                {
                  color: hasPendingChange ? colors.accent : colors.tertiaryText,
                  fontFamily: typography.action,
                },
              ]}
            >
              {androidActionLabels.apply}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    alignItems: "center",
    minHeight: 48,
    borderRadius: 26,
    borderWidth: Platform.OS === "android" ? 1 : 0,
    paddingHorizontal: Platform.OS === "android" ? 8 : 0,
    paddingVertical: Platform.OS === "android" ? 10 : 0,
  },
  iosPicker: {
    alignSelf: "center",
  },
  androidPicker: {
    alignSelf: "stretch",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    alignSelf: "stretch",
    marginTop: 12,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  actionButtonPrimary: {
    minWidth: 82,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.58,
  },
  actionButtonPressed: {
    opacity: 0.82,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.12,
  },
});

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "@/context/AppContext";
import { useTypography } from "@/hooks/useTypography";
import { palette } from "@/utils/theme";

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  variant?: "default" | "editorial";
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "default",
}: Props<T>) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const typography = useTypography();
  const isEditorial = variant === "editorial";

  return (
    <View
      style={
        isEditorial
          ? [styles.editorialShell]
          : [styles.shell, { backgroundColor: colors.surfaceMuted, borderColor: colors.borderStrong }]
      }
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              isEditorial
                ? styles.editorialOption
                : [
                    styles.option,
                    {
                      backgroundColor: selected ? colors.controlActiveSurface : colors.inputSurface,
                      borderColor: selected ? colors.borderStrong : colors.border,
                    },
                  ],
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.92}
              allowFontScaling={false}
              style={[
                isEditorial ? styles.editorialLabel : styles.label,
                {
                  color: selected ? colors.controlActiveText : colors.secondaryText,
                  fontFamily: typography.meta,
                },
              ]}
            >
              {option.label}
            </Text>
            {isEditorial ? (
              <View
                style={[
                  styles.editorialIndicator,
                  {
                    backgroundColor: selected ? colors.primaryText : "transparent",
                  },
                ]}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    minWidth: 92,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
    flexShrink: 1,
  },
  editorialShell: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    paddingTop: 2,
    paddingBottom: 2,
  },
  editorialOption: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  editorialLabel: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.35,
    textAlign: "center",
    flexShrink: 1,
  },
  editorialIndicator: {
    marginTop: 8,
    height: 2,
    minWidth: 24,
    borderRadius: 999,
  },
});

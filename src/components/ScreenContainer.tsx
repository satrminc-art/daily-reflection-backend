import React from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAppContext } from "@/context/AppContext";
import { palette } from "@/utils/theme";

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  overlay?: React.ReactNode;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function ScreenContainer({ children, scroll = false, contentContainerStyle, overlay, onScroll }: Props) {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];
  const insets = useSafeAreaInsets();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: Math.max(72, insets.bottom + 36) },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      contentInsetAdjustmentBehavior="automatic"
      overScrollMode="never"
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.fill}>{children}</View>
  );

  return (
    <LinearGradient colors={[colors.appBackground, colors.appBackground, colors.appBackground]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.select({ ios: "padding", android: "height" })}
        >
          {content}
          {overlay ? <View pointerEvents="box-none" style={styles.overlay}>{overlay}</View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 28,
    flexGrow: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

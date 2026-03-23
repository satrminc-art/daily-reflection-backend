import React from "react";
import { Platform, Text, TextInput } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/context/AppContext";
import { MembershipProvider } from "./src/context/MembershipContext";
import { SubscriptionProvider } from "./src/context/SubscriptionContext";
import { useTypography } from "./src/hooks/useTypography";
import RootNavigator from "./src/navigation/RootNavigator";
import { useAppContext } from "./src/context/AppContext";
import { palette } from "./src/utils/theme";

function ThemedStatusBar() {
  const { colorScheme } = useAppContext();
  const colors = palette[colorScheme];

  return (
    <StatusBar
      style={colorScheme === "dark" ? "light" : "dark"}
      translucent={false}
      backgroundColor={Platform.OS === "android" ? colors.background : undefined}
    />
  );
}

function GlobalTypographyDefaults() {
  const typography = useTypography();

  React.useEffect(() => {
    const TextComponent = Text as typeof Text & { defaultProps?: Record<string, unknown> };
    const TextInputComponent = TextInput as typeof TextInput & { defaultProps?: Record<string, unknown> };
    const previousTextDefaults = TextComponent.defaultProps ?? {};
    const previousInputDefaults = TextInputComponent.defaultProps ?? {};

    TextComponent.defaultProps = {
      ...previousTextDefaults,
      style: [previousTextDefaults.style, { fontFamily: typography.body }],
    };

    TextInputComponent.defaultProps = {
      ...previousInputDefaults,
      style: [previousInputDefaults.style, { fontFamily: typography.body }],
    };

    return () => {
      TextComponent.defaultProps = previousTextDefaults;
      TextInputComponent.defaultProps = previousInputDefaults;
    };
  }, [typography.body]);

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <SubscriptionProvider>
          <MembershipProvider>
            <GlobalTypographyDefaults />
            <ThemedStatusBar />
            <RootNavigator />
          </MembershipProvider>
        </SubscriptionProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import { useAppStrings } from "@/hooks/useAppStrings";
import { useTypography } from "@/hooks/useTypography";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { TodayScreen } from "@/screens/TodayScreen";
import { ArchiveScreen } from "@/screens/ArchiveScreen";
import { FavoritesScreen } from "@/screens/FavoritesScreen";
import { ReflectionDetailScreen } from "@/screens/ReflectionDetailScreen";
import { MembershipScreen } from "@/screens/MembershipScreen";
import { PaywallScreen } from "@/screens/PaywallScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { ReflectionDetailParams } from "@/types/reflection";
import { palette } from "@/utils/theme";

export type RootStackParamList = {
  MainTabs: undefined;
  ReflectionDetail: ReflectionDetailParams;
  Membership: undefined;
  Paywall: { source?: "archive" | "settings" | "premium-preview" } | undefined;
};

export type TabParamList = {
  Today: undefined;
  Archive: undefined;
  Favorites: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function CalendarTabIcon({
  color,
  focused,
  fontFamily,
}: {
  color: string;
  focused: boolean;
  fontFamily: string;
}) {
  const dayNumber = new Date().getDate();

  return (
    <View
      style={[
        styles.calendarIcon,
        focused && styles.calendarIconFocused,
        {
          borderColor: color,
        },
      ]}
    >
      <View style={[styles.calendarBinding, { backgroundColor: color }]} />
      <Text style={[styles.calendarDay, { color, fontFamily }]}>{dayNumber}</Text>
    </View>
  );
}

function OutlineTabIcon({
  name,
  color,
  focused,
}: {
  name: "folder" | "bookmark" | "settings";
  color: string;
  focused: boolean;
}) {
  if (name === "folder") {
    return (
      <View
        style={[
          styles.folderIcon,
          focused && styles.iconFocused,
          {
            borderColor: color,
          },
        ]}
      >
        <View style={[styles.folderTab, { borderColor: color, backgroundColor: "transparent" }]} />
      </View>
    );
  }

  if (name === "bookmark") {
    return (
      <View
        style={[
          styles.bookmarkIcon,
          focused && styles.iconFocused,
          {
            borderColor: color,
          },
        ]}
      >
        <View style={[styles.bookmarkNotchLeft, { borderTopColor: color }]} />
        <View style={[styles.bookmarkNotchRight, { borderTopColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.gearWrap, focused && styles.iconFocused]}>
      <View style={[styles.gearCore, { borderColor: color }]} />
      <View style={[styles.gearToothTop, { backgroundColor: color }]} />
      <View style={[styles.gearToothBottom, { backgroundColor: color }]} />
      <View style={[styles.gearToothLeft, { backgroundColor: color }]} />
      <View style={[styles.gearToothRight, { backgroundColor: color }]} />
    </View>
  );
}

function MainTabs() {
  const { colorScheme } = useAppContext();
  const { t } = useAppStrings();
  const typography = useTypography();
  const colors = palette[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
          letterSpacing: 0.2,
          fontFamily: typography.meta,
        },
        tabBarActiveTintColor: colors.primaryText,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: t("tabs.today"),
          tabBarIcon: ({ color, focused }) => (
            <CalendarTabIcon color={color} focused={focused} fontFamily={typography.meta} />
          ),
        }}
      />
      <Tabs.Screen
        name="Archive"
        component={ArchiveScreen}
        options={{
          tabBarLabel: t("tabs.archive"),
          tabBarIcon: ({ color, focused }) => <OutlineTabIcon name="folder" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: t("tabs.favorites"),
          tabBarIcon: ({ color, focused }) => <OutlineTabIcon name="bookmark" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t("tabs.settings"),
          tabBarIcon: ({ color, focused }) => <OutlineTabIcon name="settings" color={color} focused={focused} />,
        }}
      />
    </Tabs.Navigator>
  );
}

export function AppNavigator() {
  const { isReady, appState, colorScheme } = useAppContext();
  const { reflectionTitle, t } = useAppStrings();
  const typography = useTypography();
  const colors = palette[colorScheme];
  const navigationTheme = {
    ...(colorScheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.surface,
      card: colors.surface,
      border: colors.border,
      text: colors.primaryText,
      primary: colors.accent,
    },
  };

  if (!isReady) {
    return <ActivityIndicator style={{ flex: 1 }} color={colors.primaryText} />;
  }

  if (!appState.hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.primaryText,
          headerTitleStyle: {
            fontWeight: "700",
            fontFamily: typography.display,
          },
          contentStyle: {
            backgroundColor: colors.surface,
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ReflectionDetail"
          component={ReflectionDetailScreen}
          options={{
            title: reflectionTitle(),
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Membership"
          component={MembershipScreen}
          options={{
            title: t("membership.title"),
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            title: "Premium",
            headerBackTitleVisible: false,
            presentation: "modal",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  calendarIcon: {
    width: 20,
    height: 18,
    borderWidth: 1.4,
    borderRadius: 5,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarIconFocused: {
    transform: [{ translateY: -0.5 }],
  },
  iconFocused: {
    transform: [{ translateY: -0.5 }],
  },
  calendarBinding: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4.5,
  },
  calendarDay: {
    fontSize: 8.5,
    fontWeight: "700",
    lineHeight: 9,
    marginTop: 3,
  },
  folderIcon: {
    width: 20,
    height: 14,
    borderWidth: 1.5,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "visible",
  },
  folderTab: {
    position: "absolute",
    left: 1.5,
    top: -4.5,
    width: 8,
    height: 5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bookmarkIcon: {
    width: 14,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 3,
    overflow: "hidden",
    position: "relative",
  },
  bookmarkNotchLeft: {
    position: "absolute",
    bottom: -1,
    left: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderLeftColor: "transparent",
    borderTopWidth: 6,
    borderRightWidth: 0,
    borderRightColor: "transparent",
  },
  bookmarkNotchRight: {
    position: "absolute",
    bottom: -1,
    right: 0,
    width: 0,
    height: 0,
    borderRightWidth: 7,
    borderRightColor: "transparent",
    borderTopWidth: 6,
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
  },
  gearWrap: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gearCore: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderRadius: 999,
  },
  gearToothTop: {
    position: "absolute",
    top: 1,
    width: 2,
    height: 4,
    borderRadius: 999,
  },
  gearToothBottom: {
    position: "absolute",
    bottom: 1,
    width: 2,
    height: 4,
    borderRadius: 999,
  },
  gearToothLeft: {
    position: "absolute",
    left: 1,
    width: 4,
    height: 2,
    borderRadius: 999,
  },
  gearToothRight: {
    position: "absolute",
    right: 1,
    width: 4,
    height: 2,
    borderRadius: 999,
  },
});

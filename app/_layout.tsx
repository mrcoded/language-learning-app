import IntroScreen from "@/components/auth/intro-screen";
import { useAuth } from "@/context/AuthContext";
import AuthProvider from "@/providers/AuthProvider";

import { useDeepLinking } from "@/hooks/useDeepLinking";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Toaster } from "sonner-native";

export const unstable_settings = {
  initialRouteName: "onboarding",
};

function RootLayoutNav() {
  const segments = useSegments();
  const colorScheme = useColorScheme();

  const { session, loading, profile } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  //Handle deep linking for magic link
  useDeepLinking();

  useEffect(() => {
    if (loading) return;

    if (session) {
      if (!profile || !profile.onboarding_completed) {
        // Authenticated but onboarding not done — send to onboarding
        const isOnboarding = segments[0] === "onboarding";
        if (!isOnboarding) {
          router.replace("/onboarding");
        }
      } else {
        // Fully authenticated & onboarded — block access to auth/onboarding
        const isInAuthFlow =
          segments[0] === "onboarding" || segments[0] === "auth";
        if (isInAuthFlow) {
          router.replace("/(tabs)/lessons");
        }
      }
    }
  }, [session, loading, profile, segments]);

  const navTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  if (!loaded || loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!session) {
    return (
      <ThemeProvider value={navTheme}>
        <GestureHandlerRootView style={styles.container}>
          <IntroScreen />
          <Toaster />
        </GestureHandlerRootView>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={navTheme}>
      <GestureHandlerRootView style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="conversation" />
          <Stack.Screen name="practice" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
        <Toaster />
      </GestureHandlerRootView>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
});

// app/_layout.tsx
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
//import "react-native-reanimated";
import { FormDataProvider } from "@context/FormContext";
import { AuthProvider, useAuth } from "context/AuthContext";
import { View, StyleSheet, Platform, ActivityIndicator } from "react-native";

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from "expo-router";



function AppNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key || loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    // If unauthenticated and NOT inside the (auth) group, force them there
    if (!user && !inAuthGroup) {
      router.replace("/(auth)" as any);
    }
    // If authenticated and trying to hit the (auth) group, force them inside the app
    else if (user && inAuthGroup) {
      router.replace("/(tabs)/browse" as any);
    }
  }, [user, segments, loading, rootNavigationState?.key]);

  if (loading || !rootNavigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <FormDataProvider>
        <View style={styles.appContainer}>
          <AppNavigator />
        </View>
      </FormDataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    maxWidth: Platform.OS === "web" ? 800 : "100%",
    width: "100%",
    marginHorizontal: "auto",
    backgroundColor: "#fff",
    // Standard shadows for cross-platform support where possible
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
});

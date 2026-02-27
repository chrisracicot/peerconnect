// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
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

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function AppNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    // A small buffer to ensure the Root Layout is ready before calculating routing
    setTimeout(() => setIsNavigationReady(true), 100);
  }, []);

  useEffect(() => {
    if (!isNavigationReady || loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    // If unauthenticated and NOT inside the (auth) group, force them there
    if (!user && !inAuthGroup) {
      router.replace("/(auth)" as any);
    }
    // If authenticated and trying to hit the (auth) group, force them inside the app
    else if (user && inAuthGroup) {
      router.replace("/(tabs)/browse" as any);
    }
  }, [user, segments, loading, isNavigationReady]);

  if (loading || !isNavigationReady) {
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
    // Add subtle shadow for web to distinguish the app frame from the background
    boxShadow: Platform.OS === "web" ? "0 0 15px rgba(0,0,0,0.1)" : "none",
  },
});

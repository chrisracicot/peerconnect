// app/_layout.tsx
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
//import "react-native-reanimated";
import { FormDataProvider } from "@context/FormContext";
import { AuthProvider } from "context/AuthContext";
import { View, StyleSheet, Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

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
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
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

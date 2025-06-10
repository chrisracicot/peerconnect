import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Image, Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FormDataProvider } from "../context/FormContext";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={40} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <FormDataProvider>
      <Tabs
        screenOptions={{
          tabBarInactiveBackgroundColor: "#F6F7F9",
          tabBarActiveBackgroundColor: "#F6F7F9",
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, false),
        }}
      >
        <Tabs.Screen
          name="browse"
          options={{
            title: "Browse",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="handshake" size={24} color={color} />
            ),
            tabBarActiveTintColor: "#A6192E",
          }}
        />
        <Tabs.Screen
          name="ask"
          options={{
            title: "Ask",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="hand-sparkles" size={24} color={color} />
            ),
            tabBarActiveTintColor: "#A6192E",
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: "Messages",
            tabBarIcon: ({ color }) => (
              <Feather name="settings" size={24} color={color} />
            ),
            tabBarActiveTintColor: "#A6192E",
          }}
        />
                <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarIcon: ({ color }) => (
              <Feather name="settings" size={24} color={color} />
            ),
            tabBarActiveTintColor: "#A6192E",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="account-circle-outline"
                size={24}
                color={color}
              />
            ),
            tabBarActiveTintColor: "#A6192E",
          }}
        />
      </Tabs>
    </FormDataProvider>
  );
}

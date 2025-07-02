// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";

// Icon libraries
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

// Custom tab icon component that supports multiple icon sets
function TabBarIcon({
  iconSet = "FontAwesome", // Default icon set
  name,
  color,
}: {
  iconSet?:
    | "FontAwesome"
    | "FontAwesome6"
    | "Feather"
    | "MaterialCommunityIcons";
  name: string;
  color: string;
}) {
  const size = 24;

  // Select the correct icon component based on the icon set
  const IconComponent = {
    FontAwesome,
    FontAwesome6,
    Feather,
    MaterialCommunityIcons,
  }[iconSet];

  // If the icon set is not found, render nothing
  if (!IconComponent) return null;

  return (
    <IconComponent
      name={name as any}
      size={size}
      color={color}
      style={{ marginBottom: -3 }}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarInactiveBackgroundColor: "#F6F7F9",
        tabBarActiveBackgroundColor: "#F6F7F9",
        tabBarActiveTintColor: "#A6192E",
      }}
    >
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color }) =>
            TabBarIcon({ iconSet: "FontAwesome6", name: "handshake", color }),
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: "Ask",
          tabBarIcon: ({ color }) =>
            TabBarIcon({
              iconSet: "FontAwesome6",
              name: "hand-sparkles",
              color,
            }),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) =>
            TabBarIcon({ iconSet: "Feather", name: "message-circle", color }),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color }) =>
            TabBarIcon({ iconSet: "Feather", name: "calendar", color }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            TabBarIcon({
              iconSet: "MaterialCommunityIcons",
              name: "account-circle-outline",
              color,
            }),
        }}
      />
    </Tabs>
  );
}
// Note: This file is the layout for the tab navigation in the app.

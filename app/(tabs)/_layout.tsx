
import React from "react";

import { Tabs } from "expo-router";

import TabBarIcon from "../../components/layout/TabBarIcon";
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
            TabBarIcon({ iconSet: "FontAwesome6", name: "hand-sparkles", color }),
        }}
      />
      <Tabs.Screen
        name="messages/index"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) =>
            TabBarIcon({ iconSet: 'Feather', name: 'message-circle', color })
        }}
      />
      <Tabs.Screen
        name="messages/[id]"
        options={{
          href: null, // Hide from tab bar
          headerShown: false // Show header with back button
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
            TabBarIcon({ iconSet: "MaterialCommunityIcons", name: "account-circle-outline", color }),
        }}
      />
    </Tabs>

  );
}

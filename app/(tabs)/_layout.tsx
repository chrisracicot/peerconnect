// app/%28tabs%29/_layout.tsx
import React from "react";
<<<<<<< HEAD
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Image, Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
// import { FormDataProvider } from "../context/FormContext";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={40} style={{ marginBottom: -3 }} {...props} />;
}
=======
import { Tabs } from "expo-router";
import { FormDataProvider } from "../context/FormContext";
import TabBarIcon from "../../components/layout/TabBarIcon";
>>>>>>> main

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
              TabBarIcon({ iconSet: "MaterialCommunityIcons", name: "account-circle-outline", color }),
          }}
        />
      </Tabs>

  );
}

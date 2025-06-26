import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type IconProps = {
  iconSet: "FontAwesome" | "FontAwesome6" | "Feather" | "MaterialCommunityIcons";
  name: string;
  color: string;
};

export default function TabBarIcon({ iconSet, name, color }: IconProps) {
  const size = 24;

  switch (iconSet) {
    case "FontAwesome":
      return <FontAwesome name={name as any} size={size} color={color} />;
    case "FontAwesome6":
      return <FontAwesome6 name={name as any} size={size} color={color} />;
    case "Feather":
      return <Feather name={name as any} size={size} color={color} />;
    case "MaterialCommunityIcons":
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
    default:
      return null;
  }
}

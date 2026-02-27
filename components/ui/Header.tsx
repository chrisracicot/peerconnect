// components/ui/Header.tsx
import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import useUnreadNotifications from "@components/hooks/useUnreadNotifications";
import { useRouter } from "expo-router";
import { useAuth } from "context/AuthContext";

function Icon(props: React.ComponentProps<typeof FontAwesome>) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

interface HeaderProps {
  onNotificationPress?: () => void;
  onMessagePress?: () => void;
}

export default function Header({
  onNotificationPress,
  onMessagePress,
}: HeaderProps) {
  const { unreadCount } = useUnreadNotifications();
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Image
        source={require("../../assets/images/sait.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.headerIcons}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (onNotificationPress) onNotificationPress();
            router.push("/notifications");
          }}
        >
          <Icon name="bell" color="#1f1f1f" />
          {unreadCount > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            if (onMessagePress) onMessagePress();
            router.push("/(tabs)/messages");
          }}
        >
          <Icon name="comment-o" color="#1f1f1f" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    backgroundColor: "#FFF",
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  iconButton: {
    padding: 4,
  },
  unreadDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
});

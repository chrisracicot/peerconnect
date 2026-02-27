import { supabase } from "@lib/supabase";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// New notification
export async function createNotification({
  userId,
  type,
  content,
  data,
}: {
  userId: string;
  type: string;
  content: string;
  data?: Record<string, any>;
}) {
  const { error } = await supabase
    .from("notifications")
    .insert([{ user_id: userId, type, content, data }]);

  if (error) throw error;
}

// Get count of unread notifications
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
}

// Mark a notification as read
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
}

// Fetch all notifications for a user (optional, for list screen later)
export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Register for Push Notifications and update the token
export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  // Web fallback (notifications don't strictly work the same way here without a service worker config)
  if (Platform.OS === 'web') {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    // Ask for permission if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    // Return early if permission is still not granted (e.g. user denied)
    if (finalStatus !== "granted") {
      console.warn("Failed to get push token for push notification; permission not granted.");
      return null;
    }

    try {
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID || "default_id", // Fallback if missing
        })
      ).data;

      // Save token to profile
      if (token && userId) {
        await supabase
          .from("profiles")
          .update({ push_token: token })
          .eq("id", userId);
      }
    } catch (e) {
      console.warn("Error getting push token. Emulators might not support this fully:", e);
    }
  } else {
    console.warn("Must use physical device for Push Notifications. Skipping token fetch.");
  }

  return token;
}

// Helper to push a notification
export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data?: any
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data: data || {},
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    const receipt = await response.json();
    console.log("Push Notification Receipt:", receipt);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

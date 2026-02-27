import { supabase } from "@lib/supabase";
import { createNotification, sendPushNotification } from "./notificationService";
import type { Message } from "@models/message";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Fetch conversation between currentUserId and receiverId
export async function getConversationMessages(
  currentUserId: string,
  receiverId: string
): Promise<Message[]> {
  const cacheKey = `@messages_${currentUserId}_${receiverId}`;

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    // Fallback to cache if offline
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached) as Message[];
    } catch (e) { }
    throw error;
  }

  if (data) {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) { }
  }

  return data || [];
}

// Send a new message
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) return;

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content: trimmed,
    })
    .select();

  if (error || !data?.length) throw error;

  const message = data[0];

  // Create notification for receiver
  await createNotification({
    userId: receiverId,
    type: "message",
    content: "You received a new message",
    data: {
      messageId: message.id,
      senderId,
    },
  });

  // Get receiver's push token to send native notification
  const { data: profile } = await supabase
    .from("profiles")
    .select("push_token")
    .eq("id", receiverId)
    .single();

  if (profile?.push_token) {
    await sendPushNotification(
      profile.push_token,
      "New Message",
      content.length > 50 ? content.substring(0, 47) + "..." : content,
      { url: `/messages/${senderId}` }
    );
  }
}

// Mark all unread messages from receiverId -> currentUserId as read
export async function markMessagesAsRead(
  currentUserId: string,
  senderId: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", currentUserId)
    .eq("sender_id", senderId)
    .eq("is_read", false);

  if (error) throw error;
}

// Get count of unread messages across all conversations
export async function getUnreadMessagesCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) throw error;
  return count || 0;
}

import { supabase } from "@lib/supabase";

export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export async function getConversationMessages(
  currentUserId: string,
  receiverId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${currentUserId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    content,
  });

  if (error) throw error;
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

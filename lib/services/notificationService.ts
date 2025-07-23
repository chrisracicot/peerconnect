import { supabase } from "@lib/supabase";

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

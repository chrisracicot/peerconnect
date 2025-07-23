import { useEffect, useState, useCallback } from "react";
import { supabase } from "@lib/supabase";
import { getUnreadNotificationCount } from "@lib/services/notificationService";

export default function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000); // 8s max wait

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        clearTimeout(timeout);
        return;
      }

      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);

      clearTimeout(timeout);
    } catch (err: any) {
      console.error("Unread fetch failed:", err.message || err);
    }
  }, []);

  useEffect(() => {
    fetchUnread(); // initial fetch

    const interval = setInterval(fetchUnread, 15000); // 15s
    return () => clearInterval(interval);
  }, [fetchUnread]);

  return { unreadCount, refetchUnreadCount: fetchUnread };
}

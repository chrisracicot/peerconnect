import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";
import { getUnreadNotificationCount } from "@lib/services/notificationService";

export default function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;

      try {
        const count = await getUnreadNotificationCount(user.id);
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
      }
    };

    fetch();
  }, []);

  return { unreadCount };
}

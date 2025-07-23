import { supabase } from "@lib/supabase";

import {
  createNotification,
  getUnreadNotificationCount,
  markNotificationAsRead,
  getUserNotifications,
} from "@lib/services/notificationService";

const testUserEmail = "glconde.ca@hotmail.com";
const testUserId = "5e01283b-cc0c-4a6e-9336-76c8171bb99d";

let notificationId: string;

beforeAll(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testUserEmail,
    password: "password123",
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`);
  }

  await supabase.auth.setSession(data.session);
});

describe("notificationsService.ts", () => {
  it("createNotification() inserts a new notification", async () => {
    await createNotification({
      userId: testUserId,
      type: "test",
      content: "Test notification content",
      data: { source: "jest" },
    });

    const { data, error } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", testUserId)
      .eq("content", "Test notification content")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    if (data) {
      notificationId = data.id;
    }
  });

  it("getUserNotifications() fetches all notifications", async () => {
    const result = await getUserNotifications(testUserId);
    expect(Array.isArray(result)).toBe(true);
    expect(result.some((n) => n.id === notificationId)).toBe(true);
  });

  it("getUnreadNotificationCount() returns a valid count", async () => {
    const count = await getUnreadNotificationCount(testUserId);
    expect(typeof count).toBe("number");
  });

  it("markNotificationAsRead() marks the notification", async () => {
    await markNotificationAsRead(notificationId);
    const { data } = await supabase
      .from("notifications")
      .select("is_read")
      .eq("id", notificationId)
      .single();
    expect(data?.is_read).toBe(true);
  });

  afterAll(async () => {
    await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)
      .eq("user_id", testUserId);
  });
});

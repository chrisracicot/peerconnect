import { supabase } from "@lib/supabase";

const userEmail = "emuglc@gmail.com";
const userId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";

let notificationId: string;

beforeAll(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: "password123",
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`);
  }

  await supabase.auth.setSession(data.session);
});

describe("Supabase: Notifications Table CRUD (auth user)", () => {
  it("creates a notification", async () => {
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        content: "Test notification content",
        type: "info",
        data: { route: "/home" },
        is_read: false,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    notificationId = data.id;
  });

  it("fetches notifications for the user", async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId);

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
  });

  it("marks notification as read", async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    expect(error).toBeNull();
  });

  it("deletes the notification", async () => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    expect(error).toBeNull();
  });

  afterAll(async () => {
    await supabase.from("notifications").delete().eq("id", notificationId);
  });
});

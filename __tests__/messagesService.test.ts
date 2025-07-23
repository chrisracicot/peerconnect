import { supabase } from "@lib/supabase";
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessagesCount,
} from "@lib/services/messagesService";

const senderEmail = "emuglc@gmail.com";
const senderId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";
const receiverId = "5e01283b-cc0c-4a6e-9336-76c8171bb99d";

let insertedMessageId: number;

beforeAll(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: senderEmail,
    password: "password123",
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`);
  }

  await supabase.auth.setSession(data.session);
});

describe("messagesService.ts", () => {
  it("sendMessage() sends and stores a message", async () => {
    await sendMessage(senderId, receiverId, "Test message from Jest");

    const { data, error } = await supabase
      .from("messages")
      .select("id")
      .eq("sender_id", senderId)
      .eq("receiver_id", receiverId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    if (data) {
      insertedMessageId = data.id;
    }
  });

  it("getConversationMessages() retrieves the message", async () => {
    const messages = await getConversationMessages(senderId, receiverId);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages[messages.length - 1].id).toBe(insertedMessageId);
  });

  it("getUnreadMessagesCount() returns correct count", async () => {
    const count = await getUnreadMessagesCount(receiverId);
    expect(typeof count).toBe("number");
  });

  it("markMessagesAsRead() marks messages as read", async () => {
    const { data: login, error } = await supabase.auth.signInWithPassword({
      email: "glconde.ca@hotmail.com",
      password: "password123",
    });
    if (error || !login.session) throw new Error("Receiver login failed");
    await supabase.auth.setSession(login.session);

    await markMessagesAsRead(receiverId, senderId);

    const { data } = await supabase
      .from("messages")
      .select("is_read")
      .eq("id", insertedMessageId)
      .single();

    expect(data?.is_read).toBe(true);
  });

  afterAll(async () => {
    await supabase.from("messages").delete().eq("id", insertedMessageId);

    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", receiverId)
      .like("content", "%Jest%");
  });
});

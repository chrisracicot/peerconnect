import { supabase } from "@lib/supabase";

const senderEmail = "emuglc@gmail.com";
const receiverEmail = "glconde.ca@hotmail.com";
const senderId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";
const receiverId = "5e01283b-cc0c-4a6e-9336-76c8171bb99d";

let messageId: number;

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

describe("Supabase: Messages Table CRUD (auth user)", () => {
  it("creates a message", async () => {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content: "Hello from Authenticated Jest test!",
        is_read: false,
        safety_analysis: { flagged: false },
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    messageId = data.id;
  });

  it("reads the message by ID", async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("id", messageId)
      .single();

    expect(error).toBeNull();
    expect(data?.content).toBe("Hello from Authenticated Jest test!");
  });

  it("updates is_read flag", async () => {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);

    expect(error).toBeNull();
  });

  it("deletes the message", async () => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    expect(error).toBeNull();
  });

  afterAll(async () => {
    await supabase.from("messages").delete().eq("id", messageId);
  });
});

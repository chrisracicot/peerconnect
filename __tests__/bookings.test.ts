import { supabase } from "@lib/supabase";

const requesterEmail = "emuglc@gmail.com";
const requesterId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";
const providerId = "5e01283b-cc0c-4a6e-9336-76c8171bb99d";

let bookingId: number;

beforeAll(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: requesterEmail,
    password: "password123",
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`);
  }

  await supabase.auth.setSession(data.session);
});

describe("Supabase: Bookings Table CRUD (auth user)", () => {
  it("creates a booking", async () => {
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        requester_id: requesterId,
        provider_id: providerId,
        title: "Test Booking",
        date: new Date().toISOString(),
        status: "pending",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    bookingId = data.id;
  });

  it("reads the booking by ID", async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    expect(error).toBeNull();
    expect(data?.title).toBe("Test Booking");
  });

  it("updates booking status", async () => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId);

    expect(error).toBeNull();
  });

  it("deletes the booking", async () => {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    expect(error).toBeNull();
  });

  afterAll(async () => {
    await supabase.from("bookings").delete().eq("id", bookingId);
  });
});

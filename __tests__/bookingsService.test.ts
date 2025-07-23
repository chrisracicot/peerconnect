import { supabase } from "@lib/supabase";
import { createBooking, getBookingsForUser } from "@lib/services/bookService";

const requesterEmail = "emuglc@gmail.com";
const requesterId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";
const providerId = "5e01283b-cc0c-4a6e-9336-76c8171bb99d";

let createdBookingId: number;

beforeAll(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: requesterEmail,
    password: "password123",
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in requester: ${error?.message}`);
  }

  await supabase.auth.setSession(data.session);
});

describe("bookingsService.ts", () => {
  it("createBooking() should create a booking", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString(); // 1 day ahead

    const booking = await createBooking(
      requesterId,
      providerId,
      "Test Booking from Jest",
      futureDate
    );

    expect(booking).toBeDefined();
    expect(booking.title).toBe("Test Booking from Jest");
    createdBookingId = booking.id;
  });

  it("getBookingsForUser() should retrieve bookings for the user", async () => {
    const bookings = await getBookingsForUser(requesterId);
    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.some((b) => b.id === createdBookingId)).toBe(true);
  });

  afterAll(async () => {
    await supabase.from("bookings").delete().eq("id", createdBookingId);
  });
});

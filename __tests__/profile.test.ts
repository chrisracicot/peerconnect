import { supabase } from "@lib/supabase";

const userEmail = "emuglc@gmail.com";
const userId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";

let originalFullName: string | null = null;

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

describe("Supabase: Profiles Table CRUD (auth user)", () => {
  it("reads own profile", async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBe(userId);
    originalFullName = data?.full_name;
  });

  it("updates full_name", async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: "Test User Updated" })
      .eq("id", userId);

    expect(error).toBeNull();
  });

  it("restores full_name to original", async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: originalFullName || "Test User" })
      .eq("id", userId);

    expect(error).toBeNull();
  });
});

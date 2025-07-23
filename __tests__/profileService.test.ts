import { supabase } from "@lib/supabase";
import {
  getProfileById,
  updateProfileById,
} from "@lib/services/profileService";

const testUserEmail = "emuglc@gmail.com";
const testUserId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";

// no add or edit tests for profile
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

describe("profileService.ts", () => {
  it("getProfileById() returns a valid profile", async () => {
    const profile = await getProfileById(testUserId);
    expect(profile).toBeDefined();
    expect(profile?.id).toBe(testUserId);
  });

  it("updateProfileById() updates profile fields", async () => {
    const updates = {
      full_name: "Test User Jest",
      verified: true,
    };

    const { data, error } = await updateProfileById(testUserId, updates);
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.full_name).toBe(updates.full_name);
    expect(data?.verified).toBe(true);
  });
});

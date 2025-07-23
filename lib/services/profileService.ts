import { supabase } from "@lib/supabase";
import type { UserProfile } from "@models/profile";

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    return null;
  }

  return data;
}

export async function updateProfileById(
  id: string,
  updates: Partial<Omit<UserProfile, "id">>
): Promise<{ data: UserProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error.message);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

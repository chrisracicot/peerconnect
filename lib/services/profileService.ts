import { supabase } from "@lib/supabase";
import type { UserProfile } from "@models/profile";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getProfileById(id: string): Promise<UserProfile | null> {
  const cacheKey = `@profile_${id}`;

  // Try cache first
  try {
    const cachedData = await AsyncStorage.getItem(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      // Cache valid for 1 hour
      const isExpired = Date.now() - parsed.timestamp > 60 * 60 * 1000;
      if (!isExpired) {
        return parsed.data as UserProfile;
      }
    }
  } catch (e) {
    console.error("Profile cache read error:", e);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
    // Fallback to expired cache
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData).data as UserProfile;
      }
    } catch (e) { }
    return null;
  }

  // Save to cache
  if (data) {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: data,
      }));
    } catch (e) {
      console.error("Profile cache write error:", e);
    }
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

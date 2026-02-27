import { supabase } from "../supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getCourses = async () => {
  const CACHE_KEY = "@courses_cache";

  // Try cache first
  try {
    const cachedData = await AsyncStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
      if (!isExpired) {
        return parsed.data;
      }
    }
  } catch (error) {
    console.error("Course cache read error:", error);
  }

  const { data, error } = await supabase
    .from("Course")
    .select("course_id")
    .order("course_id", { ascending: true });

  if (error) {
    // Fallback to expired cache if offline
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData).data;
      }
    } catch (e) { }
    throw error;
  }

  // Save to cache
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
  } catch (error) {
    console.error("Course cache write error:", error);
  }

  return data;
};

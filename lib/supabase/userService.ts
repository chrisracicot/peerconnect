import { supabase } from "@lib/supabase";

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("getCurrentUserId auth error:", error);
    throw error;
  }
  if (!user?.id) {
    throw new Error("No authenticated user found.");
  }
  return user.id;
}

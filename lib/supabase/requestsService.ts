import { supabase } from "../supabase";
import type { RequestItem, NewRequest } from "@models/request";

// fetch all
export async function fetchRequests(): Promise<RequestItem[]> {
  const { data, error } = await supabase.from("request").select("*");

  if (error) {
    console.error("Error fetching requests:", error.message, error.details);
    throw new Error("Failed to fetch requests. Please try again later.");
  }

  if (!data) {
    console.warn("fetchRequests returned no data.");
    return [];
  }

  return data;
}

// add new
export async function createRequest(newRequest: NewRequest): Promise<void> {
  const { error } = await supabase.from("request").insert([newRequest]);

  if (error) {
    console.error("Error creating request:", error.message, error.details);
    throw new Error("Failed to create request. Please try again.");
  }
}

// get by id
export async function getRequestById(id: string): Promise<RequestItem | null> {
  const { data, error } = await supabase
    .from("request")
    .select("*")
    .eq("request_id", id)
    .single();

  if (error) {
    console.error("Error fetching request by ID:", error);
    return null;
  }

  return data as RequestItem;
}

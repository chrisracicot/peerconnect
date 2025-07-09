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

// add new, return inserted row
export async function createRequest(data: NewRequest): Promise<RequestItem> {
  const { data: inserted, error } = await supabase
    .from("request")
    .insert([data])
    .select()
    .single();

  console.log("INSERT result:", inserted, "error:", error);

  if (error) {
    console.error("Insert error:", error);
    throw new Error(error.message || JSON.stringify(error));
  }
  if (!inserted) throw new Error("Insert returned null");
  return inserted;
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

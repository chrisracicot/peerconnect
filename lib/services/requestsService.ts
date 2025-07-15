// lib/supabase/requestsService.ts
import { supabase } from "../supabase";
import type { RequestItem, NewRequest } from "@models/request";

// Fetch all requests
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

// Create new request, return inserted row
export async function createRequest(data: NewRequest): Promise<RequestItem> {
  const { data: inserted, error } = await supabase
    .from("request")
    .insert([data])
    .select()
    .single();

  console.log("INSERT result:", inserted, "error:", error);

  if (error) {
    //console.error("Insert error:", error);
    throw new Error(error.message || JSON.stringify(error));
  }
  if (!inserted) throw new Error("Insert returned null");
  return inserted;
}

// Get request by ID
export async function getRequestById(id: number): Promise<RequestItem | null> {
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

// Update request - allows partial updates
export async function updateRequest(
  id: number,
  updates: Partial<Pick<RequestItem, "title" | "description">>
): Promise<RequestItem> {
  const { data, error } = await supabase
    .from("request")
    .update(updates)
    .eq("request_id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating request:", error);
    throw new Error(error.message || "Failed to update request");
  }

  if (!data) {
    throw new Error("Update returned no data");
  }

  return data as RequestItem;
}

// Delete request
export async function deleteRequest(id: number): Promise<void> {
  const { error } = await supabase
    .from("request")
    .delete()
    .eq("request_id", id);

  if (error) {
    console.error("Error deleting request:", error);
    throw new Error(error.message || "Failed to delete request");
  }
}

// Reactivate request by updating create_date to current timestamp
export async function reactivateRequest(id: number): Promise<RequestItem> {
  const newCreateDate = new Date().toISOString();

  const { data, error } = await supabase
    .from("request")
    .update({
      create_date: newCreateDate,
      status: "pending", // Reset status to pending when reactivating
    })
    .eq("request_id", id)
    .select()
    .single();

  if (error) {
    console.error("Error reactivating request:", error);
    throw new Error(error.message || "Failed to reactivate request");
  }

  if (!data) {
    throw new Error("Reactivate returned no data");
  }

  return data as RequestItem;
}

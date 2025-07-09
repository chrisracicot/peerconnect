import { supabase } from "../supabase";
import type { RequestItem, NewRequest } from "@models/request";

// get all reuqests
export async function fetchRequests(): Promise<RequestItem[]> {
  const { data, error } = await supabase.from("request").select("*");
  if (error) throw error;
  return data as RequestItem[];
}

// new request
export async function createRequest(data: NewRequest): Promise<void> {
  const { error } = await supabase.from("request").insert([data]);
  if (error) throw error;
}

// lib/bookingsService.ts
import { supabase } from "../supabase";

export interface Booking {
    id: number;
    requester_id: string;
    provider_id: string;
    title: string;
    date: string;
    created_at: string;
    status: "pending" | "confirmed" | "canceled";
}

export async function createBooking(
    requesterId: string,
    providerId: string,
    title: string,
    date: string
): Promise<Booking> {
    const { data, error } = await supabase
        .from("bookings")
        .insert({
            requester_id: requesterId,
            provider_id: providerId,
            title,
            date,
            status: "pending",
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
        .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
}
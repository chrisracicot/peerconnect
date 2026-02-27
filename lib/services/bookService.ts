// lib/bookingsService.ts
import { supabase } from "../supabase";

export interface Booking {
    id: number;
    requester_id: string;
    provider_id: string;
    request_id: number;
    title: string;
    date: string;
    location: string;
    price: number;
    created_at: string;
    status: "pending" | "confirmed" | "completed" | "canceled";
    payment_status: "pending" | "escrow" | "released" | "disputed";
}

export async function createBooking(
    requesterId: string,
    providerId: string,
    requestId: number,
    title: string,
    date: string,
    location: string,
    price: number,
): Promise<Booking> {
    const { data, error } = await supabase
        .from("bookings")
        .insert({
            requester_id: requesterId,
            provider_id: providerId,
            request_id: requestId,
            title,
            date,
            location,
            price,
            status: "pending",
            payment_status: "pending",
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
        .or(`requester_id.eq.${userId}, provider_id.eq.${userId} `)
        .order("date", { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function updateBookingEscrow(
    bookingId: number,
    newStatus: "escrow" | "released" | "disputed"
): Promise<Booking> {
    const { data, error } = await supabase
        .from("bookings")
        .update({ payment_status: newStatus })
        .eq("id", bookingId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
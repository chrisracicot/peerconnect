import { supabase } from "../supabase";

export interface AvailabilitySlot {
    id: string;
    user_id: string;
    day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    start_time: string;
    end_time: string;
    created_at: string;
}

export async function getUserAvailability(userId: string): Promise<AvailabilitySlot[]> {
    const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", userId)
        .order("day_of_week", { ascending: true }); // Ideally order by a day index

    if (error) throw error;
    return data || [];
}

export async function addAvailabilitySlot(
    userId: string,
    dayOfWeek: AvailabilitySlot['day_of_week'],
    startTime: string,
    endTime: string
): Promise<AvailabilitySlot> {
    const { data, error } = await supabase
        .from("availability")
        .insert({
            user_id: userId,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
    const { error } = await supabase
        .from("availability")
        .delete()
        .eq("id", slotId);

    if (error) throw error;
}

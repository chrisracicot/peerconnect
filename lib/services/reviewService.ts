import { supabase } from "../supabase";

export interface Review {
    id: number;
    reviewer_id: string;
    reviewee_id: string;
    booking_id: number | null;
    rating: number;
    comment: string | null;
    created_at: string;
}

export async function submitReview(
    reviewerId: string,
    revieweeId: string,
    bookingId: number | null,
    rating: number,
    comment: string | null
): Promise<Review> {
    const { data, error } = await supabase
        .from("reviews")
        .insert({
            reviewer_id: reviewerId,
            reviewee_id: revieweeId,
            booking_id: bookingId,
            rating,
            comment,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Fetch average rating for a profile
export async function getUserAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("reviewee_id", userId);

    if (error) throw error;

    if (!data || data.length === 0) return { average: 0, count: 0 };

    const total = data.reduce((sum, review) => sum + review.rating, 0);
    return { average: total / data.length, count: data.length };
}

// Fetch individual reviews
export async function getUserReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

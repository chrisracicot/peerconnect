import { supabase } from "../supabase";

export interface Report {
    id: string;
    reporter_id: string;
    target_type: 'message' | 'request' | 'user';
    target_id: string;
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
}

export async function submitReport(
    reporterId: string,
    targetType: 'message' | 'request' | 'user',
    targetId: string,
    reason: string
): Promise<Report> {
    const { data, error } = await supabase
        .from("reports")
        .insert({
            reporter_id: reporterId,
            target_type: targetType,
            target_id: targetId,
            reason,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getPendingReports(): Promise<Report[]> {
    const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function resolveReport(reportId: string): Promise<void> {
    const { error } = await supabase
        .from("reports")
        .update({ status: "resolved" })
        .eq("id", reportId);

    if (error) throw error;
}

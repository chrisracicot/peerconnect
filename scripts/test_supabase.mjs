import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or("and(sender_id.eq.00000000-0000-0000-0000-000000000000,receiver_id.eq.00000000-0000-0000-0000-000000000001),and(sender_id.eq.00000000-0000-0000-0000-000000000001,receiver_id.eq.00000000-0000-0000-0000-000000000000)")
        .order("created_at", { ascending: true })
        .limit(1);

    console.log("Error:", error);
    console.log("Data length:", data?.length);
}

test();

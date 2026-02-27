import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('\❌ ERROR: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTables() {
    console.log('🔍 Verifying Supabase Tables connection for:', supabaseUrl);

    const tables = ['profiles', 'Course', 'request', 'bookings', 'messages', 'transactions', 'reviews'];
    let allGood = true;

    for (const table of tables) {
        try {
            // We only fetch 1 row to see if the table exists and allows connections
            const { data, error } = await supabase.from(table).select('*').limit(1);

            if (error) {
                console.log(`\❌ Table '${table}': ERROR - ${error.message} (Code: ${error.code})`);
                if (error.code === '42P01') {
                    console.log(`   -> Table '${table}' does not exist.`);
                } else if (error.code === 'PGRST301') {
                    console.log(`   -> Table '${table}' RLS policy might be blocking you, but the table EXISTS.`);
                }
                allGood = false;
            } else {
                console.log(`\✅ Table '${table}': Accessible and properly configured.`);
            }
        } catch (e: any) {
            console.log(`\❌ Table '${table}': UNEXPECTED ERROR - ${e.message}`);
            allGood = false;
        }
    }

    console.log('\n----------------------------------------');
    if (allGood) {
        console.log('\✅ ALL TABLES VERIFIED SUCCESSFULLY! Your schema is ready.');
    } else {
        console.log('\❌ SOME TABLES FAILED VERIFICATION. Please check the output above.');
    }
}

verifyTables();

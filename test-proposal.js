const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ajclycefbemxqnxdwkvt.supabase.co';
const supabaseKey = 'sb_publishable_geVaFTGelyCGuZ9fuTJsbA_qs67-YD9';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Signing in as Bob Learner...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'bob@peerconnect.com',
        password: 'password123',
    });

    if (authError || !authData.user) {
        console.warn("Auth Error/Not Found. Attempting to sign up Bob Learner...");
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: 'bob@peerconnect.com',
            password: 'password123',
            options: { data: { full_name: 'Bob Learner' } }
        });

        if (signupError) {
            console.error("Signup failed too:", signupError);
            return;
        }
    }

    const { data: sessionData } = await supabase.auth.signInWithPassword({
        email: 'bob@peerconnect.com',
        password: 'password123',
    });

    if (!sessionData || !sessionData.user) {
        console.error("Could not sign in as Bob Learner!");
        return;
    }

    const bobId = sessionData.user.id;
    console.log(`Bob Learner ID: ${bobId}`);

    console.log("Searching for Chris Charles...");
    let chrisId;
    const { data: chrisData, error: chrisError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', '%Chris%Charles%')
        .single();

    if (chrisError || !chrisData) {
        console.error("Could not find Chris Charles exact match, trying generalized Chris search...");
        const { data: fallbackData } = await supabase
            .from('profiles')
            .select('id, full_name')
            .ilike('full_name', '%Chris%')
            .limit(1);

        if (fallbackData && fallbackData.length > 0) {
            chrisId = fallbackData[0].id;
            console.log(`Fallback found Chris ID: ${chrisId} (${fallbackData[0].full_name})`);
        } else {
            console.log("No Chris found.");
            return;
        }
    } else {
        chrisId = chrisData.id;
        console.log(`Chris Charles ID: ${chrisId}`);
    }

    console.log("Sending proposal...");

    const proposalPayload = JSON.stringify({
        title: "Software Engineering Help",
        price: 40.00,
        location: "Online (Zoom)",
        date: new Date(Date.now() + 86400000 * 2).toISOString(),
    });

    const bookingMessage = `[PROPOSAL]${proposalPayload}`;

    const { error: msgError } = await supabase.from('messages').insert({
        sender_id: bobId,
        receiver_id: chrisId,
        content: bookingMessage,
        is_read: false
    });

    if (msgError) {
        console.error("Error sending message:", msgError);
        return;
    }

    console.log("Proposal successfully inserted!");
}

run();

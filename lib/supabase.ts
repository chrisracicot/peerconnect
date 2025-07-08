import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Access Expo environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

//debugging
console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});

export type Message = {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
  user1_id: string;
  user2_id: string;
};

export type ConversationWithMessages = Conversation & {
  messages: Message[];
  other_user: {
    id: string;
    username: string;
    avatar_url: string;
  };
};


// import postgres from 'postgres'
// const connectionString = process.env.DATABASE_URL
// const sql = postgres(connectionString)
// export default sql
// import * as SecureStore from 'expo-secure-store';
// import 'react-native-url-polyfill/auto';
import {createClient} from "@supabase/supabase-js";
        
// Use a custom secure storage solution for the Supabase client to store the JWT
// const ExpoSecureStoreAdapter = {
//     getItem: (key: string) => {
//       return SecureStore.getItemAsync(key);
//     },
//     setItem: (key: string, value: string) => {
//       SecureStore.setItemAsync(key, value);
//     },
//     removeItem: (key: string) => {
//       SecureStore.deleteItemAsync(key);
//     },
//   };

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_KEY,
    {
        // auth: {
        //     storage: ExpoSecureStoreAdapter as any,
        //     detectSessionInUrl: false,
        //   },
    }
);
export default supabase;

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const missingSupabaseConfig = !supabaseUrl || !supabaseAnonKey;

const createSupabaseFallback = () => {
  const emptySession = { data: { session: null } };

  return {
    auth: {
      getSession: async () => emptySession,
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: new Error('Supabase is not configured'),
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback: (event: string, session: null) => void) => {
        callback('INITIAL_SESSION', null);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      updateUser: async () => ({
        data: null,
        error: new Error('Supabase is not configured'),
      }),
    },
  } as const;
};

if (missingSupabaseConfig) {
  console.warn(
    'Supabase public environment variables are missing. The app will load in fallback mode until EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are provided.',
  );
}

export const supabase = missingSupabaseConfig
  ? createSupabaseFallback()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage, // required for React Native
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });

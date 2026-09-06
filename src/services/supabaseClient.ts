import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Vite environment variables with project fallbacks
const defaultUrl = 'https://xcpvuqkpdwkwlpgxaufx.supabase.co';
const defaultKey = 'sb_publishable_jUEvpCHbZm6soGwKusc7qA_k324GWh3';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || defaultUrl).trim();
// Strip trailing /rest/v1 or trailing slashes if present
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey).trim();

let client: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('Supabase client initialized successfully:', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
} else {
  console.warn('Supabase URL or Anon Key is not configured. Running in local cache mode.');
}

export const supabase = client;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && client);
};

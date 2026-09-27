import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read configuration from localStorage or Vite environment variables with safe defaults
const getStoredUrl = (): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('VITE_SUPABASE_URL') || localStorage.getItem('SUPABASE_URL');
    if (local && local.trim()) return local.trim();
  }
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_URL) ||
    '';
  return String(envUrl).trim();
};

const getStoredKey = (): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || localStorage.getItem('SUPABASE_ANON_KEY');
    if (local && local.trim()) return local.trim();
  }
  const envKey =
    (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_ANON_KEY) ||
    '';
  return String(envKey).trim();
};

let currentUrl = getStoredUrl().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
let currentAnonKey = getStoredKey();

function createSupabaseInstance(url: string, key: string): SupabaseClient | null {
  const cleanUrl = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const cleanKey = key.trim();
  if (!cleanUrl || !cleanKey) return null;

  try {
    const c = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.log('Supabase client initialized successfully:', cleanUrl);
    return c;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export let supabase: SupabaseClient | null = createSupabaseInstance(currentUrl, currentAnonKey);

if (!supabase) {
  console.warn('Supabase URL or Anon Key is not configured. Running in local cache mode.');
}

export const isSupabaseConfigured = (): boolean => {
  return Boolean(currentUrl && currentAnonKey && supabase);
};

export const getSupabaseConfig = () => {
  return {
    url: currentUrl,
    anonKey: currentAnonKey,
    isConfigured: isSupabaseConfigured(),
  };
};

export const setSupabaseConfig = (url: string, key: string): { success: boolean; error?: string } => {
  const cleanUrl = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const cleanKey = key.trim();

  if (!cleanUrl) {
    return { success: false, error: 'Supabase Project URL is required.' };
  }
  if (!cleanKey) {
    return { success: false, error: 'Supabase Anon Public Key is required.' };
  }

  try {
    const newClient = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });

    currentUrl = cleanUrl;
    currentAnonKey = cleanKey;
    supabase = newClient;

    if (typeof window !== 'undefined') {
      localStorage.setItem('VITE_SUPABASE_URL', cleanUrl);
      localStorage.setItem('VITE_SUPABASE_ANON_KEY', cleanKey);
      window.dispatchEvent(
        new CustomEvent('tenant_hub_supabase_config_changed', {
          detail: { isConfigured: true, url: cleanUrl },
        })
      );
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Invalid Supabase credentials.' };
  }
};

export const clearSupabaseConfig = () => {
  currentUrl = '';
  currentAnonKey = '';
  supabase = null;

  if (typeof window !== 'undefined') {
    localStorage.removeItem('VITE_SUPABASE_URL');
    localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
    localStorage.removeItem('SUPABASE_URL');
    localStorage.removeItem('SUPABASE_ANON_KEY');
    window.dispatchEvent(
      new CustomEvent('tenant_hub_supabase_config_changed', {
        detail: { isConfigured: false, url: '' },
      })
    );
  }
};


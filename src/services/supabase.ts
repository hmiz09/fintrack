import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'fintrack_supabase_url';
const STORAGE_ANON_KEY = 'fintrack_supabase_anon_key';

// Default Supabase project credentials (configured for automatic cross-device pairing)
const DEFAULT_SUPABASE_URL = 'https://eirtnhsbrlswvcmhwovu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Ajq5cSkao7mNRT9WaZgOtQ_6gTMWHCG';

// Read from build environment variables, local storage, or defaults
export const getSupabaseConfig = (): { url: string; anonKey: string } => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '';

  return {
    url: (envUrl || localUrl || DEFAULT_SUPABASE_URL).trim(),
    anonKey: (envKey || localKey || DEFAULT_SUPABASE_ANON_KEY).trim(),
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  }
  cachedClient = null;
};

export const clearSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
  }
  cachedClient = null;
};

let cachedClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return cachedClient;
  } catch {
    return null;
  }
};

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/** PartyPal project — used if env is missing or truncated (e.g. "...supabase" without ".co"). */
const PARTYPAL_SUPABASE_URL = 'https://gbkfxfqjavvojewjwkvq.supabase.co';

function resolveSupabaseUrl(raw: string | undefined): string {
  const value = (raw ?? '').trim().replace(/\/$/, '');
  if (!value) return PARTYPAL_SUPABASE_URL;
  // Common Netlify typo: project ref + ".supabase" with TLD stripped
  if (/^https:\/\/[a-z0-9]+\.supabase$/i.test(value)) {
    return `${value}.co`;
  }
  return value;
}

const SUPABASE_URL = resolveSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase Admin Client.
 * Uses the Service Role Key to bypass RLS for privileged backend operations.
 * NEVER expose this to the browser or client components.
 */
export const supabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing environment variables for Supabase Admin client (SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};

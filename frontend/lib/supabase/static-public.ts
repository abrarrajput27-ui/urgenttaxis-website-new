import { createClient } from '@supabase/supabase-js';

/**
 * Public static Supabase client for build-time static generation (e.g. generateStaticParams).
 * Uses public anon key and standard fetch without request cookies.
 */
export function getPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

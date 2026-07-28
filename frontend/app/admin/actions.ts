import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function handleLogout() {
  'use server';
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

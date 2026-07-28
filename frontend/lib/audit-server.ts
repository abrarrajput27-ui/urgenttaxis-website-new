import { supabaseServer } from '@/lib/supabase/server';

export async function logAdminAudit(
  action: string,
  entityName: string,
  entityId?: string,
  oldValues?: unknown,
  newValues?: unknown
) {
  try {
    const serverSupabase = await supabaseServer();
    const { data: { user } } = await serverSupabase.auth.getUser();

    await serverSupabase.from('audit_logs').insert({
      user_id: user?.id || null,
      action,
      entity_name: entityName,
      entity_id: entityId || null,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
    });
  } catch (err) {
    console.error('Failed to insert server audit log:', err);
  }
}

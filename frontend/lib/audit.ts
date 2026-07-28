import { supabase } from '@/lib/supabase/client';

export async function logClientAudit(
  action: string,
  entityName: string,
  entityId?: string,
  oldValues?: unknown,
  newValues?: unknown
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('audit_logs').insert({
      user_id: user?.id || null,
      action,
      entity_name: entityName,
      entity_id: entityId || null,
      old_values: oldValues ?? null,
      new_values: newValues ?? null,
    });
  } catch (err) {
    console.error('Failed to insert client audit log:', err);
  }
}



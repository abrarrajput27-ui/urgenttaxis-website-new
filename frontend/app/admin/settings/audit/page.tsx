import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: ['admin'],
  };

  // Pagination & Filters
  const queryStr = typeof resolvedParams.query === 'string' ? resolvedParams.query : '';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const itemsPerPage = 30;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // List Query
  let dbQuery = supabase
    .from('audit_logs')
    .select(`
      *,
      user_profiles ( full_name, email )
    `, { count: 'exact' });

  if (queryStr) {
    dbQuery = dbQuery.or(`action.ilike.%${queryStr}%,entity_name.ilike.%${queryStr}%`);
  }

  const { data: logs, count } = await dbQuery.order('created_at', { ascending: false }).range(from, to);
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/settings" className="text-slate-400 hover:text-white">&larr; Back to Settings</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">System Audit Logs</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1">Immutable record of all administrative and system actions.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold">
            Total Records: {count || 0}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <form className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
            <input type="text" name="query" defaultValue={queryStr} placeholder="Search Action, Entity Name..." className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 w-full max-w-md" />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Search Logs</button>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="p-4 font-bold text-slate-400 uppercase text-xs">Timestamp</th>
                  <th className="p-4 font-bold text-slate-400 uppercase text-xs">Actor</th>
                  <th className="p-4 font-bold text-slate-400 uppercase text-xs">Action</th>
                  <th className="p-4 font-bold text-slate-400 uppercase text-xs">Entity</th>
                  <th className="p-4 font-bold text-slate-400 uppercase text-xs">Payload (Delta)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logs?.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-slate-300">{format(new Date(log.created_at), 'MMM dd, yyyy')}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{format(new Date(log.created_at), 'HH:mm:ss')}</div>
                    </td>
                    <td className="p-4">
                      {log.user_profiles ? (
                        <>
                          <div className="font-bold text-white">{log.user_profiles.full_name}</div>
                          <div className="text-xs text-slate-500">{log.user_profiles.email}</div>
                        </>
                      ) : (
                        <span className="text-slate-500 italic">System / Unknown</span>
                      )}
                      {log.ip_address && <div className="text-[10px] text-slate-600 font-mono mt-1">IP: {log.ip_address}</div>}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded text-[10px] font-bold uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 font-bold capitalize">{log.entity_name}</div>
                      <div className="text-xs text-slate-500 font-mono truncate max-w-[150px]" title={log.entity_id}>{log.entity_id || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      {log.new_values ? (
                        <pre className="text-[10px] text-brand-green bg-slate-900 p-2 rounded overflow-x-auto max-w-xs border border-slate-800 font-mono">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      ) : (
                        <span className="text-slate-500 text-xs italic">No payload</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!logs || logs.length === 0) && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No audit logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
              <div>Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} entries</div>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/admin/settings/audit?page=${page - 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Previous</Link>}
                {page < totalPages && <Link href={`/admin/settings/audit?page=${page + 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Next</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

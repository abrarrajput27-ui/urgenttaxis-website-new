import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';

export default async function AdminSettingsPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();
  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: ['admin'],
  };

  const { data: settings } = await supabase.from('system_settings').select('*').order('setting_key');

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Configure global application variables, branding, and integrations.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/settings/audit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              View Audit Logs
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <nav className="flex flex-col space-y-1">
              <a href="#" className="bg-slate-900 text-brand-blue font-bold px-4 py-3 rounded-lg border-l-4 border-brand-blue">General</a>
              <a href="#" className="text-slate-400 hover:bg-slate-900/50 hover:text-white px-4 py-3 rounded-lg font-medium transition-colors">Payment Gateways</a>
              <a href="#" className="text-slate-400 hover:bg-slate-900/50 hover:text-white px-4 py-3 rounded-lg font-medium transition-colors">Notifications / SMS</a>
              <a href="#" className="text-slate-400 hover:bg-slate-900/50 hover:text-white px-4 py-3 rounded-lg font-medium transition-colors">SEO & Branding</a>
            </nav>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">General Configuration</h3>
              </div>
              <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800/50">
                    {settings?.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 w-1/3">
                          <div className="font-bold text-white text-sm">{s.setting_key.replace(/_/g, ' ').toUpperCase()}</div>
                          <div className="text-xs text-slate-500 mt-1">{s.description || 'System constant'}</div>
                        </td>
                        <td className="p-4">
                          <pre className="text-xs text-brand-green bg-slate-900 p-2 rounded overflow-x-auto border border-slate-800 font-mono">
                            {JSON.stringify(s.setting_value, null, 2)}
                          </pre>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-xs font-bold text-brand-blue hover:text-blue-400 transition-colors">Edit</button>
                        </td>
                      </tr>
                    ))}
                    {(!settings || settings.length === 0) && (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-500 text-sm">No settings configured in the database yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

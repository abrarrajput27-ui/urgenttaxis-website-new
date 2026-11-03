import { supabaseServer } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AdminCMSPage({
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
  const itemsPerPage = 20;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // List Query
  let dbQuery = supabase
    .from('cms_pages')
    .select('*', { count: 'exact' });

  if (queryStr) {
    dbQuery = dbQuery.or(`title.ilike.%${queryStr}%,slug.ilike.%${queryStr}%`);
  }

  const { data: pages, count } = await dbQuery.order('updated_at', { ascending: false }).range(from, to);
  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  // Media Count
  const { count: mediaCount } = await supabase.from('media_assets').select('*', { count: 'exact', head: true });

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CMS & Content</h1>
            <p className="text-sm text-slate-400 mt-1">Manage SEO pages, blogs, and dynamic website content.</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">Media Library</button>
            <button className="bg-brand-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">+ Create Page</button>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Total Pages</p>
            <p className="text-3xl font-extrabold text-white mt-2">{count ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Published Pages</p>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2">{pages?.filter(p => p.is_published).length ?? 0}</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs font-semibold uppercase text-slate-400">Media Assets</p>
            <p className="text-3xl font-extrabold text-brand-blue mt-2">{mediaCount ?? 0}</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <form className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-4">
            <input type="text" name="query" defaultValue={queryStr} placeholder="Search Page Title or Slug..." className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-4 py-2 w-full max-w-sm" />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold">Search</button>
          </form>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Page Title</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Slug / URL</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">SEO Status</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Last Updated</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Visibility</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pages?.map((p) => {
                  const hasSeo = Boolean(p.meta_title && p.meta_description);
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{p.title}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-brand-blue truncate max-w-[200px]">/{p.slug}</div>
                      </td>
                      <td className="p-4">
                        {hasSeo ? (
                          <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">Optimized</span>
                        ) : (
                          <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-2 py-1 rounded">Needs Review</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-300">{format(new Date(p.updated_at), 'MMM dd, yyyy')}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                          {p.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/admin/cms/${p.id}`} className="text-xs font-bold text-brand-blue hover:text-blue-400 transition-colors">
                          Edit Content &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {(!pages || pages.length === 0) && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500 text-sm">No CMS pages found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
              <div>Showing {from + 1} to {Math.min(to + 1, count || 0)} of {count} entries</div>
              <div className="flex gap-2">
                {page > 1 && <Link href={`/admin/cms?page=${page - 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Previous</Link>}
                {page < totalPages && <Link href={`/admin/cms?page=${page + 1}&query=${queryStr}`} className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700 text-white">Next</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

import { supabaseServer } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

async function updateCmsPage(formData: FormData) {
  'use server';
  const supabase = await supabaseServer();
  const id = formData.get('page_id') as string;
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const content_markdown = formData.get('content_markdown') as string;
  const is_published = formData.get('is_published') === 'true';

  await supabase.from('cms_pages').update({
    title, slug, meta_title, meta_description, content_markdown, is_published, updated_at: new Date().toISOString()
  }).eq('id', id);

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id, action: 'UPDATE_CMS_PAGE', entity_name: 'cms_pages', entity_id: id, new_values: { title, is_published }
    });
  }
  revalidatePath(`/admin/cms/${id}`);
}

export default async function CmsPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await supabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase.from('user_profiles').select('full_name').eq('id', user.id).single();

  const currentUser = {
    email: user.email,
    fullName: profile?.full_name || user.email?.split('@')[0],
    roles: ['admin'],
  };

  const { data: pageData, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !pageData) notFound();

  return (
    <AdminShell user={currentUser}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin/cms" className="text-slate-400 hover:text-white">&larr; Back</Link>
              <h1 className="text-2xl font-bold text-white tracking-tight">Edit Page: {pageData.title}</h1>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${pageData.is_published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                {pageData.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-sm text-brand-blue mt-2">
              URL Preview: /pages/{pageData.slug}
            </p>
          </div>
          <div className="flex gap-2">
            <a href={`/${pageData.slug}`} target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
              Preview Live &rarr;
            </a>
          </div>
        </div>

        <form action={updateCmsPage} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <input type="hidden" name="page_id" value={pageData.id} />
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Content Editor */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Content Editor (Markdown Supported)</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Page Title (H1)</label>
                  <input type="text" name="title" defaultValue={pageData.title} className="w-full bg-slate-900 border border-slate-800 text-white rounded p-2 text-sm" required />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Page Content</label>
                  <textarea 
                    name="content_markdown" 
                    defaultValue={pageData.content_markdown || ''} 
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-4 font-mono text-sm min-h-[400px]"
                    placeholder="# Main Heading\n\nWrite your markdown content here..."
                  />
                  <p className="text-xs text-slate-500 mt-2">HTML and Markdown are fully supported for formatting.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* SEO Settings */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">SEO & Metadata</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">URL Slug</label>
                  <input type="text" name="slug" defaultValue={pageData.slug} className="w-full bg-slate-900 border border-slate-800 text-brand-blue rounded p-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Meta Title</label>
                  <input type="text" name="meta_title" defaultValue={pageData.meta_title || ''} className="w-full bg-slate-900 border border-slate-800 text-white rounded p-2 text-sm" placeholder="Max 60 chars" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Meta Description</label>
                  <textarea 
                    name="meta_description" 
                    defaultValue={pageData.meta_description || ''} 
                    className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded p-2 text-sm h-24"
                    placeholder="Max 160 chars. Best for Google Search snippets."
                  />
                </div>
              </div>
            </div>

            {/* Publishing */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white">Publishing</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Visibility Status</label>
                  <select name="is_published" defaultValue={pageData.is_published ? 'true' : 'false'} className="w-full bg-slate-900 border border-slate-800 text-white rounded p-2 text-sm" required>
                    <option value="true">Published (Live)</option>
                    <option value="false">Draft (Hidden)</option>
                  </select>
                </div>
                
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded shadow-sm text-sm transition-colors mt-2">
                  Save Changes
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">Changes are applied immediately.</p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </AdminShell>
  );
}

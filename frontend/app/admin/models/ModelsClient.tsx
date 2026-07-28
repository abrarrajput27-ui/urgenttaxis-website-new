'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { VehicleModel, VehicleCategory, DisplayMode } from '@/types/database';
import { logClientAudit } from '@/lib/audit';

interface ModelsClientProps {
  initialModels: VehicleModel[];
  categories: VehicleCategory[];
}

export default function ModelsClient({ initialModels, categories }: ModelsClientProps) {
  const router = useRouter();
  const [models, setModels] = useState<VehicleModel[]>(initialModels);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);

  // Soft disable confirmation modal
  const [confirmModel, setConfirmModel] = useState<VehicleModel | null>(null);

  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [slug, setSlug] = useState('');
  const [masterImageUrl, setMasterImageUrl] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('model_or_similar');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredModels = models.filter(
    (m) =>
      m.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.vehicle_categories?.name &&
        m.vehicle_categories.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openCreateModal = () => {
    setEditingModel(null);
    setCategoryId(categories[0]?.id || '');
    setBrandName('');
    setModelName('');
    setSlug('');
    setMasterImageUrl('');
    setDisplayMode('model_or_similar');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (model: VehicleModel) => {
    setEditingModel(model);
    setCategoryId(model.category_id);
    setBrandName(model.brand_name);
    setModelName(model.model_name);
    setSlug(model.slug);
    setMasterImageUrl(model.master_image_url || '');
    setDisplayMode(model.display_mode);
    setIsActive(model.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleModelNameChange = (val: string) => {
    setModelName(val);
    if (!editingModel) {
      const full = `${brandName} ${val}`.trim();
      setSlug(full.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setUploadingImage(true);
    try {
      const selectedCategory = categories.find((c) => c.id === categoryId);
      const categorySlug = selectedCategory?.slug || 'generic';
      const modelSlugClean = slug || 'model';
      const fileExt = file.name.split('.').pop();
      const fileName = `models/${categorySlug}/${modelSlugClean}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      // 1. Upload to Supabase Storage vehicle-catalog bucket
      const { error: uploadError } = await supabase.storage
        .from('vehicle-catalog')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('vehicle-catalog')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      setMasterImageUrl(publicUrl);

      // 2. Track media asset record in media_assets table
      const { data: mediaAsset, error: mediaError } = await supabase
        .from('media_assets')
        .insert({
          title: `${brandName} ${modelName} Catalog Image`.trim() || 'Model Catalog Image',
          file_url: publicUrl,
          bucket_name: 'vehicle-catalog',
          file_type: file.type,
          is_active: true,
        })
        .select()
        .single();

      if (mediaError) {
        console.warn('Warning: Failed to create media_assets tracking row:', mediaError.message);
      }

      await logClientAudit(
        'UPLOAD_MEDIA',
        'media_assets',
        mediaAsset?.id || undefined,
        null,
        { file_url: publicUrl, bucket_name: 'vehicle-catalog', path: fileName }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      alert(`Image upload failed: ${msg}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!masterImageUrl) return;
    if (!confirm('Are you sure you want to remove this master image?')) return;

    try {
      const oldUrl = masterImageUrl;
      setMasterImageUrl('');

      await logClientAudit(
        'DELETE_MEDIA',
        'vehicle_models',
        editingModel?.id,
        { master_image_url: oldUrl },
        { master_image_url: null }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove image';
      alert(`Failed to remove image: ${msg}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (editingModel) {
        // Update
        const { data, error } = await supabase
          .from('vehicle_models')
          .update({
            category_id: categoryId,
            brand_name: brandName,
            model_name: modelName,
            slug,
            master_image_url: masterImageUrl || null,
            display_mode: displayMode,
            is_active: isActive,
          })
          .eq('id', editingModel.id)
          .select('*, vehicle_categories(*)')
          .single();

        if (error) throw error;
        setModels(models.map((m) => (m.id === data.id ? data : m)));

        await logClientAudit(
          'UPDATE_MODEL',
          'vehicle_models',
          editingModel.id,
          editingModel,
          data
        );
      } else {
        // Create
        const { data, error } = await supabase
          .from('vehicle_models')
          .insert({
            category_id: categoryId,
            brand_name: brandName,
            model_name: modelName,
            slug,
            master_image_url: masterImageUrl || null,
            display_mode: displayMode,
            is_active: isActive,
          })
          .select('*, vehicle_categories(*)')
          .single();

        if (error) throw error;
        setModels([...models, data]);

        await logClientAudit(
          'CREATE_MODEL',
          'vehicle_models',
          data.id,
          null,
          data
        );
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveConfirm = async () => {
    if (!confirmModel) return;
    try {
      const nextActive = !confirmModel.is_active;
      const { data, error } = await supabase
        .from('vehicle_models')
        .update({ is_active: nextActive })
        .eq('id', confirmModel.id)
        .select('*, vehicle_categories(*)')
        .single();

      if (error) throw error;
      setModels(models.map((m) => (m.id === data.id ? data : m)));

      await logClientAudit(
        'TOGGLE_MODEL_STATUS',
        'vehicle_models',
        confirmModel.id,
        { is_active: confirmModel.is_active },
        { is_active: nextActive }
      );

      setConfirmModel(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle status';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vehicle Models</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage makes, models, master images, and website display modes (Dzire, Innova, Ertiga, etc.)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Add New Vehicle Model
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brand, model, slug..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Showing {filteredModels.length} of {models.length} models
        </p>
      </div>

      {/* Table List */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredModels.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {models.length === 0
              ? 'No vehicle models found in database. Click above to add a model.'
              : 'No models match your search criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Master Image</th>
                  <th className="py-3.5 px-4 font-semibold">Brand & Model</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Display Mode</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      {model.master_image_url ? (
                        <img
                          src={model.master_image_url}
                          alt={model.model_name}
                          className="w-12 h-9 object-cover rounded border border-slate-800 bg-slate-900"
                        />
                      ) : (
                        <div className="w-12 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-600">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {model.brand_name} {model.model_name}
                      <p className="text-[10px] font-mono text-slate-400 font-normal">{model.slug}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800">
                        {model.vehicle_categories?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20 uppercase">
                        {model.display_mode.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setConfirmModel(model)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border transition-colors ${
                          model.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${model.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        {model.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(model)}
                        className="text-amber-400 hover:text-amber-300 font-medium text-xs cursor-pointer px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Active/Inactive Toggle */}
      {confirmModel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {confirmModel.is_active ? 'Deactivate Vehicle Model?' : 'Activate Vehicle Model?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to mark <strong>{confirmModel.brand_name} {confirmModel.model_name}</strong> as{' '}
              <strong className={confirmModel.is_active ? 'text-red-400' : 'text-emerald-400'}>
                {confirmModel.is_active ? 'Inactive' : 'Active'}
              </strong>
              ? Soft-disabling preserves variant and fleet references.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModel(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleActiveConfirm}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  confirmModel.is_active
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Confirm {confirmModel.is_active ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white">
              {editingModel ? 'Edit Vehicle Model' : 'Create Vehicle Model'}
            </h2>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Vehicle Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Brand Make (e.g. Maruti)</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Maruti / Toyota"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Model Name (e.g. Dzire)</label>
                  <input
                    type="text"
                    required
                    value={modelName}
                    onChange={(e) => handleModelNameChange(e.target.value)}
                    placeholder="Dzire / Innova Crysta"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Supabase Storage Media Upload */}
              <div className="border border-slate-800 bg-slate-950/50 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">Master Catalog Image (vehicle-catalog Bucket)</label>
                  {masterImageUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteImage}
                      className="text-[10px] text-red-400 hover:text-red-300 font-semibold underline cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {masterImageUrl && (
                  <div className="relative w-full h-36 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center p-2">
                    <img src={masterImageUrl} alt="Master Catalog Preview" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                  {uploadingImage && <span className="text-amber-400 font-medium animate-pulse text-[11px]">Uploading to Supabase...</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Public Display Mode</label>
                  <select
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="model_or_similar">Model or Similar (Recommended)</option>
                    <option value="exact_vehicle">Exact Vehicle</option>
                    <option value="vehicle_model">Vehicle Model</option>
                    <option value="category_or_similar">Category or Similar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Active Status</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadingImage}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>}
                  <span>{loading ? 'Saving...' : 'Save Vehicle Model'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


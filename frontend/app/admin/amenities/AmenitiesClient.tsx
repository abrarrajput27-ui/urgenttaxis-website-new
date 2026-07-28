'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Amenity } from '@/types/database';
import { logClientAudit } from '@/lib/audit';

interface AmenitiesClientProps {
  initialAmenities: Amenity[];
}

export default function AmenitiesClient({ initialAmenities }: AmenitiesClientProps) {
  const router = useRouter();
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);

  // Soft disable confirmation modal
  const [confirmAmenity, setConfirmAmenity] = useState<Amenity | null>(null);

  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredAmenities = amenities.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.icon_name && a.icon_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openCreateModal = () => {
    setEditingAmenity(null);
    setName('');
    setIconName('');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Amenity) => {
    setEditingAmenity(item);
    setName(item.name);
    setIconName(item.icon_name || '');
    setIsActive(item.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (editingAmenity) {
        // Update
        const { data, error } = await supabase
          .from('amenities')
          .update({
            name,
            icon_name: iconName || null,
            is_active: isActive,
          })
          .eq('id', editingAmenity.id)
          .select()
          .single();

        if (error) throw error;
        setAmenities(amenities.map((a) => (a.id === data.id ? data : a)));

        await logClientAudit(
          'UPDATE_AMENITY',
          'amenities',
          editingAmenity.id,
          editingAmenity,
          data
        );
      } else {
        // Create
        const { data, error } = await supabase
          .from('amenities')
          .insert({
            name,
            icon_name: iconName || null,
            is_active: isActive,
          })
          .select()
          .single();

        if (error) throw error;
        setAmenities([...amenities, data]);

        await logClientAudit(
          'CREATE_AMENITY',
          'amenities',
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
    if (!confirmAmenity) return;
    try {
      const nextActive = !confirmAmenity.is_active;
      const { data, error } = await supabase
        .from('amenities')
        .update({ is_active: nextActive })
        .eq('id', confirmAmenity.id)
        .select()
        .single();

      if (error) throw error;
      setAmenities(amenities.map((a) => (a.id === data.id ? data : a)));

      await logClientAudit(
        'TOGGLE_AMENITY_STATUS',
        'amenities',
        confirmAmenity.id,
        { is_active: confirmAmenity.is_active },
        { is_active: nextActive }
      );

      setConfirmAmenity(null);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Vehicle Amenities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage features taggable to vehicle master catalog (AC, Music System, Charging Port, etc.)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Add New Amenity
        </button>
      </div>

      {/* Toolbar & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search amenity name or icon..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Showing {filteredAmenities.length} of {amenities.length} amenities
        </p>
      </div>

      {/* Table List */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredAmenities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {amenities.length === 0
              ? 'No amenities found in database. Click above to create one.'
              : 'No amenities match your search criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Amenity Name</th>
                  <th className="py-3.5 px-4 font-semibold">Icon Code</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredAmenities.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {item.icon_name || 'default'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setConfirmAmenity(item)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border transition-colors ${
                          item.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(item)}
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
      {confirmAmenity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {confirmAmenity.is_active ? 'Deactivate Amenity?' : 'Activate Amenity?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to mark <strong>{confirmAmenity.name}</strong> as{' '}
              <strong className={confirmAmenity.is_active ? 'text-red-400' : 'text-emerald-400'}>
                {confirmAmenity.is_active ? 'Inactive' : 'Active'}
              </strong>
              ? Soft-disabling preserves variant amenity mappings.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAmenity(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleActiveConfirm}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  confirmAmenity.is_active
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Confirm {confirmAmenity.is_active ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              {editingAmenity ? 'Edit Amenity' : 'Create Amenity'}
            </h2>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Amenity Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Air Conditioner (AC)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Icon Identifier</label>
                <input
                  type="text"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="ac / music / bottle / luggage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
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
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>}
                  <span>{loading ? 'Saving...' : 'Save Amenity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


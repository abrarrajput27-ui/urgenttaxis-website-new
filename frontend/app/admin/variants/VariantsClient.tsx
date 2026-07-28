'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { VehicleVariant, VehicleModel, FuelType } from '@/types/database';
import { logClientAudit } from '@/lib/audit';

interface VariantsClientProps {
  initialVariants: VehicleVariant[];
  models: VehicleModel[];
}

export default function VariantsClient({ initialVariants, models }: VariantsClientProps) {
  const router = useRouter();
  const [variants, setVariants] = useState<VehicleVariant[]>(initialVariants);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<VehicleVariant | null>(null);

  // Soft disable confirmation modal
  const [confirmVariant, setConfirmVariant] = useState<VehicleVariant | null>(null);

  const [modelId, setModelId] = useState(models[0]?.id || '');
  const [variantName, setVariantName] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('CNG');
  const [seatingCapacity, setSeatingCapacity] = useState('4');
  const [luggageCapacity, setLuggageCapacity] = useState('2');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.variant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.fuel_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.vehicle_models?.model_name &&
        v.vehicle_models.model_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.vehicle_models?.brand_name &&
        v.vehicle_models.brand_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModel =
      selectedModelFilter === 'all' || v.model_id === selectedModelFilter;

    return matchesSearch && matchesModel;
  });

  const openCreateModal = () => {
    setEditingVariant(null);
    setModelId(models[0]?.id || '');
    setVariantName('');
    setFuelType('CNG');
    setSeatingCapacity('4');
    setLuggageCapacity('2');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (variant: VehicleVariant) => {
    setEditingVariant(variant);
    setModelId(variant.model_id);
    setVariantName(variant.variant_name);
    setFuelType(variant.fuel_type);
    setSeatingCapacity(variant.seating_capacity.toString());
    setLuggageCapacity(variant.luggage_capacity_large.toString());
    setIsActive(variant.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (editingVariant) {
        // Update
        const { data, error } = await supabase
          .from('vehicle_variants')
          .update({
            model_id: modelId,
            variant_name: variantName,
            fuel_type: fuelType,
            seating_capacity: parseInt(seatingCapacity, 10) || 4,
            luggage_capacity_large: parseInt(luggageCapacity, 10) || 0,
            is_active: isActive,
          })
          .eq('id', editingVariant.id)
          .select('*, vehicle_models(*, vehicle_categories(*))')
          .single();

        if (error) throw error;
        setVariants(variants.map((v) => (v.id === data.id ? data : v)));

        await logClientAudit(
          'UPDATE_VARIANT',
          'vehicle_variants',
          editingVariant.id,
          editingVariant,
          data
        );
      } else {
        // Create
        const { data, error } = await supabase
          .from('vehicle_variants')
          .insert({
            model_id: modelId,
            variant_name: variantName,
            fuel_type: fuelType,
            seating_capacity: parseInt(seatingCapacity, 10) || 4,
            luggage_capacity_large: parseInt(luggageCapacity, 10) || 0,
            is_active: isActive,
          })
          .select('*, vehicle_models(*, vehicle_categories(*))')
          .single();

        if (error) throw error;
        setVariants([...variants, data]);

        await logClientAudit(
          'CREATE_VARIANT',
          'vehicle_variants',
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
    if (!confirmVariant) return;
    try {
      const nextActive = !confirmVariant.is_active;
      const { data, error } = await supabase
        .from('vehicle_variants')
        .update({ is_active: nextActive })
        .eq('id', confirmVariant.id)
        .select('*, vehicle_models(*, vehicle_categories(*))')
        .single();

      if (error) throw error;
      setVariants(variants.map((v) => (v.id === data.id ? data : v)));

      await logClientAudit(
        'TOGGLE_VARIANT_STATUS',
        'vehicle_variants',
        confirmVariant.id,
        { is_active: confirmVariant.is_active },
        { is_active: nextActive }
      );

      setConfirmVariant(null);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Vehicle Variants</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage specific trims, seating capacity, luggage capacity, and fuel configurations (Dzire VXI CNG, Innova ZX, etc.)
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Add New Vehicle Variant
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variant or fuel..."
            className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <select
            value={selectedModelFilter}
            onChange={(e) => setSelectedModelFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Models</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand_name} {m.model_name}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Showing {filteredVariants.length} of {variants.length} variants
        </p>
      </div>

      {/* Table List */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredVariants.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {variants.length === 0
              ? 'No vehicle variants found in database. Click above to add a variant.'
              : 'No variants match your search criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Variant Name</th>
                  <th className="py-3.5 px-4 font-semibold">Model Make</th>
                  <th className="py-3.5 px-4 font-semibold">Fuel Type</th>
                  <th className="py-3.5 px-4 font-semibold">Seating</th>
                  <th className="py-3.5 px-4 font-semibold">Luggage</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {variant.variant_name}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {variant.vehicle_models?.brand_name} {variant.vehicle_models?.model_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-mono text-[10px]">
                        {variant.fuel_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{variant.seating_capacity} Seats</td>
                    <td className="py-3.5 px-4">{variant.luggage_capacity_large} Bags</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setConfirmVariant(variant)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border transition-colors ${
                          variant.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${variant.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        {variant.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(variant)}
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
      {confirmVariant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {confirmVariant.is_active ? 'Deactivate Variant?' : 'Activate Variant?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to mark <strong>{confirmVariant.variant_name}</strong> as{' '}
              <strong className={confirmVariant.is_active ? 'text-red-400' : 'text-emerald-400'}>
                {confirmVariant.is_active ? 'Inactive' : 'Active'}
              </strong>
              ? Soft-disabling preserves actual fleet linkages.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmVariant(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleActiveConfirm}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  confirmVariant.is_active
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Confirm {confirmVariant.is_active ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              {editingVariant ? 'Edit Vehicle Variant' : 'Create Vehicle Variant'}
            </h2>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Parent Vehicle Model</label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand_name} {m.model_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Variant Name (e.g. Dzire VXI CNG)</label>
                <input
                  type="text"
                  required
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Dzire VXI CNG / Innova ZX Diesel"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="CNG">CNG</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Luggage Capacity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={luggageCapacity}
                    onChange={(e) => setLuggageCapacity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                  <span>{loading ? 'Saving...' : 'Save Variant'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ActualFleet, VehicleVariant, FleetStatus } from '@/types/database';
import { logClientAudit } from '@/lib/audit';

interface FleetClientProps {
  initialFleet: ActualFleet[];
  variants: VehicleVariant[];
}

export default function FleetClient({ initialFleet, variants }: FleetClientProps) {
  const router = useRouter();
  const [fleet, setFleet] = useState<ActualFleet[]>(initialFleet);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFleet, setEditingFleet] = useState<ActualFleet | null>(null);

  // Soft disable confirmation modal
  const [confirmFleet, setConfirmFleet] = useState<ActualFleet | null>(null);

  const [variantId, setVariantId] = useState(variants[0]?.id || '');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [chassisNumber, setChassisNumber] = useState('');
  const [status, setStatus] = useState<FleetStatus>('available');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredFleet = fleet.filter((item) => {
    const reg = item.registration_number || 'not assigned';
    const brand = item.vehicle_variants?.vehicle_models?.brand_name || '';
    const model = item.vehicle_variants?.vehicle_models?.model_name || '';
    const variant = item.vehicle_variants?.variant_name || '';

    const matchesSearch =
      reg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'all' || item.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setEditingFleet(null);
    setVariantId(variants[0]?.id || '');
    setRegistrationNumber('');
    setChassisNumber('');
    setStatus('available');
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ActualFleet) => {
    setEditingFleet(item);
    setVariantId(item.variant_id);
    setRegistrationNumber(item.registration_number || '');
    setChassisNumber(item.chassis_number || '');
    setStatus(item.status);
    setIsActive(item.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const regToSave = registrationNumber.trim() ? registrationNumber.trim().toUpperCase() : null;

      if (editingFleet) {
        // Update
        const { data, error } = await supabase
          .from('actual_fleet')
          .update({
            variant_id: variantId,
            registration_number: regToSave, // NULLABLE / OPTIONAL
            chassis_number: chassisNumber.trim() || null,
            status,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingFleet.id)
          .select('*, vehicle_variants(*, vehicle_models(*, vehicle_categories(*)))')
          .single();

        if (error) throw error;
        setFleet(fleet.map((f) => (f.id === data.id ? data : f)));

        await logClientAudit(
          'UPDATE_FLEET_UNIT',
          'actual_fleet',
          editingFleet.id,
          editingFleet,
          data
        );
      } else {
        // Create
        const { data, error } = await supabase
          .from('actual_fleet')
          .insert({
            variant_id: variantId,
            registration_number: regToSave, // NULLABLE / OPTIONAL
            chassis_number: chassisNumber.trim() || null,
            status,
            is_active: isActive,
          })
          .select('*, vehicle_variants(*, vehicle_models(*, vehicle_categories(*)))')
          .single();

        if (error) throw error;
        setFleet([...fleet, data]);

        await logClientAudit(
          'CREATE_FLEET_UNIT',
          'actual_fleet',
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
    if (!confirmFleet) return;
    try {
      const nextActive = !confirmFleet.is_active;
      const { data, error } = await supabase
        .from('actual_fleet')
        .update({ is_active: nextActive, updated_at: new Date().toISOString() })
        .eq('id', confirmFleet.id)
        .select('*, vehicle_variants(*, vehicle_models(*, vehicle_categories(*)))')
        .single();

      if (error) throw error;
      setFleet(fleet.map((f) => (f.id === data.id ? data : f)));

      await logClientAudit(
        'TOGGLE_FLEET_STATUS',
        'actual_fleet',
        confirmFleet.id,
        { is_active: confirmFleet.is_active },
        { is_active: nextActive }
      );

      setConfirmFleet(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to toggle status';
      alert(msg);
    }
  };

  const getStatusBadge = (fleetStatus: FleetStatus) => {
    switch (fleetStatus) {
      case 'available':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'booked':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'on_trip':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'maintenance':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'blocked':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'inactive':
      default:
        return 'bg-slate-800 text-slate-500 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Actual Operational Fleet</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage physical vehicles on road. Registration Number is <strong>OPTIONAL</strong> (can exist as Catalog Unit when Registration is NULL).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Add New Fleet Unit
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reg # or model..."
            className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full sm:w-44 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="on_trip">On Trip</option>
            <option value="maintenance">Maintenance</option>
            <option value="blocked">Blocked</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Showing {filteredFleet.length} of {fleet.length} fleet units
        </p>
      </div>

      {/* Table List */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredFleet.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {fleet.length === 0
              ? 'No physical fleet units registered in database. Click above to register a unit.'
              : 'No fleet units match your search criteria.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Catalog Image</th>
                  <th className="py-3.5 px-4 font-semibold">Reg. Number</th>
                  <th className="py-3.5 px-4 font-semibold">Master Vehicle Model</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Fuel & Seating</th>
                  <th className="py-3.5 px-4 font-semibold">Fleet Status</th>
                  <th className="py-3.5 px-4 font-semibold">Active</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredFleet.map((item) => {
                  const masterImage = item.vehicle_variants?.vehicle_models?.master_image_url;
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4">
                        {masterImage ? (
                          <img
                            src={masterImage}
                            alt="Catalog Image"
                            className="w-10 h-8 object-cover rounded border border-slate-800 bg-slate-900"
                          />
                        ) : (
                          <div className="w-10 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-600">
                            No Img
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {item.registration_number ? (
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {item.registration_number}
                          </span>
                        ) : (
                          <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-sans">
                            Not Assigned <span className="text-slate-500 italic font-mono">(Catalog Unit)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.vehicle_variants?.vehicle_models?.brand_name} {item.vehicle_variants?.vehicle_models?.model_name}
                        <p className="text-[10px] text-slate-400 font-normal">{item.vehicle_variants?.variant_name}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {item.vehicle_variants?.vehicle_models?.vehicle_categories?.name || 'Category'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {item.vehicle_variants?.fuel_type} • {item.vehicle_variants?.seating_capacity} Seats
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${getStatusBadge(item.status)}`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setConfirmFleet(item)}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Active/Inactive Toggle */}
      {confirmFleet && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {confirmFleet.is_active ? 'Deactivate Fleet Unit?' : 'Activate Fleet Unit?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to mark vehicle{' '}
              <strong>
                {confirmFleet.registration_number || 'Catalog Unit (Not Assigned)'}
              </strong>{' '}
              as{' '}
              <strong className={confirmFleet.is_active ? 'text-red-400' : 'text-emerald-400'}>
                {confirmFleet.is_active ? 'Inactive' : 'Active'}
              </strong>
              ?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmFleet(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleActiveConfirm}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  confirmFleet.is_active
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Confirm {confirmFleet.is_active ? 'Deactivation' : 'Activation'}
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
              {editingFleet ? 'Edit Actual Fleet Unit' : 'Create Actual Fleet Unit'}
            </h2>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Vehicle Variant</label>
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_models?.brand_name} {v.vehicle_models?.model_name} - {v.variant_name} ({v.fuel_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Registration Number <span className="text-slate-500 font-normal">(Optional — leave blank for Catalog Unit)</span>
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. UP14XX1234 or leave blank for Not Assigned"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Chassis / VIN Number (Optional)</label>
                <input
                  type="text"
                  value={chassisNumber}
                  onChange={(e) => setChassisNumber(e.target.value)}
                  placeholder="Optional chassis identifier"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Operational Availability Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FleetStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="available">Available (Eligible)</option>
                    <option value="booked">Booked (Ineligible)</option>
                    <option value="on_trip">On Trip (Ineligible)</option>
                    <option value="maintenance">Maintenance (Ineligible)</option>
                    <option value="blocked">Blocked (Ineligible)</option>
                    <option value="inactive">Inactive (Ineligible)</option>
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
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>}
                  <span>{loading ? 'Saving...' : 'Save Fleet Unit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


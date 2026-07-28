'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DynamicPricingRule, VehicleCategory } from '@/types/database';
import { logClientAudit } from '@/lib/audit';

interface SurgeClientProps {
  initialRules: DynamicPricingRule[];
  categories: VehicleCategory[];
}

export default function SurgeClient({ initialRules, categories }: SurgeClientProps) {
  const router = useRouter();
  const [rules, setRules] = useState<DynamicPricingRule[]>(initialRules);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DynamicPricingRule | null>(null);

  // Soft disable confirmation modal
  const [confirmRule, setConfirmRule] = useState<DynamicPricingRule | null>(null);

  // Form Fields
  const [ruleName, setRuleName] = useState('');
  const [tripType, setTripType] = useState<string>('all');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'percentage' | 'flat'>('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState<number>(10);
  const [priority, setPriority] = useState<number>(10);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredRules = rules.filter(
    (r) =>
      r.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.trip_type && r.trip_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openCreateModal = () => {
    setEditingRule(null);
    setRuleName('');
    setTripType('all');
    setCategoryId('all');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setAdjustmentType('percentage');
    setAdjustmentValue(10);
    setPriority(10);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: DynamicPricingRule) => {
    setEditingRule(rule);
    setRuleName(rule.rule_name);
    setTripType(rule.trip_type || 'all');
    setCategoryId(rule.category_id || 'all');
    setStartDate(rule.start_date || '');
    setEndDate(rule.end_date || '');
    setStartTime(rule.start_time || '');
    setEndTime(rule.end_time || '');
    setAdjustmentType(rule.adjustment_type);
    setAdjustmentValue(rule.adjustment_value);
    setPriority(rule.priority);
    setIsActive(rule.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        rule_name: ruleName,
        trip_type: tripType === 'all' ? null : (tripType as DynamicPricingRule['trip_type']),
        category_id: categoryId === 'all' ? null : categoryId,
        start_date: startDate || null,
        end_date: endDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
        adjustment_type: adjustmentType,
        adjustment_value: adjustmentValue,
        priority: priority,
        is_active: isActive,
      };

      if (editingRule) {
        // Update
        const { data, error } = await supabase
          .from('dynamic_pricing_rules')
          .update(payload)
          .eq('id', editingRule.id)
          .select('*, vehicle_categories(*)')
          .single();

        if (error) throw error;
        setRules(rules.map((r) => (r.id === data.id ? data : r)));

        await logClientAudit('UPDATE_SURGE_RULE', 'dynamic_pricing_rules', editingRule.id, editingRule, data);
      } else {
        // Create
        const { data, error } = await supabase
          .from('dynamic_pricing_rules')
          .insert(payload)
          .select('*, vehicle_categories(*)')
          .single();

        if (error) throw error;
        setRules([...rules, data]);

        await logClientAudit('CREATE_SURGE_RULE', 'dynamic_pricing_rules', data.id, null, data);
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
    if (!confirmRule) return;
    try {
      const nextActive = !confirmRule.is_active;
      const { data, error } = await supabase
        .from('dynamic_pricing_rules')
        .update({ is_active: nextActive })
        .eq('id', confirmRule.id)
        .select('*, vehicle_categories(*)')
        .single();

      if (error) throw error;
      setRules(rules.map((r) => (r.id === data.id ? data : r)));

      await logClientAudit(
        'TOGGLE_SURGE_RULE_STATUS',
        'dynamic_pricing_rules',
        confirmRule.id,
        { is_active: confirmRule.is_active },
        { is_active: nextActive }
      );

      setConfirmRule(null);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Dynamic Surge & Seasonal Rules</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure demand multipliers, night peak hours, and holiday pricing. Priority integers resolve rule conflicts deterministically.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Add New Surge Rule
        </button>
      </div>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search rule name or trip type..."
          className="w-full sm:w-72 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <p className="text-xs text-slate-400 font-mono">
          Showing {filteredRules.length} of {rules.length} surge rules
        </p>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No dynamic surge rules found in database. Click above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Rule Name</th>
                  <th className="py-3.5 px-4 font-semibold">Service Type</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Adjustment</th>
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Active Dates & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{rule.rule_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono uppercase text-[10px]">
                        {rule.trip_type ? rule.trip_type.replace('_', ' ') : 'All Trips'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-medium">
                        {rule.vehicle_categories?.name || 'All Categories'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {rule.adjustment_type === 'percentage' ? `+${rule.adjustment_value}%` : `+₹${rule.adjustment_value}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">
                      Priority: {rule.priority}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px]">
                      {rule.start_date || rule.end_date ? `${rule.start_date || 'Any'} to ${rule.end_date || 'Any'}` : 'Always Active Date'}{' '}
                      • {rule.start_time || rule.end_time ? `${rule.start_time || '00:00'} - ${rule.end_time || '23:59'}` : '24 Hours'}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => setConfirmRule(rule)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer border transition-colors ${
                          rule.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${rule.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openEditModal(rule)}
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
      {confirmRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {confirmRule.is_active ? 'Deactivate Surge Rule?' : 'Activate Surge Rule?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to mark surge rule <strong>{confirmRule.rule_name}</strong> as{' '}
              <strong className={confirmRule.is_active ? 'text-red-400' : 'text-emerald-400'}>
                {confirmRule.is_active ? 'Inactive' : 'Active'}
              </strong>
              ?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRule(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleActiveConfirm}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  confirmRule.is_active
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Confirm {confirmRule.is_active ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              {editingRule ? 'Edit Surge Rule' : 'Create Surge Rule'}
            </h2>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g. Diwali Festival Surge 15%"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Service Type</label>
                  <select
                    value={tripType}
                    onChange={(e) => setTripType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Service Types</option>
                    <option value="one_way">One Way</option>
                    <option value="round_trip">Round Trip</option>
                    <option value="local_rental">Local Rental</option>
                    <option value="airport_transfer">Airport Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Adjustment Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as 'percentage' | 'flat')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Adjustment Value</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Priority Integer <span className="text-slate-500 font-normal">(Higher number = Higher Priority)</span>
                </label>
                <input
                  type="number"
                  required
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono font-bold text-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Time (Optional)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Time (Optional)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
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
                  <span>{loading ? 'Saving...' : 'Save Surge Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

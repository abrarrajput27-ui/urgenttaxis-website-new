'use client';

import React, { useState, useMemo } from 'react';
import { TollPlazaItem, StateTaxRate } from '@/lib/data/tolls-data';
import {
  ShieldCheck,
  Search,
  Filter,
  Edit2,
  Check,
  History,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface TollAuditRecord {
  id: string;
  tollName: string;
  field: string;
  oldValue: number | string;
  newValue: number | string;
  updatedAt: string;
  updatedBy: string;
}

interface TollsClientProps {
  initialTolls: TollPlazaItem[];
  initialStateTaxes: Record<string, StateTaxRate>;
}

export default function TollsClient({
  initialTolls,
  initialStateTaxes,
}: TollsClientProps) {
  const [tolls, setTolls] = useState<TollPlazaItem[]>(initialTolls);
  const [stateTaxes, setStateTaxes] = useState<Record<string, StateTaxRate>>(initialStateTaxes);
  const [activeTab, setActiveTab] = useState<'plazas' | 'state_taxes' | 'audit_history'>('plazas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [editingToll, setEditingToll] = useState<TollPlazaItem | null>(null);
  const [auditLogs, setAuditLogs] = useState<TollAuditRecord[]>([
    {
      id: 'log-1',
      tollName: 'Jewar Toll Plaza',
      field: 'sedanRate',
      oldValue: 155,
      newValue: 165,
      updatedAt: '2026-10-15 14:30',
      updatedBy: 'Admin (System)',
    },
    {
      id: 'log-2',
      tollName: 'Chhajrasi Toll Plaza',
      field: 'verifiedAt',
      oldValue: '2026-10-01',
      newValue: '2026-11-01',
      updatedAt: '2026-11-01 10:15',
      updatedBy: 'Admin (NHAI TIS Sync)',
    },
  ]);

  // Unique States list for filter
  const stateOptions = useMemo(() => {
    const set = new Set(tolls.map((t) => t.state));
    return ['All', ...Array.from(set)];
  }, [tolls]);

  // Filtered Toll Plazas
  const filteredTolls = useMemo(() => {
    return tolls.filter((item) => {
      const matchState = selectedState === 'All' || item.state === selectedState;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.highway.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.authority.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchQuery;
    });
  }, [tolls, selectedState, searchQuery]);

  // Handle Rate Update
  const handleSaveTollEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingToll) return;

    const original = tolls.find((t) => t.id === editingToll.id);
    if (!original) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Track audit changes
    const newLogs: TollAuditRecord[] = [];
    if (original.sedanRate !== editingToll.sedanRate) {
      newLogs.push({
        id: `log-${Date.now()}-1`,
        tollName: editingToll.name,
        field: 'Sedan Single',
        oldValue: original.sedanRate,
        newValue: editingToll.sedanRate,
        updatedAt: nowStr,
        updatedBy: 'Admin',
      });
    }
    if (original.suvRate !== editingToll.suvRate) {
      newLogs.push({
        id: `log-${Date.now()}-2`,
        tollName: editingToll.name,
        field: 'SUV Single',
        oldValue: original.suvRate,
        newValue: editingToll.suvRate,
        updatedAt: nowStr,
        updatedBy: 'Admin',
      });
    }
    if (original.sedanReturn !== editingToll.sedanReturn) {
      newLogs.push({
        id: `log-${Date.now()}-3`,
        tollName: editingToll.name,
        field: 'Sedan Return',
        oldValue: original.sedanReturn,
        newValue: editingToll.sedanReturn,
        updatedAt: nowStr,
        updatedBy: 'Admin',
      });
    }

    setAuditLogs((prev) => [...newLogs, ...prev]);
    setTolls((prev) =>
      prev.map((t) =>
        t.id === editingToll.id
          ? { ...editingToll, verifiedAt: new Date().toISOString().substring(0, 10) }
          : t
      )
    );
    setEditingToll(null);
  };

  // Quick Verify Rate Action
  const handleVerifyPlaza = (tollId: string) => {
    const today = new Date().toISOString().substring(0, 10);
    setTolls((prev) =>
      prev.map((t) => (t.id === tollId ? { ...t, verifiedAt: today } : t))
    );
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NHAI & State Expressway Rate Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Toll &amp; State Tax Master Console
          </h1>
          <p className="text-xs text-slate-400">
            Maintain verified single and return toll rates, commercial border taxes, and rate audit history.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('plazas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'plazas'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Toll Plazas ({tolls.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('state_taxes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'state_taxes'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            State Taxes ({Object.keys(stateTaxes).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit_history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'audit_history'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3 h-3" />
            <span>Audit History ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: TOLL PLAZAS ── */}
      {activeTab === 'plazas' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search toll by name, highway (e.g. NH-9, Yamuna Expressway)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* State Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> State:
              </span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {stateOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Toll Plaza &amp; Highway</th>
                  <th className="py-3 px-4">State &amp; Authority</th>
                  <th className="py-3 px-3 text-right">Sedan (1-Way)</th>
                  <th className="py-3 px-3 text-right">Sedan (Return)</th>
                  <th className="py-3 px-3 text-right">SUV (1-Way)</th>
                  <th className="py-3 px-3 text-right">Traveller</th>
                  <th className="py-3 px-4">Last Verified</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTolls.map((toll) => (
                  <tr key={toll.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{toll.name}</div>
                      <div className="text-[11px] text-amber-400/80 font-mono mt-0.5">
                        {toll.highway}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-semibold">{toll.state}</span>
                      <div className="text-[10px] text-slate-500">{toll.authority}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-white tabular-nums">
                      ₹{toll.sedanRate}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-300 tabular-nums">
                      ₹{toll.sedanReturn}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-amber-400 tabular-nums">
                      ₹{toll.suvRate}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-300 tabular-nums">
                      ₹{toll.travellerRate}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <Check className="w-3 h-3" />
                        <span>{toll.verifiedAt}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingToll(toll)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Rates"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyPlaza(toll.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 transition-colors"
                          title="Mark Verified Today"
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: STATE COMMERCIAL ENTRY TAXES ── */}
      {activeTab === 'state_taxes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stateTaxes).map(([stName, tax]) => (
            <div
              key={stName}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{stName}</h3>
                  <div className="text-xs text-amber-400 font-medium mt-0.5">{tax.name}</div>
                </div>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {tax.validity}
                </span>
              </div>

              <p className="text-xs text-slate-400">{tax.description}</p>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="bg-slate-900 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">Sedan</div>
                  <div className="text-xs font-black text-white mt-0.5">₹{tax.sedanRate}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">SUV</div>
                  <div className="text-xs font-black text-amber-400 mt-0.5">₹{tax.suvRate}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">Traveller</div>
                  <div className="text-xs font-black text-white mt-0.5">₹{tax.travellerRate}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg">
                  <div className="text-[10px] text-slate-500 font-bold">Bus</div>
                  <div className="text-xs font-black text-white mt-0.5">₹{tax.busRate}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: AUDIT HISTORY ── */}
      {activeTab === 'audit_history' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Toll Plaza</th>
                <th className="py-3 px-4">Field Changed</th>
                <th className="py-3 px-4">Previous Value</th>
                <th className="py-3 px-4">New Value</th>
                <th className="py-3 px-4">Updated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-4 text-slate-400">{log.updatedAt}</td>
                  <td className="py-3 px-4 font-bold text-white font-sans">{log.tollName}</td>
                  <td className="py-3 px-4 text-amber-400">{log.field}</td>
                  <td className="py-3 px-4 text-slate-500 line-through">₹{log.oldValue}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">₹{log.newValue}</td>
                  <td className="py-3 px-4 text-slate-400 font-sans">{log.updatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── EDIT TOLL MODAL ── */}
      {editingToll && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Toll Rates</h3>
                <p className="text-xs text-slate-400">{editingToll.name} ({editingToll.highway})</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingToll(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTollEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sedan (1-Way)
                  </label>
                  <input
                    type="number"
                    value={editingToll.sedanRate}
                    onChange={(e) =>
                      setEditingToll({ ...editingToll, sedanRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Sedan (Return)
                  </label>
                  <input
                    type="number"
                    value={editingToll.sedanReturn}
                    onChange={(e) =>
                      setEditingToll({ ...editingToll, sedanReturn: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    SUV (1-Way)
                  </label>
                  <input
                    type="number"
                    value={editingToll.suvRate}
                    onChange={(e) =>
                      setEditingToll({ ...editingToll, suvRate: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    SUV (Return)
                  </label>
                  <input
                    type="number"
                    value={editingToll.suvReturn}
                    onChange={(e) =>
                      setEditingToll({ ...editingToll, suvReturn: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingToll(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  Save &amp; Log Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

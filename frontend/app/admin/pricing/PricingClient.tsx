'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  PricingOneWay,
  PricingRoundTrip,
  PricingLocalPackage,
  PricingAirportTransfer,
  VehicleCategory,
  Route,
  Location,
} from '@/types/database';
import { logClientAudit } from '@/lib/audit';

interface PricingClientProps {
  initialOneWay: PricingOneWay[];
  initialRoundTrip: PricingRoundTrip[];
  initialLocalPackages: PricingLocalPackage[];
  initialAirportTransfers: PricingAirportTransfer[];
  categories: VehicleCategory[];
  routes: Route[];
  locations: Location[];
}

export default function PricingClient({
  initialOneWay,
  initialRoundTrip,
  initialLocalPackages,
  initialAirportTransfers,
  categories,
  routes,
  locations,
}: PricingClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer'>('one_way');

  // Pricing State
  const [oneWayList, setOneWayList] = useState<PricingOneWay[]>(initialOneWay);
  const [roundTripList, setRoundTripList] = useState<PricingRoundTrip[]>(initialRoundTrip);
  const [localPkgList, setLocalPkgList] = useState<PricingLocalPackage[]>(initialLocalPackages);
  const [airportList, setAirportList] = useState<PricingAirportTransfer[]>(initialAirportTransfers);

  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PricingOneWay | PricingRoundTrip | PricingLocalPackage | PricingAirportTransfer | null>(null);

  // Confirm Soft Disable Modal State
  const [confirmToggle, setConfirmToggle] = useState<{ type: string; item: PricingOneWay | PricingRoundTrip | PricingLocalPackage | PricingAirportTransfer } | null>(null);

  // Form Fields
  // One-Way
  const [owRouteId, setOwRouteId] = useState(routes[0]?.id || '');
  const [owCategoryId, setOwCategoryId] = useState(categories[0]?.id || '');
  const [owBaseFare, setOwBaseFare] = useState(2500);
  const [owIncludedKm, setOwIncludedKm] = useState(100);
  const [owExtraKmRate, setOwExtraKmRate] = useState(14);
  const [owDriverAllowance, setOwDriverAllowance] = useState(300);

  // Round-Trip (NO base_fare!)
  const [rtCategoryId, setRtCategoryId] = useState(categories[0]?.id || '');
  const [rtMinKmPerDay, setRtMinKmPerDay] = useState(250);
  const [rtPerKmRate, setRtPerKmRate] = useState(12);
  const [rtDriverAllowancePerDay, setRtDriverAllowancePerDay] = useState(400);
  const [rtNightHaltCharge, setRtNightHaltCharge] = useState(250);

  // Local Package
  const [lpCategoryId, setLpCategoryId] = useState(categories[0]?.id || '');
  const [lpPackageName, setLpPackageName] = useState('8 Hours / 80 KM');
  const [lpIncludedHours, setLpIncludedHours] = useState(8);
  const [lpIncludedKm, setLpIncludedKm] = useState(80);
  const [lpPackagePrice, setLpPackagePrice] = useState(2000);
  const [lpExtraHourRate, setLpExtraHourRate] = useState(150);
  const [lpExtraKmRate, setLpExtraKmRate] = useState(15);

  // Airport Transfer
  const [apAirportLocId, setApAirportLocId] = useState(locations.find((l) => l.location_type === 'airport')?.id || locations[0]?.id || '');
  const [apCityZoneLocId, setApCityZoneLocId] = useState(locations.find((l) => l.location_type === 'city')?.id || locations[0]?.id || '');
  const [apCategoryId, setApCategoryId] = useState(categories[0]?.id || '');
  const [apBaseFare, setApBaseFare] = useState(1200);
  const [apIncludedKm, setApIncludedKm] = useState(30);
  const [apExtraKmRate, setApExtraKmRate] = useState(16);

  const [isActive, setIsActive] = useState(true);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingItem(null);
    setErrorMsg(null);
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: PricingOneWay | PricingRoundTrip | PricingLocalPackage | PricingAirportTransfer) => {
    setEditingItem(item);
    setErrorMsg(null);
    setIsActive(item.is_active);

    if (activeTab === 'one_way') {
      const ow = item as PricingOneWay;
      setOwRouteId(ow.route_id);
      setOwCategoryId(ow.category_id);
      setOwBaseFare(ow.base_fare);
      setOwIncludedKm(ow.included_km);
      setOwExtraKmRate(ow.extra_km_rate);
      setOwDriverAllowance(ow.driver_allowance);
    } else if (activeTab === 'round_trip') {
      const rt = item as PricingRoundTrip;
      setRtCategoryId(rt.category_id);
      setRtMinKmPerDay(rt.min_km_per_day);
      setRtPerKmRate(rt.per_km_rate);
      setRtDriverAllowancePerDay(rt.driver_allowance_per_day);
      setRtNightHaltCharge(rt.night_halt_charge);
    } else if (activeTab === 'local_rental') {
      const lp = item as PricingLocalPackage;
      setLpCategoryId(lp.category_id);
      setLpPackageName(lp.package_name);
      setLpIncludedHours(lp.included_hours);
      setLpIncludedKm(lp.included_km);
      setLpPackagePrice(lp.package_price);
      setLpExtraHourRate(lp.extra_hour_rate);
      setLpExtraKmRate(lp.extra_km_rate);
    } else if (activeTab === 'airport_transfer') {
      const ap = item as PricingAirportTransfer;
      setApAirportLocId(ap.airport_location_id);
      setApCityZoneLocId(ap.city_zone_location_id);
      setApCategoryId(ap.category_id);
      setApBaseFare(ap.base_fare);
      setApIncludedKm(ap.included_km);
      setApExtraKmRate(ap.extra_km_rate);
    }

    setIsModalOpen(true);
  };

  // Save Form Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'one_way') {
        const payload = {
          route_id: owRouteId,
          category_id: owCategoryId,
          base_fare: owBaseFare,
          included_km: owIncludedKm,
          extra_km_rate: owExtraKmRate,
          driver_allowance: owDriverAllowance,
          is_active: isActive,
        };

        if (editingItem) {
          const { data, error } = await supabase
            .from('pricing_one_way')
            .update(payload)
            .eq('id', editingItem.id)
            .select('*, routes(*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)), vehicle_categories(*)')
            .single();
          if (error) throw error;
          setOneWayList(oneWayList.map((i) => (i.id === data.id ? data : i)));
          await logClientAudit('UPDATE_PRICING_RULE', 'pricing_one_way', editingItem.id, editingItem, data);
        } else {
          const { data, error } = await supabase
            .from('pricing_one_way')
            .insert(payload)
            .select('*, routes(*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)), vehicle_categories(*)')
            .single();
          if (error) throw error;
          setOneWayList([...oneWayList, data]);
          await logClientAudit('CREATE_PRICING_RULE', 'pricing_one_way', data.id, null, data);
        }
      } else if (activeTab === 'round_trip') {
        // NO base_fare column!
        const payload = {
          category_id: rtCategoryId,
          min_km_per_day: rtMinKmPerDay,
          per_km_rate: rtPerKmRate,
          driver_allowance_per_day: rtDriverAllowancePerDay,
          night_halt_charge: rtNightHaltCharge,
          is_active: isActive,
        };

        if (editingItem) {
          const { data, error } = await supabase
            .from('pricing_round_trip')
            .update(payload)
            .eq('id', editingItem.id)
            .select('*, vehicle_categories(*)')
            .single();
          if (error) throw error;
          setRoundTripList(roundTripList.map((i) => (i.id === data.id ? data : i)));
          await logClientAudit('UPDATE_PRICING_RULE', 'pricing_round_trip', editingItem.id, editingItem, data);
        } else {
          const { data, error } = await supabase
            .from('pricing_round_trip')
            .insert(payload)
            .select('*, vehicle_categories(*)')
            .single();
          if (error) throw error;
          setRoundTripList([...roundTripList, data]);
          await logClientAudit('CREATE_PRICING_RULE', 'pricing_round_trip', data.id, null, data);
        }
      } else if (activeTab === 'local_rental') {
        const payload = {
          category_id: lpCategoryId,
          package_name: lpPackageName,
          included_hours: lpIncludedHours,
          included_km: lpIncludedKm,
          package_price: lpPackagePrice,
          extra_hour_rate: lpExtraHourRate,
          extra_km_rate: lpExtraKmRate,
          is_active: isActive,
        };

        if (editingItem) {
          const { data, error } = await supabase
            .from('pricing_local_packages')
            .update(payload)
            .eq('id', editingItem.id)
            .select('*, vehicle_categories(*)')
            .single();
          if (error) throw error;
          setLocalPkgList(localPkgList.map((i) => (i.id === data.id ? data : i)));
          await logClientAudit('UPDATE_PRICING_RULE', 'pricing_local_packages', editingItem.id, editingItem, data);
        } else {
          const { data, error } = await supabase
            .from('pricing_local_packages')
            .insert(payload)
            .select('*, vehicle_categories(*)')
            .single();
          if (error) throw error;
          setLocalPkgList([...localPkgList, data]);
          await logClientAudit('CREATE_PRICING_RULE', 'pricing_local_packages', data.id, null, data);
        }
      } else if (activeTab === 'airport_transfer') {
        const payload = {
          airport_location_id: apAirportLocId,
          city_zone_location_id: apCityZoneLocId,
          category_id: apCategoryId,
          base_fare: apBaseFare,
          included_km: apIncludedKm,
          extra_km_rate: apExtraKmRate,
          is_active: isActive,
        };

        if (editingItem) {
          const { data, error } = await supabase
            .from('pricing_airport_transfers')
            .update(payload)
            .eq('id', editingItem.id)
            .select('*, airport_location:locations!pricing_airport_transfers_airport_location_id_fkey(*), city_zone_location:locations!pricing_airport_transfers_city_zone_location_id_fkey(*), vehicle_categories(*)')
            .single();
          if (error) throw error;
          setAirportList(airportList.map((i) => (i.id === data.id ? data : i)));
          await logClientAudit('UPDATE_PRICING_RULE', 'pricing_airport_transfers', editingItem.id, editingItem, data);
        } else {
          const { data, error } = await supabase
            .from('pricing_airport_transfers')
            .insert(payload)
            .select('*, airport_location:locations!pricing_airport_transfers_airport_location_id_fkey(*), city_zone_location:locations!pricing_airport_transfers_city_zone_location_id_fkey(*), vehicle_categories(*)')
            .single();
          if (error) throw error;
          setAirportList([...airportList, data]);
          await logClientAudit('CREATE_PRICING_RULE', 'pricing_airport_transfers', data.id, null, data);
        }
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

  // Toggle Active Status
  const handleToggleConfirm = async () => {
    if (!confirmToggle) return;
    const { type, item } = confirmToggle;
    const nextActive = !item.is_active;

    try {
      if (type === 'one_way') {
        const { data, error } = await supabase
          .from('pricing_one_way')
          .update({ is_active: nextActive })
          .eq('id', item.id)
          .select('*, routes(*, origin:locations!routes_origin_location_id_fkey(*), destination:locations!routes_destination_location_id_fkey(*)), vehicle_categories(*)')
          .single();
        if (error) throw error;
        setOneWayList(oneWayList.map((i) => (i.id === data.id ? data : i)));
        await logClientAudit('TOGGLE_PRICING_RULE_STATUS', 'pricing_one_way', item.id, { is_active: item.is_active }, { is_active: nextActive });
      } else if (type === 'round_trip') {
        const { data, error } = await supabase
          .from('pricing_round_trip')
          .update({ is_active: nextActive })
          .eq('id', item.id)
          .select('*, vehicle_categories(*)')
          .single();
        if (error) throw error;
        setRoundTripList(roundTripList.map((i) => (i.id === data.id ? data : i)));
        await logClientAudit('TOGGLE_PRICING_RULE_STATUS', 'pricing_round_trip', item.id, { is_active: item.is_active }, { is_active: nextActive });
      } else if (type === 'local_rental') {
        const { data, error } = await supabase
          .from('pricing_local_packages')
          .update({ is_active: nextActive })
          .eq('id', item.id)
          .select('*, vehicle_categories(*)')
          .single();
        if (error) throw error;
        setLocalPkgList(localPkgList.map((i) => (i.id === data.id ? data : i)));
        await logClientAudit('TOGGLE_PRICING_RULE_STATUS', 'pricing_local_packages', item.id, { is_active: item.is_active }, { is_active: nextActive });
      } else if (type === 'airport_transfer') {
        const { data, error } = await supabase
          .from('pricing_airport_transfers')
          .update({ is_active: nextActive })
          .eq('id', item.id)
          .select('*, airport_location:locations!pricing_airport_transfers_airport_location_id_fkey(*), city_zone_location:locations!pricing_airport_transfers_city_zone_location_id_fkey(*), vehicle_categories(*)')
          .single();
        if (error) throw error;
        setAirportList(airportList.map((i) => (i.id === data.id ? data : i)));
        await logClientAudit('TOGGLE_PRICING_RULE_STATUS', 'pricing_airport_transfers', item.id, { is_active: item.is_active }, { is_active: nextActive });
      }

      setConfirmToggle(null);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Pricing Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Single Source of Truth for base fares, rates, and packages across all four trip service types.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Add New Pricing Rule
        </button>
      </div>

      {/* Service Type Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => { setActiveTab('one_way'); setSearchTerm(''); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'one_way'
              ? 'text-amber-400 border-amber-500 bg-slate-950/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          One-Way Outstation ({oneWayList.length})
        </button>
        <button
          onClick={() => { setActiveTab('round_trip'); setSearchTerm(''); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'round_trip'
              ? 'text-amber-400 border-amber-500 bg-slate-950/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Round-Trip Outstation ({roundTripList.length})
        </button>
        <button
          onClick={() => { setActiveTab('local_rental'); setSearchTerm(''); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'local_rental'
              ? 'text-amber-400 border-amber-500 bg-slate-950/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Local Packages ({localPkgList.length})
        </button>
        <button
          onClick={() => { setActiveTab('airport_transfer'); setSearchTerm(''); }}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'airport_transfer'
              ? 'text-amber-400 border-amber-500 bg-slate-950/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Airport Transfers ({airportList.length})
        </button>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter rules by category, route, or location..."
          className="w-full sm:w-72 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <p className="text-xs text-slate-400 font-mono">
          Active Tab: <strong className="text-amber-400 uppercase">{activeTab.replace('_', ' ')}</strong>
        </p>
      </div>

      {/* TAB 1: ONE-WAY OUTSTATION TABLE */}
      {activeTab === 'one_way' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {oneWayList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No One-Way pricing rules found in database. Click above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Route (Origin → Destination)</th>
                    <th className="py-3.5 px-4 font-semibold">Vehicle Category</th>
                    <th className="py-3.5 px-4 font-semibold">Base Fare</th>
                    <th className="py-3.5 px-4 font-semibold">Included KM</th>
                    <th className="py-3.5 px-4 font-semibold">Extra KM Rate</th>
                    <th className="py-3.5 px-4 font-semibold">Driver Allowance</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {oneWayList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {item.routes?.origin?.name || 'Origin'} → {item.routes?.destination?.name || 'Destination'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-medium">
                          {item.vehicle_categories?.name || 'Category'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">₹{item.base_fare}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{item.included_km} KM</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">₹{item.extra_km_rate}/KM</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">₹{item.driver_allowance}</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setConfirmToggle({ type: 'one_way', item })}
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
      )}

      {/* TAB 2: ROUND-TRIP OUTSTATION TABLE (NO BASE FARE!) */}
      {activeTab === 'round_trip' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {roundTripList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No Round-Trip pricing rules found in database. Click above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Vehicle Category</th>
                    <th className="py-3.5 px-4 font-semibold">Daily Min KM Guarantee</th>
                    <th className="py-3.5 px-4 font-semibold">Per KM Rate</th>
                    <th className="py-3.5 px-4 font-semibold">Driver Allowance / Day</th>
                    <th className="py-3.5 px-4 font-semibold">Night Halt Charge</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {roundTripList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-medium">
                          {item.vehicle_categories?.name || 'Category'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">{item.min_km_per_day} KM/day</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">₹{item.per_km_rate}/KM</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">₹{item.driver_allowance_per_day}/day</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">₹{item.night_halt_charge}/night</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setConfirmToggle({ type: 'round_trip', item })}
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
      )}

      {/* TAB 3: LOCAL HOURLY RENTAL TABLE */}
      {activeTab === 'local_rental' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {localPkgList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No Local Packages found in database. Click above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Package Name</th>
                    <th className="py-3.5 px-4 font-semibold">Vehicle Category</th>
                    <th className="py-3.5 px-4 font-semibold">Package Price</th>
                    <th className="py-3.5 px-4 font-semibold">Included Limit</th>
                    <th className="py-3.5 px-4 font-semibold">Extra Hour Rate</th>
                    <th className="py-3.5 px-4 font-semibold">Extra KM Rate</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {localPkgList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{item.package_name}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-medium">
                          {item.vehicle_categories?.name || 'Category'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">₹{item.package_price}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {item.included_hours} Hrs / {item.included_km} KM
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">₹{item.extra_hour_rate}/Hr</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">₹{item.extra_km_rate}/KM</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setConfirmToggle({ type: 'local_rental', item })}
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
      )}

      {/* TAB 4: AIRPORT TRANSFERS TABLE */}
      {activeTab === 'airport_transfer' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {airportList.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No Airport Transfer rules found in database. Click above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Airport Location</th>
                    <th className="py-3.5 px-4 font-semibold">City Zone</th>
                    <th className="py-3.5 px-4 font-semibold">Vehicle Category</th>
                    <th className="py-3.5 px-4 font-semibold">Base Transfer Fare</th>
                    <th className="py-3.5 px-4 font-semibold">Included KM</th>
                    <th className="py-3.5 px-4 font-semibold">Extra KM Rate</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {airportList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{item.airport_location?.name || 'Airport'}</td>
                      <td className="py-3.5 px-4 text-slate-300">{item.city_zone_location?.name || 'City Zone'}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-medium">
                          {item.vehicle_categories?.name || 'Category'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">₹{item.base_fare}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{item.included_km} KM</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">₹{item.extra_km_rate}/KM</td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setConfirmToggle({ type: 'airport_transfer', item })}
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
      )}

      {/* Confirmation Modal for Active/Inactive Toggle */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {confirmToggle.item.is_active ? 'Deactivate Pricing Rule?' : 'Activate Pricing Rule?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to mark this pricing rule as{' '}
              <strong className={confirmToggle.item.is_active ? 'text-red-400' : 'text-emerald-400'}>
                {confirmToggle.item.is_active ? 'Inactive' : 'Active'}
              </strong>
              ? Soft-disabling preserves historic snapshot calculation references.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmToggle(null)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleConfirm}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer ${
                  confirmToggle.item.is_active
                    ? 'bg-red-600 hover:bg-red-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Confirm {confirmToggle.item.is_active ? 'Deactivation' : 'Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white">
              {editingItem ? `Edit ${activeTab.replace('_', ' ').toUpperCase()} Rule` : `Create ${activeTab.replace('_', ' ').toUpperCase()} Rule`}
            </h2>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* FORM FIELDS FOR TAB 1: ONE-WAY */}
              {activeTab === 'one_way' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Target Route</label>
                    <select
                      value={owRouteId}
                      onChange={(e) => setOwRouteId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.origin?.name} → {r.destination?.name} ({r.estimated_distance_km} KM)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Vehicle Category</label>
                    <select
                      value={owCategoryId}
                      onChange={(e) => setOwCategoryId(e.target.value)}
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
                      <label className="block text-slate-400 font-semibold mb-1">Base Fare (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={owBaseFare}
                        onChange={(e) => setOwBaseFare(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Included KM</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={owIncludedKm}
                        onChange={(e) => setOwIncludedKm(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Extra KM Rate (₹/KM)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={owExtraKmRate}
                        onChange={(e) => setOwExtraKmRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Driver Allowance (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={owDriverAllowance}
                        onChange={(e) => setOwDriverAllowance(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM FIELDS FOR TAB 2: ROUND-TRIP (NO BASE FARE!) */}
              {activeTab === 'round_trip' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Vehicle Category</label>
                    <select
                      value={rtCategoryId}
                      onChange={(e) => setRtCategoryId(e.target.value)}
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
                      <label className="block text-slate-400 font-semibold mb-1">Min KM Guarantee / Day</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={rtMinKmPerDay}
                        onChange={(e) => setRtMinKmPerDay(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Per KM Rate (₹/KM)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={rtPerKmRate}
                        onChange={(e) => setRtPerKmRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Driver Allowance / Day (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={rtDriverAllowancePerDay}
                        onChange={(e) => setRtDriverAllowancePerDay(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Night Halt Charge / Night (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={rtNightHaltCharge}
                        onChange={(e) => setRtNightHaltCharge(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM FIELDS FOR TAB 3: LOCAL PACKAGES */}
              {activeTab === 'local_rental' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Vehicle Category</label>
                    <select
                      value={lpCategoryId}
                      onChange={(e) => setLpCategoryId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Package Name</label>
                    <input
                      type="text"
                      required
                      value={lpPackageName}
                      onChange={(e) => setLpPackageName(e.target.value)}
                      placeholder="e.g. 8 Hours / 80 KM"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Included Hours</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={lpIncludedHours}
                        onChange={(e) => setLpIncludedHours(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Included KM</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={lpIncludedKm}
                        onChange={(e) => setLpIncludedKm(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Package Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={lpPackagePrice}
                        onChange={(e) => setLpPackagePrice(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Extra Hour Rate (₹/Hr)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={lpExtraHourRate}
                        onChange={(e) => setLpExtraHourRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Extra KM Rate (₹/KM)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={lpExtraKmRate}
                        onChange={(e) => setLpExtraKmRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM FIELDS FOR TAB 4: AIRPORT TRANSFERS */}
              {activeTab === 'airport_transfer' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Airport Location</label>
                    <select
                      value={apAirportLocId}
                      onChange={(e) => setApAirportLocId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">City Zone Location</label>
                    <select
                      value={apCityZoneLocId}
                      onChange={(e) => setApCityZoneLocId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Vehicle Category</label>
                    <select
                      value={apCategoryId}
                      onChange={(e) => setApCategoryId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Base Transfer Fare (₹)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={apBaseFare}
                        onChange={(e) => setApBaseFare(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Included KM</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={apIncludedKm}
                        onChange={(e) => setApIncludedKm(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Extra KM Rate (₹/KM)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.5"
                        value={apExtraKmRate}
                        onChange={(e) => setApExtraKmRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Active Status</label>
                <select
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="true font-semibold text-emerald-400">Active</option>
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
                  <span>{loading ? 'Saving...' : 'Save Pricing Rule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

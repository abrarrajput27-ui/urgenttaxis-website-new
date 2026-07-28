'use client';

import { useState } from 'react';
import {
  CalculateFareInput,
  CalculateFareResult,
  calculateOneWayFare,
  calculateRoundTripFare,
  calculateLocalRentalFare,
  calculateAirportTransferFare,
} from '@/lib/pricing/calculator';
import {
  PricingOneWay,
  PricingRoundTrip,
  PricingLocalPackage,
  PricingAirportTransfer,
  DynamicPricingRule,
  VehicleCategory,
  Route,
  Location,
} from '@/types/database';

interface SimulatorClientProps {
  oneWayRules: PricingOneWay[];
  roundTripRules: PricingRoundTrip[];
  localPackages: PricingLocalPackage[];
  airportTransfers: PricingAirportTransfer[];
  dynamicRules: DynamicPricingRule[];
  categories: VehicleCategory[];
  routes: Route[];
  locations: Location[];
}

export default function SimulatorClient({
  oneWayRules,
  roundTripRules,
  localPackages,
  airportTransfers,
  dynamicRules,
  categories,
  routes,
  locations,
}: SimulatorClientProps) {
  const [serviceType, setServiceType] = useState<'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer'>('one_way');

  // Input Controls
  const [routeId, setRouteId] = useState(routes[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [packageId, setPackageId] = useState(localPackages[0]?.id || '');
  const [airportLocId, setAirportLocId] = useState(locations.find((l) => l.location_type === 'airport')?.id || locations[0]?.id || '');
  const [cityZoneLocId, setCityZoneLocId] = useState(locations.find((l) => l.location_type === 'city')?.id || locations[0]?.id || '');

  const [actualDistanceKm, setActualDistanceKm] = useState(210);
  const [numberOfDays, setNumberOfDays] = useState(3);
  const [numberOfNights, setNumberOfNights] = useState(2);
  const [durationHours, setDurationHours] = useState(9.5);
  const [pickupDateTime, setPickupDateTime] = useState('2026-08-01T18:30');

  const [simulationResult, setSimulationResult] = useState<CalculateFareResult | null>(null);
  const [noRuleError, setNoRuleError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRunSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulationResult(null);
    setNoRuleError(null);
    setValidationError(null);

    try {
      const input: CalculateFareInput = {
        serviceType,
        categoryId,
        actualDistanceKm,
        numberOfDays,
        numberOfNights,
        durationHours,
        pickupDateTime: pickupDateTime ? new Date(pickupDateTime).toISOString() : undefined,
      };

      if (serviceType === 'one_way') {
        const rule = oneWayRules.find((r) => r.route_id === routeId && r.category_id === categoryId && r.is_active);
        if (!rule) {
          setNoRuleError(`No active One-Way pricing rule found for the selected Route & Category.`);
          return;
        }
        const result = calculateOneWayFare(input, rule, dynamicRules);
        setSimulationResult(result);
      } else if (serviceType === 'round_trip') {
        const rule = roundTripRules.find((r) => r.category_id === categoryId && r.is_active);
        if (!rule) {
          setNoRuleError(`No active Round-Trip pricing rule found for the selected Vehicle Category.`);
          return;
        }
        const result = calculateRoundTripFare(input, rule, dynamicRules);
        setSimulationResult(result);
      } else if (serviceType === 'local_rental') {
        const pkg = localPackages.find((p) => p.id === packageId && p.is_active);
        if (!pkg) {
          setNoRuleError(`No active Local Package pricing rule found for the selected package.`);
          return;
        }
        const result = calculateLocalRentalFare(input, pkg, dynamicRules);
        setSimulationResult(result);
      } else if (serviceType === 'airport_transfer') {
        const rule = airportTransfers.find(
          (r) =>
            r.airport_location_id === airportLocId &&
            r.city_zone_location_id === cityZoneLocId &&
            r.category_id === categoryId &&
            r.is_active
        );
        if (!rule) {
          setNoRuleError(`No active Airport Transfer pricing rule found for the selected Airport, Zone & Category.`);
          return;
        }
        const result = calculateAirportTransferFare(input, rule, dynamicRules);
        setSimulationResult(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed.';
      setValidationError(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight">Admin Pricing Simulator & Sandbox</h1>
        <p className="text-xs text-slate-400 mt-1">
          Diagnostic testing sandbox. Run pricing simulations, verify dynamic surge priority resolution, and inspect itemized MMT-style customer quotations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulation Inputs Form */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-3">
            Simulation Control Inputs
          </h2>

          {validationError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg">
              {validationError}
            </div>
          )}

          <form onSubmit={handleRunSimulation} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as 'one_way' | 'round_trip' | 'local_rental' | 'airport_transfer')}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="one_way">One-Way Outstation</option>
                <option value="round_trip">Round-Trip Outstation</option>
                <option value="local_rental font-semibold">Local Hourly Rental</option>
                <option value="airport_transfer">Airport / Railway Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Vehicle Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Controls per Service Type */}
            {serviceType === 'one_way' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Corridor Route</label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.origin?.name} → {r.destination?.name} ({r.estimated_distance_km} KM)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {serviceType === 'local_rental' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Rental Package</label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {localPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.package_name} - ₹{p.package_price}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {serviceType === 'airport_transfer' && (
              <>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Airport Location</label>
                  <select
                    value={airportLocId}
                    onChange={(e) => setAirportLocId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
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
                    value={cityZoneLocId}
                    onChange={(e) => setCityZoneLocId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.city})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* General Trip Inputs */}
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Actual Distance (KM)</label>
              <input
                type="number"
                required
                min="0"
                value={actualDistanceKm}
                onChange={(e) => setActualDistanceKm(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {serviceType === 'round_trip' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Number of Days</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={numberOfDays}
                    onChange={(e) => setNumberOfDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Number of Nights</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={numberOfNights}
                    onChange={(e) => setNumberOfNights(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {serviceType === 'local_rental' && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Actual Duration (Hours)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="0.5"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Target Pickup Date & Time</label>
              <input
                type="datetime-local"
                value={pickupDateTime}
                onChange={(e) => setPickupDateTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-xs mt-2"
            >
              ▶ Run Pricing Simulation
            </button>
          </form>
        </div>

        {/* Right Column: Simulation Output & Calculation Trace */}
        <div className="lg:col-span-7 space-y-6">
          {noRuleError && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center space-y-2 shadow-xl">
              <span className="text-amber-400 text-2xl font-bold block">⚠️ No Active Pricing Rule Found</span>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {noRuleError}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                System safely blocked fare generation. No fabricated or guessed fare returned.
              </p>
            </div>
          )}

          {!simulationResult && !noRuleError && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs shadow-xl">
              Select simulation parameters on the left and click &quot;Run Pricing Simulation&quot; to inspect full calculation traces and MMT-style quotations.
            </div>
          )}

          {simulationResult && (
            <div className="space-y-6">
              {/* MMT-Style Quotation Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                      {simulationResult.serviceType.replace('_', ' ')} Quotation
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">Customer Fare Breakdown</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Payable Fare</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">₹{simulationResult.automaticFare.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Service Specific Distance Math Line */}
                  {simulationResult.serviceType === 'round_trip' ? (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">
                        Distance Charge ({simulationResult.billableKm} Billable KM [Min: {simulationResult.guaranteedMinKm} KM for {simulationResult.numberOfDays} days])
                      </span>
                      <span className="font-mono text-white font-semibold">₹{simulationResult.distanceCharge.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Base / Package Fare (Includes {simulationResult.includedKm} KM)</span>
                      <span className="font-mono text-white font-semibold">₹{simulationResult.baseFare.toFixed(2)}</span>
                    </div>
                  )}

                  {simulationResult.extraKmCharge > 0 && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Extra Distance Charge ({simulationResult.extraKm} Extra KM)</span>
                      <span className="font-mono text-white font-semibold">₹{simulationResult.extraKmCharge.toFixed(2)}</span>
                    </div>
                  )}

                  {simulationResult.extraHourCharge > 0 && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Extra Duration Charge ({simulationResult.extraHours} Extra Hours)</span>
                      <span className="font-mono text-white font-semibold">₹{simulationResult.extraHourCharge.toFixed(2)}</span>
                    </div>
                  )}

                  {simulationResult.driverAllowance > 0 && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Driver Allowance ({simulationResult.numberOfDays} Days)</span>
                      <span className="font-mono text-white font-semibold">₹{simulationResult.driverAllowance.toFixed(2)}</span>
                    </div>
                  )}

                  {simulationResult.nightHaltCharge > 0 && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Night Halt Charge ({simulationResult.numberOfNights} Nights)</span>
                      <span className="font-mono text-white font-semibold">₹{simulationResult.nightHaltCharge.toFixed(2)}</span>
                    </div>
                  )}

                  {simulationResult.dynamicSurgeAmount > 0 && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-cyan-400">
                      <span>Dynamic Surge Multiplier ({simulationResult.appliedDynamicRuleName})</span>
                      <span className="font-mono font-bold">+₹{simulationResult.dynamicSurgeAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Included & Excluded Badges */}
                <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">✓ Included Items</span>
                    <ul className="space-y-0.5 text-slate-300 text-[11px]">
                      {simulationResult.includedCharges.map((inc, i) => (
                        <li key={i}>• {inc}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">✗ Excluded (Payable at Actuals)</span>
                    <ul className="space-y-0.5 text-slate-400 text-[11px]">
                      {simulationResult.excludedCharges.map((exc, i) => (
                        <li key={i}>• {exc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Internal Calculation Trace Log */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-by-Step Calculation Trace Log
                </h3>

                <div className="space-y-2 font-mono text-[11px]">
                  {simulationResult.traceLogs.map((log, idx) => (
                    <div key={idx} className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80 flex items-start justify-between gap-4">
                      <div>
                        <span className="text-amber-400 font-bold">[{log.step}]</span>
                        <p className="text-slate-300 mt-0.5">{log.description}</p>
                      </div>
                      {log.amount !== undefined && (
                        <span className="text-emerald-400 font-bold shrink-0">₹{log.amount.toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Applied Base Rule ID: {simulationResult.appliedRuleId}</span>
                  <span>Calculated At: {new Date(simulationResult.calculatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

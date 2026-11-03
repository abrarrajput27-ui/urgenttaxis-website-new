'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/seo';
import { BOOKING_ADDONS, isAddOnSupported } from '@/lib/pricing/add-ons';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Params
  const serviceType = searchParams.get('serviceType') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const routeId = searchParams.get('routeId') || '';
  const pickupAddress = searchParams.get('pickup') || '';
  const dropAddress = searchParams.get('drop') || '';
  const travelDateTime = searchParams.get('date') || '';
  const actualDistanceKm = searchParams.get('km') || '0';
  const rawStops = searchParams.get('stops') || '';
  const stops = rawStops ? rawStops.split('|').map((s) => s.trim()).filter(Boolean) : [];
  const rawAddOns = searchParams.get('addOns') || '';
  const initialAddOns = rawAddOns.split(',').map((s) => s.trim()).filter(Boolean);

  // State
  const [customerFullName, setCustomerFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(initialAddOns);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with URL search params after client hydration
  useEffect(() => {
    const raw = searchParams.get('addOns');
    if (raw) {
      const parsed = raw.split(',').map((s) => s.trim()).filter(Boolean);
      setSelectedAddOns(parsed);
    }
  }, [searchParams]);

  // Re-verify fare locally (just visual, true authority is backend)
  const [fareData, setFareData] = useState<any>(null);
  const [isLoadingFare, setIsLoadingFare] = useState(true);

  useEffect(() => {
    if (!serviceType || !categoryId) return;
    
    // Re-verify fare from server
    fetch('/api/public/calculate-fare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType,
        categoryId,
        routeId,
        pickupDateTime: travelDateTime,
        actualDistanceKm: Number(actualDistanceKm),
        selectedAddOns
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.fare) {
        setFareData(data.fare);
      } else {
        setError('Failed to recalculate fare. Please return to the homepage and search again.');
      }
    })
    .catch(() => setError('Network error.'))
    .finally(() => setIsLoadingFare(false));
  }, [serviceType, categoryId, routeId, travelDateTime, actualDistanceKm, selectedAddOns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFullName || !customerPhone) {
      setError('Please provide your name and phone number.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/public/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          categoryId,
          routeId,
          pickupAddress,
          dropAddress,
          travelDateTime,
          returnDateTime: searchParams.get('returnDate') || undefined,
          actualDistanceKm,
          passengerCount,
          specialInstructions,
          stops,
          selectedAddOns,
          customerFullName,
          customerPhone,
          customerEmail,
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/booking-confirmation/${data.bookingReference}`);
      } else {
        setError(data.message || 'Failed to submit booking.');
      }
    } catch (err) {
      setError('A network error occurred while submitting your booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!serviceType || !categoryId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Invalid Booking Session</h2>
          <p className="text-slate-600 mb-6">Your session has expired or parameters are missing.</p>
          <Link href="/" prefetch={true} className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Complete Your Booking</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Contact Details</h2>
              <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={customerFullName}
                      onChange={(e) => setCustomerFullName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required 
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Phase 3: Chargeable Vehicle Add-ons Review */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span>✨</span> Optional Trip Add-ons
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select optional preferences for your journey. Fixed at ₹300 per add-on.
                  </p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                  ₹300 each
                </span>
              </div>

              <div className="space-y-3">
                {Object.values(BOOKING_ADDONS).map((addon) => {
                  const isCompatible = isAddOnSupported(addon.id, categoryId);
                  const isChecked = selectedAddOns.includes(addon.id);

                  return (
                    <div
                      key={addon.id}
                      onClick={() => {
                        if (!isCompatible) return;
                        setSelectedAddOns((prev) =>
                          prev.includes(addon.id) ? prev.filter((id) => id !== addon.id) : [...prev, addon.id]
                        );
                      }}
                      className={`p-4 rounded-xl border transition-all ${
                        !isCompatible
                          ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                          : isChecked
                          ? 'bg-blue-50/60 border-brand-blue ring-1 ring-brand-blue/30 cursor-pointer'
                          : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-center gap-3 cursor-pointer pointer-events-none">
                          <input
                            type="checkbox"
                            checked={isChecked && isCompatible}
                            disabled={!isCompatible}
                            readOnly
                            className="w-4 h-4 text-brand-blue rounded border-slate-300 focus:ring-brand-blue cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-sm text-slate-900 block">{addon.name}</span>
                            <span className="text-xs text-slate-600 block mt-0.5">{addon.shortDescription}</span>
                          </div>
                        </label>
                        <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                          +₹{addon.price}
                        </span>
                      </div>
                      {!isCompatible ? (
                        <p className="text-[11px] text-rose-600 font-semibold pl-7 mt-2">
                          ⚠️ {addon.ineligibleMessage || 'Not compatible with selected vehicle.'}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pl-7 mt-1.5">{addon.disclaimer}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Trip Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Passengers</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Special Instructions</label>
                <textarea 
                  rows={3} 
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  placeholder="E.g., Require infant seat, extra luggage space..."
                />
              </div>
            </div>

            {/* Document Upload stub for 5B */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Identity Verification</h2>
              <p className="text-sm text-slate-500 mb-6">If you are traveling outside the state, government ID may be required before travel.</p>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                <span className="text-brand-blue font-bold text-sm block mb-1">Document upload securely available post-booking.</span>
                <span className="text-xs text-slate-400">Supported formats: JPG, PNG, PDF</span>
              </div>
            </div>

          </div>
          
          {/* Summary Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-32">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Booking Summary</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold block">Service</span>
                  <span className="font-bold text-slate-900 capitalize">{serviceType.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold block">Pickup</span>
                  <span className="font-medium text-slate-700">{pickupAddress}</span>
                </div>
                {dropAddress && (
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-bold block">Drop</span>
                    <span className="font-medium text-slate-700">{dropAddress}</span>
                  </div>
                )}
                {stops && stops.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="text-xs text-slate-500 uppercase font-bold block">Intermediate Stops</span>
                    <span className="font-medium text-slate-700">{stops.join(' ➔ ')}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold block">Date & Time</span>
                  <span className="font-medium text-slate-700">{new Date(travelDateTime).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                {isLoadingFare ? (
                  <div className="animate-pulse bg-slate-100 h-16 rounded-xl w-full" />
                ) : fareData ? (
                  <>
                    <div className="flex justify-between items-center text-slate-600 text-sm">
                      <span>Base Vehicle Fare ({fareData.includedKm} KM)</span>
                      <span>₹{(fareData.baseVehicleFare || fareData.baseFare).toLocaleString('en-IN')}</span>
                    </div>

                    {fareData.addOns && fareData.addOns.length > 0 && (
                      <div className="border-t border-slate-100 pt-3 mt-3 space-y-1.5">
                        <span className="text-xs font-bold text-slate-700 uppercase block">Selected Add-ons</span>
                        {fareData.addOns.map((addon: any) => (
                          <div key={addon.id} className="flex justify-between items-center text-slate-600 text-xs">
                            <span>• {addon.name}</span>
                            <span className="font-semibold text-slate-800">₹{addon.price}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center text-xs font-bold text-indigo-900 pt-1 border-t border-slate-100">
                          <span>Total Add-on Charges</span>
                          <span>₹{fareData.addOnTotal || 0}</span>
                        </div>
                      </div>
                    )}
                    {fareData.distanceCharge > 0 && (
                      <div className="flex justify-between items-center text-slate-600 text-sm">
                        <span>Extra Distance Charge</span>
                        <span>₹{fareData.distanceCharge.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {fareData.driverAllowance > 0 && (
                      <div className="flex justify-between items-center text-slate-600 text-sm">
                        <span>Driver Allowance</span>
                        <span>₹{fareData.driverAllowance.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">Total Payable</span>
                        <span className="text-xl font-black text-brand-blue">₹{fareData.customerPayable.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="bg-brand-blue/5 p-4 rounded-xl border border-brand-blue/10 mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-brand-blue uppercase">Booking Token (30%)</span>
                        <span className="text-lg font-black text-brand-blue">₹{fareData.tokenAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-500 uppercase">Balance to Driver (70%)</span>
                        <span className="text-sm font-bold text-slate-700">₹{fareData.balanceAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-red-500 text-sm">Fare unavailable</div>
                )}
              </div>

              <button 
                type="submit" 
                form="booking-form"
                disabled={isSubmitting || isLoadingFare || !fareData}
                className="w-full mt-6 bg-brand-green hover:bg-brand-green-hover text-white font-black py-4 rounded-xl shadow-lg shadow-brand-green/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Request Booking'}
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-xs text-slate-500">Or book instantly via WhatsApp</span>
                <a 
                  href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20need%20some%20help%20with%20my%20booking.%20%E2%9C%A8`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block mt-2 text-sm font-bold text-brand-green hover:underline"
                >
                  WhatsApp Us
                </a>
              </div>
              
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="animate-pulse bg-slate-200 h-16 rounded-xl w-full max-w-xl"></div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

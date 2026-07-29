'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/seo';

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

  // State
  const [customerFullName, setCustomerFullName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [passengerCount, setPassengerCount] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        actualDistanceKm: Number(actualDistanceKm)
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
  }, [serviceType, categoryId, routeId, travelDateTime, actualDistanceKm]);

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
          actualDistanceKm,
          passengerCount,
          specialInstructions,
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
          <a href="/" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold">Return Home</a>
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
                      <span>Base Fare ({fareData.includedKm} KM)</span>
                      <span>₹{fareData.baseFare.toLocaleString('en-IN')}</span>
                    </div>
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
                        <span className="text-sm font-bold text-brand-blue uppercase">Booking Token (25%)</span>
                        <span className="text-lg font-black text-brand-blue">₹{fareData.tokenAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-500 uppercase">Balance to Driver</span>
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

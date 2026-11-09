'use client';

import { useState } from 'react';
import { FaPaperPlane, FaWhatsapp, FaCheckCircle, FaCar } from 'react-icons/fa';
import { BUSINESS_CONFIG } from '@/lib/config';

export default function ContactInquiryForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickup: '',
    drop: '',
    travelDate: '',
    vehicle: 'Sedan (Dzire / Etios)',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please enter your name and phone number.');
      return;
    }

    const lines = [
      '🚖 *URGENT TAXIS — CAB BOOKING INQUIRY*',
      '━━━━━━━━━━━━━━━━━━━━',
      '✨ *Fast To Your Destination – Your Quick Ride Solution!*',
      '',
      '📋 *TRIP DETAILS*',
      '• 🚗 *Service:* Custom Taxi Inquiry / Callback',
      `• 📍 *Pickup:* ${formData.pickup || 'Not specified'}`,
      `• 🏁 *Drop:* ${formData.drop || 'Not specified'}`,
      `• 📅 *Date:* ${formData.travelDate || 'Immediate / Flexible'}`,
      `• 👤 *Passenger:* ${formData.name} (${formData.phone})`,
      '',
      '🚘 *VEHICLE SELECTION*',
      `• 🚗 *Vehicle:* *${formData.vehicle}*`,
      '',
      '💬 *INQUIRY MESSAGE*',
      `• ${formData.message || 'Please provide cab availability and instant fare quote.'}`,
      '',
      '🌐 *Website:* https://www.urgenttaxis.in/contact',
      '📞 *24x7 Helpline:* +91 7310651940 | Masuri, Ghaziabad',
      '💬 *WhatsApp Desk:* +91 8595066033',
      '',
      'Please confirm cab availability & driver assignment! ✨',
    ];

    const waUrl = `https://wa.me/${BUSINESS_CONFIG.phone.whatsappRaw}?text=${encodeURIComponent(lines.join('\n'))}`;
    setSubmitted(true);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
      <div className="space-y-2 mb-6 border-b border-slate-100 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
          <FaCar className="text-brand-green" />
          <span>Quick Taxi Inquiry Desk</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-brand-blue tracking-tight">
          Send Us an Inquiry / Request a Callback
        </h3>
        <p className="text-xs text-slate-500 font-medium">
          Fill this form for instant price quotations, outstation packages, or customized tour itineraries.
        </p>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
          <FaCheckCircle className="text-brand-green text-3xl mx-auto" />
          <h4 className="text-base font-bold text-emerald-900">Inquiry Sent Successfully!</h4>
          <p className="text-xs text-slate-600 font-medium">
            Our dispatch supervisor is reviewing your request on WhatsApp. We will reply within 5-10 minutes.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-xs font-bold text-brand-blue underline hover:text-brand-green"
          >
            Send another inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Verma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pickup City / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Ghaziabad / Delhi / Noida"
                value={formData.pickup}
                onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Drop Destination
              </label>
              <input
                type="text"
                placeholder="e.g. Nainital / Haridwar / Airport"
                value={formData.drop}
                onChange={(e) => setFormData({ ...formData, drop: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Travel Date
              </label>
              <input
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Vehicle Preference
              </label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
              >
                <option value="Sedan (Dzire / Etios)">Sedan (Dzire / Etios - 4 Seats)</option>
                <option value="SUV / MPV (Ertiga)">SUV / MPV (Ertiga - 6 Seats)</option>
                <option value="Innova Crysta">Innova Crysta (Luxury 6-7 Seats)</option>
                <option value="Tempo Traveller">Tempo Traveller (12-16 Seats)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Trip Details / Additional Notes
            </label>
            <textarea
              rows={3}
              placeholder="Tell us about your trip (one-way / round-trip, flight time, number of passengers, luggage)..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <FaWhatsapp className="text-base" />
            <span>Send Instant Inquiry on WhatsApp</span>
          </button>
        </form>
      )}
    </div>
  );
}

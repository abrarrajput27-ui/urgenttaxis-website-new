import React from 'react';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { SITE_CONFIG } from '@/lib/seo';
import DocumentUploadForm from '@/components/public/DocumentUploadForm';

export default async function BookingConfirmationPage({ params }: { params: { reference: string } }) {
  const supabase = await supabaseServer();
  
  // Fetch booking details
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      *,
      customers (
        full_name,
        phone,
        email
      ),
      vehicle_categories (
        name
      ),
      fare_snapshots (
        customer_payable,
        token_amount,
        balance_amount
      ),
      payments (
        amount,
        status
      ),
      customer_documents (
        id,
        is_verified
      )
    `)
    .eq('booking_reference', params.reference)
    .single();

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Booking Not Found</h2>
          <p className="text-slate-600 mb-6">We couldn't find a booking with the reference {params.reference}.</p>
          <Link href="/" className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold">Return Home</Link>
        </div>
      </div>
    );
  }

  const snapshot = booking.fare_snapshots?.[0] || {};
  const payments = booking.payments?.filter((p: any) => p.status === 'success') || [];
  const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const trueBalance = Math.max(0, (snapshot.customer_payable || 0) - totalPaid);
  const documentsSubmitted = (booking.customer_documents && booking.customer_documents.length > 0);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'partially_paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unpaid': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'refunded': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-green"></div>
          
          <div className="w-20 h-20 bg-green-50 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          
          <h1 className="text-3xl font-black text-slate-900 mb-2">Booking {booking.status === 'confirmed' ? 'Confirmed' : 'Received'}</h1>
          <p className="text-slate-500 mb-6">Thank you, {booking.customers?.full_name}! Your booking request is currently {booking.status}.</p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-6 py-3">
              <span className="text-xs text-slate-500 uppercase font-bold block mb-1">Booking Reference</span>
              <span className="text-xl font-black text-brand-blue tracking-wider">{booking.booking_reference}</span>
            </div>
            
            <div className={`inline-block border rounded-xl px-6 py-3 ${getStatusColor(booking.status)}`}>
              <span className="text-xs uppercase font-bold block mb-1">Booking Status</span>
              <span className="text-xl font-black tracking-wider capitalize">{booking.status.replace('_', ' ')}</span>
            </div>

            <div className={`inline-block border rounded-xl px-6 py-3 ${getPaymentStatusColor(booking.payment_status)}`}>
              <span className="text-xs uppercase font-bold block mb-1">Payment Status</span>
              <span className="text-xl font-black tracking-wider capitalize">{booking.payment_status.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Trip Details</span>
              <p className="text-sm font-bold text-slate-900 capitalize mb-1">{booking.trip_type.replace('_', ' ')} Service</p>
              <p className="text-xs text-slate-600 mb-1"><strong>Pickup:</strong> {booking.pickup_address}</p>
              {booking.drop_address && <p className="text-xs text-slate-600 mb-1"><strong>Drop:</strong> {booking.drop_address}</p>}
              <p className="text-xs text-slate-600"><strong>Date:</strong> {new Date(booking.pickup_datetime).toLocaleString()}</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Vehicle</span>
              <p className="text-sm font-bold text-slate-900 mb-1">{booking.vehicle_categories?.name}</p>
              <p className="text-xs text-slate-600 mb-1">Passengers: {booking.passenger_count}</p>
              <p className="text-xs text-slate-600">Luggage: {booking.luggage_count}</p>
            </div>
          </div>

          <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-6 text-left mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase mb-4">Payment Summary</h3>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-slate-600">Total Customer Payable</span>
              <span className="font-bold text-slate-900">₹{snapshot.customer_payable?.toLocaleString('en-IN') || 0}</span>
            </div>
            
            <div className="h-px w-full bg-brand-blue/10 my-4"></div>
            
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-sm font-bold text-brand-blue block">Minimum Token Required (25%)</span>
                <span className="text-xs text-slate-500">Must be paid to confirm booking</span>
              </div>
              <span className="text-xl font-black text-brand-blue">₹{snapshot.token_amount?.toLocaleString('en-IN') || 0}</span>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-slate-600 font-medium">Amount Paid</span>
              <span className="font-bold text-green-700">₹{totalPaid.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-600 font-medium">Balance Due</span>
              <span className="font-bold text-slate-700">₹{trueBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-8 flex gap-4 items-start">
            <svg className={`w-6 h-6 flex-shrink-0 mt-0.5 ${documentsSubmitted ? 'text-green-500' : 'text-amber-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {documentsSubmitted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )}
            </svg>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Identity Verification (KYC)</p>
              <p className="text-xs text-slate-600">
                {documentsSubmitted 
                  ? 'Your identity document has been securely received.'
                  : 'Action Required: Please upload your Aadhaar, PAN, or Passport to verify your identity before the trip.'}
              </p>
            </div>
          </div>
          
          {booking.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-8 flex gap-4 items-start">
              <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-1">Action Required: Pay Token to Confirm</p>
                <p className="text-xs text-slate-600">Your booking is currently <strong>PENDING</strong>. Please contact our support team via WhatsApp or Phone to complete your 25% token payment and instantly confirm your cab.</p>
              </div>
            </div>
          )}

          {!documentsSubmitted && (
            <DocumentUploadForm bookingReference={booking.booking_reference} />
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={`${SITE_CONFIG.whatsapp}?text=Hello%20Urgent%20Taxis!%20%F0%9F%91%8B%0A%0AI%20have%20submitted%20a%20booking%20request.%0A%F0%9F%93%8B%20*Reference*%3A%20${booking.booking_reference}%0A%0AI%20would%20like%20to%20pay%20the%20*Token%20Amount*.%20%F0%9F%92%B0`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-4 bg-brand-green hover:bg-brand-green-hover text-white font-black rounded-xl shadow-lg shadow-brand-green/20 transition-all flex items-center justify-center gap-2"
            >
              Pay via WhatsApp Support
            </a>
            <Link 
              href="/"
              className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
            >
              Return to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

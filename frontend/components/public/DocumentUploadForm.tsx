'use client';

import React, { useState } from 'react';

export default function DocumentUploadForm({ bookingReference }: { bookingReference: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('AADHAAR');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('bookingReference', bookingReference);

    try {
      const res = await fetch('/api/public/upload-document', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadStatus({ success: true, message: 'Document uploaded successfully. Thank you!' });
        setFile(null); // Reset form
      } else {
        setUploadStatus({ success: false, message: data.message || 'Failed to upload document.' });
      }
    } catch (err) {
      setUploadStatus({ success: false, message: 'An error occurred during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-left mb-8 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Upload Identity Document (KYC)
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Please upload a valid identity document (Aadhaar, PAN, or Passport). This is securely stored and never shared publicly.
      </p>

      {uploadStatus && (
        <div className={`p-4 rounded-xl mb-4 text-sm font-bold ${uploadStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {uploadStatus.message}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Document Type</label>
          <select 
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="AADHAAR">Aadhaar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="PASSPORT">Passport</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Upload File (JPG, PNG, PDF up to 5MB)</label>
          <input 
            type="file" 
            accept="image/jpeg, image/png, application/pdf"
            onChange={handleFileChange}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <button 
          type="submit" 
          disabled={!file || isUploading}
          className={`w-full py-3.5 rounded-xl text-white font-black text-sm transition-all ${!file || isUploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-blue hover:bg-brand-blue-hover shadow-lg shadow-brand-blue/20'}`}
        >
          {isUploading ? 'Uploading Securely...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
}

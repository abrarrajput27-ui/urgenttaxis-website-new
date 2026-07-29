import { constructMetadata } from '@/lib/seo';
import PublicBreadcrumbs from '@/components/public/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Privacy Policy | Urgent Taxis',
  description: 'Privacy policy for Urgent Taxis outstation cab booking service. Learn how we handle your data.',
  canonicalPath: '/privacy',
});

export default function PrivacyPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy' },
  ];

  return (
    <div className="pb-16 bg-slate-50 min-h-screen text-slate-900">
      <div className="bg-white border-b border-slate-100">
        <PublicBreadcrumbs items={breadcrumbItems} />
      </div>

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-brand-blue tracking-tight mb-8">
          Privacy Policy
        </h1>
        
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed font-medium">
          <p>
            At Urgent Taxis, we are committed to protecting your personal information and your right to privacy.
          </p>

          <h2 className="text-lg font-black text-slate-900 mt-6">1. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use. 
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Name, phone number, and email address</li>
            <li>Pickup and drop-off locations</li>
            <li>Identity documents (if required for interstate travel)</li>
          </ul>

          <h2 className="text-lg font-black text-slate-900 mt-6">2. How We Use Your Information</h2>
          <p>
            We use personal information collected via our website for a variety of business purposes described below.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To facilitate cab bookings and driver dispatch</li>
            <li>To send administrative information (e.g., booking confirmations, driver details via WhatsApp or SMS)</li>
            <li>To fulfill and manage your payments and invoices</li>
          </ul>

          <h2 className="text-lg font-black text-slate-900 mt-6">3. Data Sharing</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Specifically, your phone number and pickup location will be shared with the assigned driver.
          </p>
          
          <p className="mt-8 text-xs text-slate-500">
            Last updated: July 2026
          </p>
        </div>
      </section>
    </div>
  );
}

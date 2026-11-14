'use client';

import React from 'react';
import Link from 'next/link';

interface NavLinkItem {
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

export default function ContextualSEONavigation() {
  // 1. POPULAR CITY TAXI SERVICES (Only verified city taxi service category links)
  const cityTaxiServices: NavLinkItem[] = [
    { label: 'Taxi Service in Delhi', href: '/taxi-service/delhi' },
    { label: 'Taxi Service in Ghaziabad', href: '/taxi-service/ghaziabad' },
    { label: 'Taxi Service in Noida', href: '/taxi-service/noida' },
    { label: 'Taxi Service in Greater Noida', href: '/taxi-service/greater-noida' },
    { label: 'Taxi Service in Gurugram', href: '/taxi-service/gurugram' },
    { label: 'Taxi Service in Faridabad', href: '/taxi-service/faridabad' },
    { label: 'Taxi Service in Lucknow', href: '/taxi-service/lucknow' },
    { label: 'Taxi Service in Dehradun', href: '/taxi-service/dehradun' },
    { label: 'Taxi Service in Haridwar', href: '/taxi-service/haridwar' },
    { label: 'Taxi Service in Rishikesh', href: '/taxi-service/rishikesh' },
    { label: 'Taxi Service in Haldwani', href: '/taxi-service/haldwani' },
    { label: 'Taxi Service in Nainital', href: '/taxi-service/nainital' },
    { label: 'Taxi Service in Bareilly', href: '/taxi-service/bareilly' },
    { label: 'Taxi Service in Meerut', href: '/taxi-service/meerut' },
    { label: 'Taxi Service in Masuri', href: '/taxi-service/masuri' },
    { label: 'Taxi Service in Hapur', href: '/taxi-service/hapur' },
    { label: 'Taxi Service in Modinagar', href: '/taxi-service/modinagar' },
    { label: 'Taxi Service in Muradnagar', href: '/taxi-service/muradnagar' },
    { label: 'Taxi Service in Indirapuram', href: '/taxi-service/indirapuram' },
    { label: 'Taxi Service in Raj Nagar Extension', href: '/taxi-service/raj-nagar-extension' },
  ];

  // 2. TOP CAB ROUTES (Top intercity highway corridors)
  const topCabRoutes: NavLinkItem[] = [
    { label: 'Delhi to Haridwar Taxi', href: '/routes/delhi-to-haridwar-taxi' },
    { label: 'Delhi to Dehradun Taxi', href: '/routes/delhi-to-dehradun-taxi' },
    { label: 'Delhi to Rishikesh Taxi', href: '/routes/delhi-to-rishikesh-taxi' },
    { label: 'Delhi to Nainital Taxi', href: '/routes/delhi-to-nainital-taxi' },
    { label: 'Delhi to Haldwani Taxi', href: '/routes/delhi-to-haldwani-taxi' },
    { label: 'Delhi to Jaipur Taxi', href: '/routes/delhi-to-jaipur-taxi' },
    { label: 'Delhi to Agra Taxi', href: '/routes/delhi-to-agra-taxi' },
    { label: 'Delhi to Chandigarh Taxi', href: '/routes/delhi-to-chandigarh-taxi' },
    { label: 'Delhi to Lucknow Taxi', href: '/routes/delhi-to-lucknow-taxi' },
    { label: 'Delhi to Bareilly Taxi', href: '/routes/delhi-to-bareilly-taxi' },
    { label: 'Delhi to Mathura Taxi', href: '/routes/delhi-to-mathura-taxi' },
    { label: 'Delhi to Moradabad Taxi', href: '/routes/delhi-to-moradabad-taxi' },
    { label: 'Lucknow to Delhi Taxi', href: '/routes/lucknow-to-delhi-taxi' },
    { label: 'Lucknow to Ayodhya Taxi', href: '/routes/lucknow-to-ayodhya-taxi' },
    { label: 'Lucknow to Varanasi Taxi', href: '/routes/lucknow-to-varanasi-taxi' },
    { label: 'Lucknow to Kanpur Taxi', href: '/routes/lucknow-to-kanpur-taxi' },
    { label: 'Ghaziabad to Haridwar Taxi', href: '/routes/ghaziabad-to-haridwar-taxi' },
    { label: 'Ghaziabad to Dehradun Taxi', href: '/routes/ghaziabad-to-dehradun-taxi' },
    { label: 'Noida to Agra Taxi', href: '/routes/noida-to-agra-taxi' },
    { label: 'Noida to Jaipur Taxi', href: '/routes/noida-to-jaipur-taxi' },
  ];

  // 3. AIRPORT CAB ROUTES (Verified airport transfer connections)
  const airportCabRoutes: NavLinkItem[] = [
    { label: 'Delhi IGI Airport Taxi', href: '/airport-transfers/delhi-to-igi-airport' },
    { label: 'Ghaziabad to Delhi Airport', href: '/airport-transfers/ghaziabad-to-delhi-airport' },
    { label: 'Noida to Delhi Airport', href: '/airport-transfers/noida-to-delhi-airport' },
    { label: 'Greater Noida to Delhi Airport', href: '/airport-transfers/greater-noida-to-delhi-airport' },
    { label: 'Delhi Airport to Ghaziabad', href: '/airport-transfers/delhi-airport-to-ghaziabad' },
    { label: 'Delhi Airport to Noida', href: '/airport-transfers/delhi-airport-to-noida' },
    { label: 'Lucknow Airport Taxi', href: '/airport-transfers/delhi-to-lucknow-airport' },
    { label: 'Dehradun Airport Taxi', href: '/airport-transfers/delhi-to-dehradun-airport' },
    { label: 'Jaipur Airport Taxi', href: '/airport-transfers/delhi-to-jaipur-airport' },
    { label: 'Chandigarh Airport Taxi', href: '/airport-transfers/delhi-to-chandigarh-airport' },
    { label: 'Pantnagar Airport Taxi', href: '/airport-transfers/delhi-to-pantnagar-airport' },
    { label: 'Bareilly Airport Taxi', href: '/airport-transfers/delhi-to-bareilly-airport' },
    { label: 'Amritsar Airport Taxi', href: '/airport-transfers/delhi-to-amritsar-airport' },
  ];

  // 4. ALL-INDIA STATE & REGIONAL COVERAGE
  const stateCoverageRoutes: NavLinkItem[] = [
    { label: 'Bihar Taxi Services', href: '/routes' },
    { label: 'Delhi NCR Taxi Service', href: '/taxi-service/delhi' },
    { label: 'Goa Outstation Cabs', href: '/routes' },
    { label: 'Gujarat Taxi Services', href: '/routes' },
    { label: 'Haryana Cabs & Taxi', href: '/taxi-service/gurugram' },
    { label: 'Himachal Pradesh Cabs', href: '/routes' },
    { label: 'Jammu & Kashmir Cabs', href: '/routes' },
    { label: 'Madhya Pradesh Taxi', href: '/routes' },
    { label: 'Maharashtra Cabs', href: '/routes' },
    { label: 'Punjab Outstation Cabs', href: '/routes' },
    { label: 'Rajasthan Taxi Service', href: '/routes/delhi-to-jaipur-taxi' },
    { label: 'Uttar Pradesh Cabs', href: '/taxi-service/ghaziabad' },
    { label: 'Uttarakhand Taxi Services', href: '/routes/delhi-to-dehradun-taxi' },
    { label: 'West Bengal Cabs', href: '/routes' },
    { label: 'Delhi to Patna Taxi', href: '/routes/delhi-to-patna-taxi' },
    { label: 'Delhi to Bodh Gaya Taxi', href: '/routes/delhi-to-bodh-gaya-taxi' },
    { label: 'Delhi to Haridwar Taxi', href: '/routes/delhi-to-haridwar-taxi' },
    { label: 'Delhi to Rishikesh Taxi', href: '/routes/delhi-to-rishikesh-taxi' },
    { label: 'Delhi to Nainital Taxi', href: '/routes/delhi-to-nainital-taxi' },
    { label: 'Delhi to Agra Taxi', href: '/routes/delhi-to-agra-taxi' },
  ];

  const sections: NavSection[] = [
    {
      title: 'Popular City Taxi Services',
      links: cityTaxiServices,
    },
    {
      title: 'Top Cab Routes',
      links: topCabRoutes,
    },
    {
      title: 'Airport Cab Routes',
      links: airportCabRoutes,
    },
    {
      title: 'Service Coverage Across States',
      links: stateCoverageRoutes,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-white/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs text-slate-400">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="text-white font-bold text-[14px] tracking-wide uppercase pb-2 border-b border-white/10">
              {sec.title}
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {sec.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={true}
                    className="hover:text-white hover:underline transition-colors block leading-relaxed"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

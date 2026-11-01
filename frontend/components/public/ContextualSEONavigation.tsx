'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkItem {
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

export default function ContextualSEONavigation() {
  const pathname = usePathname() || '/';

  // 1. MASTER DATASETS (All verified canonical URLs)
  const allCityServices: NavLinkItem[] = [
    { label: 'Taxi Service in Delhi', href: '/taxi-service/delhi' },
    { label: 'Taxi Service in Ghaziabad', href: '/taxi-service/ghaziabad' },
    { label: 'Taxi Service in Noida', href: '/taxi-service/noida' },
    { label: 'Taxi Service in Greater Noida', href: '/taxi-service/greater-noida' },
    { label: 'Taxi Service in Gurugram', href: '/taxi-service/gurugram' },
    { label: 'Taxi Service in Faridabad', href: '/taxi-service/faridabad' },
    { label: 'Taxi Service in Haldwani', href: '/taxi-service/haldwani' },
    { label: 'Taxi Service in Nainital', href: '/taxi-service/nainital' },
    { label: 'Taxi Service in Dehradun', href: '/taxi-service/dehradun' },
    { label: 'Taxi Service in Haridwar', href: '/taxi-service/haridwar' },
    { label: 'Taxi Service in Rishikesh', href: '/taxi-service/rishikesh' },
    { label: 'Taxi Service in Lucknow', href: '/taxi-service/lucknow' },
    { label: 'Taxi Service in Bareilly', href: '/taxi-service/bareilly' },
    { label: 'Taxi Service in Meerut', href: '/taxi-service/meerut' },
  ];

  const allTopCabRoutes: NavLinkItem[] = [
    { label: 'Delhi to Jaipur Taxi', href: '/routes/delhi-to-jaipur-taxi' },
    { label: 'Delhi to Agra Taxi', href: '/routes/delhi-to-agra-taxi' },
    { label: 'Delhi to Chandigarh Taxi', href: '/routes/delhi-to-chandigarh-taxi' },
    { label: 'Delhi to Dehradun Taxi', href: '/routes/delhi-to-dehradun-taxi' },
    { label: 'Delhi to Haridwar Taxi', href: '/routes/delhi-to-haridwar-taxi' },
    { label: 'Delhi to Rishikesh Taxi', href: '/routes/delhi-to-rishikesh-taxi' },
    { label: 'Delhi to Nainital Taxi', href: '/routes/delhi-to-nainital-taxi' },
    { label: 'Delhi to Haldwani Taxi', href: '/routes/delhi-to-haldwani-taxi' },
    { label: 'Delhi to Lucknow Taxi', href: '/routes/delhi-to-lucknow-taxi' },
    { label: 'Delhi to Bareilly Taxi', href: '/routes/delhi-to-bareilly-taxi' },
    { label: 'Delhi to Mathura Taxi', href: '/routes/delhi-to-mathura-taxi' },
    { label: 'Jaipur to Delhi Taxi', href: '/routes/jaipur-to-delhi-taxi' },
    { label: 'Dehradun to Delhi Taxi', href: '/routes/dehradun-to-delhi-taxi' },
  ];

  const allTopAirportRoutes: NavLinkItem[] = [
    { label: 'Delhi IGI Airport Taxi', href: '/airport-transfers/delhi-to-igi-airport' },
    { label: 'Jaipur Airport Taxi', href: '/airport-transfers/delhi-to-jaipur-airport' },
    { label: 'Chandigarh Airport Taxi', href: '/airport-transfers/delhi-to-chandigarh-airport' },
    { label: 'Dehradun Airport Taxi', href: '/airport-transfers/delhi-to-dehradun-airport' },
    { label: 'Amritsar Airport Taxi', href: '/airport-transfers/delhi-to-amritsar-airport' },
    { label: 'Lucknow Airport Taxi', href: '/airport-transfers/delhi-to-lucknow-airport' },
    { label: 'Pantnagar Airport Taxi', href: '/airport-transfers/delhi-to-pantnagar-airport' },
    { label: 'Bareilly Airport Taxi', href: '/airport-transfers/delhi-to-bareilly-airport' },
  ];

  const allDelhiAirportRoutes: NavLinkItem[] = [
    { label: 'Ghaziabad to Delhi Airport', href: '/airport-transfers/ghaziabad-to-delhi-airport' },
    { label: 'Noida to Delhi Airport', href: '/airport-transfers/noida-to-delhi-airport' },
    { label: 'Greater Noida to Delhi Airport', href: '/airport-transfers/greater-noida-to-delhi-airport' },
    { label: 'Delhi to IGI Airport', href: '/airport-transfers/delhi-to-igi-airport' },
    { label: 'IGI Airport to Ghaziabad', href: '/airport-transfers/delhi-airport-to-ghaziabad' },
    { label: 'IGI Airport to Noida', href: '/airport-transfers/delhi-airport-to-noida' },
  ];

  const allRegionalRoutes: NavLinkItem[] = [
    { label: 'Ghaziabad to Haridwar Taxi', href: '/routes/ghaziabad-to-haridwar-taxi' },
    { label: 'Ghaziabad to Dehradun Taxi', href: '/routes/ghaziabad-to-dehradun-taxi' },
    { label: 'Noida to Agra Taxi', href: '/routes/noida-to-agra-taxi' },
    { label: 'Noida to Jaipur Taxi', href: '/routes/noida-to-jaipur-taxi' },
    { label: 'Delhi to Moradabad Taxi', href: '/routes/delhi-to-moradabad-taxi' },
    { label: 'Delhi to Aligarh Taxi', href: '/routes/delhi-to-aligarh-taxi' },
    { label: 'Delhi to Vrindavan Taxi', href: '/routes/delhi-to-vrindavan-taxi' },
    { label: 'Delhi to Mathura Taxi', href: '/routes/delhi-to-mathura-taxi' },
  ];

  // Helper to filter out circular link to current page
  const cleanLinks = (items: NavLinkItem[]) => items.filter((item) => item.href !== pathname);

  // 2. CONTEXTUAL RESOLUTION ENGINE
  let sections: NavSection[] = [];

  // CASE A: Route Page Context (e.g. /routes/delhi-to-jaipur-taxi, /routes/delhi-to-haldwani-taxi)
  if (pathname.startsWith('/routes/')) {
    const slug = pathname.replace('/routes/', '');

    if (slug.includes('jaipur')) {
      sections = [
        {
          title: 'Popular City Taxi Services',
          links: cleanLinks([
            { label: 'Taxi Service in Delhi', href: '/taxi-service/delhi' },
            { label: 'Taxi Service in Gurugram', href: '/taxi-service/gurugram' },
            { label: 'Taxi Service in Noida', href: '/taxi-service/noida' },
            { label: 'Taxi Service in Ghaziabad', href: '/taxi-service/ghaziabad' },
            { label: 'Taxi Service in Faridabad', href: '/taxi-service/faridabad' },
          ]),
        },
        {
          title: 'Top Cab Routes from Delhi',
          links: cleanLinks([
            { label: 'Delhi to Agra Taxi', href: '/routes/delhi-to-agra-taxi' },
            { label: 'Delhi to Chandigarh Taxi', href: '/routes/delhi-to-chandigarh-taxi' },
            { label: 'Delhi to Dehradun Taxi', href: '/routes/delhi-to-dehradun-taxi' },
            { label: 'Delhi to Haridwar Taxi', href: '/routes/delhi-to-haridwar-taxi' },
            { label: 'Delhi to Rishikesh Taxi', href: '/routes/delhi-to-rishikesh-taxi' },
            { label: 'Delhi to Nainital Taxi', href: '/routes/delhi-to-nainital-taxi' },
          ]),
        },
        {
          title: 'Top Airport Cab Routes',
          links: cleanLinks([
            { label: 'Delhi IGI Airport Taxi', href: '/airport-transfers/delhi-to-igi-airport' },
            { label: 'Jaipur Airport Taxi', href: '/airport-transfers/delhi-to-jaipur-airport' },
            { label: 'Chandigarh Airport Taxi', href: '/airport-transfers/delhi-to-chandigarh-airport' },
            { label: 'Dehradun Airport Taxi', href: '/airport-transfers/delhi-to-dehradun-airport' },
          ]),
        },
        {
          title: 'Delhi Airport Routes',
          links: cleanLinks([
            { label: 'Ghaziabad to Delhi Airport', href: '/airport-transfers/ghaziabad-to-delhi-airport' },
            { label: 'Noida to Delhi Airport', href: '/airport-transfers/noida-to-delhi-airport' },
            { label: 'Delhi to IGI Airport', href: '/airport-transfers/delhi-to-igi-airport' },
            { label: 'IGI Airport to Ghaziabad', href: '/airport-transfers/delhi-airport-to-ghaziabad' },
          ]),
        },
        {
          title: 'Jaipur & Regional Routes',
          links: cleanLinks([
            { label: 'Jaipur to Delhi Taxi', href: '/routes/jaipur-to-delhi-taxi' },
            { label: 'Noida to Jaipur Taxi', href: '/routes/noida-to-jaipur-taxi' },
            { label: 'Delhi to Mathura Taxi', href: '/routes/delhi-to-mathura-taxi' },
            { label: 'Delhi to Vrindavan Taxi', href: '/routes/delhi-to-vrindavan-taxi' },
          ]),
        },
      ];
    } else if (slug.includes('haldwani') || slug.includes('nainital')) {
      sections = [
        {
          title: 'Popular City Taxi Services',
          links: cleanLinks([
            { label: 'Taxi Service in Haldwani', href: '/taxi-service/haldwani' },
            { label: 'Taxi Service in Nainital', href: '/taxi-service/nainital' },
            { label: 'Taxi Service in Bareilly', href: '/taxi-service/bareilly' },
            { label: 'Taxi Service in Delhi', href: '/taxi-service/delhi' },
            { label: 'Taxi Service in Ghaziabad', href: '/taxi-service/ghaziabad' },
          ]),
        },
        {
          title: 'Top Cab Routes from Delhi',
          links: cleanLinks([
            { label: 'Delhi to Haridwar Taxi', href: '/routes/delhi-to-haridwar-taxi' },
            { label: 'Delhi to Dehradun Taxi', href: '/routes/delhi-to-dehradun-taxi' },
            { label: 'Delhi to Rishikesh Taxi', href: '/routes/delhi-to-rishikesh-taxi' },
            { label: 'Delhi to Bareilly Taxi', href: '/routes/delhi-to-bareilly-taxi' },
            { label: 'Delhi to Agra Taxi', href: '/routes/delhi-to-agra-taxi' },
          ]),
        },
        {
          title: 'Top Airport Cab Routes',
          links: cleanLinks([
            { label: 'Pantnagar Airport Taxi', href: '/airport-transfers/delhi-to-pantnagar-airport' },
            { label: 'Bareilly Airport Taxi', href: '/airport-transfers/delhi-to-bareilly-airport' },
            { label: 'Delhi IGI Airport Taxi', href: '/airport-transfers/delhi-to-igi-airport' },
            { label: 'Dehradun Airport Taxi', href: '/airport-transfers/delhi-to-dehradun-airport' },
          ]),
        },
        {
          title: 'Delhi Airport Routes',
          links: cleanLinks([
            { label: 'Ghaziabad to Delhi Airport', href: '/airport-transfers/ghaziabad-to-delhi-airport' },
            { label: 'Noida to Delhi Airport', href: '/airport-transfers/noida-to-delhi-airport' },
            { label: 'Delhi to IGI Airport', href: '/airport-transfers/delhi-to-igi-airport' },
            { label: 'IGI Airport to Ghaziabad', href: '/airport-transfers/delhi-airport-to-ghaziabad' },
          ]),
        },
        {
          title: 'Popular Regional Routes',
          links: cleanLinks([
            { label: 'Delhi to Moradabad Taxi', href: '/routes/delhi-to-moradabad-taxi' },
            { label: 'Ghaziabad to Haridwar Taxi', href: '/routes/ghaziabad-to-haridwar-taxi' },
            { label: 'Ghaziabad to Dehradun Taxi', href: '/routes/ghaziabad-to-dehradun-taxi' },
            { label: 'Delhi to Aligarh Taxi', href: '/routes/delhi-to-aligarh-taxi' },
          ]),
        },
      ];
    } else {
      // General outstation route page context
      sections = [
        {
          title: 'Popular City Taxi Services',
          links: cleanLinks(allCityCitySubset(slug)),
        },
        {
          title: 'Top Cab Routes',
          links: cleanLinks(allTopCabRoutes).slice(0, 7),
        },
        {
          title: 'Top Airport Cab Routes',
          links: cleanLinks(allTopAirportRoutes).slice(0, 6),
        },
        {
          title: 'Delhi Airport Routes',
          links: cleanLinks(allDelhiAirportRoutes),
        },
        {
          title: 'Popular Regional Routes',
          links: cleanLinks(allRegionalRoutes).slice(0, 6),
        },
      ];
    }
  }

  // CASE B: City / Locality Page Context (e.g. /taxi-service/ghaziabad, /taxi-service/delhi, /taxi-service/dehradun)
  else if (pathname.startsWith('/taxi-service/')) {
    const locality = pathname.replace('/taxi-service/', '');
    sections = [
      {
        title: 'Popular City Taxi Services',
        links: cleanLinks(allCityServices).slice(0, 7),
      },
      {
        title: `Top Cab Routes from ${capitalize(locality)} & NCR`,
        links: cleanLinks(allTopCabRoutes).slice(0, 7),
      },
      {
        title: 'Top Airport Cab Routes',
        links: cleanLinks(allTopAirportRoutes).slice(0, 6),
      },
      {
        title: 'Delhi Airport Routes',
        links: cleanLinks(allDelhiAirportRoutes),
      },
      {
        title: 'Popular Regional Routes',
        links: cleanLinks(allRegionalRoutes).slice(0, 6),
      },
    ];
  }

  // CASE C: Airport Transfer Pages (e.g. /airport-transfers, /airport-transfers/ghaziabad-to-delhi-airport)
  else if (pathname.startsWith('/airport-transfers')) {
    sections = [
      {
        title: 'Popular City Taxi Services',
        links: cleanLinks(allCityServices).slice(0, 7),
      },
      {
        title: 'Top Cab Routes',
        links: cleanLinks(allTopCabRoutes).slice(0, 7),
      },
      {
        title: 'Top Airport Cab Routes',
        links: cleanLinks(allTopAirportRoutes),
      },
      {
        title: 'Delhi Airport Routes',
        links: cleanLinks(allDelhiAirportRoutes),
      },
      {
        title: 'Popular Regional Routes',
        links: cleanLinks(allRegionalRoutes).slice(0, 6),
      },
    ];
  }

  // CASE D: Default (Homepage, Fleet, About, Policy, etc.) — authoritative master structure
  else {
    sections = [
      {
        title: 'Popular City Taxi Services',
        links: allCityServices,
      },
      {
        title: 'Top Cab Routes',
        links: allTopCabRoutes,
      },
      {
        title: 'Top Airport Cab Routes',
        links: allTopAirportRoutes,
      },
      {
        title: 'Delhi Airport Routes',
        links: allDelhiAirportRoutes,
      },
      {
        title: 'Popular Regional Routes',
        links: allRegionalRoutes,
      },
    ];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-white/10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 text-xs text-slate-400">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-3">
            <h4 className="text-white font-bold text-[13px] tracking-wide uppercase pb-1 border-b border-white/10">
              {sec.title}
            </h4>
            <ul className="space-y-2">
              {sec.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    prefetch={true}
                    className="hover:text-white transition-colors block leading-relaxed"
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

// Helpers
function capitalize(str: string): string {
  if (!str) return '';
  return str.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function allCityCitySubset(slug: string): NavLinkItem[] {
  const list: NavLinkItem[] = [
    { label: 'Taxi Service in Delhi', href: '/taxi-service/delhi' },
    { label: 'Taxi Service in Ghaziabad', href: '/taxi-service/ghaziabad' },
    { label: 'Taxi Service in Noida', href: '/taxi-service/noida' },
    { label: 'Taxi Service in Greater Noida', href: '/taxi-service/greater-noida' },
    { label: 'Taxi Service in Gurugram', href: '/taxi-service/gurugram' },
    { label: 'Taxi Service in Faridabad', href: '/taxi-service/faridabad' },
    { label: 'Taxi Service in Meerut', href: '/taxi-service/meerut' },
  ];
  if (slug.includes('dehradun')) {
    list.unshift({ label: 'Taxi Service in Dehradun', href: '/taxi-service/dehradun' });
  }
  if (slug.includes('haridwar')) {
    list.unshift({ label: 'Taxi Service in Haridwar', href: '/taxi-service/haridwar' });
  }
  if (slug.includes('rishikesh')) {
    list.unshift({ label: 'Taxi Service in Rishikesh', href: '/taxi-service/rishikesh' });
  }
  if (slug.includes('lucknow')) {
    list.unshift({ label: 'Taxi Service in Lucknow', href: '/taxi-service/lucknow' });
  }
  if (slug.includes('bareilly')) {
    list.unshift({ label: 'Taxi Service in Bareilly', href: '/taxi-service/bareilly' });
  }
  return list.slice(0, 7);
}

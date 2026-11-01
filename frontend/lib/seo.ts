import type { Metadata } from 'next';
import { BUSINESS_CONFIG } from './config';

export const SITE_CONFIG = {
  name: BUSINESS_CONFIG.brandName,
  domain: BUSINESS_CONFIG.canonicalDomain,
  tagline: BUSINESS_CONFIG.tagline,
  taglineHindi: BUSINESS_CONFIG.taglineHindi,
  description: 'Book reliable outstation cabs, IGI airport transfers & local hourly rentals in Ghaziabad & Delhi NCR with transparent pricing & verified drivers.',
  phone: BUSINESS_CONFIG.phone.primary,
  phoneRaw: BUSINESS_CONFIG.phone.primaryRaw,
  phoneDisplay: BUSINESS_CONFIG.phone.display,
  whatsapp: BUSINESS_CONFIG.phone.whatsapp,
  whatsappRaw: BUSINESS_CONFIG.phone.whatsappRaw,
  supportEmail: BUSINESS_CONFIG.phone.email,
  address: BUSINESS_CONFIG.headOffice.formattedAddress,
  headOffice: BUSINESS_CONFIG.headOffice,
};

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  ogImage?: string;
}

/**
 * Constructs standardized, SEO-compliant Next.js metadata objects.
 * Prevents double brand name appending and keeps descriptions under 155 characters.
 */
export function constructMetadata({
  title,
  description = SITE_CONFIG.description,
  canonicalPath = '',
  noIndex = false,
  ogImage = '/logo.jpg',
}: ConstructMetadataProps = {}): Metadata {
  // Enforce title: if title is provided, do NOT append brand here because Next.js template (%s | Urgent Taxis) handles it.
  // If title is not provided, use default brand title.
  const pageTitle = title || `${SITE_CONFIG.name} - Outstation Cabs & Airport Transfers`;
  
  // Truncate description to 155 chars if needed for search engines
  const trimmedDescription = description.length > 155 ? `${description.slice(0, 152).trim()}...` : description;

  const canonicalUrl = `${SITE_CONFIG.domain}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_CONFIG.domain}${ogImage.startsWith('/') ? ogImage : `/${ogImage}`}`;

  return {
    title: pageTitle,
    description: trimmedDescription,
    metadataBase: new URL(SITE_CONFIG.domain),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: trimmedDescription,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: `${SITE_CONFIG.name} - ${pageTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: trimmedDescription,
      images: [fullImageUrl],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

/**
 * Generates JSON-LD Structured Data for LocalBusiness & TaxiService.
 */
export function generateLocalBusinessSchema() {
  const sameAsProfiles = Object.values(BUSINESS_CONFIG.socialProfiles).filter(Boolean) as string[];

  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    '@id': `${BUSINESS_CONFIG.canonicalDomain}/#taxiservice`,
    name: BUSINESS_CONFIG.brandName,
    url: BUSINESS_CONFIG.canonicalDomain,
    logo: `${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`,
    image: `${BUSINESS_CONFIG.canonicalDomain}/logo.jpg`,
    telephone: BUSINESS_CONFIG.phone.primaryRaw,
    email: BUSINESS_CONFIG.phone.email,
    priceRange: '₹₹',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${BUSINESS_CONFIG.headOffice.shopNumber}, ${BUSINESS_CONFIG.headOffice.building}, ${BUSINESS_CONFIG.headOffice.street}`,
      addressLocality: `${BUSINESS_CONFIG.headOffice.locality}, ${BUSINESS_CONFIG.headOffice.city}`,
      addressRegion: BUSINESS_CONFIG.headOffice.state,
      postalCode: BUSINESS_CONFIG.headOffice.postalCode,
      addressCountry: BUSINESS_CONFIG.headOffice.country,
    },
    areaServed: BUSINESS_CONFIG.serviceAreas.map((area) => ({
      '@type': 'City',
      name: area,
    })),
    termsOfService: `${BUSINESS_CONFIG.canonicalDomain}/terms`,
    ...(sameAsProfiles.length > 0 ? { sameAs: sameAsProfiles } : {}),
  };
}

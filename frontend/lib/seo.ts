import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'Urgent Taxis',
  domain: 'https://www.urgenttaxis.com',
  tagline: 'Fast To Your Destination, Your Quick Ride Solution!',
  description: 'Book premium sedan, SUV, and outstation cabs in Delhi NCR, Agra, Haridwar, Jaipur, and airport transfers with transparent pricing and verified drivers.',
  phone: '7310 651 940',
  phoneRaw: '+917310651940',
  whatsapp: 'https://wa.me/917310651940',
  supportEmail: 'info@urgenttaxis.com',
  address: 'Shop No. 09, S. R. Complex, Railway Station Road, Masuri, Ghaziabad, Masuri, Uttar Pradesh 201302',
};

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}

/**
 * Constructs standardized, SEO-compliant Next.js metadata objects.
 */
export function constructMetadata({
  title,
  description = SITE_CONFIG.description,
  canonicalPath = '',
  noIndex = false,
}: ConstructMetadataProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_CONFIG.name}` : `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`;
  const canonicalUrl = `${SITE_CONFIG.domain}${canonicalPath}`;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_CONFIG.domain),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: 'Urgent Taxis',
    url: SITE_CONFIG.domain,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.supportEmail,
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Delhi NCR' },
      { '@type': 'City', name: 'Delhi' },
      { '@type': 'City', name: 'Noida' },
      { '@type': 'City', name: 'Gurgaon' },
      { '@type': 'City', name: 'Agra' },
      { '@type': 'City', name: 'Haridwar' },
      { '@type': 'City', name: 'Jaipur' },
    ],
    priceRange: '₹₹',
    termsOfService: `${SITE_CONFIG.domain}/terms`,
  };
}

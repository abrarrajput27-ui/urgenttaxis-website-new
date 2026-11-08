import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';
import masterRoutesData from '@/lib/data/processed-master-routes.json';
import verifiedRoutesData from '@/lib/data/verified-routes.json';
import { LOCALITIES_DATA } from '@/lib/data/localities-data';
import { AIRPORT_ROUTES_DATA } from '@/lib/data/airport-routes-data';
import { BLOG_ARTICLES } from '@/lib/data/blog-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.domain;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/routes`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/taxi-service`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/airport-transfers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fleet`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/local-rentals`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/booking-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cancellation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/tempo-traveller`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/bus-charter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/corporate-taxi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/chardham-yatra`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/tour-packages`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fleet/hatchback`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fleet/sedan`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fleet/suv-muv`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/fleet/executive-suv`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  // 20 Locality pages (/taxi-service/[locality])
  const localityPages: MetadataRoute.Sitemap = Object.keys(LOCALITIES_DATA).map((slug) => ({
    url: `${baseUrl}/taxi-service/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dedicated Airport Routes (/airport-transfers/[slug])
  const airportPages: MetadataRoute.Sitemap = Object.keys(AIRPORT_ROUTES_DATA).map((slug) => ({
    url: `${baseUrl}/airport-transfers/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // 15 Blog Articles (/blog/[slug])
  const blogPages: MetadataRoute.Sitemap = Object.keys(BLOG_ARTICLES).map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  // Verified Outstation Routes only (/routes/[slug]) - Excludes placeholder / unverified corridors
  const verifiedSet = new Set(verifiedRoutesData as string[]);
  const dynamicRoutePages: MetadataRoute.Sitemap = masterRoutesData
    .filter((mr) => verifiedSet.has(mr.slug))
    .map((mr) => ({
      url: `${baseUrl}/routes/${mr.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  return [
    ...staticPages,
    ...localityPages,
    ...airportPages,
    ...blogPages,
    ...dynamicRoutePages,
  ];
}

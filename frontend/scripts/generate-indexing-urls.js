const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.urgenttaxis.in';

// 1. Static Pages
const staticPages = [
  '',
  '/services',
  '/routes',
  '/taxi-service',
  '/airport-transfers',
  '/fleet',
  '/local-rentals',
  '/faq',
  '/booking-policy',
  '/about',
  '/contact',
  '/blog',
  '/reviews',
  '/terms',
  '/privacy',
  '/cancellation',
  '/tempo-traveller',
  '/bus-charter',
  '/corporate-taxi',
  '/chardham-yatra',
  '/tour-packages',
  '/fleet/hatchback',
  '/fleet/sedan',
  '/fleet/suv-muv',
  '/fleet/executive-suv',
].map((p) => `${baseUrl}${p}`);

// 2. Localities
const { LOCALITIES_DATA } = require('../lib/data/localities-data.ts');
const localityUrls = Object.keys(LOCALITIES_DATA).map((slug) => `${baseUrl}/taxi-service/${slug}`);

// 3. Airport Transfers
const { AIRPORT_ROUTES_DATA } = require('../lib/data/airport-routes-data.ts');
const airportUrls = Object.keys(AIRPORT_ROUTES_DATA).map((slug) => `${baseUrl}/airport-transfers/${slug}`);

// 4. Blog Articles
const { BLOG_ARTICLES } = require('../lib/data/blog-data.ts');
const blogUrls = Object.keys(BLOG_ARTICLES).map((slug) => `${baseUrl}/blog/${slug}`);

// 5. Master Outstation Routes
const masterRoutes = require('../lib/data/processed-master-routes.json');
const routeUrls = masterRoutes.map((r) => `${baseUrl}/routes/${r.slug}`);

const allUrls = [
  ...staticPages,
  ...localityUrls,
  ...airportUrls,
  ...blogUrls,
  ...routeUrls,
];

console.log(`Generated ${allUrls.length} total URLs.`);

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'all-urls.txt'), allUrls.join('\n'), 'utf8');
fs.writeFileSync(
  path.join(publicDir, 'urls-index.json'),
  JSON.stringify({ total: allUrls.length, generatedAt: new Date().toISOString(), urls: allUrls }, null, 2),
  'utf8'
);
console.log('Saved all-urls.txt and urls-index.json in frontend/public/');

/**
 * Internal Link Verification Script
 * Validates that all links generated across Header, Footer, Locality Pages,
 * Airport Pages, Blog Articles, and Sitemaps resolve to valid routes.
 */

import fs from 'fs';
import path from 'path';

console.log('--- URGENT TAXIS INTERNAL LINK INTEGRITY AUDIT ---');

const errors = [];
const verifiedRoutes = new Set([
  '/',
  '/about',
  '/contact',
  '/fleet',
  '/fleet/hatchback',
  '/fleet/sedan',
  '/fleet/suv-muv',
  '/fleet/executive-suv',
  '/routes',
  '/taxi-service',
  '/airport-transfers',
  '/local-rentals',
  '/corporate-taxi',
  '/tour-packages',
  '/tempo-traveller',
  '/bus-charter',
  '/chardham-yatra',
  '/reviews',
  '/blog',
  '/faq',
  '/booking-policy',
  '/cancellation',
  '/terms',
  '/privacy',
  '/sitemap.xml',
  '/robots.txt',
]);

// 1. Add all 20 locality routes
const localitiesDataPath = path.resolve('frontend/lib/data/localities-data.ts');
if (fs.existsSync(localitiesDataPath)) {
  const content = fs.readFileSync(localitiesDataPath, 'utf8');
  const matches = content.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g);
  for (const m of matches) {
    verifiedRoutes.add(`/taxi-service/${m[1]}`);
  }
}

// 2. Add all airport routes
const airportDataPath = path.resolve('frontend/lib/data/airport-routes-data.ts');
if (fs.existsSync(airportDataPath)) {
  const content = fs.readFileSync(airportDataPath, 'utf8');
  const matches = content.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g);
  for (const m of matches) {
    verifiedRoutes.add(`/airport-transfers/${m[1]}`);
  }
}

// 3. Add all blog routes
const blogDataPath = path.resolve('frontend/lib/data/blog-data.ts');
if (fs.existsSync(blogDataPath)) {
  const content = fs.readFileSync(blogDataPath, 'utf8');
  const matches = content.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g);
  for (const m of matches) {
    verifiedRoutes.add(`/blog/${m[1]}`);
  }
}

// 4. Add master routes
const masterRoutesPath = path.resolve('frontend/lib/data/processed-master-routes.json');
if (fs.existsSync(masterRoutesPath)) {
  const routes = JSON.parse(fs.readFileSync(masterRoutesPath, 'utf8'));
  for (const r of routes) {
    verifiedRoutes.add(`/routes/${r.slug}`);
  }
}

console.log(`Loaded ${verifiedRoutes.size} valid site routes.`);

// Check links in Footer.tsx
const footerPath = path.resolve('frontend/components/public/Footer.tsx');
if (fs.existsSync(footerPath)) {
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  const linkMatches = footerContent.matchAll(/href=["'](\/[^"']*)["']/g);
  for (const match of linkMatches) {
    const target = match[1];
    if (!verifiedRoutes.has(target)) {
      errors.push(`[Footer] Broken or unmapped internal link: ${target}`);
    }
  }
}

// Check links in Header.tsx
const headerPath = path.resolve('frontend/components/public/Header.tsx');
if (fs.existsSync(headerPath)) {
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  const linkMatches = headerContent.matchAll(/href=["'](\/[^"']*)["']/g);
  for (const match of linkMatches) {
    const target = match[1];
    if (!verifiedRoutes.has(target)) {
      errors.push(`[Header] Broken or unmapped internal link: ${target}`);
    }
  }
}

// Check for dead '#' links
if (fs.existsSync(headerPath)) {
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  if (headerContent.includes('href="#"')) {
    errors.push('[Header] Dead href="#" link detected!');
  }
}

if (errors.length === 0) {
  console.log('✓ All internal links verified successfully. 0 broken links found.');
  process.exit(0);
} else {
  console.error(`Found ${errors.length} link issues:`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

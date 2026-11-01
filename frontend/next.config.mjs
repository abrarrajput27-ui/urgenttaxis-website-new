/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // 301 Permanent Redirects: Gurugram Airport (artificial route) -> Delhi Airport (Canonical IGI Airport)
      { source: '/routes/gurugram-airport-to-agra-taxi', destination: '/routes/delhi-airport-to-agra-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-mathura-taxi', destination: '/routes/delhi-airport-to-mathura-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-vrindavan-taxi', destination: '/routes/delhi-airport-to-vrindavan-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-lucknow-taxi', destination: '/routes/delhi-airport-to-lucknow-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-kanpur-taxi', destination: '/routes/delhi-airport-to-kanpur-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-varanasi-taxi', destination: '/routes/delhi-airport-to-varanasi-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-ayodhya-taxi', destination: '/routes/delhi-airport-to-ayodhya-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-prayagraj-taxi', destination: '/routes/delhi-airport-to-prayagraj-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-bareilly-taxi', destination: '/routes/delhi-airport-to-bareilly-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-moradabad-taxi', destination: '/routes/delhi-airport-to-moradabad-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-gorakhpur-taxi', destination: '/routes/delhi-airport-to-gorakhpur-taxi', permanent: true },
      { source: '/routes/gurugram-airport-to-aligarh-taxi', destination: '/routes/delhi-airport-to-aligarh-taxi', permanent: true },
      
      // Direct vanity path redirects without /routes/ prefix
      { source: '/gurugram-airport-to-agra-taxi', destination: '/routes/delhi-airport-to-agra-taxi', permanent: true },
      { source: '/gurugram-airport-to-mathura-taxi', destination: '/routes/delhi-airport-to-mathura-taxi', permanent: true },
      { source: '/gurugram-airport-to-vrindavan-taxi', destination: '/routes/delhi-airport-to-vrindavan-taxi', permanent: true },
      { source: '/gurugram-airport-to-lucknow-taxi', destination: '/routes/delhi-airport-to-lucknow-taxi', permanent: true },
      { source: '/gurugram-airport-to-kanpur-taxi', destination: '/routes/delhi-airport-to-kanpur-taxi', permanent: true },
      { source: '/gurugram-airport-to-varanasi-taxi', destination: '/routes/delhi-airport-to-varanasi-taxi', permanent: true },
      { source: '/gurugram-airport-to-ayodhya-taxi', destination: '/routes/delhi-airport-to-ayodhya-taxi', permanent: true },
      { source: '/gurugram-airport-to-prayagraj-taxi', destination: '/routes/delhi-airport-to-prayagraj-taxi', permanent: true },
      { source: '/gurugram-airport-to-bareilly-taxi', destination: '/routes/delhi-airport-to-bareilly-taxi', permanent: true },
      { source: '/gurugram-airport-to-moradabad-taxi', destination: '/routes/delhi-airport-to-moradabad-taxi', permanent: true },
      { source: '/gurugram-airport-to-gorakhpur-taxi', destination: '/routes/delhi-airport-to-gorakhpur-taxi', permanent: true },
      { source: '/gurugram-airport-to-aligarh-taxi', destination: '/routes/delhi-airport-to-aligarh-taxi', permanent: true },

      // Common non-suffix legacy routes -> canonical -taxi routes
      { source: '/routes/delhi-to-haridwar', destination: '/routes/delhi-to-haridwar-taxi', permanent: true },
      { source: '/routes/delhi-to-dehradun', destination: '/routes/delhi-to-dehradun-taxi', permanent: true },
      { source: '/routes/delhi-to-haldwani', destination: '/routes/delhi-to-haldwani-taxi', permanent: true },
      { source: '/routes/delhi-to-rishikesh', destination: '/routes/delhi-to-rishikesh-taxi', permanent: true },
      { source: '/routes/delhi-to-shimla', destination: '/routes/delhi-to-shimla-taxi', permanent: true },
      { source: '/routes/delhi-to-agra', destination: '/routes/delhi-to-agra-taxi', permanent: true },
      { source: '/routes/delhi-to-jaipur', destination: '/routes/delhi-to-jaipur-taxi', permanent: true },
      { source: '/routes/delhi-to-nainital', destination: '/routes/delhi-to-nainital-taxi', permanent: true },
      { source: '/routes/delhi-to-chandigarh', destination: '/routes/delhi-to-chandigarh-taxi', permanent: true },
      { source: '/routes/delhi-to-manali', destination: '/routes/delhi-to-manali-taxi', permanent: true },
      { source: '/routes/delhi-to-amritsar', destination: '/routes/delhi-to-amritsar-taxi', permanent: true },
      { source: '/routes/delhi-to-lucknow', destination: '/routes/delhi-to-lucknow-taxi', permanent: true },
      { source: '/routes/delhi-to-ayodhya', destination: '/routes/delhi-to-ayodhya-taxi', permanent: true },
      { source: '/routes/delhi-to-varanasi', destination: '/routes/delhi-to-varanasi-taxi', permanent: true },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};

export default nextConfig;


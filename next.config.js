/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
      },
      {
        protocol: 'https',
        hostname: 'xyz-api.animein.net',
      },
      {
        protocol: 'https',
        hostname: 'api.animein.net',
      },
      {
        protocol: 'https',
        hostname: '**.animein.net',
      },
    ],
  },
};

module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        // ADDED: Allow images from Google's main domain for the favicon
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

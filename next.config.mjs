

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@ckeditor/ckeditor5-build-classic'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'savemaxbc.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ddfcdn.realtor.ca',
        pathname: '**',
      },
    ],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
}



export default nextConfig

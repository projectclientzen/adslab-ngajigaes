/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // skip ESLint during build — run separately via `npm run lint`
  },
  typescript: {
    ignoreBuildErrors: false, // keep TypeScript errors as build failures
  },
}
module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['geist'],
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
}

module.exports = nextConfig

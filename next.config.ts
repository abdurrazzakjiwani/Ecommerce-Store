import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000')

const nextConfig: NextConfig = {
  images: {
    // Generated Payload image sizes are served through the API by default. When the
    // S3 adapter is enabled, filenames resolve to object storage instead and the
    // remotePatterns entry below covers them.
    qualities: [75, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },

  // sharp ships native binaries and must not be bundled by webpack.
  serverExternalPackages: ['sharp'],

  // Windows: Turbopack cannot resolve Payload's SCSS without an explicit load path.
  // See https://github.com/vercel/next.js/issues/86431
  sassOptions: {
    loadPaths: ['./node_modules/@payloadcms/ui/dist/scss/'],
  },

  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },

  reactStrictMode: true,

  turbopack: {
    root: path.resolve(dirname),
  },

  env: {
    NEXT_PUBLIC_SERVER_URL: SERVER_URL,
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

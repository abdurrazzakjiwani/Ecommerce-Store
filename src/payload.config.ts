import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Categories } from './collections/Categories'
import { Customers } from './collections/Customers'
import { Media } from './collections/Media'
import { Messages } from './collections/Messages'
import { Orders } from './collections/Orders'
import { Posts } from './collections/Posts'
import { Products } from './collections/Products'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Public base URL for media served straight from object storage.
 *
 * Vercel Blob stores are created as public in the Vercel dashboard, which yields
 * URLs of the form https://<store>.public.blob.vercel-storage.com/<path>. When
 * this variable is absent we fall back to Payload's own file route, which still
 * works but proxies bytes through the serverless function.
 */
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL?.replace(/\/$/, '')

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' - Storefront Admin',
    },
  },

  collections: [
    Users,
    Customers,
    Media,
    Categories,
    Products,
    Orders,
    Messages,
    Posts,
  ],

  globals: [SiteSettings],

  db: postgresAdapter({
    pool: {
      // MUST be the pooled Neon connection string, not the direct one.
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  editor: lexicalEditor(),

  // Explicitly configured on purpose. An unconfigured adapter falls back to an
  // ephemeral development service that prints credentials to the console, which
  // reads like working delivery but is not. See research.md decision D9.
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.RESEND_FROM || 'onboarding@resend.dev',
    defaultFromName: process.env.RESEND_FROM_NAME || 'Storefront Enquiries',
  }),

  plugins: [
    /**
     * Durable media storage.
     *
     * MANDATORY, not an optimisation. Vercel's local disk does not survive a
     * redeploy, so local storage means the client's product images silently
     * disappear on the next deploy. Enabling this adapter sets
     * `disableLocalStorage: true`, which is the actual guarantee.
     *
     * `clientUploads` is equally mandatory. Vercel caps proxied server-side
     * uploads at 4.5MB and modern phone photographs exceed that, so uploads must
     * go directly from the browser to storage. This REQUIRES a CORS policy on the
     * bucket allowing PUT from the site origin - see quickstart.md Step 3.
     */
    s3Storage({
      bucket: process.env.S3_BUCKET || '',
      // Vercel Blob supports compositional prefixes, so store the full object
      // path and build public URLs from it directly.
      useCompositePrefixes: true,
      disableLocalStorage: true,
      clientUploads: {
        // Only the signed-in owner may request upload instructions. Uploads are
        // an admin capability, never a public one (Principle IV).
        access: ({ req }) => Boolean(req.user),
      },
      collections: {
        media: {
          generateFileURL: ({ filename, prefix }) => {
            if (!S3_PUBLIC_URL) return `${filename}`
            return `${S3_PUBLIC_URL}/${prefix ? `${prefix}/` : ''}${filename}`
          },
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
        region: process.env.AWS_REGION || 'auto',
        endpoint: process.env.AWS_ENDPOINT || '',
      },
    }),
  ],

  secret: process.env.PAYLOAD_SECRET || '',

  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  /**
   * Project-wide upload ceiling. In Payload 3 this is a global setting rather
   * than a per-collection one.
   *
   * Kept above the 4.5MB Vercel server-side cap on purpose: `clientUploads`
   * sends the file straight from the browser to object storage, so the
   * serverless function's limit does not apply. This ceiling is a guard against
   * unbounded uploads, not a workaround for the platform cap.
   */
  upload: {
    limits: {
      fileSize: Number(process.env.S3_UPLOAD_MAX_SIZE ?? 10_485_760),
    },
  },

  sharp,

  telemetry: false,

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

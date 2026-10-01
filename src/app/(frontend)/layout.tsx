import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'

import { Footer } from '@/components/layout/Footer'
import { SiteSettingsProvider } from '@/components/layout/SiteSettingsProvider'
import { StorefrontShell } from '@/components/layout/StorefrontShell'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { WhatsAppFab } from '@/components/layout/WhatsAppFab'
import { getSiteSettings } from '@/lib/catalog'

import './globals.css'

/*
 * Both fonts are variable and loaded through next/font, which self-hosts them and
 * applies `font-display: swap` with a metric-matched fallback. That avoids the
 * layout shift a render-blocking Google Fonts request would cause.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const base = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  return {
    // Required for social and Open Graph images to resolve to absolute URLs.
    metadataBase: new URL(base),
    description: settings.tagline,
    title: {
      default: `${settings.businessName} - ${settings.tagline}`,
      template: `%s - ${settings.businessName}`,
    },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <html className={`${spaceGrotesk.variable} ${dmSans.variable}`} lang="en">
      <body className="flex min-h-dvh flex-col">
        {/*
          Business identity is resolved once, here, from the site-settings global
          and provided downward. No component reads a business value from
          anywhere else.
        */}
        <SiteSettingsProvider value={settings}>
          <StorefrontShell>
            <main className="flex-1">{children}</main>
          </StorefrontShell>

          <Footer settings={settings} />
          {/*
        One WhatsApp action, sized for the viewport: a labelled button where there is
        room for the label, and the standalone mark on a phone where a label would
        crowd the edge. Both render the official mark on a legal background - see
        WhatsAppButton and WhatsAppFab for the measured contrast reasoning.
      */}
      <div className="sm:hidden">
        <WhatsAppFab />
      </div>
      <div className="hidden sm:block">
        <WhatsAppButton />
      </div>
        </SiteSettingsProvider>
      </body>
    </html>
  )
}

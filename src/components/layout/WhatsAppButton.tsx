'use client'

import { MessageCircle } from 'lucide-react'

import { buildWaLink } from '@/lib/whatsapp'
import { useSiteSettings } from './SiteSettingsProvider'

/**
 * Persistent support control, present on every page.
 *
 * Presentational only: it links to WhatsApp and never sends anything itself.
 * The link text is intentionally generic, because the number may not yet be
 * configured and a specific label would then be misleading.
 */
export function WhatsAppButton({ label = 'Chat with us' }: { label?: string }) {
  const settings = useSiteSettings()
  const href = buildWaLink(settings.whatsappNumber, `Hello ${settings.businessName}, I have a question.`)

  return (
    <div className="support-dock">
      <a
        className="flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-white shadow-lg transition-transform duration-200 hover:scale-[1.02] motion-reduce:hover:scale-100"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        <MessageCircle aria-hidden="true" size={18} />
        <span className="hidden sm:inline">{label}</span>
        <span className="sr-only sm:hidden">{label}</span>
      </a>
    </div>
  )
}

'use client'

import { createContext, useContext } from 'react'

import type { SiteSettings } from '@/lib/types'

/**
 * The single source of business identity for every client component.
 *
 * Principle I requires that no component read a business value from anywhere
 * else - not a constant, not an environment variable, not a prop default. The
 * server layout resolves the `site-settings` global once and provides it here;
 * components consume it and nothing else.
 */
const SiteSettingsContext = createContext<SiteSettings | null>(null)

export function SiteSettingsProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: SiteSettings
}) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings(): SiteSettings {
  const settings = useContext(SiteSettingsContext)

  if (!settings) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }

  return settings
}

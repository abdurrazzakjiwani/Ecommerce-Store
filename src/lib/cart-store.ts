'use client'

import { create } from 'zustand'
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware'
import { z } from 'zod'

import type { AddressInput } from './address'
import type { PriceType, Product } from './types'

/**
 * Persisted shape, validated on read.
 *
 * Zustand's default JSON storage casts whatever it finds straight to the state
 * type with no runtime validation - Zustand's own documentation warns about this
 * and recommends exactly this approach. Without it, a stale or hand-edited value
 * in localStorage crashes the drawer on the next visit. Validating means the worst
 * case is a reset to an empty basket.
 */
const cartItemSchema = z.object({
  image: z.string().nullable(),
  price: z.number().nullable(),
  priceType: z.enum(['fixed', 'from', 'quote']),
  qty: z.number().int().min(1).max(999),
  slug: z.string().min(1),
  title: z.string().min(1),
})

const savedAddressSchema = z.object({
  city: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  notes: z.string().optional(),
  postalCode: z.string(),
  province: z.string(),
})

const persistedSchema = z.object({
  items: z.array(cartItemSchema).max(50),
  savedAddress: savedAddressSchema.nullable(),
})

export type CartItem = z.infer<typeof cartItemSchema>
export type SavedAddress = z.infer<typeof savedAddressSchema>

/** The subset of state written to localStorage. */
type PersistedState = {
  items: CartItem[]
  savedAddress: SavedAddress | null
}

const STORAGE_VERSION = 1

/**
 * Storage adapter that validates on read.
 *
 * Returns `null` for anything malformed, which makes Zustand fall back to the
 * initial state rather than adopting a value that would throw on first render.
 */
const storage: PersistStorage<PersistedState> = {
  getItem: (name): StorageValue<PersistedState> | null => {
    if (typeof window === 'undefined') return null

    const raw = window.localStorage.getItem(name)
    if (raw === null) return null

    try {
      const parsed = JSON.parse(raw) as { state?: unknown }
      const result = persistedSchema.safeParse(parsed.state)

      if (!result.success) return null

      // Zustand's StorageValue is the { state, version } envelope, not the bare
      // state, so the validated result is re-wrapped here.
      return { state: result.data, version: STORAGE_VERSION }
    } catch {
      return null
    }
  },

  removeItem: (name) => {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(name)
  },

  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(name, JSON.stringify(value))
  },
}

type CartState = {
  add: (product: Product, qty?: number) => void
  clear: () => void

  hasHydrated: boolean
  items: CartItem[]
  remove: (slug: string) => void

  savedAddress: SavedAddress | null
  saveAddress: (address: AddressInput | SavedAddress | null) => void
  setHasHydrated: (value: boolean) => void
  setQty: (slug: string, qty: number) => void
  totalCount: () => number
}

export const useCartStore = create<CartState>()(
  persist<CartState, [], [], PersistedState>(
    (set, get) => ({
      hasHydrated: false,
      items: [],
      savedAddress: null,

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.slug === product.slug)

          if (existing) {
            // Merge rather than duplicate, and clamp so a repeated tap cannot
            // produce a quantity of 1000 by accident.
            return {
              items: state.items.map((item) =>
                item.slug === product.slug
                  ? { ...item, qty: Math.min(item.qty + qty, 999) }
                  : item,
              ),
            }
          }

          return {
            items: [
              ...state.items,
              {
                image: product.images[0] ?? null,
                price: product.price,
                priceType: product.priceType,
                qty: Math.max(1, Math.min(qty, 999)),
                slug: product.slug,
                title: product.title,
              },
            ],
          }
        }),

      clear: () => set({ items: [] }),

      remove: (slug) =>
        set((state) => ({ items: state.items.filter((item) => item.slug !== slug) })),

      saveAddress: (address) => set({ savedAddress: address }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setQty: (slug, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.slug === slug ? { ...item, qty: Math.max(1, Math.min(qty, 999)) } : item,
          ),
        })),

      totalCount: () => get().items.reduce((total, item) => total + item.qty, 0),
    }),
    {
      name: 'yourbrand-cart',
      /**
       * Required for server-rendered pages. Without it the server renders an
       * empty basket and the client renders a populated one, which React reports
       * as a hydration mismatch and which makes the basket count visibly jump.
       */
      skipHydration: true,
      storage,
      partialize: (state) => ({ items: state.items, savedAddress: state.savedAddress }),
      version: STORAGE_VERSION,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

/**
 * Whether a line contributes to the subtotal.
 *
 * The basket holds a price snapshot purely so the drawer can render a total
 * without a round trip. The authoritative total is recomputed from the catalogue
 * at checkout, so a tampered localStorage value cannot dictate what the business
 * is quoted.
 */
export function priceTypeAllowsTotal(priceType: PriceType, price: number | null): boolean {
  return priceType !== 'quote' && price !== null
}

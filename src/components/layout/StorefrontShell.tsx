'use client'

import { useState } from 'react'

import { CartDrawer } from '@/components/cart/CartDrawer'
import { Header } from '@/components/layout/Header'

/**
 * Client boundary for the two interactive chrome elements: the header (which owns
 * the basket trigger) and the basket drawer itself.
 *
 * `children` is passed in from the server layout and stays server-rendered, so
 * the page content is not dragged into the client bundle.
 */
export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <Header onOpenCart={() => setCartOpen(true)} />
      {children}
      <CartDrawer onClose={() => setCartOpen(false)} open={cartOpen} />
    </>
  )
}

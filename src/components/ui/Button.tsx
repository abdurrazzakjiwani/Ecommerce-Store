import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp'
type Size = 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  // Amber background with white text: 4.91:1, passes WCAG AA.
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-surface text-text border border-border hover:border-accent',
  ghost: 'text-text hover:bg-muted',
  /*
   * WhatsApp actions only. Teal rather than brand green, because the mark beside it
   * is the official glyph and Meta forbids recolouring it, so the background has to
   * carry the contrast instead. Measured: unmodified brand-green mark 3.87:1, white
   * label 7.67:1. The two obvious alternatives fail - white on brand green is
   * 1.98:1, and brand green on cream is 1.91:1. See research.md D2 and
   * src/tests/contrast.test.ts.
   */
  // Hover darkens rather than brightens. Hovering to brand green is the trap here:
  // white on #25D366 measures 1.98:1 and the green mark on green is 1:1, so the mark
  // would disappear and the label would fail contrast on exactly the state a visitor
  // enters deliberately. A slightly darker teal keeps both legal.
  whatsapp: 'bg-whatsapp-deep text-white hover:bg-[#053f3a]',
}

const SIZES: Record<Size, string> = {
  // 44px minimum hit area on both axes, per WCAG-referenced target guidance.
  md: 'min-h-11 px-4 py-2 text-sm',
  lg: 'min-h-12 px-6 py-3 text-base',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-55 whitespace-nowrap'

type SharedProps = {
  children: ReactNode
  className?: string
  size?: Size
  variant?: Variant
}

export function Button({
  children,
  className,
  size = 'md',
  variant = 'primary',
  ...rest
}: SharedProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      type="button"
      {...rest}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  className,
  href,
  size = 'md',
  variant = 'primary',
  ...rest
}: SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      href={href}
      {...rest}
    >
      {children}
    </Link>
  )
}

/**
 * External link that opens in a new tab.
 *
 * `rel="noopener noreferrer"` is not optional: without it the opened page gets a
 * handle on `window.opener` and can navigate this tab. This is how the WhatsApp
 * links are rendered.
 */
export function ButtonExternal({
  children,
  className,
  href,
  size = 'md',
  variant = 'primary',
  ...rest
}: SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...rest}
    >
      {children}
    </a>
  )
}

'use client'

import { X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/cn'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Slide-over panel used by the basket and mobile navigation.
 *
 * Accessibility behaviour that is easy to omit and immediately noticeable when
 * missing:
 * - Focus moves into the panel on open and returns to the invoking control on
 *   close, so keyboard users are not dumped back at the top of the page.
 * - Tab is trapped inside the panel while open.
 * - Escape closes it.
 * - Background scroll is locked, and the page behind is marked aria-hidden.
 */
export function Sheet({
  children,
  onClose,
  open,
  side = 'right',
  title,
}: {
  children: React.ReactNode
  onClose: () => void
  open: boolean
  side?: 'left' | 'right'
  title: string
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null)

      if (focusable.length === 0) return

      const first = focusable[0] as HTMLElement
      const last = focusable[focusable.length - 1] as HTMLElement

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return

    restoreFocusTo.current = document.activeElement as HTMLElement | null

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    document.addEventListener('keydown', handleKeyDown)

    // Defer so the panel has mounted before we reach into it.
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
      target?.focus()
    }, 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
      window.clearTimeout(timer)
      restoreFocusTo.current?.focus()
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-hidden="true"
        className="absolute inset-0 h-full w-full cursor-default bg-primary/40"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />

      <div
        aria-label={title}
        aria-modal="true"
        className={cn(
          'absolute inset-y-0 flex w-full max-w-md flex-col bg-bg shadow-2xl',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          'border-border',
        )}
        ref={panelRef}
        role="dialog"
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button
            aria-label={`Close ${title.toLowerCase()}`}
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-muted"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  )
}

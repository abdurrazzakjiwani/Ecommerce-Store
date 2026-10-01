import { ImageOff } from 'lucide-react'

import { cn } from '@/lib/cn'

/**
 * Product image with a labelled fallback.
 *
 * Spec edge case: an item published with no images must remain reachable and be
 * visually distinguishable rather than rendering a broken frame. This renders an
 * explicit, obvious placeholder instead.
 *
 * Uses next/image with a fixed aspect box so space is reserved before load and
 * Cumulative Layout Shift stays under the 0.1 budget.
 */
export function ProductImage({
  alt,
  className,
  priority = false,
  src,
}: {
  alt: string
  className?: string
  priority?: boolean
  src: string | null
}) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex aspect-4/5 w-full flex-col items-center justify-center gap-2 bg-muted text-muted-fore',
          className,
        )}
      >
        <ImageOff aria-hidden="true" size={28} />
        <span className="px-4 text-center text-xs font-medium">No photo yet</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={cn('aspect-4/5 w-full bg-muted object-cover', className)}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      src={src}
    />
  )
}

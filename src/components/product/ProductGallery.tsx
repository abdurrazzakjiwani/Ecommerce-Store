'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import { ProductImage } from './ProductImage'

/**
 * Scrollable image gallery for a product card or detail page.
 *
 * Accessibility decisions that matter:
 * - The viewport is a labelled `region`, and a polite live region announces
 *   "Image 2 of 4" so a screen-reader user knows where they are without relying
 *   on the dots.
 * - Previous/next are real buttons with accessible names, disabled at the ends,
 *   so the control is keyboard operable and its state is announced.
 * - Dots are buttons, not decorative spans.
 *
 * `aspect-4/5` reserves the box before images load, holding CLS down.
 */
export function ProductGallery({
  alt,
  className,
  images,
  showControls = true,
}: {
  alt: string
  className?: string
  images: string[]
  showControls?: boolean
}) {
  const [selected, setSelected] = useState(0)

  // Embla v8 exposes events on the instance (`on`/`off`), not as options.
  // The listener only calls setState on an actual event, so nothing is set
  // synchronously while the effect runs.
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: false })

  useEffect(() => {
    if (!emblaApi) return

    const sync = () => setSelected(emblaApi.selectedScrollSnap())

    emblaApi.on('select', sync)
    emblaApi.on('reInit', sync)

    return () => {
      emblaApi.off('select', sync)
      emblaApi.off('reInit', sync)
    }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const hasMultiple = images.length > 1

  return (
    <div className={cn('relative', className)}>
      {images.length === 0 ? (
        <ProductImage alt={alt} src={null} />
      ) : (
        <>
          <div
            aria-label={`${alt} images`}
            aria-roledescription="carousel"
            className="overflow-hidden rounded-xl"
            ref={emblaRef}
            role="region"
          >
            <div className="flex touch-pan-y">
              {images.map((src, index) => (
                <div className="min-w-0 flex-[0_0_100%]" key={`${src}-${index}`}>
                  <ProductImage
                    alt={`${alt}, image ${index + 1} of ${images.length}`}
                    src={src}
                  />
                </div>
              ))}
            </div>
          </div>

          {/*
            Announced politely as the slide changes, so the user does not have to
            interrogate the dots to know their position.
          */}
          <p aria-live="polite" className="sr-only">
            Image {selected + 1} of {images.length}
          </p>

          {hasMultiple && showControls ? (
            <>
              <button
                aria-label="Previous image"
                className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-text shadow-md transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-0"
                disabled={selected === 0}
                onClick={scrollPrev}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </button>

              <button
                aria-label="Next image"
                className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-surface/90 text-text shadow-md transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-0"
                disabled={selected === images.length - 1}
                onClick={scrollNext}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={18} />
              </button>

              <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                {images.map((src, index) => (
                  <button
                    aria-label={`Go to image ${index + 1}`}
                    aria-pressed={index === selected}
                    className="h-2.5 w-2.5 cursor-pointer rounded-full bg-primary/30 transition-colors hover:bg-primary/50 aria-pressed:bg-accent"
                    key={`dot-${src}-${index}`}
                    onClick={() => emblaApi?.scrollTo(index)}
                    type="button"
                  />
                ))}
              </div>
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

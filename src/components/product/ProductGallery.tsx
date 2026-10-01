'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { CyclingControl } from '@/components/layout/CyclingControl'
import { cn } from '@/lib/cn'
import { onReducedMotionChange, prefersReducedMotion } from '@/lib/motion'
import { ProductImage } from './ProductImage'

/**
 * Scrollable image gallery for a product card or detail page.
 *
 * ============================================================================
 * THE autoPlay PROP IS LOAD-BEARING. DO NOT DEFAULT IT TO true.
 * ============================================================================
 *
 * FR-015 requires that images on catalogue cards never advance on their own, while
 * item detail pages may cycle. Only `app/(frontend)/products/[slug]/page.tsx` is
 * permitted to pass `autoPlay`. Everything else inherits `false`.
 *
 * This is a performance and accessibility decision, not a preference. The catalogue
 * holds ~24 products. A page of results with 24 concurrently autoplaying carousels
 * would mean 24 timers, 24 `aria-live` position announcements firing on a loop, and
 * 24 separate pause controls needed to satisfy WCAG 2.2.2. Defaulting to `false` means
 * a future contributor adding a carousel to a card has to opt *in* to motion rather
 * than inherit it, so the prohibition survives contact with someone who has not read
 * the specification.
 *
 * ============================================================================
 * WHY STICKY PAUSE CANNOT BE DELEGATED TO THE PLUGIN
 * ============================================================================
 *
 * FR-019: once a visitor pauses the carousel themselves, it must stay paused. The
 * obvious configuration - `stopOnMouseEnter: true` with `stopOnInteraction: false` -
 * does NOT deliver this. Per the plugin's documented behaviour, mouse-enter resume
 * only happens when `stopOnInteraction` is false, and in that configuration the
 * plugin restarts itself after *every* drag or click. So a visitor who pauses, then
 * drags the carousel, would have it start again behind their back.
 *
 * The plugin exposes only `play(jump?)` and `stop()`; there is no `isPlaying()`.
 * So the state is owned here, in `userPaused`, and the single rule is:
 *
 *     nothing calls play() while userPaused is true
 *
 * Not on pointer-out, not on focus-out, not on re-render, not on remount.
 * `playOnInit: false` additionally lets the reduced-motion check run before the
 * first tick, so FR-017 ("MUST NOT begin") is satisfied literally rather than
 * cancelled milliseconds later.
 *
 * See specs/002-polish-storefront/research.md D3 and data-model.md for the state
 * machine.
 */

/** Five images cycle; anything beyond stays reachable as thumbnails. See FR-017. */
const MAX_CYCLED_IMAGES = 5

/** 5000ms against SC-004's five-second ceiling. Leaves margin; calmer for photos. */
const CYCLE_DELAY_MS = 5000

export type ProductGalleryProps = {
  alt: string
  className?: string
  images: string[]
  showControls?: boolean
  /**
   * Whether images may advance on their own. Defaults to false - see the note above.
   * Only the item detail page passes true.
   */
  autoPlay?: boolean
  /** Overridable for tests. Defaults to MAX_CYCLED_IMAGES. */
  maxCycledImages?: number
}

export function ProductGallery({
  alt,
  className,
  images,
  showControls = true,
  autoPlay = false,
  maxCycledImages = MAX_CYCLED_IMAGES,
}: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  /*
   * Reduced motion, read through useSyncExternalStore rather than copied into state
   * by an effect. This matters for FR-017: the value has to be known before the first
   * tick, and a subscription keeps it live if the visitor changes the preference while
   * the page is open. The server snapshot is alse, so the first client render
   * matches the server and there is no hydration mismatch; React then re-renders with
   * the real value before the carousel is allowed to start.
   */
  const reducedMotion = useSyncExternalStore(
    onReducedMotionChange,
    prefersReducedMotion,
    () => false,
  )

  /**
   * Sticky manual pause. Separate from any transient "held" state the plugin manages
   * for pointer and focus, because this one only clears on an explicit resume.
   */
  const [userPaused, setUserPaused] = useState(false)

  // Mirrors `userPaused` for the plugin callbacks, which are created once and would
  // otherwise close over the initial value. Written in an effect rather than during
  // render, per the react-hooks/refs rule.
  const userPausedRef = useRef(false)
  useEffect(() => {
    userPausedRef.current = userPaused
  }, [userPaused])



  // Cycling needs at least two images. One image has nothing to cycle through, and
  // zero renders a placeholder with no controls at all (FR-021, FR-022).
  const cyclingAllowed = autoPlay && images.length > 1 && !reducedMotion

  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: CYCLE_DELAY_MS,
        // Start manually, so the reduced-motion check has already run by the time the
        // first tick is scheduled. See the note above.
        playOnInit: false,
        // Focus pause is handled by the plugin; pointer pause and sticky pause are
        // ours, because the plugin's interaction-restart path is what breaks FR-019.
        stopOnFocusIn: true,
        stopOnInteraction: true,
        stopOnMouseEnter: false,
      }),
    [],
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', loop: false },
    cyclingAllowed ? [autoplayPlugin] : [],
  )

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

  /** Images that participate in cycling. Any remainder stay reachable below. */
  const cycledCount = Math.min(images.length, maxCycledImages)
  const overflowCount = images.length - cycledCount

  /**
   * The plugin bails out of initialisation when there is only one scroll snap, leaving
   * its internal delay table unbuilt. Calling `play()` in that state throws rather
   * than no-op, so every call is gated on there actually being somewhere to go.
   *
   * This is not only a test-environment concern: a single measured slide, or slides
   * that fail to measure, produces the same state in a real browser.
   */
  const canCycle = useCallback(() => {
    if (!emblaApi) return false
    try {
      return emblaApi.scrollSnapList().length > 1
    } catch {
      return false
    }
  }, [emblaApi])

  const startCycling = useCallback(() => {
    if (!emblaApi || !cyclingAllowed) return
    if (userPausedRef.current || reducedMotion) return
    if (!canCycle()) return
    emblaApi.plugins().autoplay?.play()
  }, [emblaApi, cyclingAllowed, reducedMotion, canCycle])

  const stopCycling = useCallback(() => {
    if (!emblaApi) return
    // `stop` is safe even when the plugin never initialised, but guard anyway so a
    // missing instance can never throw during teardown.
    try {
      emblaApi.plugins().autoplay?.stop()
    } catch {
      // Nothing to stop.
    }
  }, [emblaApi])



  // Honour the preference: never *begin* cycling under reduced motion (FR-017).
  useEffect(() => {
    if (!emblaApi || !cyclingAllowed) {
      stopCycling()
      return
    }
    startCycling()
  }, [emblaApi, cyclingAllowed, reducedMotion, startCycling, stopCycling])

  // Pointer pause. Resume on pointer-out ONLY if the visitor has not paused manually
  // (FR-018, FR-019).
  useEffect(() => {
    if (!emblaApi || !cyclingAllowed) return

    const node = emblaApi.rootNode()
    if (!node) return

    const handleEnter = () => stopCycling()
    const handleLeave = () => {
      if (!userPausedRef.current) startCycling()
    }

    node.addEventListener('mouseenter', handleEnter)
    node.addEventListener('mouseleave', handleLeave)

    return () => {
      node.removeEventListener('mouseenter', handleEnter)
      node.removeEventListener('mouseleave', handleLeave)
    }
  }, [emblaApi, cyclingAllowed, startCycling, stopCycling])

  const toggleCycling = useCallback(() => {
    if (userPaused) {
      setUserPaused(false)
      startCycling()
    } else {
      setUserPaused(true)
      stopCycling()
    }
  }, [userPaused, startCycling, stopCycling])

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
            <div className="flex touch-pan-y" data-testid="track">
              {images.map((src, index) => (
                <div
                  className="min-w-0 flex-[0_0_100%]"
                  data-testid="slide"
                  key={`${src}-${index}`}
                >
                  <ProductImage
                    alt={`${alt}, image ${index + 1} of ${images.length}`}
                    src={src}
                  />
                </div>
              ))}
            </div>
          </div>

          {/*
            Announced politely as the slide changes, so a visitor who cannot see the
            images change still knows where they are. This is the "image 2 of 4"
            requirement - it must not be limited to the cycling case, because manual
            browsing has the same need.
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

              {/* The WCAG 2.2.2 pause control, rendered only while cycling is possible. */}
              {cyclingAllowed ? (
                <div className="absolute right-2 top-2">
                  <CyclingControl
                    label="Pause image carousel"
                    onToggle={toggleCycling}
                    paused={userPaused}
                  />
                </div>
              ) : null}

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

          {/*
            An over-full set must not silently lose images. Only the first five cycle,
            and the rest are listed here so every one stays reachable (FR-017).
          */}
          {overflowCount > 0 ? (
            <details className="mt-3 rounded-lg border border-border bg-surface p-3">
              <summary className="cursor-pointer text-sm font-medium text-text">
                {overflowCount} more image{overflowCount === 1 ? '' : 's'} not shown above
              </summary>
              <ul className="mt-2 grid grid-cols-3 gap-2">
                {images.slice(cycledCount).map((src, index) => (
                  <li key={`overflow-${src}-${index}`}>
                    <ProductImage
                      alt={`${alt}, additional image ${cycledCount + index + 1} of ${images.length}`}
                      src={src}
                    />
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </div>
  )
}

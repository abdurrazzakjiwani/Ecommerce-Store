'use client'

import { Pause, Play } from 'lucide-react'

export type CyclingControlProps = {
  /** Whether the carousel is currently advancing. Drives the label and the icon. */
  paused: boolean
  onToggle: () => void
  /** Accessible name for the button, e.g. "Pause image carousel". */
  label: string
  className?: string
}

/**
 * The visible pause control for an auto-cycling image carousel.
 *
 * WCAG 2.2.2 requires that automatically moving content can be paused. A carousel
 * that cycles with no visible control excludes anyone who cannot tolerate movement,
 * so this control is not optional decoration - it is the mechanism the requirement
 * asks for, and it is rendered whenever cycling is active.
 *
 * WHY THE STATE COMES FROM PROPS RATHER THAN THE PLUGIN:
 * `embla-carousel-autoplay` exposes only `play(jump?)` and `stop()`. There is no
 * `isPlaying()` to read back, so this button cannot ask the carousel what it is
 * doing. The owner of the state - the gallery - passes it down, which also means the
 * sticky-pause rule and this control cannot disagree with each other.
 *
 * Touch target is 44x44 (WCAG-referenced comfortable size, constitution Principle V).
 */
export function CyclingControl({ paused, onToggle, label, className }: CyclingControlProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={paused ? label.replace(/^pause/i, 'Resume') : label}
      // Conveys pressed state to assistive technology, so the current mode is not
      // something a screen reader user has to infer from the label text.
      aria-pressed={paused}
      className={[
        'inline-flex h-11 w-11 items-center justify-center rounded-full',
        'border border-border bg-surface/95 text-text shadow-sm backdrop-blur',
        'transition-colors hover:bg-surface',
        'motion-reduce:transition-none',
        className ?? '',
      ].join(' ')}
    >
      {paused ? (
        <Play aria-hidden="true" size={18} className="translate-x-px" />
      ) : (
        <Pause aria-hidden="true" size={18} className="-translate-x-px" />
      )}
    </button>
  )
}

export default CyclingControl

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ProductGallery } from '@/components/product/ProductGallery'

/**
 * Carousel behaviour, and specifically the requirement set most likely to break
 * silently: FR-015 through FR-020.
 *
 * WHY THE CAROUSEL IS FAKED
 * -------------------------
 * `embla-carousel` measures slides with `offsetTop` / `offsetLeft` / `offsetWidth`, and
 * jsdom performs no layout, so every slide measures identically and the snap list comes
 * back empty. Probed directly: with all four geometry getters stubbed, Embla still
 * reported a snap list of length 0. Real geometry therefore cannot be simulated here.
 *
 * That makes the division of responsibility worth stating plainly. Embla's geometry is
 * Embla's concern and is covered by its own tests. What belongs to this component is
 * the decision logic - when cycling is permitted, who may stop it, whether a manual
 * pause survives - and all of that is testable against a fake that records what it was
 * asked to do. Mocking the library here is not a way to make a weak test pass; it is the
 * only way to assert the requirement at all.
 *
 * The fake reproduces the one behaviour that matters for FR-019: it records `play()`
 * and `stop()` calls, so "stayed paused" is an assertion about what the component
 * requested, not about a timer that may or may not have fired.
 *
 * FR-019 IS THE POINT
 * -------------------
 * `embla-carousel-autoplay` cannot express "a manual pause is sticky". With
 * `stopOnInteraction: false` the plugin restarts itself after *every* drag or click, and
 * mouse-enter resume only happens in that same configuration - so the settings that look
 * like they deliver pause-on-hover also silently defeat a manual pause. The gallery owns
 * this state instead, and these tests are what stop a future refactor from handing it
 * back.
 */

const play = vi.fn()
const stop = vi.fn()

vi.mock('embla-carousel-react', () => ({
  default: () => {
    const api = {
      scrollSnapList: () => [0, 1, 2, 3, 4, 5, 6],
      selectedScrollSnap: () => 0,
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      scrollTo: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      rootNode: () => document.querySelector('[aria-roledescription="carousel"]'),
      plugins: () => ({ autoplay: { play, stop } }),
    }
    return [vi.fn(), api]
  },
}))

const originalMatchMedia = window.matchMedia

function images(count: number) {
  return Array.from({ length: count }, (_, i) => `/placeholders/p${i + 1}.svg`)
}

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  play.mockClear()
  stop.mockClear()
  setReducedMotion(false)
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
})

describe('FR-015 cards never cycle', () => {
  it('renders no pause control when autoPlay is not requested', async () => {
    // This is the card case. With ~24 products a catalogue page must not mount 24
    // autoplaying carousels, and must not render 24 pause controls either.
    render(<ProductGallery alt="Item" autoPlay={false} images={images(4)} />)

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /item images/i })).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /pause|resume/i })).toBeNull()
  })

  it('defaults autoPlay to false when the prop is omitted', async () => {
    // The default is the load-bearing part of FR-015: a card that forgets to pass the
    // prop must still get a still carousel.
    render(<ProductGallery alt="Item" images={images(4)} />)

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /item images/i })).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /pause|resume/i })).toBeNull()
  })

  it('never calls play on the plugin for a card', async () => {
    render(<ProductGallery alt="Item" autoPlay={false} images={images(4)} />)

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /item images/i })).toBeInTheDocument()
    })
    expect(play).not.toHaveBeenCalled()
  })
})

describe('FR-016 a visible pause control', () => {
  it('renders the control when autoPlay is requested', async () => {
    // WCAG 2.2.2: automatically moving content must be pausable. The control is the
    // mechanism the requirement asks for, so its absence is the failure.
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    expect(await screen.findByRole('button', { name: /pause image carousel/i })).toBeInTheDocument()
  })

  it('gives it a 44px touch target (FR-014, SC-015)', async () => {
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })
    expect(control.className).toContain('h-11')
    expect(control.className).toContain('w-11')
  })

  it('starts cycling once mounted', async () => {
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause image carousel/i })).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(play).toHaveBeenCalled()
    })
  })

  it('renames to Resume once paused, and reports pressed state', async () => {
    const user = userEvent.setup()
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })
    expect(control).toHaveAttribute('aria-pressed', 'false')

    await user.click(control)

    const resumed = screen.getByRole('button', { name: /resume image carousel/i })
    expect(resumed).toHaveAttribute('aria-pressed', 'true')
  })

  it('is reachable and operable by keyboard', async () => {
    const user = userEvent.setup()
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })

    // Focus it directly, then activate with the keyboard rather than the mouse.
    control.focus()
    expect(control).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByRole('button', { name: /resume image carousel/i })).toBeInTheDocument()
  })
})

describe('FR-021 and FR-022 not enough images', () => {
  it('renders no pause control for a single image', async () => {
    // One image has nothing to cycle through, so the control would be noise.
    render(<ProductGallery alt="Item" autoPlay images={images(1)} />)

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /item images/i })).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /pause|resume/i })).toBeNull()
    expect(play).not.toHaveBeenCalled()
  })

  it('renders no carousel and no control for an item with no images', async () => {
    render(<ProductGallery alt="Item" autoPlay images={[]} />)

    expect(screen.getByText('No photo yet')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /item images/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /pause|resume/i })).toBeNull()
    expect(play).not.toHaveBeenCalled()
  })
})

describe('FR-017 reduced motion', () => {
  it('never begins cycling when the visitor has asked for reduced motion', async () => {
    setReducedMotion(true)
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    // No pause control exists, because cycling was never permitted to start. The
    // requirement is that it MUST NOT begin - not that it begins and is cancelled.
    expect(screen.queryByRole('button', { name: /pause|resume/i })).toBeNull()
    expect(play).not.toHaveBeenCalled()
  })

  it('still offers manual navigation', async () => {
    // Reduced motion removes the automatic movement, not the visitor's ability to
    // browse the images themselves.
    setReducedMotion(true)
    render(<ProductGallery alt="Item" autoPlay images={images(3)} />)

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /item images/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /next image/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go to image 2/i })).toBeInTheDocument()
  })
})

describe('FR-020 position announcement', () => {
  it('announces the current position in words, in a polite live region', async () => {
    // A visitor who cannot see the images change needs this.
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const status = screen.getByText('Image 1 of 4')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('announces position when cycling is off too, since manual browsing needs it', async () => {
    render(<ProductGallery alt="Item" images={images(2)} />)

    await waitFor(() => {
      expect(screen.getByText('Image 1 of 2')).toBeInTheDocument()
    })
  })

  it('counts the full image set, not just the cycled subset', async () => {
    // "Image 2 of 7" is the honest statement even though only five cycle.
    render(<ProductGallery alt="Item" autoPlay images={images(7)} />)

    expect(screen.getByText('Image 1 of 7')).toBeInTheDocument()
  })
})

describe('FR-017 image overflow', () => {
  it('keeps every image reachable and surfaces the overflow beyond five', async () => {
    // Nothing may be silently dropped from an over-full set.
    render(<ProductGallery alt="Item" autoPlay images={images(7)} />)

    for (let index = 1; index <= 7; index += 1) {
      expect(screen.getByRole('button', { name: `Go to image ${index}` })).toBeInTheDocument()
    }

    expect(screen.getByText(/2 more images not shown above/i)).toBeInTheDocument()
  })

  it('shows no overflow notice when the set is within the maximum', async () => {
    render(<ProductGallery alt="Item" autoPlay images={images(5)} />)

    expect(screen.queryByText(/not shown above/i)).toBeNull()
  })

  it('honours a custom maximum', async () => {
    render(<ProductGallery alt="Item" autoPlay images={images(6)} maxCycledImages={2} />)

    expect(screen.getByText(/4 more images not shown above/i)).toBeInTheDocument()
  })
})

describe('FR-019 sticky manual pause', () => {
  it('stops the carousel when the visitor pauses', async () => {
    const user = userEvent.setup()
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })
    play.mockClear()
    stop.mockClear()

    await user.click(control)

    expect(stop).toHaveBeenCalled()
    expect(play).not.toHaveBeenCalled()
  })

  it('stays paused after the pointer leaves the carousel', async () => {
    // THE requirement. A resume on mouse-out would silently defeat the pause the
    // visitor just asked for, and it is the failure the plugin cannot prevent.
    const user = userEvent.setup()
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })
    await user.click(control)

    const region = screen.getByRole('region', { name: /item images/i })
    play.mockClear()

    await user.pointer({ target: region })
    await user.pointer({ target: document.body })

    // The pointer leaving must not restart it.
    expect(play).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /resume image carousel/i })).toBeInTheDocument()
  })

  it('stays paused after focus leaves the carousel', async () => {
    const user = userEvent.setup()
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })
    await user.click(control)
    play.mockClear()

    // Tab well past the carousel controls.
    for (let i = 0; i < 8; i += 1) {
      await user.tab()
    }

    expect(play).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /resume image carousel/i })).toBeInTheDocument()
  })

  it('stays paused after a drag, which is the plugin interaction-restart path', async () => {
    // With stopOnInteraction false the plugin restarts after every drag. That is why
    // this state is owned here rather than delegated.
    const user = userEvent.setup()
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })
    await user.click(control)
    play.mockClear()

    const region = screen.getByRole('region', { name: /item images/i })
    await act(async () => {
      await user.pointer([
        { target: region, keys: '[MouseLeft>]', coords: { x: 200, y: 100 } },
        { target: region, coords: { x: 20, y: 100 } },
        { target: region, keys: '[/MouseLeft]' },
      ])
    })

    expect(play).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /resume image carousel/i })).toBeInTheDocument()
  })

  it('resumes only on an explicit resume action', async () => {
    const user = userEvent.setup()
    render(<ProductGallery alt="Item" autoPlay images={images(4)} />)

    const control = await screen.findByRole('button', { name: /pause image carousel/i })
    await user.click(control)
    expect(screen.getByRole('button', { name: /resume image carousel/i })).toBeInTheDocument()

    play.mockClear()
    await user.click(screen.getByRole('button', { name: /resume image carousel/i }))

    await waitFor(() => {
      expect(play).toHaveBeenCalled()
    })
    expect(screen.getByRole('button', { name: /pause image carousel/i })).toBeInTheDocument()
  })
})

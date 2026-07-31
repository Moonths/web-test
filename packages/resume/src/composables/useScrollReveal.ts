import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/** Walk up the DOM to find the nearest scrollable ancestor. */
function findScrollContainer(el: HTMLElement): HTMLElement | Window {
  let parent: HTMLElement | null = el.parentElement
  while (parent) {
    const style = getComputedStyle(parent)
    const overflowY = style.overflowY
    if (overflowY === 'auto' || overflowY === 'scroll') return parent
    parent = parent.parentElement
  }
  return window
}

/**
 * Tracks scroll progress within an element (0 = just entered viewport, 1 = about to leave).
 * Automatically detects the correct scroll container (window or nearest overflow:auto ancestor).
 */
export function useScrollReveal(
  elRef: Ref<HTMLElement | null>,
  options?: {
    factor?: number
    rootMargin?: string
  }
) {
  const progress = ref(0)
  const isVisible = ref(false)
  const hasBeenVisible = ref(false)

  let rafId = 0
  let ticking = false
  let scrollContainer: HTMLElement | Window = window

  function updateProgress() {
    const el = elRef.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight
    const factor = options?.factor ?? 1
    const threshold = vh * factor

    const raw = 1 - rect.top / threshold
    const clamped = Math.max(0, Math.min(1, raw))
    progress.value = clamped
    isVisible.value = clamped > 0 && clamped < 1

    if (clamped > 0.05) hasBeenVisible.value = true
    ticking = false
  }

  function onScroll() {
    if (!ticking) {
      rafId = requestAnimationFrame(() => {
        updateProgress()
        ticking = false
      })
      ticking = true
    }
  }

  onMounted(() => {
    const el = elRef.value
    if (el) {
      scrollContainer = findScrollContainer(el)
    }
    scrollContainer.addEventListener('scroll', onScroll, { passive: true } as any)
    updateProgress()
  })

  onUnmounted(() => {
    scrollContainer.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(rafId)
  })

  return { progress, isVisible, hasBeenVisible }
}

/**
 * Simple intersection observer — returns true when element enters viewport.
 */
export function useInView(
  elRef: Ref<HTMLElement | null>,
  options?: { threshold?: number; rootMargin?: string; once?: boolean }
) {
  const inView = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elRef.value) return

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView.value = true
          if (options?.once !== false) {
            observer?.unobserve(entry.target)
          }
        } else if (options?.once === false) {
          inView.value = false
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px 0px -10% 0px',
      }
    )
    observer.observe(elRef.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { inView }
}

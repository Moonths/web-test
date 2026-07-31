import { onMounted, onUnmounted, ref } from 'vue'

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

export const easeOutBack = (t: number) => {
  const c = 1.70158
  const u = t - 1
  return 1 + (c + 1) * u * u * u + c * u * u
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * One-shot in-view detection for reveal-on-scroll entrances.
 * Returns a template ref target and a reactive flag that flips once.
 */
export function useInView(threshold = 0.2) {
  const target = ref<HTMLElement | null>(null)
  const inView = ref(false)
  let io: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return
    if (prefersReducedMotion()) {
      inView.value = true
      return
    }
    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView.value = true
          io?.disconnect()
          io = null
        }
      },
      { threshold },
    )
    io.observe(target.value)
  })

  onUnmounted(() => io?.disconnect())

  return { target, inView }
}

/**
 * rAF-throttled scroll loop bound to a section's visibility.
 * The callback only runs while the section is near the viewport.
 */
export function useRafScrollLoop(
  section: { value: HTMLElement | null },
  update: () => void,
) {
  let io: IntersectionObserver | null = null
  let ticking = false

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      update()
    })
  }

  onMounted(() => {
    if (!section.value) return
    io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', onScroll, { passive: true })
          window.addEventListener('resize', onScroll)
          update()
        } else {
          window.removeEventListener('scroll', onScroll)
          window.removeEventListener('resize', onScroll)
        }
      },
      { rootMargin: '10% 0px 10% 0px' },
    )
    io.observe(section.value)
  })

  onUnmounted(() => {
    io?.disconnect()
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
}

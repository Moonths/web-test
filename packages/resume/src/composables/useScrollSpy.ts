import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollSpy(sectionIds: string[]) {
  const activeId = ref('')
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) activeId.value = e.target.id })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer!.observe(el)
    })
  })

  onUnmounted(() => observer?.disconnect())
  return { activeId }
}

import { onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * Triggers staggered entrance animations on child elements
 * that have animation CSS classes (stagger-enter, scale-in, slide-in-right, slide-in-left).
 *
 * Usage:
 *   const container = ref<HTMLElement>()
 *   usePageEntrance(container)
 *
 * Then in template:
 *   <div ref="container">
 *     <div class="stagger-enter">...</div>
 *     <div class="stagger-enter">...</div>
 *   </div>
 */
export function usePageEntrance(container: Ref<HTMLElement | null | undefined>) {
  let observer: IntersectionObserver | null = null

  const ANIMATION_CLASSES = ['stagger-enter', 'scale-in', 'slide-in-right', 'slide-in-left']

  onMounted(() => {
    if (!container.value) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer?.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const children = container.value.querySelectorAll(ANIMATION_CLASSES.map(c => '.' + c).join(', '))
    children.forEach((el) => observer!.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
}

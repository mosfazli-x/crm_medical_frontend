import { useNuxtApp } from 'nuxt/app';
import { onMounted, ref, type Ref } from 'vue'

/**
 * Animates a number from 0 to `end` once its element scrolls into view.
 * Returns a ref with the live formatted value to render in the template.
 */
export function useCounter(target: Ref<HTMLElement | null>, end: number, opts: { duration?: number; suffix?: string } = {}) {
  const { duration = 1.6, suffix = '' } = opts
  const display = ref('0' + suffix)

  if (import.meta.server) return { display }

  onMounted(() => {
    if (!target.value) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      display.value = end.toLocaleString('fa-IR') + suffix
      return
    }

    const gsapInstance = (useNuxtApp() as any).$gsap
    const counter = { value: 0 }

    gsapInstance.to(counter, {
      value: end,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: target.value,
        start: 'top 85%',
        once: true
      },
      onUpdate: () => {
        display.value = Math.round(counter.value).toLocaleString('fa-IR') + suffix
      }
    })
  })

  return { display }
}
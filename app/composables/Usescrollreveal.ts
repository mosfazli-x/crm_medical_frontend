import { useNuxtApp } from 'nuxt/app'
import { nextTick, onMounted, watch, type Ref } from 'vue'

interface RevealOptions {
  /** CSS selector (relative to the root element) for items to stagger. Omit to animate the root itself. */
  items?: string
  y?: number
  duration?: number
  stagger?: number
  delay?: number
  start?: string
}

/**
 * Reveals an element (or a group of child items) as it scrolls into view.
 * Wraps GSAP + ScrollTrigger, no-ops on the server and is skipped entirely
 * for users who prefer reduced motion.
 *
 * Pass a `when` ref for targets that are rendered lazily (e.g. behind a
 * loading gate): the reveal waits until the ref flips to `true` and the DOM
 * has flushed before wiring up ScrollTrigger.
 */
export function useScrollReveal(target: Ref<HTMLElement | null>, options: RevealOptions = {}, when?: Ref<boolean>) {
  if (import.meta.server) return

  const {
    items,
    y = 28,
    duration = 0.9,
    stagger = 0.1,
    delay = 0,
    start = 'top 82%'
  } = options

  const reveal = async () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!target.value) return

    if (prefersReduced) {
      // Just make everything visible, skip motion entirely.
      target.value.style.opacity = '1'
      target.value.style.transform = 'none'
      if (items) {
        target.value.querySelectorAll(items).forEach((el) => {
          ;(el as HTMLElement).style.opacity = '1'
          ;(el as HTMLElement).style.transform = 'none'
        })
      }
      return
    }

    const { $gsap } = useNuxtApp()
    if (!$gsap) return
    const gsapInstance = $gsap
    const els = items ? target.value.querySelectorAll(items) : target.value

    gsapInstance.fromTo(
      els,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        delay,
        stagger: items ? stagger : 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: target.value,
          start
        }
      }
    )
  }

  if (when) {
    watch(when, (ready) => {
      if (ready) nextTick(reveal)
    }, { immediate: true })
  } else {
    onMounted(reveal)
  }
}
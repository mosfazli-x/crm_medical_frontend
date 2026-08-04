import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import Lenis from 'lenis'
import type { ScrollToOptions } from 'lenis'

interface UseLenisOptions {
  /** Fixed-header height subtracted from `scrollTo` targets. */
  navOffset?: number
  /** Smooth-scroll duration in seconds for wheel/trackpad input. */
  duration?: number
  /** Linear interpolation intensity (0–1); lower = silkier. */
  lerp?: number
  /** Wheel input multiplier. */
  wheelMultiplier?: number
}

/**
 * Professional Lenis smooth scrolling for the immersive landing page,
 * wired into the GSAP ticker so every ScrollTrigger stays in sync with
 * the animated scroll position (the same Lenis + GSAP integration used
 * on premium sites such as cardiatec.ai).
 *
 * Scoped to the calling page only — no other route touches Lenis, so the
 * CRM's internal scroll containers and dialogs keep native behavior.
 * No-ops for `prefers-reduced-motion` and falls back to native scrolling.
 */
export function useLenis(options: UseLenisOptions = {}) {
  const {
    navOffset = 72,
    duration = 1.1,
    lerp = 0.09,
    wheelMultiplier = 1,
  } = options

  const lenis = ref<Lenis | null>(null)

  function raf(time: number) {
    lenis.value?.raf(time * 1000)
  }

  function scrollTo(target: string | number | HTMLElement, scrollToOptions: Partial<ScrollToOptions> = {}) {
    const instance = lenis.value
    if (instance) {
      instance.scrollTo(target, { offset: -navOffset, duration: 1.4, ...scrollToOptions })
      return
    }

    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' })
    } else {
      const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  onMounted(() => {
    if (import.meta.server) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const { $gsap, $ScrollTrigger } = useNuxtApp()
    if (!$gsap || !$ScrollTrigger) return

    const instance = new Lenis({
      duration,
      lerp,
      wheelMultiplier,
      smoothWheel: true,
    })

    instance.on('scroll', $ScrollTrigger.update)
    $gsap.ticker.add(raf)
    $gsap.ticker.lagSmoothing(0)

    lenis.value = instance
  })

  onBeforeUnmount(() => {
    const { $gsap } = useNuxtApp()
    if ($gsap) {
      $gsap.ticker.remove(raf)
      $gsap.ticker.lagSmoothing(500, 33)
    }
    lenis.value?.destroy()
    lenis.value = null
  })

  return { lenis, scrollTo }
}

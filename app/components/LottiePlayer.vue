<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Lightweight Lottie wrapper: only imports lottie-web and fetches the
 * animation JSON once the player scrolls into view, keeping it off the
 * critical bundle/network path entirely.
 *
 * Swap the `src` prop per placement with a real export from LottieFiles /
 * After Effects (Bodymovin). `/lottie/pulse.json` is a minimal placeholder
 * so the component is runnable out of the box.
 */
const props = withDefaults(
  defineProps<{
    src?: string
    loop?: boolean
    autoplay?: boolean
  }>(),
  { src: '/lottie/pulse.json', loop: true, autoplay: true }
)

const container = ref<HTMLElement | null>(null)
let animInstance: any = null

onMounted(() => {
  if (!container.value) return

  const observer = new IntersectionObserver(
    async (entries) => {
      if (!entries[0].isIntersecting || animInstance) return
      const lottie = (await import('lottie-web')).default
      animInstance = lottie.loadAnimation({
        container: container.value as Element,
        renderer: 'svg',
        loop: props.loop,
        autoplay: props.autoplay,
        path: props.src
      })
      observer.disconnect()
    },
    { rootMargin: '200px' }
  )
  observer.observe(container.value)
})

onBeforeUnmount(() => {
  animInstance?.destroy?.()
})
</script>

<template>
  <div ref="container" class="!h-full !w-full" aria-hidden="true" />
</template>
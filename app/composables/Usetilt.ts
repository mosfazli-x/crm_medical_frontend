import { onBeforeUnmount, onMounted, type Ref } from 'vue'

interface TiltOptions {
  max?: number // max rotation in degrees
  scale?: number
  perspective?: number
}

/**
 * Applies a gentle 3D tilt (rotateX/rotateY/translateZ) that follows the
 * pointer. Desktop-only by design (fine pointers), and skipped for
 * prefers-reduced-motion — the brief calls for restraint here.
 */
export function useTilt(el: Ref<HTMLElement | null>, options: TiltOptions = {}) {
  if (import.meta.server) return

  const { max = 8, scale = 1.02, perspective = 1000 } = options
  const isFinePointer = window.matchMedia('(pointer: fine)').matches
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onMove(e: MouseEvent) {
    if (!el.value) return
    const rect = el.value.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5

    el.value.style.transform = `perspective(${perspective}px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale(${scale}) translateZ(0)`
  }

  function onLeave() {
    if (!el.value) return
    el.value.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`
  }

  onMounted(() => {
    if (!isFinePointer || prefersReduced || !el.value) return
    el.value.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
    el.value.addEventListener('mousemove', onMove)
    el.value.addEventListener('mouseleave', onLeave)
  })

  onBeforeUnmount(() => {
    if (!el.value) return
    el.value.removeEventListener('mousemove', onMove)
    el.value.removeEventListener('mouseleave', onLeave)
  })
}
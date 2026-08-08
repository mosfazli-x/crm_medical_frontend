import { onBeforeUnmount, onMounted, type Ref } from 'vue'

interface TiltOptions {
  max?: number // max rotation in degrees
  scale?: number
  perspective?: number
}

type TiltTarget = Ref<HTMLElement | null> | HTMLElement | null

function isRefLike(el: TiltTarget): el is Ref<HTMLElement | null> {
  return !!el && typeof el === 'object' && 'value' in el
}

/**
 * Applies a gentle 3D tilt (rotateX/rotateY/translateZ) that follows the
 * pointer. Desktop-only by design (fine pointers), and skipped for
 * prefers-reduced-motion — the brief calls for restraint here.
 *
 * Accepts either a template ref (attached on mount, the common case) or a
 * live element (attached immediately — for elements queried after mount).
 */
export function useTilt(el: TiltTarget, options: TiltOptions = {}) {
  if (import.meta.server) return

  const { max = 8, scale = 1.02, perspective = 1000 } = options
  const isFinePointer = window.matchMedia('(pointer: fine)').matches
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function resolve(): HTMLElement | null {
    return isRefLike(el) ? el.value : el
  }

  function onMove(e: MouseEvent) {
    const target = resolve()
    if (!target) return
    const rect = target.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5

    target.style.transform = `perspective(${perspective}px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) scale(${scale}) translateZ(0)`
  }

  function onLeave() {
    const target = resolve()
    if (!target) return
    target.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`
  }

  function attach() {
    const target = resolve()
    if (!target || !isFinePointer || prefersReduced) return
    target.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)'
    target.addEventListener('mousemove', onMove)
    target.addEventListener('mouseleave', onLeave)
  }

  if (isRefLike(el)) {
    onMounted(attach)
  } else {
    attach()
  }

  onBeforeUnmount(() => {
    const target = resolve()
    if (!target) return
    target.removeEventListener('mousemove', onMove)
    target.removeEventListener('mouseleave', onLeave)
  })
}
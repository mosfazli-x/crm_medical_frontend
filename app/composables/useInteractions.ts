import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Animated counter — animates from 0 to target value.
 */
export function useCounter(target: number, duration = 1800) {
  const value = ref(0)
  let rafId: number | null = null

  function animate() {
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      value.value = Math.round(eased * target)
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      }
    }
    rafId = requestAnimationFrame(step)
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId)
  }

  return { value, animate, stop }
}

/**
 * Cursor glow — tracks mouse position for radial gradient overlay.
 */
export function useCursorGlow() {
  const x = ref(50)
  const y = ref(50)
  const visible = ref(false)

  function onMouseMove(e: MouseEvent) {
    x.value = (e.clientX / window.innerWidth) * 100
    y.value = (e.clientY / window.innerHeight) * 100
    if (!visible.value) visible.value = true
  }

  function onMouseLeave() {
    visible.value = false
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseleave', onMouseLeave)
  })

  return { x, y, visible }
}

/**
 * Mouse parallax — tracks mouse position as center-origin normalized values.
 * Returns lerp-smoothed values (mx/my) for background layers and
 * damped-spring values (sx/sy) for 3D tilt with overshoot and smooth
 * return-to-neutral on mouse leave.
 */
export function useMouseParallax() {
  const mx = ref(0)
  const my = ref(0)
  const sx = ref(0)
  const sy = ref(0)

  let rawX = 0
  let rawY = 0
  let rafId: number | null = null

  const LERP = 0.08
  const STIFFNESS = 0.12
  const DAMPING = 0.72
  let velX = 0
  let velY = 0
  let springX = 0
  let springY = 0

  function onMouseMove(e: MouseEvent) {
    rawX = (e.clientX / window.innerWidth - 0.5)
    rawY = (e.clientY / window.innerHeight - 0.5)
  }

  function onMouseLeave() {
    rawX = 0
    rawY = 0
  }

  function loop() {
    mx.value += (rawX - mx.value) * LERP
    my.value += (rawY - my.value) * LERP

    velX += (rawX - springX) * STIFFNESS - velX * DAMPING
    velY += (rawY - springY) * STIFFNESS - velY * DAMPING
    springX += velX
    springY += velY
    sx.value = springX
    sy.value = springY

    rafId = requestAnimationFrame(loop)
  }

  onMounted(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    rafId = requestAnimationFrame(loop)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseleave', onMouseLeave)
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  return { mx, my, sx, sy }
}

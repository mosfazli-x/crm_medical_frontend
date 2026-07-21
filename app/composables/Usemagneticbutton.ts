import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/**
 * Pulls a button slightly toward the cursor while hovered, and springs
 * back on leave. Desktop / fine-pointer only.
 */
export function useMagneticButton(el: Ref<HTMLElement | null>, strength = 0.35) {
  if (import.meta.server) return

  const isFinePointer = window.matchMedia('(pointer: fine)').matches
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function onMove(e: MouseEvent) {
    if (!el.value) return
    const rect = el.value.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    el.value.style.transform = `translate(${x}px, ${y}px)`
  }

  function onLeave() {
    if (!el.value) return
    el.value.style.transform = 'translate(0, 0)'
  }

  onMounted(() => {
    if (!isFinePointer || prefersReduced || !el.value) return
    el.value.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
    el.value.addEventListener('mousemove', onMove)
    el.value.addEventListener('mouseleave', onLeave)
  })

  onBeforeUnmount(() => {
    if (!el.value) return
    el.value.removeEventListener('mousemove', onMove)
    el.value.removeEventListener('mouseleave', onLeave)
  })
}
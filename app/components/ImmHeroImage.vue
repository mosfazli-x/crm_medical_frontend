<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

/**
 * Immersive layered hero visual.
 *
 * Port of the CardiaTec `#brxe-pdomdt` hero image block:
 *  - `.hero--image-wrapper`            → .imm-hero-image
 *  - `.hero--image-entry-wrapper`      → .imm-hero-image__entry
 *  - `.hero--pulse-wrapper`            → .imm-hero-image__pulse
 *  - `.hero--layered-image-wrapper`    → .imm-hero-image__layers
 *  - five stacked `.hero--layered-image` layers
 *
 * Animations mirror the site's MotionPage config:
 *  - infinite pulse (scale 0.96 / rotate 1deg, yoyo)
 *  - pointer-X linked timeline (per-layer rotationY/rotationZ + horizontal drift)
 *  - pointer-Y linked tilt timeline (scale 0.95 + slight 3D rotation)
 * Only enabled on wide screens, fine pointers, and non-reduced motion.
 *
 * `pointerScope`:
 *  - 'window' (default) → the parallax responds to the pointer anywhere on screen
 *  - 'self' → only while the pointer hovers the image itself
 */

const props = withDefaults(
  defineProps<{
    pointerScope?: 'window' | 'self'
  }>(),
  { pointerScope: 'window' }
)

const imageWrap = ref<HTMLElement | null>(null)
const layersWrap = ref<HTMLElement | null>(null)
const targetEl = ref<HTMLElement | null>(null)
const moleculesEl = ref<HTMLElement | null>(null)
const heartEl = ref<HTMLElement | null>(null)
const proteinEl = ref<HTMLElement | null>(null)
const networkEl = ref<HTMLElement | null>(null)

let mouseXtl: gsap.core.Timeline | null = null
let mouseYtl: gsap.core.Timeline | null = null
let rafId: number | null = null
let targetX = 0.5
let targetY = 0.5
let curX = 0.5
let curY = 0.5
let enabled = false
let disposed = false

function loop() {
  if (disposed) return
  curX += (targetX - curX) * 0.1
  curY += (targetY - curY) * 0.1
  mouseXtl?.progress(curX)
  mouseYtl?.progress(curY)
  if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
    rafId = requestAnimationFrame(loop)
  } else {
    rafId = null
  }
}

function centerPointer() {
  if (disposed) return
  targetX = 0.5
  targetY = 0.5
  if (rafId == null) rafId = requestAnimationFrame(loop)
}

function onPointerMove(e: PointerEvent) {
  if (!enabled || disposed) return
  if (props.pointerScope === 'self') {
    const el = imageWrap.value
    if (!el) return
    const r = el.getBoundingClientRect()
    targetX = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1)
    targetY = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1)
  } else {
    targetX = e.clientX / window.innerWidth
    targetY = e.clientY / window.innerHeight
  }
  if (rafId == null) rafId = requestAnimationFrame(loop)
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const desktop = window.matchMedia('(min-width: 1024px)').matches
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (reduced || !desktop || !finePointer) return
  if (!imageWrap.value) return

  gsap.set(imageWrap.value, {
    transformOrigin: '50% 50%',
    transformPerspective: 800,
  })

  mouseXtl = gsap.timeline({ paused: true })
  mouseXtl
    .fromTo(imageWrap.value, { xPercent: -6 }, { xPercent: 6 }, 0)
    .fromTo(heartEl.value, { scale: 1, rotationY: 0, rotationZ: 0 }, { scale: 1.1, rotationY: 20, rotationZ: 10 }, 0)
    .fromTo([moleculesEl.value, targetEl.value], { rotationY: 0, rotationZ: 0 }, { rotationY: 10, rotationZ: 5 }, 0)
    .fromTo(networkEl.value, { scale: 1, rotationY: 0, rotationZ: 0 }, { scale: 0.9, rotationY: 3, rotationZ: 2 }, 0)
    .fromTo(proteinEl.value, { rotationY: 0, rotationZ: 0 }, { rotationY: -10, rotationZ: -5 }, 0)

  mouseYtl = gsap.timeline({ paused: true })
  mouseYtl
    .fromTo(imageWrap.value, { rotationX: 1, rotationY: 1, rotationZ: 0 }, { scale: 0.95, rotationX: -1, rotationY: -2, rotationZ: 0 }, 0)
    .fromTo(layersWrap.value, { rotationX: 1, rotationY: 1, rotationZ: 0 }, { scale: 0.95, rotationX: -1, rotationY: -2, rotationZ: 0 }, 0)

  mouseXtl.progress(0.5)
  mouseYtl.progress(0.5)

  enabled = true
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('mouseleave', centerPointer)
  window.addEventListener('blur', centerPointer)
})

onBeforeUnmount(() => {
  disposed = true
  window.removeEventListener('pointermove', onPointerMove)
  document.documentElement.removeEventListener('mouseleave', centerPointer)
  window.removeEventListener('blur', centerPointer)
  if (rafId != null) cancelAnimationFrame(rafId)
  mouseXtl?.kill()
  mouseYtl?.kill()
})
</script>

<template>
  <div ref="imageWrap" class="imm-hero-image">
    <div class="imm-hero-image__entry">
      <div class="imm-hero-image__pulse">
        <div ref="layersWrap" class="imm-hero-image__layers">
          <img
            ref="moleculesEl"
            class="imm-hero-layer imm-hero-layer--molecules"
            src="/images/heart-hero-molecules.png"
            alt=""
            width="2000"
            height="1817"
            loading="lazy"
          >
          <img
            ref="heartEl"
            class="imm-hero-layer imm-hero-layer--heart"
            src="/images/heart-hero-heart.png"
            alt=""
            width="2000"
            height="1817"
            loading="lazy"
          >
          <img
            ref="proteinEl"
            class="imm-hero-layer imm-hero-layer--protein"
            src="/images/heart-hero-protein.png"
            alt=""
            width="2000"
            height="1817"
            loading="lazy"
          >
          <img
            ref="networkEl"
            class="imm-hero-layer imm-hero-layer--network"
            src="/images/heart-hero-network.png"
            alt=""
            width="2000"
            height="1817"
            loading="lazy"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mirrors the CardiaTec `#brxe-pdomdt` specs */
.imm-hero-image {
  position: relative;
  width: 100%;
  will-change: transform;
}

.imm-hero-image__entry {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.imm-hero-image__pulse {
  width: 100%;
  transform-origin: center;
  will-change: transform;
  animation: imm-hero-image-pulse 4s ease-in-out infinite alternate;
}

.imm-hero-image__layers {
  position: relative;
  width: 100%;
  perspective: 600px;
  will-change: transform;
}

.imm-hero-layer {
  display: block;
  width: 100%;
  height: auto;
  will-change: transform;
}

.imm-hero-layer--target {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 4;
}

.imm-hero-layer--molecules {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 3;
}

.imm-hero-layer--heart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
}

.imm-hero-layer--protein {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
}

.imm-hero-layer--network {
  position: relative;
  width: 100%;
  z-index: 0;
}

@keyframes imm-hero-image-pulse {
  from {
    transform: scale(1) rotate(0deg);
  }

  to {
    transform: scale(0.96) rotate(1deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .imm-hero-image__pulse {
    animation: none;
  }
}
</style>

<template>
  <div v-if="rendered" class="preloader" :dir="dir" :class="{ 'is-lifting': lifting }" role="status" aria-live="polite"
    :aria-label="t('aestheticLanding.loading.ariaLabel')">
    <!-- Cinematic backdrop: drifting orbs, film grain, vignette -->
    <div class="preloader__backdrop" aria-hidden="true">
      <span class="preloader__orb preloader__orb--sapphire" />
      <span class="preloader__orb preloader__orb--champagne" />
      <span class="preloader__grain" />
      <span class="preloader__vignette" />
    </div>

    <!-- Hairline matte frame — mirrors the stage's photographic edge -->
    <span class="preloader__frame" aria-hidden="true" />

    <!-- Champagne peel line that sweeps down as the veil lifts -->
    <span class="preloader__peel" aria-hidden="true" />

    <!-- Content -->
    <div class="preloader__content" :class="{ 'is-leaving': contentLeaving }">

      <div class="loader-3d-container perspective-[1000px]">
        <div class="loader-3d-element relative w-32 h-32">
          <!-- Front face -->
          <div
            class="loader-face loader-face--front absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-500 shadow-2xl shadow-blue-500/30">
            <img src="~/assets/images/hastihoseinilogo.png" alt="Hasti Hosseini Clinic" class="w-16 h-16 object-contain"
              width="48" height="48" />
          </div>
          <!-- Back face -->
          <div
            class="loader-face loader-face--back absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-100 shadow-2xl shadow-cyan-400/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
          </div>
        </div>
      </div>

      <h1 class="preloader__name">{{ name }}</h1>
      <p class="preloader__subtitle">{{ subtitle }}</p>

      <div class="preloader__meta">
        <Transition name="status-fade" mode="out-in">
          <span :key="statusIndex" class="preloader__status">{{ status }}</span>
        </Transition>
      </div>

      <svg class="heart" viewBox="-5 -5 278 56" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <filter>
          <feGaussianBlur stdDeviation="1.6"></feGaussianBlur>
        </filter>
        <g transform="translate(29.1 -127.42)">
          <path pathLength="1"
            d="M-28.73 167.2c26.43 9.21 68.46-9.46 85.45-12.03 18.45-2.78 32.82 4.86 28.75 9.83-3.82 4.66-25.77-21.18-14.81-31.5 9.54-8.98 17.64 10.64 16.42 17.06-1.51-6.2 2.95-26.6 14.74-22.11 11.7 4.46-4.33 49.03-15.44 44.08-6.97-3.1 15.44-16.26 26.1-16 23.03.56 55.6 27.51 126.63 3.36"
            id="line"></path>
        </g>
        <g transform="translate(29.1 -127.42)">
          <path pathLength="1"
            d="M-28.73 167.2c26.43 9.21 68.46-9.46 85.45-12.03 18.45-2.78 32.82 4.86 28.75 9.83-3.82 4.66-25.77-21.18-14.81-31.5 9.54-8.98 17.64 10.64 16.42 17.06-1.51-6.2 2.95-26.6 14.74-22.11 11.7 4.46-4.33 49.03-15.44 44.08-6.97-3.1 15.44-16.26 26.1-16 23.03.56 55.6 27.51 126.63 3.36"
            id="point" filter="url(#blur)"></path>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ (e: 'finished'): void }>()

const { t, locale } = useI18n()

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))
const isRtl = computed(() => locale.value === 'fa')

const rendered = ref(true)
const lifting = ref(false)
const contentLeaving = ref(false)
const progress = ref(0)
const statusIndex = ref(0)
const prefersReducedMotion = ref(false)

const SOFT_CAP = 92
const RING_RADIUS = 52
const RING_CIRC = 2 * Math.PI * RING_RADIUS

const ringOffset = computed(() => RING_CIRC - (progress.value / 100) * RING_CIRC)

const initials = computed(() => t('aestheticLanding.loading.initials'))
const name = computed(() => t('aestheticLanding.brand.name'))
const subtitle = computed(() => t('aestheticLanding.brand.tagline'))

const statuses = computed(() => [
  t('aestheticLanding.loading.status1'),
  t('aestheticLanding.loading.status2'),
  t('aestheticLanding.loading.status3'),
])

const status = computed(() => statuses.value[statusIndex.value])

const toPersianDigits = (input: string | number) =>
  String(input).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

const countText = computed(() => {
  const n = Math.round(progress.value)
  return isRtl.value ? toPersianDigits(n) : String(n)
})

let progressTimer: ReturnType<typeof setInterval> | null = null
const exitTimers: ReturnType<typeof setTimeout>[] = []

const startProgress = () => {
  const step = () => {
    const remaining = SOFT_CAP - progress.value
    progress.value += Math.max(remaining * 0.09, 1.4)
    if (progress.value > 30 && statusIndex.value === 0) statusIndex.value = 1
    else if (progress.value > 62 && statusIndex.value === 1) statusIndex.value = 2
    if (progress.value >= SOFT_CAP) {
      progress.value = SOFT_CAP
      stopProgress()
      exitTimers.push(setTimeout(beginExit, prefersReducedMotion.value ? 60 : 180))
    }
  }
  progressTimer = setInterval(step, prefersReducedMotion.value ? 20 : 45)
}

const stopProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const beginExit = () => {
  contentLeaving.value = true

  if (prefersReducedMotion.value) {
    exitTimers.push(
      setTimeout(() => {
        rendered.value = false
        emit('finished')
      }, 220),
    )
    return
  }

  exitTimers.push(
    setTimeout(() => {
      lifting.value = true
    }, 420),
  )
  exitTimers.push(
    setTimeout(() => {
      rendered.value = false
      emit('finished')
    }, 420 + 920),
  )
}

onMounted(() => {
  prefersReducedMotion.value =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false)
  startProgress()
})

onBeforeUnmount(() => {
  stopProgress()
  exitTimers.forEach(clearTimeout)
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--ink, oklch(18% 0.014 268));
  color: var(--lightcyan, oklch(93% 0.03 277));
  color-scheme: dark;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* ============ BACKDROP ============ */

.preloader__backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.preloader__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.55;
  will-change: transform;
  animation: preloader-orb 22s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.preloader__orb--sapphire {
  top: -12rem;
  inset-inline-end: -8rem;
  width: 44vw;
  height: 44vw;
  background: radial-gradient(circle,
      color-mix(in oklab, var(--cornflower, oklch(58.5% 0.203 277)) 55%, transparent),
      transparent 70%);
}

.preloader__orb--champagne {
  inset-block-end: -14rem;
  inset-inline-start: -10rem;
  width: 40vw;
  height: 40vw;
  opacity: 0.16;
  filter: blur(100px);
  background: radial-gradient(circle, var(--champagne, oklch(80% 0.08 90)), transparent 70%);
  animation-duration: 26s;
  animation-direction: reverse;
}

.preloader__grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.preloader__vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 260px 80px var(--ink, oklch(18% 0.014 268));
}

.preloader__frame {
  position: absolute;
  inset: 0.75rem;
  z-index: 2;
  border: 1px solid var(--hairline, oklch(100% 0 0 / 0.12));
  pointer-events: none;
}

.preloader__peel {
  position: absolute;
  top: 0;
  inset-inline: 0;
  z-index: 3;
  height: 2px;
  opacity: 0;
  background: linear-gradient(90deg,
      transparent,
      var(--champagne-bright, oklch(90% 0.08 92)),
      transparent);
  transition: opacity 0.25s ease;
  pointer-events: none;
}

/* ============ CONTENT ============ */

.preloader__content {
  position: relative;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.1rem;
  text-align: center;
  transition:
    opacity 0.45s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)),
    filter 0.45s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)),
    transform 0.45s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1));
}

.preloader__content.is-leaving {
  opacity: 0;
  filter: blur(10px);
  transform: scale(1.06);
}

.preloader__monogram {
  position: relative;
  width: 128px;
  height: 128px;
  animation: preloader-rise 1.1s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

.preloader__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.preloader__ring-track {
  fill: none;
  stroke: color-mix(in oklab, var(--champagne, oklch(80% 0.08 90)) 22%, transparent);
  stroke-width: 1;
}

.preloader__ring-progress {
  fill: none;
  stroke: var(--champagne-bright, oklch(90% 0.08 92));
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 326.73;
  stroke-dashoffset: 326.73;
  transition: stroke-dashoffset 0.1s linear;
}

.preloader__initials {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display, Georgia, serif);
  font-size: 2.5rem;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-indent: 0.18em;
  color: var(--lightcyan, oklch(93% 0.03 277));
  animation: preloader-rise 1.1s 0.08s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

.preloader__name {
  margin: 0;
  padding-top: 1rem;
  font-family: var(--font-display, Georgia, serif);
  font-size: clamp(1.3rem, 2.7vw, 1.8rem);
  font-weight: 700;
  letter-spacing: 0.42em;
  text-indent: 0.42em;
  text-transform: uppercase;
  color: var(--lightcyan, oklch(93% 0.03 277));
  animation: preloader-rise 1.1s 0.14s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

.preloader__subtitle {
  margin: 0;
  font-size: 0.6rem;
  font-weight: 400;
  letter-spacing: 0.38em;
  text-indent: 0.38em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--champagne, oklch(80% 0.08 90)) 65%, transparent);
  animation: preloader-rise 1.1s 0.2s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

.preloader__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 1.25rem;
  margin-top: 0.5rem;
  animation: preloader-rise 1.1s 0.28s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

.preloader__status {
  font-size: 0.58rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--periwinkle, oklch(87% 0.06 277)) 72%, transparent);
}

.preloader__sep {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: color-mix(in oklab, var(--champagne, oklch(80% 0.08 90)) 70%, transparent);
}

.preloader__count {
  font-family: var(--font-display, Georgia, serif);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
  color: var(--champagne-bright, oklch(90% 0.08 92));
}

.preloader__track {
  position: relative;
  width: min(220px, 56vw);
  height: 1px;
  margin-top: 0.25rem;
  background: color-mix(in oklab, var(--lightcyan, oklch(93% 0.03 277)) 14%, transparent);
  overflow: hidden;
  animation: preloader-rise 1.1s 0.34s var(--ease-luxe, cubic-bezier(0.16, 1, 0.3, 1)) both;
}

.preloader__bar {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 0%;
  background: linear-gradient(90deg,
      var(--champagne, oklch(80% 0.08 90)),
      var(--champagne-bright, oklch(90% 0.08 92)));
  transition: width 0.1s linear;
}

/* ============ DISMISSAL ============ */

.preloader.is-lifting {
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.95s cubic-bezier(0.76, 0, 0.24, 1);
  will-change: transform;
}

.preloader.is-lifting .preloader__peel {
  opacity: 1;
}

/* ============ STATUS TRANSITION ============ */

.status-fade-enter-active,
.status-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ============ RTL / PERSIAN ============ */

.preloader[dir="rtl"] .preloader__name,
.preloader[dir="rtl"] .preloader__subtitle,
.preloader[dir="rtl"] .preloader__status,
.preloader[dir="rtl"] .preloader__initials {
  letter-spacing: 0;
  text-indent: 0;
}

/* ============ REDUCED MOTION ============ */

@media (prefers-reduced-motion: reduce) {

  .preloader__monogram,
  .preloader__initials,
  .preloader__name,
  .preloader__subtitle,
  .preloader__meta,
  .preloader__track,
  .preloader__orb {
    animation: none !important;
  }

  .preloader__content {
    transition: opacity 0.2s ease, filter 0.2s ease, transform 0.2s ease;
  }

  .preloader.is-lifting {
    transition: transform 0.3s ease;
  }
}



.loader-orb {
  animation: loader-drift 18s ease-in-out infinite;
}

.loader-orb--2 {
  animation-duration: 22s;
  animation-delay: -4s;
}

.loader-orb--3 {
  animation-duration: 25s;
  animation-delay: -8s;
}

@keyframes loader-drift {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  25% {
    transform: translate(4%, 5%) scale(1.08);
  }

  50% {
    transform: translate(-3%, -2%) scale(0.95);
  }

  75% {
    transform: translate(2%, -4%) scale(1.03);
  }
}

/* 3D Cube rotation */
.loader-3d-container {
  perspective: 1000px;
  width: 128px;
  height: 128px;
}

.loader-3d-element {
  transform-style: preserve-3d;
  animation: loader-rotate3d 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.loader-face {
  backface-visibility: hidden;
}

.loader-face--back {
  transform: rotateY(180deg);
}

@keyframes loader-rotate3d {

  0%,
  100% {
    transform: rotateY(0deg) rotateX(0deg) scale(1);
  }

  25% {
    transform: rotateY(90deg) rotateX(15deg) scale(1.05);
  }

  50% {
    transform: rotateY(180deg) rotateX(0deg) scale(1);
  }

  75% {
    transform: rotateY(270deg) rotateX(-15deg) scale(1.05);
  }
}

/* Logo text gradient animation */
.loader-logo-text {
  animation: loader-text-gradient 3s ease-in-out infinite;
}

@keyframes loader-text-gradient {

  0%,
  100% {
    background-position: 0% center;
  }

  50% {
    background-position: 200% center;
  }
}

/* Floating particles */
.loader-particle {
  animation: loader-float linear infinite;
}

@keyframes loader-float {

  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  50% {
    transform: translateY(-100vh) translateX(20px) scale(1.5);
  }
}

/* Status text transition */
.status-fade-enter-active,
.status-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Exit transition */
.loader-exit-leave-active {
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.loader-exit-leave-to {
  opacity: 0;
  filter: blur(12px) brightness(1.2);
  transform: scale(1.1);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {

  .loader-orb,
  .loader-3d-element,
  .loader-logo-text,
  .loader-particle {
    animation: none !important;
  }

  .loader-exit-leave-active {
    transition: opacity 0.3s ease;
  }

  .loader-exit-leave-to {
    filter: none;
    transform: none;
  }
}

/* From Uiverse.io by G27XLEO */
.heart #line {
  fill: none;
  stroke: var(--lightcyan, oklch(93% 0.03 277));
  stroke-width: 1.5;
  stroke-linecap: butt;
  stroke-linejoin: round;
  stroke-miterlimit: 4;
  stroke-opacity: 1;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: dash 2s linear infinite;
}

.heart #point {
  fill: none;
  stroke: var(--lightcyan, oklch(93% 0.03 277));
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-miterlimit: 0.1;
  stroke-opacity: 1;
  stroke-dasharray: 0.0001, 0.9999;
  stroke-dashoffset: 1;
  animation: dash 2s linear infinite;
}

@keyframes dash {
  0% {
    stroke-dashoffset: 1;
  }

  80% {
    stroke-dashoffset: 0;
  }

  100% {
    stroke-dashoffset: 0;
  }
}
</style>

<template>
  <Transition name="loader-exit" @after-leave="$emit('finished')">
    <LoadingBackground v-if="rendered" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      :class="isLight ? 'ld-shell ld-shell--light' : 'ld-shell'" role="status" aria-live="polite"
      aria-label="Loading MedVista">
      <temolate>
        <!-- Animated background orbs (teal, matching landing glow) -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="loader-orb loader-orb--1 ld-glow ld-glow--1 absolute w-[600px] h-[600px] rounded-full blur-[120px] -top-40 -right-32"
            :class="isLight ? 'opacity-[0.20]' : 'opacity-[0.22]'"></div>
          <div
            class="loader-orb loader-orb--2 ld-glow ld-glow--2 absolute w-[500px] h-[500px] rounded-full blur-[100px] -bottom-36 -left-28"
            :class="isLight ? 'opacity-[0.14]' : 'opacity-[0.16]'"></div>
          <div
            class="loader-orb loader-orb--3 ld-glow ld-glow--3 absolute w-[400px] h-[400px] rounded-full blur-[90px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            :class="isLight ? 'opacity-[0.10]' : 'opacity-[0.12]'"></div>
        </div>

        <!-- Subtle teal grid pattern overlay -->
        <div class="absolute inset-0 ld-grid" />
        <div class="absolute inset-0 ld-veil" aria-hidden="true" />

        <!-- Main content -->
        <div class="relative z-10 flex flex-col items-center gap-8">
          <!-- 3D Rotating medical cross -->
          <div class="loader-3d-container">
            <div class="loader-3d-element relative">
              <!-- Front face -->
              <div
                class="loader-face loader-face--front ld-cube ld-cube--front">
                <img src="~/assets/images/hastihoseinilogo.png" alt="Hasti Hosseini Clinic"
                  class="w-16 h-16 object-contain ld-cube-logo" width="48" height="48" />
              </div>
              <!-- Back face -->
              <div class="loader-face loader-face--back ld-cube ld-cube--back">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EEEEEE" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                </svg>
              </div>

              <!-- Teal rim light along the cube edge -->
              <div class="pointer-events-none absolute inset-0 rounded-2xl ld-cube-rim" aria-hidden="true"></div>
            </div>
          </div>

          <!-- Logo text with teal gradient -->
          <div class="loader-text-container text-center">
            <h1 class="loader-logo-text text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ld-logo-gradient"
              style="background-size: 200% auto;">
              {{ t('landing.loading.clinicName') }}
            </h1>
            <p class="loader-tagline mt-2 text-sm font-medium ld-muted">
              {{ computedTagline }}
            </p>
          </div>

          <!-- Animated progress (ECG pulse) -->
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

          <!-- Loading status text -->
          <div class="loader-status-container h-5">
            <Transition name="status-fade" mode="out-in">
              <span :key="statusIndex" class="text-xs font-medium ld-muted">
                {{ statusMessages[statusIndex] }}
              </span>
            </Transition>
          </div>
        </div>

        <!-- Floating particles (teal) -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div v-for="i in 20" :key="i" class="loader-particle absolute w-1 h-1 rounded-full ld-particle"
            :class="isLight ? 'opacity-40' : 'opacity-70'" :style="particleStyle(i)"></div>
        </div>
      </temolate>
    </LoadingBackground>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(defineProps<{
  show: boolean
  tagline?: string
}>(), {
  tagline: undefined,
})

const emit = defineEmits<{ (e: 'finished'): void }>()

const { t, locale } = useI18n()

const computedTagline = computed(() => props.tagline ?? t('landing.loading.tagline'))

const statusMessages = computed(() => [
  t('landing.loading.status1'),
  t('landing.loading.status2'),
  t('landing.loading.status3'),
  t('landing.loading.status4'),
])

const rendered = ref(true)
const displayProgress = ref(0)
const statusIndex = ref(0)
const isLight = ref(false)
const prefersReducedMotion = ref(false)

let progressTimer: ReturnType<typeof setInterval> | null = null
let finishTimer: ReturnType<typeof setTimeout> | null = null

const SOFT_CAP = 92
const circumference = 2 * Math.PI * 28

const strokeOffset = computed(() => {
  return circumference - (displayProgress.value / 100) * circumference
})

const particleStyle = (i: number) => {
  const delay = Math.random() * 5
  const duration = 8 + Math.random() * 12
  const x = Math.random() * 100
  const y = Math.random() * 100
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

const startProgress = () => {
  progressTimer = setInterval(() => {
    const remaining = SOFT_CAP - displayProgress.value
    displayProgress.value += Math.max(remaining * 0.12, 0.15)
    if (displayProgress.value >= SOFT_CAP) {
      displayProgress.value = SOFT_CAP
      if (progressTimer) clearInterval(progressTimer)
    }
    if (displayProgress.value > 28 && statusIndex.value === 0) statusIndex.value = 1
    else if (displayProgress.value > 58 && statusIndex.value === 1) statusIndex.value = 2
    else if (displayProgress.value > 84 && statusIndex.value === 2) statusIndex.value = 3
  }, 130)
}

const stopProgress = () => {
  if (progressTimer) clearInterval(progressTimer)
  progressTimer = null
}

watch(() => props.show, (isShowing) => {
  if (!isShowing) {
    stopProgress()
    displayProgress.value = 100
    finishTimer = setTimeout(() => {
      rendered.value = false
    }, 420)
  }
})

onMounted(() => {
  isLight.value = document.documentElement.getAttribute('data-theme') === 'light'
  prefersReducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  const observer = new MutationObserver(() => {
    isLight.value = document.documentElement.getAttribute('data-theme') === 'light'
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  startProgress()
})

onBeforeUnmount(() => {
  stopProgress()
  if (finishTimer) clearTimeout(finishTimer)
})
</script>

<style scoped>
/* ═══════════════════════════════════════════
   MedicalDashboardLoader — navy + teal
   Mirrors the current landing template palette.
   ═══════════════════════════════════════════ */
.ld-shell {
  --ld-bg: #0f151c;
  --ld-foreground: #EEEEEE;
  --ld-muted: #B8BDC5;
  --ld-card: #393E46;
  --ld-card-soft: #2B3138;
  --ld-border: #4A505A;
  --ld-primary: #00ADB5;
  --ld-primary-soft: #39C6D6;
  --ld-primary-bright: #4FD6E4;
  --ld-font-display: 'Fraunces', ui-serif, Georgia, serif;
  --ld-font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;

  background:
    radial-gradient(
      100% 80% at 85% 0%,
      rgba(0, 173, 181, 0.12) 0%,
      rgba(34, 40, 49, 0) 50%
    ),
    var(--ld-bg);
  color: var(--ld-foreground);
  color-scheme: dark;
}

.ld-shell--light {
  --ld-bg: #f6f8fb;
  --ld-foreground: #1c232b;
  --ld-muted: #5b6675;
  --ld-card: #ffffff;
  --ld-card-soft: #eef1f6;
  --ld-border: #d5dbe4;
  --ld-primary: #00ADB5;
  --ld-primary-soft: #17c1c9;
  --ld-primary-bright: #2dd3db;
  background:
    radial-gradient(
      100% 80% at 85% 0%,
      rgba(0, 173, 181, 0.12) 0%,
      rgba(255, 255, 255, 0) 50%
    ),
    var(--ld-bg);
  color: var(--ld-foreground);
  color-scheme: light;
}

.ld-muted {
  color: var(--ld-muted);
}

/* ── Backdrop glow orbs (teal) ── */
.ld-glow--1 {
  background: radial-gradient(circle,
    color-mix(in oklab, var(--ld-primary) 45%, transparent),
    transparent 70%);
}

.ld-glow--2 {
  background: radial-gradient(circle,
    color-mix(in oklab, var(--ld-primary-soft) 40%, transparent),
    transparent 70%);
}

.ld-glow--3 {
  background: radial-gradient(circle,
    color-mix(in oklab, var(--ld-primary-bright) 35%, transparent),
    transparent 70%);
}

/* ── Teal grid pattern ── */
.ld-grid {
  opacity: 0.05;
  background-image:
    linear-gradient(color-mix(in oklab, var(--ld-primary) 55%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in oklab, var(--ld-primary) 55%, transparent) 1px, transparent 1px);
  background-size: 60px 60px;
}

/* ── Soft navy veil to deepen the base, like the landing backdrop ── */
.ld-veil {
  background: linear-gradient(
    100deg,
    color-mix(in oklab, #222831 92%, transparent) 0%,
    color-mix(in oklab, #222831 70%, transparent) 45%,
    color-mix(in oklab, #222831 46%, transparent) 100%
  );
}

/* Orb animations */
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
  width: 128px;
  height: 128px;
  transform-style: preserve-3d;
  animation: loader-rotate3d 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.loader-face {
  backface-visibility: hidden;
}

.loader-face--back {
  transform: rotateY(180deg);
}

/* Cube faces — teal gradient surfaces with a soft inner glow cue */
.ld-cube {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
}

.ld-cube--front {
  background: linear-gradient(135deg, var(--ld-primary), var(--ld-primary-soft));
  box-shadow: 0 30px 60px -15px rgba(0, 173, 181, 0.35);
}

.ld-cube--front .ld-cube-logo {
  filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.35));
}

.ld-cube--back {
  background: linear-gradient(135deg, var(--ld-primary-soft), var(--ld-primary));
  box-shadow: 0 30px 60px -15px rgba(0, 173, 181, 0.35);
}

/* Teal rim light traced around the cube edge (glass depth cue) */
.ld-cube-rim {
  box-shadow: inset 0 1px 0 rgba(238, 238, 238, 0.25),
    0 0 0 1px color-mix(in oklab, var(--ld-primary-bright) 40%, transparent);
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

/* Logo text gradient — teal sweep */
.ld-logo-gradient {
  background-image: linear-gradient(90deg, var(--ld-primary), var(--ld-primary-soft) 50%, var(--ld-primary-bright));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: "bon";
}

.loader-logo-text {
  animation: loader-text-gradient 3s ease-in-out infinite;
}

.ld-shell--light .ld-logo-gradient {
  background-image: linear-gradient(90deg, #008b92, #00ADB5 50%, #1ec6cf);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
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

/* Floating particles — teal */
.ld-particle {
  background: var(--ld-primary-soft);
  box-shadow: 0 0 8px 1px color-mix(in oklab, var(--ld-primary) 55%, transparent);
}

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

/* ECG pulse — teal trace (kept structural path from Uiverse) */
.heart #line {
  fill: none;
  stroke: var(--ld-primary);
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
  stroke: var(--ld-primary-soft);
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
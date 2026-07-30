<template>
  <Transition name="loader-exit" @after-leave="$emit('finished')">
    <LoadingBackground v-if="rendered" class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      :class="isLight ? 'bg-slate-50' : 'bg-[#060a13]'" role="status" aria-live="polite" aria-label="Loading MedVista">
      <temolate>
        <!-- Animated background orbs -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="loader-orb loader-orb--1 absolute w-[600px] h-[600px] rounded-full blur-[120px] -top-40 -right-32"
            :class="isLight ? 'bg-blue-400/15' : 'bg-blue-500/20'"></div>
          <div
            class="loader-orb loader-orb--2 absolute w-[500px] h-[500px] rounded-full blur-[100px] -bottom-36 -left-28"
            :class="isLight ? 'bg-cyan-300/10' : 'bg-cyan-400/15'"></div>
          <div
            class="loader-orb loader-orb--3 absolute w-[400px] h-[400px] rounded-full blur-[90px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            :class="isLight ? 'bg-indigo-300/8' : 'bg-indigo-400/10'"></div>
        </div>

        <!-- Grid pattern overlay -->
        <div class="absolute inset-0"
          :style="{ opacity: isLight ? 0.03 : 0.05, backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }">
        </div>

        <!-- Main content -->
        <div class="relative z-10 flex flex-col items-center gap-8">
          <!-- 3D Rotating medical cross -->
          <div class="loader-3d-container perspective-[1000px]">
            <div class="loader-3d-element relative w-32 h-32">
              <!-- Front face -->
              <div
                class="loader-face loader-face--front absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-2xl shadow-blue-500/30">
                <img src="~/assets/images/hastihoseinilogo.png" alt="" class="w-16 h-16 object-contain" width="48"
                  height="48" />
              </div>
              <!-- Back face -->
              <div
                class="loader-face loader-face--back absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-2xl shadow-cyan-400/30">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Logo text with gradient -->
          <div class="loader-text-container text-center">
            <h1
              class="loader-logo-text text-2xl md:text-3xl lg:text-4xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
              style="background-size: 200% auto;">
              {{ t('landing.loading.clinicName') }}
            </h1>
            <p class="loader-tagline mt-2 text-sm font-medium" :class="isLight ? 'text-slate-500' : 'text-slate-400'">
              {{ computedTagline }}
            </p>
          </div>

          <!-- Animated progress ring -->
          <!-- From Uiverse.io by G27XLEO -->
          <svg class="heart" viewBox="-5 -5 278 56" version="1.1" id="svg5" xmlns="http://www.w3.org/2000/svg">
            <filter>
              <feGaussianBlur stdDeviation="1.6"></feGaussianBlur>
            </filter>
            <g transform="translate(29.1 -127.42)" id="layer1">
              <path pathLength="1"
                d="M-28.73 167.2c26.43 9.21 68.46-9.46 85.45-12.03 18.45-2.78 32.82 4.86 28.75 9.83-3.82 4.66-25.77-21.18-14.81-31.5 9.54-8.98 17.64 10.64 16.42 17.06-1.51-6.2 2.95-26.6 14.74-22.11 11.7 4.46-4.33 49.03-15.44 44.08-6.97-3.1 15.44-16.26 26.1-16 23.03.56 55.6 27.51 126.63 3.36"
                id="line"></path>
            </g>
            <g transform="translate(29.1 -127.42)" id="layer2">
              <path pathLength="1"
                d="M-28.73 167.2c26.43 9.21 68.46-9.46 85.45-12.03 18.45-2.78 32.82 4.86 28.75 9.83-3.82 4.66-25.77-21.18-14.81-31.5 9.54-8.98 17.64 10.64 16.42 17.06-1.51-6.2 2.95-26.6 14.74-22.11 11.7 4.46-4.33 49.03-15.44 44.08-6.97-3.1 15.44-16.26 26.1-16 23.03.56 55.6 27.51 126.63 3.36"
                id="point" filter="url(#blur)"></path>
            </g>
          </svg>


          <!-- Loading status text -->
          <div class="loader-status-container h-5">
            <Transition name="status-fade" mode="out-in">
              <span :key="statusIndex" class="text-xs font-medium"
                :class="isLight ? 'text-slate-500' : 'text-slate-400'">
                {{ statusMessages[statusIndex] }}
              </span>
            </Transition>
          </div>
        </div>

        <!-- Floating particles -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
          <div v-for="i in 20" :key="i" class="loader-particle absolute w-1 h-1 rounded-full"
            :class="isLight ? 'bg-cyan-400/20' : 'bg-blue-400/30'" :style="particleStyle(i)"></div>
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
  stroke: #2563EB;
  stroke-width: 1.5;
  stroke-linecap: butt;
  stroke-linejoin: round;
  stroke-miterlimit: 4;
  stroke-opacity: 1;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: dash 3s linear infinite;
}
.heart #point {
  fill: none;
  stroke: #2563EB;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-miterlimit: 0.1;
  stroke-opacity: 1;
  stroke-dasharray: 0.0001, 0.9999;
  stroke-dashoffset: 1;
  animation: dash 3s linear infinite;
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
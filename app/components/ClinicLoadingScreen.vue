<template>
  <Transition name="loader-exit" @after-leave="$emit('finished')">
    <div
      v-if="rendered"
      dir="rtl"
      class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300"
      role="status"
      aria-live="polite"
      :aria-label="statusMessages[statusIndex]"
    >
      <!-- ambient gradient field -->
      <div class="absolute inset-0 bg-periwinkle/25 dark:bg-electric-sapphire/15"></div>
      <div class="blob blob-a absolute w-[560px] h-[560px] rounded-full blur-[110px] bg-baby-blue-ice/50 dark:bg-electric-sapphire/25 -top-40 -right-32"></div>
      <div class="blob blob-b absolute w-[520px] h-[520px] rounded-full blur-[110px] bg-periwinkle/45 dark:bg-cornflower-blue/20 -bottom-36 -left-28"></div>
      <div class="blob blob-c absolute w-[360px] h-[360px] rounded-full blur-[100px] bg-light-cyan/40 dark:bg-electric-sapphire/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

      <!-- glass card -->
      <div class="relative z-10 card-glow flex w-[min(92vw,380px)] flex-col items-center gap-7 rounded-[28px] border border-white/50 dark:border-white/10 bg-white/60 dark:bg-slate-800/50 px-8 py-10 shadow-2xl shadow-electric-sapphire/20 backdrop-blur-xl">

        <!-- animated mark -->
        <div class="relative flex h-36 w-36 items-center justify-center">
          <div ref="lottieHost" class="h-full w-full"></div>
          <div v-if="!lottieReady" class="absolute inset-0 flex items-center justify-center">
            <MedicalKit class="w-12 h-12 fill-electric-sapphire dark:fill-cornflower-blue opacity-70" />
          </div>
        </div>

        <div class="flex flex-col items-center gap-1.5 text-center">
          <h3 class="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{{ clinicName }}</h3>
          <p class="text-sm font-medium text-slate-400 dark:text-slate-400">{{ tagline }}</p>
        </div>

        <!-- progress -->
        <div class="flex w-full flex-col items-center gap-3">
          <div class="progress-track relative h-1.5 w-full overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
            <div
              class="progress-fill h-full rounded-full bg-gradient-to-l from-electric-sapphire to-cornflower-blue"
              :style="{ width: displayProgress + '%' }"
            ></div>
          </div>
          <div class="flex w-full items-center justify-between">
            <Transition name="status-fade" mode="out-in">
              <span :key="statusIndex" class="text-xs font-medium text-slate-400 dark:text-slate-500">
                {{ statusMessages[statusIndex] }}
              </span>
            </Transition>
            <span class="text-xs font-bold tabular-nums text-electric-sapphire dark:text-cornflower-blue">
              {{ Math.round(displayProgress) }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'
import pulseAnimation from '~/lottie/medical-pulse.json'

const props = withDefaults(defineProps<{
  show: boolean
  clinicName?: string
  tagline?: string
}>(), {
  clinicName: 'کلینیک دکتر حسینی',
  tagline: 'در حال بارگذاری پنل کلینیک',
})

const emit = defineEmits<{ (e: 'finished'): void }>()

const statusMessages = [
  'در حال برقراری اتصال امن...',
  'بارگذاری اطلاعات کاربری...',
  'آماده‌سازی داشبورد کلینیک...',
  'چند لحظه دیگر...',
]

const rendered = ref(true)
const displayProgress = ref(0)
const statusIndex = ref(0)
const lottieReady = ref(false)
const lottieHost = ref<HTMLElement | null>(null)
const prefersReducedMotion = ref(false)

let anim: any = null
let progressTimer: ReturnType<typeof setInterval> | null = null
let finishTimer: ReturnType<typeof setTimeout> | null = null

const SOFT_CAP = 92

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
  prefersReducedMotion.value = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  try {
    import('lottie-web').then(({ default: lottie }) => {
      if (!lottieHost.value) return
      anim = lottie.loadAnimation({
        container: lottieHost.value,
        renderer: 'svg',
        loop: true,
        autoplay: !prefersReducedMotion.value,
        animationData: pulseAnimation,
      })
      anim.addEventListener('DOMLoaded', () => { lottieReady.value = true })
      if (prefersReducedMotion.value) anim.goToAndStop(60, true)
    })
  } catch (err) {
    lottieReady.value = false
  }

  startProgress()
})

onBeforeUnmount(() => {
  stopProgress()
  if (finishTimer) clearTimeout(finishTimer)
  anim?.destroy?.()
})
</script>

<style scoped>
.blob {
  animation: drift 14s ease-in-out infinite;
}
.blob-b { animation-duration: 17s; animation-delay: -4s; }
.blob-c { animation-duration: 20s; animation-delay: -8s; }

@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(3%, 4%) scale(1.06); }
  66% { transform: translate(-3%, -2%) scale(0.96); }
}

.card-glow {
  animation: glow 2s ease-in-out infinite;
}
@keyframes glow {
  0%, 100% { box-shadow: 0 25px 60px -15px rgba(79, 70, 229, 0.25); }
  50% { box-shadow: 0 25px 70px -10px rgba(79, 70, 229, 0.4); }
}

.progress-fill {
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
}
.progress-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  background-size: 60px 100%;
  animation: shimmer 1.6s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -80px 0; }
  100% { background-position: 200px 0; }
}

.status-fade-enter-active, .status-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.status-fade-enter-from { opacity: 0; transform: translateY(3px); }
.status-fade-leave-to { opacity: 0; transform: translateY(-3px); }

.loader-exit-leave-active {
  transition: opacity 0.45s ease, filter 0.45s ease, transform 0.45s ease;
}
.loader-exit-leave-to {
  opacity: 0;
  filter: blur(6px);
  transform: scale(1.03);
}

@media (prefers-reduced-motion: reduce) {
  .blob, .card-glow, .progress-fill::after {
    animation: none !important;
  }
  .loader-exit-leave-active {
    transition: opacity 0.25s ease;
  }
  .loader-exit-leave-to {
    filter: none;
    transform: none;
  }
}
</style>

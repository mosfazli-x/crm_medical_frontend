<template>
  <Transition name="app-splash">
    <div
      v-if="visible"
      class="app-splash"
      role="status"
      aria-live="polite"
      :aria-label="t('splash.loadingLabel')"
    >
      <!-- Ambient background -->
      <div class="app-splash__bg" aria-hidden="true">
        <span class="app-splash__glow app-splash__glow--emerald" />
        <span class="app-splash__glow app-splash__glow--navy" />
        <span class="app-splash__grid" />
        <span class="app-splash__vignette" />
      </div>

      <div class="app-splash__content">
        <div class="app-splash__mark">
          <span class="app-splash__ring app-splash__ring--out" aria-hidden="true" />
          <span class="app-splash__ring app-splash__ring--in" aria-hidden="true" />
          <span class="app-splash__logo">
            <img src="/pwa-192x192.png" alt="" width="78" height="78" decoding="async" fetchpriority="high">
          </span>
        </div>

        <h1 class="app-splash__brand">{{ t('splash.brand') }}</h1>
        <p class="app-splash__sub">{{ t('splash.brandSub') }}</p>

        <svg
          class="app-splash__ecg"
          viewBox="0 0 260 64"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path
            class="app-splash__ecg-track"
            d="M0 32 H40 L52 32 L60 10 L70 54 L80 32 H116 L126 32 L134 18 L142 46 L150 32 H260"
          />
          <path
            class="app-splash__ecg-line"
            pathLength="1"
            d="M0 32 H40 L52 32 L60 10 L70 54 L80 32 H116 L126 32 L134 18 L142 46 L150 32 H260"
          />
        </svg>

        <p class="app-splash__tagline">{{ t('splash.tagline') }}</p>
      </div>

      <footer class="app-splash__footer">
        <div
          class="app-splash__bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress)"
        >
          <span class="app-splash__bar-fill" :style="{ width: `${progress}%` }" />
        </div>
        <div class="app-splash__meta">
          <span class="app-splash__status">
            <span class="app-splash__pulse" aria-hidden="true" />
            {{ statusText }}
          </span>
          <span class="app-splash__pct">{{ percentLabel }}</span>
        </div>
      </footer>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { SPLASH_STATUS_COUNT, useSplash } from '~/composables/useSplash'

const { t, locale } = useI18n()
const router = useRouter()
const { visible, progress, statusIndex, start, finish, stop } = useSplash()

const STATUS_KEYS = [
  'splash.status.booting',
  'splash.status.records',
  'splash.status.schedule',
  'splash.status.finance',
  'splash.status.finalizing',
] as const

const statusText = computed(() => t(STATUS_KEYS[Math.min(statusIndex.value, SPLASH_STATUS_COUNT - 1)] ?? STATUS_KEYS[0]))

const percentLabel = computed(() => {
  const n = Math.round(progress.value)
  const intlLocale = locale.value === 'fa' ? 'fa-IR' : 'en-US'
  return `${n.toLocaleString(intlLocale)}${locale.value === 'fa' ? '٪' : '%'}`
})

let settleTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  start()

  const signals: Promise<unknown>[] = [router.isReady(), nextTick()]
  if (document.fonts?.ready) signals.push(document.fonts.ready)
  if (document.readyState !== 'complete') {
    signals.push(new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true })))
  }

  // A short settle beat so the bar never snaps to 100 the instant it appears.
  void Promise.allSettled(signals).then(() => {
    settleTimer = setTimeout(() => finish(), 220)
  })
})

onBeforeUnmount(() => {
  if (settleTimer) clearTimeout(settleTimer)
  stop()
})
</script>

<style scoped>
.app-splash {
  position: fixed;
  inset: 0;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(1.5rem, 4vh, 2.75rem);
  padding: calc(2rem + env(safe-area-inset-top, 0px)) 1.75rem
    calc(1.75rem + env(safe-area-inset-bottom, 0px));
  background:
    radial-gradient(120% 95% at 50% -10%, #123a2c 0%, #0a231a 46%, #050f0c 100%);
  color: #eafff5;
  font-family: 'IRANSansX', 'Vazirmatn', Tahoma, sans-serif;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  touch-action: none;
}

/* ── Ambient background ───────────────────────────────────────────── */
.app-splash__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.app-splash__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
}

.app-splash__glow--emerald {
  top: -22%;
  inset-inline-start: -18%;
  width: 62vmax;
  height: 62vmax;
  background: radial-gradient(circle, rgba(23, 168, 116, 0.55), transparent 62%);
  animation: splash-drift-a 12s ease-in-out infinite alternate;
}

.app-splash__glow--navy {
  bottom: -28%;
  inset-inline-end: -22%;
  width: 56vmax;
  height: 56vmax;
  background: radial-gradient(circle, rgba(30, 55, 84, 0.7), transparent 64%);
  animation: splash-drift-b 15s ease-in-out infinite alternate;
}

.app-splash__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(80% 65% at 50% 45%, #000 0%, transparent 78%);
  -webkit-mask-image: radial-gradient(80% 65% at 50% 45%, #000 0%, transparent 78%);
}

.app-splash__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 42%, transparent 42%, rgba(2, 8, 6, 0.72) 100%);
}

/* ── Brand block ──────────────────────────────────────────────────── */
.app-splash__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: splash-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.app-splash__mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 108px;
  height: 108px;
  margin-bottom: 1.4rem;
}

.app-splash__logo {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 88px;
  height: 88px;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.09);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 18px 44px -18px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(23, 168, 116, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  animation: splash-logo-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.app-splash__logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.app-splash__ring {
  position: absolute;
  border-radius: 32px;
  border: 1.5px solid rgba(23, 168, 116, 0.55);
}

.app-splash__ring--in {
  inset: 4px;
  animation: splash-ring 3.2s ease-out infinite;
}

.app-splash__ring--out {
  inset: -8px;
  border-color: rgba(23, 168, 116, 0.28);
  animation: splash-ring 3.2s ease-out infinite;
  animation-delay: 1.1s;
}

.app-splash__brand {
  margin: 0;
  font-size: clamp(1.35rem, 5.4vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.35;
  color: #f4fff9;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.4);
}

.app-splash__sub {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(151, 233, 194, 0.82);
}

/* ── ECG pulse ────────────────────────────────────────────────────── */
.app-splash__ecg {
  width: min(260px, 68vw);
  height: auto;
  margin: 1.9rem 0 0;
  overflow: visible;
}

.app-splash__ecg-track {
  fill: none;
  stroke: rgba(151, 233, 194, 0.22);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.app-splash__ecg-line {
  fill: none;
  stroke: #35d69b;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 0.16 0.84;
  filter: drop-shadow(0 0 6px rgba(53, 214, 155, 0.9));
  animation: splash-ecg 2.6s linear infinite;
}

.app-splash__tagline {
  margin: 1.5rem 0 0;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.7;
  color: rgba(226, 245, 237, 0.72);
  max-width: 26ch;
}

/* ── Footer / progress ────────────────────────────────────────────── */
.app-splash__footer {
  position: relative;
  width: min(320px, 78vw);
  animation: splash-rise 0.7s 0.12s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.app-splash__bar {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.app-splash__bar-fill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, #0f5c43, #17a874 55%, #35d69b);
  box-shadow: 0 0 14px rgba(53, 214, 155, 0.6);
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-splash__bar-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: translateX(-100%);
  animation: splash-shimmer 1.5s ease-in-out infinite;
}

.app-splash__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(226, 245, 237, 0.68);
}

.app-splash__status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  text-align: start;
}

.app-splash__pulse {
  position: relative;
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #35d69b;
}

.app-splash__pulse::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(53, 214, 155, 0.55);
  animation: splash-ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.app-splash__pct {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
  color: #97e9c2;
}

/* ── Motion ───────────────────────────────────────────────────────── */
@keyframes splash-rise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes splash-logo-in {
  from { opacity: 0; transform: scale(0.82); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes splash-ring {
  0% { opacity: 0.7; transform: scale(0.9); }
  100% { opacity: 0; transform: scale(1.22); }
}

@keyframes splash-ecg {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: -1; }
}

@keyframes splash-shimmer {
  100% { transform: translateX(100%); }
}

@keyframes splash-ping {
  75%, 100% { transform: scale(2.4); opacity: 0; }
}

@keyframes splash-drift-a {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(6%, 8%, 0) scale(1.12); }
}

@keyframes splash-drift-b {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(-7%, -6%, 0) scale(1.1); }
}

.app-splash-leave-active {
  transition: opacity 0.45s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.app-splash-leave-to {
  opacity: 0;
  transform: scale(1.045);
}

@media (prefers-reduced-motion: reduce) {
  .app-splash__glow,
  .app-splash__ring,
  .app-splash__ecg-line,
  .app-splash__bar-fill::after,
  .app-splash__pulse::after,
  .app-splash__content,
  .app-splash__logo,
  .app-splash__footer {
    animation: none;
  }

  .app-splash__ecg-line {
    stroke-dasharray: none;
    opacity: 0.85;
  }

  .app-splash-leave-active {
    transition: opacity 0.2s linear;
  }

  .app-splash-leave-to {
    transform: none;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const { lang, isRtl, pn, toggleLang } = useLang()
const { isLight, toggleTheme, initTheme } = useLandingTheme()

const is404 = computed(() => props.error?.statusCode === 404)
const statusCode = computed(() => props.error?.statusCode ?? 404)

const pageTitle = computed(() =>
  `${is404.value ? t('notFound.title') : t('notFound.genericTitle')} — ${t('landing.clinicName')}`
)

const title = computed(() => (is404.value ? t('notFound.title') : t('notFound.genericTitle')))
const desc = computed(() => (is404.value ? t('notFound.desc') : t('notFound.genericDesc')))
const pillLabel = computed(() =>
  is404.value ? t('notFound.statusLabel') : `HTTP ${pn(statusCode.value)}`
)

useHead({
  title: pageTitle,
  meta: [{ name: 'robots', content: 'noindex' }],
})

const icons = {
  home: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>',
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></svg>',
  pulse: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
  moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
}

const reducedMotion = ref(false)

function goHome() {
  clearError({ redirect: '/' })
}

function goBack() {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    clearError()
    window.history.back()
  } else {
    clearError({ redirect: '/' })
  }
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false
  initTheme()
  document.documentElement.dir = isRtl.value ? 'rtl' : 'ltr'
  document.documentElement.lang = lang.value
  document.documentElement.classList.add('imm-page')
  document.body.classList.add('imm-page')
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('imm-page')
  document.body.classList.remove('imm-page')
})
</script>

<template>
  <div class="nf-viewport">
    <!-- ══ Decorative background ══ -->
    <div class="nf-bg" aria-hidden="true">
      <div class="imm-hero-aurora imm-hero-aurora--1" />
      <div class="imm-hero-aurora imm-hero-aurora--2" />
      <div class="imm-hero-aurora imm-hero-aurora--3" />
      <div class="imm-hero-grid" />
    </div>

    <!-- ══ Top bar ══ -->
    <header class="nf-topbar">
      <a href="/" class="nf-logo" :aria-label="t('landing.clinicName')">
        <span class="nf-logo-icon" aria-hidden="true">
          <img src="~/assets/images/hastihoseinilogo.png" :alt="t('landing.clinicName')" class="nf-logo-img"
            width="26" height="26" />
        </span>
        <span class="nf-logo-text">{{ t('landing.clinicName') }}</span>
      </a>

      <div class="nf-topbar-actions">
        <button class="nf-icon-btn" :title="isLight ? t('landing.theme.dark') : t('landing.theme.light')"
          :aria-label="isLight ? t('landing.theme.dark') : t('landing.theme.light')" @click="toggleTheme">
          <span v-html="isLight ? icons.moon : icons.sun" aria-hidden="true" />
        </button>
        <button class="nf-icon-btn" :title="t('index.langToggleTitle')" :aria-label="t('index.langToggleTitle')"
          @click="toggleLang">
          <span v-html="icons.globe" aria-hidden="true" />
          <span class="nf-icon-btn-text">{{ lang === 'fa' ? 'فا' : 'EN' }}</span>
        </button>
      </div>
    </header>

    <!-- ══ Content ══ -->
    <main class="nf-main">
      <div class="nf-watermark" aria-hidden="true">{{ pn(statusCode) }}</div>

      <section class="nf-content">
        <div class="nf-pill nf-anim" style="--d: 0ms">
          <span class="nf-pill-dot" aria-hidden="true" />
          <span class="nf-pill-text">{{ pillLabel }}</span>
        </div>

        <div class="nf-stage nf-anim" style="--d: 90ms">
          <span class="nf-stage-corner nf-stage-corner--tl" aria-hidden="true" />
          <span class="nf-stage-corner nf-stage-corner--tr" aria-hidden="true" />
          <span class="nf-stage-corner nf-stage-corner--bl" aria-hidden="true" />
          <span class="nf-stage-corner nf-stage-corner--br" aria-hidden="true" />

          <div class="nf-hud nf-hud--left" aria-hidden="true">
            <span class="nf-hud-pulse" v-html="icons.pulse" />
            <span class="nf-hud-label">MONITOR</span>
          </div>
          <div class="nf-hud nf-hud--right" aria-hidden="true">
            <span class="nf-hud-rec" />
            <span class="nf-hud-label">LIVE</span>
          </div>

          <div class="nf-lottie">
            <LottiePlayer src="/lottie/404.json" :autoplay="!reducedMotion" />
          </div>
        </div>

        <h1 class="nf-title nf-anim" style="--d: 180ms">{{ title }}</h1>
        <p class="nf-desc nf-anim" style="--d: 260ms">{{ desc }}</p>

        <div class="nf-actions nf-anim" style="--d: 340ms">
          <button class="nf-btn nf-btn--primary" @click="goHome">
            <span class="nf-btn-icon" v-html="icons.home" aria-hidden="true" />
            <span>{{ t('notFound.home') }}</span>
            <span class="nf-btn-shine" aria-hidden="true" />
          </button>
          <button class="nf-btn nf-btn--ghost" @click="goBack">
            <span class="nf-btn-icon nf-btn-icon--back" v-html="icons.back" aria-hidden="true" />
            <span>{{ t('notFound.back') }}</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.nf-viewport {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--imm-bg);
  color: var(--imm-text);
  overflow: hidden;
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

.nf-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

/* ── Top bar ── */
.nf-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem clamp(1.25rem, 4vw, 3rem);
}

.nf-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: var(--imm-text);
}

.nf-logo-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.16), rgba(34, 211, 238, 0.12));
  border: 1px solid var(--imm-glass-border);
  box-shadow: 0 0 24px var(--imm-blue-glow);
}

.nf-logo-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.nf-logo-text {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: -0.01em;
}

.nf-topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nf-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--imm-glass-border);
  background: var(--imm-glass);
  color: var(--imm-text-muted);
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.2s ease;
}

.nf-icon-btn:hover {
  background: var(--imm-glass-hover);
  color: var(--imm-text);
  border-color: rgba(59, 130, 246, 0.35);
  transform: translateY(-1px);
}

.nf-icon-btn-text {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* ── Main content ── */
.nf-main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  place-items: center;
  padding: 0 clamp(1.25rem, 4vw, 2.5rem) 4rem;
}

.nf-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -56%);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(16rem, 42vw, 34rem);
  line-height: 1;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  background-image: linear-gradient(180deg, rgba(59, 130, 246, 0.13), rgba(34, 211, 238, 0.03));
  user-select: none;
  pointer-events: none;
  z-index: 0;
}

.nf-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 640px;
}

/* ── Pill ── */
.nf-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.45rem 1.15rem;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.22);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--imm-cyan);
  margin-bottom: 1.75rem;
}

.nf-pill-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--imm-cyan);
  box-shadow: 0 0 10px var(--imm-cyan-glow);
  animation: nf-pulse 1.8s ease-in-out infinite;
}

.nf-pill-text {
  white-space: nowrap;
}

/* ── Animation stage ── */
.nf-stage {
  position: relative;
  width: min(600px, 88vw);
  aspect-ratio: 3 / 2;
  border-radius: 26px;
  overflow: hidden;
  background:
    radial-gradient(120% 120% at 50% 0%, rgba(59, 130, 246, 0.22), transparent 62%),
    radial-gradient(80% 80% at 88% 92%, rgba(34, 211, 238, 0.13), transparent 60%),
    linear-gradient(180deg, #0c1524, #060a13);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow:
    0 34px 90px -24px rgba(2, 6, 23, 0.75),
    0 0 0 1px rgba(255, 255, 255, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  margin-bottom: 2.5rem;
}

.nf-stage::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.016) 0px,
    rgba(255, 255, 255, 0.016) 1px,
    transparent 1px,
    transparent 3px
  );
  mix-blend-mode: overlay;
}

.nf-lottie {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.5rem, 3vw, 1.5rem);
  filter: drop-shadow(0 0 26px rgba(34, 211, 238, 0.18));
}

.nf-lottie :deep(svg) {
  width: 100%;
  height: 100%;
}

.nf-stage-corner {
  position: absolute;
  width: 22px;
  height: 22px;
  border: 2px solid rgba(34, 211, 238, 0.45);
  z-index: 3;
  pointer-events: none;
}

.nf-stage-corner--tl {
  top: 12px;
  left: 12px;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}

.nf-stage-corner--tr {
  top: 12px;
  right: 12px;
  border-left: none;
  border-bottom: none;
  border-radius: 0 6px 0 0;
}

.nf-stage-corner--bl {
  bottom: 12px;
  left: 12px;
  border-right: none;
  border-top: none;
  border-radius: 0 0 0 6px;
}

.nf-stage-corner--br {
  bottom: 12px;
  right: 12px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

.nf-hud {
  position: absolute;
  top: 14px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(148, 197, 255, 0.6);
  pointer-events: none;
}

.nf-hud--left {
  left: 44px;
}

.nf-hud--right {
  right: 44px;
}

.nf-hud-pulse {
  color: var(--imm-cyan);
  filter: drop-shadow(0 0 6px var(--imm-cyan-glow));
  animation: nf-hud-glow 2.4s ease-in-out infinite;
}

.nf-hud-rec {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f87171;
  box-shadow: 0 0 10px rgba(248, 113, 113, 0.7);
  animation: nf-pulse 1.8s ease-in-out infinite;
}

/* ── Typography ── */
.nf-title {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(2rem, 6vw, 3.4rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 1rem;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  background-image: linear-gradient(100deg, #f1f5f9 20%, var(--imm-blue) 55%, var(--imm-cyan) 90%);
}

[data-theme="light"] .nf-title {
  background-image: linear-gradient(100deg, #0f172a 20%, #2563eb 55%, #0891b2 90%);
}

.nf-desc {
  font-size: clamp(0.92rem, 1.6vw, 1.06rem);
  line-height: 1.8;
  color: var(--imm-text-muted);
  max-width: 480px;
  margin: 0 0 2.25rem;
}

/* ── Buttons ── */
.nf-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.nf-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.8rem 1.6rem;
  border-radius: 14px;
  font-family: var(--font-display);
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, background 0.25s ease;
}

.nf-btn:active {
  transform: scale(0.97);
}

.nf-btn--primary {
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #0ea5e9 55%, #06b6d4);
  background-size: 160% 160%;
  box-shadow: 0 14px 36px -12px rgba(37, 99, 235, 0.55);
}

.nf-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 44px -14px rgba(37, 99, 235, 0.7);
  background-position: 100% 100%;
}

.nf-btn--ghost {
  color: var(--imm-text);
  background: var(--imm-glass);
  border: 1px solid var(--imm-glass-border);
  backdrop-filter: blur(12px);
}

.nf-btn--ghost:hover {
  background: var(--imm-glass-hover);
  transform: translateY(-2px);
}

.nf-btn-icon {
  display: inline-flex;
  align-items: center;
}

.nf-btn-icon svg {
  stroke: currentColor;
}

[dir="rtl"] .nf-btn-icon--back svg {
  transform: scaleX(-1);
}

.nf-btn-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.22) 50%, transparent 70%);
  transform: translateX(-120%);
  transition: transform 0.7s ease;
  pointer-events: none;
}

.nf-btn--primary:hover .nf-btn-shine {
  transform: translateX(120%);
}

/* ── Entrance animation ── */
.nf-anim {
  opacity: 0;
  animation: nf-rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--d, 0ms);
}

@keyframes nf-rise {
  from {
    opacity: 0;
    transform: translateY(22px) scale(0.99);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes nf-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(0.85);
  }
}

@keyframes nf-hud-glow {
  0%, 100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .nf-main {
    padding-bottom: 3rem;
  }

  .nf-actions {
    width: 100%;
  }

  .nf-btn {
    flex: 1 1 140px;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .nf-anim {
    opacity: 1;
    animation: none;
  }

  .nf-pill-dot,
  .nf-hud-rec,
  .nf-hud-pulse {
    animation: none;
  }

  .nf-btn--primary,
  .nf-btn--ghost {
    transition: none;
  }
}
</style>

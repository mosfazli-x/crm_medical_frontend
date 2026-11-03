<template>
  <div class="ln-shell" :class="{ 'is-ready': loaderShown }" :dir="dir">
    <!-- Cinematic curtain loader — draws the logo, then parts to reveal the page -->
    <LandingCurtainLoader @finished="onLoaderFinished" />

    <!-- Background: the clinic film on desktop, the hero video on mobile -->
    <div ref="backdropRef" class="ln-backdrop" aria-hidden="true">
      <video
        v-if="isMobile && !mobileVideoFailed"
        ref="mobileVideoRef"
        class="ln-backdrop__video"
        src="/background-videos/mobile-hero.mp4"
        autoplay
        loop
        playsinline
        preload="auto"
        tabindex="-1"
        @error="mobileVideoFailed = true"
      />
      <LandingTimeOfDayBackground v-else />
      <div class="ln-backdrop__veil" />
    </div>

    <header class="ln-header">
      <div class="ln-brand">
        <span class="ln-mark" aria-hidden="true">
          <img src="../assets/images/hastihoseinilogo.png" alt="" />
        </span>
        <span class="ln-wordmark font-bon">{{ t('brand') }}</span>
      </div>

      <div class="ln-header-right">
        <!-- دکمه و اسلایدر کنترل صدا -->
        <div class="ln-audio-control">
          <button
            type="button"
            class="ln-audio-btn"
            :aria-label="isMuted ? t('unmuteVideo') : t('muteVideo')"
            @click="toggleMute"
          >
            <Icon :name="isMuted || volume === 0 ? 'lucide:volume-x' : 'lucide:volume-2'" size="18" />
          </button>
          <div class="ln-volume-wrapper">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="isMuted ? 0 : volume"
              class="ln-volume-slider"
              :aria-label="t('volumeLabel')"
              @input="onVolumeChange"
            />
          </div>
        </div>

        <button type="button" class="ln-lang" :aria-label="t('langLabel')" @click="toggleLang">
          <span class="ln-lang-globe" aria-hidden="true">
            <Icon name="lucide:globe" size="15" />
          </span>
          <span class="ln-lang-label">
            <span class="ln-lang-name">{{ locale === 'fa' ? 'English' : 'فارسی' }}</span>
            <span class="ln-lang-code">{{ locale === 'fa' ? 'EN' : 'FA' }}</span>
          </span>
        </button>
      </div>
    </header>

    <main class="ln-main" />

    <footer class="ln-footer">
      <nav class="ln-actions" aria-label="Main">
        <NuxtLink
          v-for="entry in entries"
          :key="entry.to"
          :to="entry.to"
          class="ln-ghost font-bon"
          :class="{ 'ln-ghost--primary': entry.lead }"
        >{{ entry.label }}</NuxtLink>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const messages = {
  en: {
    brand: 'Hasti Hoseini Clinic',
    metaTitle: 'Hasti Hoseini Clinic — A New Experience in Modern Medicine',
    metaDescription: 'Appointments, training and trusted guidance — thoughtfully arranged, never overwhelming.',
    est: 'Est. 2026',
    actions: {
      appointments: 'Book Appointment',
      account: 'Login/Sign Up',
      about: 'About Hasti Hosseini',
    },
    footerTagline: 'Care · Learning · Community',
    langLabel: 'Switch language',
    muteVideo: 'Mute background sound',
    unmuteVideo: 'Unmute background sound',
    volumeLabel: 'Volume',
  },
  fa: {
    brand: 'کلینیک هستی حسینی',
    metaTitle: 'کلینیک هستی حسینی — تجربه‌ای نوین در طب مدرن',
    metaDescription: 'تجربه‌ای متفاوت از پزشکی زیبایی بانوان',
    est: 'تأسیس ۲۰۲۶',
    actions: {
      appointments: 'رزرو نوبت',
      account: 'ورود',
      about: 'درباره هستی حسینی',
    },
    footerTagline: 'مراقبت · آموزش · جامعه',
    langLabel: 'تغییر زبان',
    muteVideo: 'قطع صدای پس‌زمینه',
    unmuteVideo: 'وصل صدای پس‌زمینه',
    volumeLabel: 'میزان صدا',
  },
} as const

type Locale = keyof typeof messages

const stored = useCookie<string>('i18n_lang', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' })
const locale = ref<Locale>(stored.value === 'en' ? 'en' : 'fa')
const loaderShown = ref(false)

function onLoaderFinished() {
  loaderShown.value = true
}

/* ── Audio Control ─────────────────────────────────────────────────── */
const backdropRef = ref<HTMLElement | null>(null)
const mobileVideoRef = ref<HTMLVideoElement | null>(null)
const isMuted = ref(false)
const volume = ref(0.7)

function getActiveVideos(): HTMLVideoElement[] {
  if (isMobile.value && mobileVideoRef.value) {
    return [mobileVideoRef.value]
  }
  if (backdropRef.value) {
    return Array.from(backdropRef.value.querySelectorAll('video'))
  }
  return []
}

function syncAudioState() {
  const videos = getActiveVideos()
  videos.forEach((video) => {
    video.muted = isMuted.value
    video.volume = isMuted.value ? 0 : volume.value
    if (!isMuted.value && video.paused) {
      video.play().catch(() => {})
    }
  })
}

function toggleMute() {
  isMuted.value = !isMuted.value
  syncAudioState()
}

function onVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement
  const val = parseFloat(target.value)
  volume.value = val
  if (val === 0) {
    isMuted.value = true
  } else if (isMuted.value) {
    isMuted.value = false
  }
  syncAudioState()
}

/* ── Mobile background ─────────────────────────────────────────────── */
const isMobile = ref(false)
const mobileVideoFailed = ref(false)

const MOBILE_QUERY = '(max-width: 47.9375rem)'
let mobileMq: MediaQueryList | null = null
let mobileGestureHooked = false

function onMobileMqChange(e: MediaQueryListEvent) {
  isMobile.value = e.matches
  nextTick(syncAudioState)
}

function onFirstTouch() {
  mobileVideoRef.value?.play().catch(() => {})
}

function tryPlayMobileVideo() {
  const el = mobileVideoRef.value
  if (!el) return
  el.play().catch(() => {
    if (mobileGestureHooked) return
    mobileGestureHooked = true
    window.addEventListener('pointerdown', onFirstTouch, { once: true })
  })
}

onMounted(() => {
  mobileMq = window.matchMedia(MOBILE_QUERY)
  isMobile.value = mobileMq.matches
  mobileMq.addEventListener('change', onMobileMqChange)
  nextTick(syncAudioState)
})

watch(isMobile, (active) => {
  if (active) {
    nextTick(() => {
      tryPlayMobileVideo()
      syncAudioState()
    })
  }
})

onBeforeUnmount(() => {
  mobileMq?.removeEventListener('change', onMobileMqChange)
  if (mobileGestureHooked) {
    window.removeEventListener('pointerdown', onFirstTouch)
  }
})

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

const t = (key: string): string => {
  const dict = messages[locale.value] as Record<string, unknown>
  return key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dict) as string ?? key
}

const entries = computed(() => [
  { to: '/booking', label: t('actions.appointments'), lead: true },
  { to: '/landing', label: t('actions.account'), lead: false },
  { to: '/about', label: t('actions.about'), lead: false },
])

const metaTitle = computed(() => t('metaTitle'))
const metaDescription = computed(() => t('metaDescription'))
const ogTitle = computed(() => metaTitle.value)
const ogDescription = computed(() => metaDescription.value)

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle,
  ogDescription,
  ogType: 'website',
  ogImage: '/images/hero-poster.jpg',
})

function toggleLang() {
  const next: Locale = locale.value === 'fa' ? 'en' : 'fa'
  locale.value = next
  stored.value = next
  if (typeof document !== 'undefined') {
    document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }
}

useHead({
  htmlAttrs: { lang: locale, dir },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Karla:wght@300;400;500&display=swap',
    },
  ],
})
</script>

<style scoped>
/* ── Design tokens ──────────────────────────────────────────────────── */
.ln-shell {
  --ink: oklch(17% 0.016 252);
  --ink-deep: oklch(10% 0.012 252);
  --paper: oklch(95% 0.008 85);
  --paper-muted: oklch(80% 0.012 250);
  --paper-faint: oklch(66% 0.012 250);
  --brass: #BDE0FE;
  --brass-wash: oklch(84% 0.075 84 / 0.12);
  --rule: oklch(100% 0 0 / 0.28);
  --rule-soft: oklch(100% 0 0 / 0.14);
  --rule-brass: #A2D2FF;
  --display: 'Cormorant Garamond', ui-serif, Georgia, serif;
  --sans: 'Karla', ui-sans-serif, system-ui, sans-serif;
  --gutter: clamp(1.5rem, 6vw, 7rem);
  --rail-gap: 0.75rem;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-soft: cubic-bezier(0.4, 0, 0.2, 1);
  --lift: 0 1px 2px oklch(var(--ink-deep) / 0.55), 0 2px 22px oklch(var(--ink-deep) / 0.45);

  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  color: var(--paper);
  color-scheme: dark;
  font-family: var(--sans);
  font-synthesis-weight: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--ink);
}

.ln-shell[dir='rtl'] {
  --display: 'bon', 'Vazirmatn', ui-serif, Georgia, serif;
  --sans: 'bon', 'Vazirmatn', 'Karla', ui-sans-serif, system-ui, sans-serif;
}

.font-bon {
  font-family: var(--display) !important;
}

.ln-shell[dir='rtl'] :is(.ln-wordmark, .ln-footer-brand, .ln-lang-name, .ln-lang-code) {
  text-transform: none;
  letter-spacing: 0 !important;
}

.ln-shell ::selection {
  background: var(--brass);
  color: var(--ink-deep);
}

/* ── Backdrop ──────────────────────────────────────────────────────── */
.ln-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.ln-backdrop :deep(.tod-bg__video--active) {
  opacity: 0.94;
}

.ln-backdrop__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.94;
}

.ln-backdrop__veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, oklch(10% 0.012 252 / 0.60) 0%, oklch(10% 0.012 252 / 0.22) 16%, transparent 30%),
    linear-gradient(0deg, oklch(10% 0.012 252 / 0.82) 0%, oklch(10% 0.012 252 / 0.52) 22%, transparent 46%),
    linear-gradient(180deg, oklch(10% 0.012 252 / 0.16) 0%, oklch(10% 0.012 252 / 0.04) 45%, oklch(10% 0.012 252 / 0.24) 100%);
}

.ln-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 240px 240px;
  opacity: 0.055;
  mix-blend-mode: overlay;
}

/* ── Reveal choreography ───────────────────────────────────────────── */
.ln-header,
.ln-footer {
  opacity: 0;
  transform: translate3d(0, 10px, 0);
  transition:
    opacity 1100ms var(--ease-soft) var(--ln-delay, 0ms),
    transform 1100ms var(--ease) var(--ln-delay, 0ms);
}

.ln-header { --ln-delay: 60ms; }
.ln-footer { --ln-delay: 320ms; }

.ln-shell.is-ready :is(.ln-header, .ln-footer) {
  opacity: 1;
  transform: none;
}

/* ── Header ────────────────────────────────────────────────────────── */
.ln-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: clamp(1.5rem, 4vh, 2.75rem) var(--gutter) clamp(1rem, 2.5vh, 1.5rem);
}

.ln-header-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.ln-brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.ln-mark {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.15rem;
  height: 2.15rem;
}

.ln-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 6px oklch(var(--ink-deep) / 0.55));
}

.ln-wordmark {
  font-size: clamp(0.95rem, 1.1vw, 1.1rem);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-shadow: var(--lift);
}

/* ── Audio Control ─────────────────────────────────────────────────── */
.ln-audio-control {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.ln-audio-btn {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--rule-soft);
  border-radius: 50%;
  background: transparent;
  color: var(--paper-muted);
  cursor: pointer;
  transition:
    color 200ms var(--ease),
    border-color 200ms var(--ease),
    background-color 200ms var(--ease);
}

.ln-audio-btn:hover,
.ln-audio-btn:focus-visible {
  color: var(--brass);
  border-color: var(--rule-brass);
  background: var(--brass-wash);
}

.ln-volume-wrapper {
  display: flex;
  align-items: center;
  width: 0;
  overflow: hidden;
  opacity: 0;
  transition: width 300ms var(--ease), opacity 250ms var(--ease);
}

.ln-audio-control:hover .ln-volume-wrapper,
.ln-audio-control:focus-within .ln-volume-wrapper {
  width: 4.5rem;
  opacity: 1;
}

.ln-volume-slider {
  width: 4rem;
  height: 3px;
  accent-color: var(--brass);
  background: var(--rule-soft);
  outline: none;
  cursor: pointer;
}

/* ── Language switch ───────────────────────────────────────────────── */
.ln-lang {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.75rem;
  padding: 0.25rem 0 0.35rem;
  border: 0;
  background: none;
  color: var(--paper);
  cursor: pointer;
}

.ln-lang::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: var(--brass);
  transform: scaleX(0);
  transform-origin: end;
  transition: transform 480ms var(--ease);
}

.ln-lang:hover::after,
.ln-lang:focus-visible::after {
  transform: scaleX(1);
}

.ln-lang-globe {
  display: inline-grid;
  place-items: center;
  color: var(--brass);
}

.ln-lang-label {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  line-height: 1.1;
  text-align: start;
}

.ln-lang-name {
  font-family: var(--sans);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-shadow: var(--lift);
  transition: color 200ms linear;
}

.ln-lang:hover .ln-lang-name {
  color: var(--brass);
}

.ln-lang-code {
  font-family: var(--sans);
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--paper-faint);
  text-shadow: var(--lift);
}

/* ── Stage ─────────────────────────────────────────────────────────── */
.ln-main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
}

/* ── Footer / ghost rail ───────────────────────────────────────────── */
.ln-footer {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 2.5vh, 1.6rem);
  padding: clamp(1.25rem, 3vh, 2rem) var(--gutter) clamp(1.75rem, 4vh, 3rem);
}

.ln-footer::before {
  content: '';
  position: absolute;
  top: 0;
  inset-inline: var(--gutter);
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--rule-soft) 20%,
    var(--rule-soft) 80%,
    transparent
  );
}

.ln-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.ln-ghost {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  max-width: 20rem;
  min-height: 3rem;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  background: transparent;
  color: var(--paper);
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-decoration: none;
  text-shadow: var(--lift);
  transition:
    border-color 260ms var(--ease-soft),
    background-color 260ms var(--ease-soft),
    color 260ms var(--ease-soft),
    transform 260ms var(--ease-soft);
}

.ln-ghost:hover,
.ln-ghost:focus-visible {
  border-color: var(--brass);
  background: var(--brass-wash);
  color: var(--brass);
  transform: translateY(-2px);
}

.ln-ghost:active {
  transform: translateY(0);
}

.ln-ghost--primary {
  border-color: var(--rule-brass);
  color: var(--brass);
}

.ln-ghost--primary:hover,
.ln-ghost--primary:focus-visible {
  border-color: var(--brass);
  background: oklch(84% 0.075 84 / 0.18);
}

.ln-ghost::after {
  content: '';
  flex-shrink: 0;
  width: 0.4rem;
  height: 0.4rem;
  border-top: 1px solid currentColor;
  border-right: 1px solid currentColor;
  rotate: 45deg;
  translate: -0.2rem 0;
  opacity: 0.5;
  transition:
    translate 420ms var(--ease),
    opacity 260ms linear;
}

.ln-ghost:hover::after,
.ln-ghost:focus-visible::after {
  translate: 0 0;
  opacity: 1;
}

.ln-shell[dir='rtl'] .ln-ghost::after {
  rotate: -135deg;
  translate: 0.2rem 0;
}

.ln-shell[dir='rtl'] .ln-ghost:hover::after,
.ln-shell[dir='rtl'] .ln-ghost:focus-visible::after {
  translate: 0 0;
}

.ln-footer-brand {
  font-family: var(--sans);
  font-size: 0.66rem;
  font-weight: 400;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--paper-faint);
  text-shadow: var(--lift);
}

/* ── Focus ─────────────────────────────────────────────────────────── */
.ln-shell :is(.ln-lang, .ln-ghost, .ln-audio-btn):focus-visible {
  outline: 1px solid var(--brass);
  outline-offset: 4px;
}

/* ── Responsive ────────────────────────────────────────────────────── */
@media (min-width: 48rem) {
  .ln-actions {
    flex-direction: row;
    justify-content: center;
    gap: var(--rail-gap);
  }

  .ln-ghost {
    width: auto;
    max-width: none;
    padding: 0.85rem 2rem;
  }
}

@media (min-width: 64rem) {
  .ln-mark {
    width: 2.5rem;
    height: 2.5rem;
  }

  .ln-ghost {
    padding: 1rem 2.4rem;
    font-size: 0.95rem;
  }
}

@media (min-width: 96rem) {
  .ln-wordmark {
    font-size: 1.3rem;
  }

  .ln-ghost {
    padding: 1.1rem 2.9rem;
    font-size: 1.05rem;
  }

  .ln-footer-brand {
    font-size: 0.75rem;
  }
}
</style>